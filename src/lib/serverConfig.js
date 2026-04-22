export function getServerConfig(env = process.env) {
  return {
    mongoUri: env.MONGODB_URI,
    jwtSecret: env.JWT_SECRET,
    openAiApiKey: env.OPENAI_API_KEY?.trim(),
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
    frontendUrl: env.FRONTEND_URL || 'http://localhost:5173',
    port: env.PORT || 5000,
  };
}

export function validateServerConfig(config) {
  const errors = [];
  const warnings = [];

  if (!config.mongoUri) errors.push('MONGODB_URI is required to connect to MongoDB.');
  if (!config.jwtSecret) errors.push('JWT_SECRET is required to sign authentication tokens.');

  if (!config.googleClientId || !config.googleClientSecret) {
    warnings.push('Google OAuth credentials are missing; Google sign-in and Gmail sync may fail.');
  }

  return { errors, warnings };
}
