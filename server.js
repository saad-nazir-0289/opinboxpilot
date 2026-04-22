import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { google } from 'googleapis';
import { autoSplitEmails } from './src/lib/emailParser.js';
import Student from './src/models/Student.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Setup Mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

/** Real OpenAI keys are long; ignore placeholders and accidental whitespace. */
function isConfiguredOpenAIKey(value) {
  if (!value || typeof value !== 'string') return false;
  const k = value.trim();
  if (k.length < 20) return false;
  if (/your_.*key|placeholder|changeme|xxx/i.test(k)) return false;
  if (!k.startsWith('sk-')) return false;
  return true;
}

// Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let student = await Student.findOne({ googleId: profile.id });
      if (!student) {
        // Also check if email exists
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          student = await Student.findOne({ email });
          if (student) {
            // Unify account
            student.googleId = profile.id;
            student.googleAccessToken = accessToken;
            if (refreshToken) student.googleRefreshToken = refreshToken;
            await student.save();
            return done(null, student);
          }
        }

        // Create new user
        student = new Student({
          googleId: profile.id,
          name: profile.displayName || '',
          email: email || '',
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken
        });
        await student.save();
      } else {
        // Update tokens for existing user
        student.googleAccessToken = accessToken;
        if (refreshToken) student.googleRefreshToken = refreshToken;
        await student.save();
      }
      return done(null, student);
    } catch (err) {
      return done(err, null);
    }
  }
));

app.use(passport.initialize());

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

