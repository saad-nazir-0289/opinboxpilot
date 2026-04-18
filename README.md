<!--
=========================================
PRIVATE TEAM INFO:
Team Name: Mactans

Members:
- Muhammad Saad Nazir (Team Lead)
- Umar Khalid
- Rafay Khan
=========================================
-->

# Inbox Copilot

Inbox Copilot is an AI-powered opportunity intelligence workspace for university students. It seamlessly extracts, parses, and ranks scholarships, internships, and fellowships from raw email text or PDF uploads natively mapped to a student's profile.

## Team Mactans
*   **Muhammad Saad Nazir** (Team Lead)
*   **Umar Khalid**
*   **Rafay Khan**

---

## Prerequisites

Before you start, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   A MongoDB Atlas Account / Cluster

## Setup Instructions

**1. Clone the repository and navigate into it**
\`\`\`bash
git clone https://github.com/umarr7/Soft-Tech.git
cd "Soft Tech"
\`\`\`

**2. Install dependencies**
Install the necessary NPM packages for the full-stack application:
\`\`\`bash
npm install
\`\`\`

**3. Configure Environment Variables**
Create a new file named \`.env\` in the root directory (you can use \`.env.example\` as a template) and add the following keys:
\`\`\`env
# AI Models
OPENAI_API_KEY=sk-your-openai-api-key

# Database
MONGODB_URI=mongodb://db_user:password@ac-cluster-shard-url:27017/?ssl=true&replicaSet=atlas-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0

# Authentication
JWT_SECRET=super_secret_jwt_key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
FRONTEND_URL=http://localhost:5173
PORT=5000
\`\`\`

## Running the Application Locally

The application consists of a Vite React frontend and an Express.js backend. You will need two terminal windows to run them simultaneously.

**Terminal 1: Start the Backend Server**
\`\`\`bash
node server.js
\`\`\`
*(It should print `Connected to MongoDB` and list the backend active port)*

**Terminal 2: Start the Frontend React App**
\`\`\`bash
npm run dev
\`\`\`
*(Vite will generate a local URL, typically `http://localhost:5173`)*

Open your browser and navigate to the local frontend URL. Let the app guide you through the registration, profile setup, and intelligent email parsing process!
