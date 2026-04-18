/**
 * aiApi.js — Backend Proxy Integration
 * Connects securely to the Express backend
 */

export async function extractOpportunities(rawEmails, profile, apiKey, useSampleData = false) {
  // We ping our securely built backend to prevent keys being leaked in frontend
  try {
    const response = await fetch('http://localhost:5000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawEmails,
        profile,
        useSampleData,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Backend analysis failed or is unreachable.');
    }

    const data = await response.json();
    
    // We expect the backend to give us already parsed and extracted opportunities
    return {
      opportunities: data.opportunities || [],
      rejected: data.rejected || [],
      usage: data.usage || null,
      limitedDemo: data.limitedDemo || false,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to connect to the backend server.');
  }
}
