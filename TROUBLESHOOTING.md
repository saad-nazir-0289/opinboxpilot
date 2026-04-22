# Troubleshooting

## Backend fails to start

- Check that `MONGODB_URI` and `JWT_SECRET` are set in `.env`
- Run `node server.js` and review the startup error printed in the terminal
- Confirm your MongoDB connection string is valid and the cluster allows your IP address

## Google login does not work

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Confirm the OAuth callback URL matches `GOOGLE_CALLBACK_URL`
- Make sure the Google Cloud OAuth app includes `http://localhost:5000/auth/google/callback`

## Gmail sync fails

- Sign out and sign in again with Google to refresh consent
- Make sure Gmail API access is enabled in Google Cloud
- Confirm the account granted the `gmail.readonly` scope

## OpenAI analysis fails

- Verify `OPENAI_API_KEY` is present in `.env`
- Check that your OpenAI account has model access and active billing
- Try a smaller email batch if the model returns malformed JSON

## Frontend cannot reach the backend

- Ensure the backend is running on `http://localhost:5000`
- Confirm `VITE_API_BASE_URL` matches your backend URL
- Restart the Vite dev server after changing environment variables

## PDF upload returns no content

- Try a text-based PDF instead of a scanned image PDF
- Re-export the PDF from the source app if text extraction fails
- Paste the raw email text manually if the document is image-only
