# OpenAI Setup

## 1. Create an API key

- Sign in to the OpenAI dashboard
- Create a new API key
- Copy it immediately and store it securely

## 2. Add the key to `.env`

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 3. Restart the backend

```bash
node server.js
```

## 4. Verify the integration

- Open `http://localhost:5000/api/health`
- Confirm `openaiConfigured` is `true`
- Run an analysis from the dashboard with pasted emails

## Notes

- The OpenAI key is used only on the backend
- Do not expose the key in frontend code or public repos
- If analysis fails, verify billing, model access, and network connectivity
