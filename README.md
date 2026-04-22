# Opinbox Pilot

Opinbox Pilot is an AI-powered opportunity intelligence platform for students. It helps users collect scholarship, internship, fellowship, admission, and competition emails, extract structured opportunity data from them, rank the results against a student profile, and surface the most actionable opportunities first.

The project combines a React frontend, an Express backend, MongoDB persistence, Google OAuth/Gmail integration, and OpenAI-powered email analysis.

## What The Project Does

- Lets students create an account with email/password or Google sign-in
- Stores a reusable student profile with academic and preference data
- Accepts raw pasted emails, Gmail inbox content, or PDF-uploaded email bundles
- Uses AI to extract structured opportunities from noisy inbox content
- Scores and ranks opportunities locally based on urgency, fit, and completeness
- Presents accepted opportunities and rejected/noise emails in a dashboard

## Core Features

- AI extraction of opportunities from unstructured email text
- Gmail auto-fetch for Google-authenticated users
- PDF text extraction for batch email documents
- Profile-aware scoring and ranking engine
- JWT-based authentication and protected routes
- MongoDB-backed student profile storage
- Embedded ElevenLabs assistant widget for conversational support

## Tech Stack

- Frontend: React, Vite, React Router, Zustand
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT, Passport, Google OAuth 2.0
- AI: OpenAI Chat Completions API
- Integrations: Gmail API, PDF.js, ElevenLabs ConvAI widget

## Architecture Overview

- Frontend handles login, profile setup, inbox input, and result presentation
- Backend handles authentication, profile persistence, Gmail fetching, and AI requests
- OpenAI converts raw emails into structured JSON opportunities
- Local scoring logic ranks the returned opportunities for the dashboard

For a presentation-friendly architecture diagram, see `ARCHITECTURE.md`.

## Project Structure

```text
.
|- server.js
|- src/
|  |- components/
|  |- lib/
|  |- models/
|  |- pages/
|  |- store/
|- .env.example
|- ARCHITECTURE.md
|- package.json
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18 or later
- npm 9 or later
- A MongoDB Atlas cluster or local MongoDB instance
- An OpenAI API key
- Google OAuth credentials if you want Google login and Gmail fetch enabled

## Environment Variables

Create a `.env` file in the project root by copying `.env.example`.

```bash
cp .env.example .env
```

Fill in the following values:

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
JWT_SECRET=your_jwt_signing_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
VITE_API_BASE_URL=http://localhost:5000
```

## How To Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the backend server:

```bash
node server.js
```

3. In a second terminal, start the frontend:

```bash
npm run dev
```

4. Open the app in your browser:

```text
http://localhost:5173
```

## Recommended Local Workflow

1. Register or sign in
2. Complete the student profile
3. Paste emails, upload a PDF, or fetch Gmail messages
4. Run the analysis
5. Review ranked opportunities and filtered-out noise

## API Flow

- `POST /api/auth/register` - create a local account
- `POST /api/auth/login` - sign in with email/password
- `GET /auth/google` - start Google OAuth
- `GET /api/profile` - fetch current student profile
- `PUT /api/profile` - update student profile
- `GET /api/gmail/fetch` - fetch recent Gmail content for Google users
- `POST /api/analyze` - extract opportunities from email content

## Notes

- OpenAI keys are used only on the backend; they are not exposed to the frontend
- Gmail fetching requires Google OAuth consent and valid client credentials
- The frontend currently targets `http://localhost:5000` for backend requests
- The ElevenLabs assistant is embedded client-side and configured through its hosted agent ID

## Future Improvements

- Move frontend API URLs to environment variables
- Add test coverage for backend routes and scoring logic
- Add refresh-token/session hardening for production deployments
- Add deployment-ready Docker and CI configuration

## License

This project is provided for academic and portfolio use unless a separate license is added.
