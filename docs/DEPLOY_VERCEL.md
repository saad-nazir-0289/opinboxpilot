# Deploying The Frontend To Vercel

## 1. Import the repository

- Create a new Vercel project
- Import the GitHub repository

## 2. Configure build settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

## 3. Add environment variables

```env
VITE_API_BASE_URL=https://your-backend-domain.example.com
```

## 4. Deploy and verify

- Open the deployed frontend URL
- Confirm login, profile load, and analysis requests hit the backend successfully
- Make sure the backend allows the Vercel domain in CORS via `FRONTEND_URL`
