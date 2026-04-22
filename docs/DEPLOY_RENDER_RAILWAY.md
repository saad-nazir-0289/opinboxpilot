# Deploying To Render Or Railway

## Backend

- Create a new Node service
- Set the start command to `node server.js`
- Add all backend environment variables from `.env.example`
- Set `FRONTEND_URL` to your deployed frontend domain

## Frontend

- Deploy the Vite app as a static site
- Set `VITE_API_BASE_URL` to the public backend URL
- Run `npm run build` during deployment

## Production checks

- Verify `GET /api/health`
- Test email/password registration
- Test profile save
- Test AI analysis and Google sign-in if enabled