function generateToken(student) {
  return jwt.sign({ id: student._id, email: student.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ── Auth Routes ──

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({ email, password: hashedPassword });
    await newStudent.save();

    const token = generateToken(newStudent);
    res.json({ token, student: newStudent });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student || !student.password) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(student);
    res.json({ token, student });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Google OAuth Redirect
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

// Google OAuth Callback
app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?token=${token}`);
  }
);

// ── Profile and Gmail API Routes ──

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Pass indicator if user is a Google user and has token
    const isGoogleUser = !!student.googleAccessToken;

    res.json({ profile: student, isGoogleUser });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch profile" });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.googleId;
    delete updates.googleAccessToken;
    delete updates.googleRefreshToken;
    delete updates.email;

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    res.json({ profile: student });
  } catch (error) {
    res.status(500).json({ error: "Could not update profile" });
  }
});

app.get('/api/gmail/fetch', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student || !student.googleAccessToken) {
      return res.status(400).json({ error: "Gmail connection not available. Please log out and sign in with Google." });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: student.googleAccessToken,
      refresh_token: student.googleRefreshToken
    });

    // In case refresh is needed, googleapis does it automatically if refresh_token is provided.

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch recent ~15 messages
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 15,
      // Optional: filtering out some generic noise
      q: 'newer_than:30d'
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      return res.json({ emails: [] });
    }

    const emailStrings = [];
    for (const msg of messages) {
      try {
        const msgData = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'metadata' });
        const headers = msgData.data.payload.headers;

        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';
        const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';

        let snippet = msgData.data.snippet || '';
        // Unescape some html entities from snippet
        snippet = snippet.replace(/&#39;/g, "'").replace(/&quot;/g, '"');

        const emailText = `From: ${from}\nDate: ${date}\nSubject: ${subject}\n\n${snippet}\n---\n`;
        emailStrings.push(emailText);
      } catch (err) {
        // Just skip an email if it fails to parse
        continue;
      }
    }

    res.json({ text: emailStrings.join('\n') });

  } catch (err) {
    if (err.message && err.message.includes('invalid_grant')) {
      return res.status(401).json({ error: "Google session expired. Please log out and sign in with Google again." });
    }
    console.error('Gmail API error:', err);
    res.status(500).json({ error: "Failed to fetch from Gmail. Are you sure you approved permissions?" });
  }
});


const SYSTEM_PROMPT = `You are an expert email analyst for university students in Pakistan.
Your job is to analyze a batch of emails and extract structured opportunity data.
Ensure you correctly process English + Urdu mixed text where necessary.

You MUST respond with STRICT valid JSON only — no markdown, no extra text formatting, no explanation. Do not use code blocks.

For each email, determine:
1. Is it a real, actionable opportunity (scholarship, internship, fellowship, competition, admission, research, grant)?
2. If yes, extract all structured fields.
3. If no, classify it as noise/spam with a reason.

The JSON structure must be exactly:
{
  "opportunities": [
    {
      "id": "email_1",
      "is_opportunity": true,
      "title": "Full descriptive title of the opportunity",
      "type": "scholarship|internship|fellowship|competition|admission|research|grant|other",
      "organization": "Name of the organization offering it",
      "deadline": "YYYY-MM-DD or null if not found",
      "deadline_raw": "original deadline text from email",
      "days_until_deadline": number or null,
      "summary": "2-3 sentence summary of the opportunity",
      "eligibility": ["list", "of", "eligibility", "conditions"],
      "required_docs": ["list", "of", "required", "documents"],
      "stipend_or_benefit": "financial benefit described or null",
      "link": "application URL or null",
      "contact": "contact email or phone or null",
      "location": "remote|pakistan|international|unspecified",
      "cgpa_requirement": number or null,
      "degree_requirement": ["BS","MS","PhD"] or [],
      "program_requirement": ["CS","Engineering"] or [],
      "is_financial_need_based": boolean,
      "confidence": "high|medium|low"
    }
  ],
  "rejected": [
    {
      "id": "email_2",
      "is_opportunity": false,
      "reason": "This is a newsletter/promotional/spam email with no actionable opportunity",
      "snippet": "first 80 chars of the email subject or body"
    }
  ]
}

Today's date is ${new Date().toISOString().split('T')[0]}.
Calculate days_until_deadline from today. If deadline has passed, use a negative number.
Be strict — only mark is_opportunity: true if the student can actually apply for something.
Determine confidence based on how explicit the details are.`;

function generateDemoData() {
  return {
    opportunities: [{
      "id": "demo_1",
      "is_opportunity": true,
      "title": "Google Summer of Code 2026",
      "type": "internship",
      "organization": "Google",
      "deadline": "2026-05-01",
      "deadline_raw": "May 1st, 2026",
      "days_until_deadline": 14,
      "summary": "10-week programming project with an open source organization.",
      "eligibility": ["University student", "18+ years old"],
      "required_docs": ["Resume", "Proposal"],
      "stipend_or_benefit": "$1500 USD",
      "link": "https://summerofcode.withgoogle.com/",
      "contact": "support@google.com",
      "location": "remote",
      "cgpa_requirement": null,
      "degree_requirement": ["BS"],
      "program_requirement": ["CS", "Engineering"],
      "is_financial_need_based": false,
      "confidence": "high"
    }],
    rejected: [],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };
}

app.get('/', (req, res) => {
  res.send('Backend server is live and running. Use the frontend interface to perform analysis.');
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { rawEmails, profile, useSampleData } = req.body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();

    if (useSampleData) {
      return res.json({ ...generateDemoData(), limitedDemo: false });
    }

    if (!isConfiguredOpenAIKey(OPENAI_API_KEY)) {
      return res.status(503).json({
        error:
          'OpenAI API key is missing or invalid. Create a .env file in the project folder with OPENAI_API_KEY=sk-... and restart the backend (node server.js).',
      });
    }

    let emails = autoSplitEmails(rawEmails);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No emails found. Please paste emails to continue.' });
    }

    // Limiting overflow
    let limited = false;
    if (emails.length > 100) {
      limited = true;
      emails = emails.slice(0, 100);
    }

    const emailBlock = emails
      .map((e, i) => `=== EMAIL ${i + 1} (id: email_${i + 1}) ===\n${e}`)
      .join('\n\n');

    const userMessage = `Here are ${emails.length} emails to analyze:

${emailBlock}

Student profile context:
- Degree: ${profile.degree || 'not specified'}
- Program: ${profile.program || 'not specified'}
- Semester: ${profile.semester || 'not specified'}
- CGPA range: ${profile.cgpa || 'not specified'}
- Skills: ${profile.skills || 'not specified'}
- Interests: ${profile.interests || 'not specified'}

Analyze all ${emails.length} emails and return the strict JSON.`;

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    try {
      const data = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      });

      const raw = data.choices?.[0]?.message?.content;

      if (!raw) {
        return res.status(502).json({
          error: 'OpenAI returned an empty response. Check your account billing and model access, then try again.',
        });
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const cleaned = raw.replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          return res.status(502).json({
            error:
              'Could not parse JSON from the model. Try again, or shorten the email batch.',
          });
        }
      }

      parsed.opportunities = (parsed.opportunities || []).map(o => ({
        ...o,
        deadline: o.deadline ?? "Unknown",
        required_docs: o.required_docs ?? []
      }));

      res.json({
        opportunities: parsed.opportunities,
        rejected: parsed.rejected || [],
        usage: data.usage,
        limitedDemo: limited
      });

    } catch (apiError) {
      console.error("OpenAI Error:", apiError);
      return res.status(500).json({ error: "API Failed: " + apiError.message });
    }

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const keyOk = isConfiguredOpenAIKey(process.env.OPENAI_API_KEY?.trim());
  console.log(`Backend on http://localhost:${PORT} (OPENAI_API_KEY: ${keyOk ? 'ok' : 'MISSING — real analysis will fail until set'})`);
});
