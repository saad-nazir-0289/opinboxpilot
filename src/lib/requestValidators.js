export function validateAnalyzePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  if (typeof body.useSampleData !== 'undefined' && typeof body.useSampleData !== 'boolean') {
    return 'useSampleData must be a boolean when provided.';
  }

  if (!body.useSampleData && typeof body.rawEmails !== 'string') {
    return 'rawEmails must be a string containing pasted or fetched emails.';
  }

  if (typeof body.profile !== 'undefined' && (!body.profile || typeof body.profile !== 'object' || Array.isArray(body.profile))) {
    return 'profile must be a JSON object when provided.';
  }

  return null;
}

export function validateProfileUpdatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Profile updates must be sent as a JSON object.';
  }

  return null;
}
