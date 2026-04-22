# Gmail OAuth Setup

## 1. Create a Google Cloud project

- Open Google Cloud Console
- Create or select a project
- Enable the Gmail API

## 2. Configure OAuth consent

- Open `APIs & Services -> OAuth consent screen`
- Set the app name and support email
- Add your test users if the app stays in testing mode

## 3. Create OAuth credentials

- Open `APIs & Services -> Credentials`
- Create an `OAuth client ID`
- Choose `Web application`

## 4. Add redirect URLs

- Authorized JavaScript origin: `http://localhost:5173`
- Authorized redirect URI: `http://localhost:5000/auth/google/callback`

## 5. Copy credentials into `.env`

```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

## 6. Test the flow

- Start backend and frontend
- Click `Sign in with Google`
- Approve profile, email, and Gmail readonly access
- Confirm the app returns to `/login?token=...` and then loads the profile/dashboard flow
