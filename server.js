import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

/** Real OpenAI keys are long; ignore placeholders and accidental whitespace. */
function isConfiguredOpenAIKey(value) {
  if (!value || typeof value !== 'string') return false;
  const k = value.trim();
  if (k.length < 20) return false;
  if (/your_.*key|placeholder|changeme|xxx/i.test(k)) return false;
  if (!k.startsWith('sk-')) return false;
  return true;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

function splitEmails(rawText) {
  let emails = rawText.split(/(?:\n---\n|\n\nFrom:)/);
  if (emails.length <= 1 && rawText.length > 50) {
    emails = [rawText]; // fallback -> treat whole text as 1 email
  }
  return emails
    .map((e) => e.trim())
    .filter((e) => e.length > 20)
}

app.get('/', (req, res) => {
  res.send('Backend server is live and running. Use the frontend interface to perform analysis.');
});

app.get('/api/analyze', (req, res) => {
  res.send('The /api/analyze endpoint requires a POST request. Please trigger the analysis from the React frontend.');
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

    let emails = splitEmails(rawEmails);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No emails found. Please paste emails to continue.' });
    }

    // Limiting overflow
    let limited = false;
    if (emails.length > 10) {
      limited = true;
      emails = emails.slice(0, 10);
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

const PORT = 3000;
app.listen(PORT, () => {
  const keyOk = isConfiguredOpenAIKey(process.env.OPENAI_API_KEY?.trim());
  console.log(`Backend on http://localhost:${PORT} (OPENAI_API_KEY: ${keyOk ? 'ok' : 'MISSING — real analysis will fail until set'})`);
});
