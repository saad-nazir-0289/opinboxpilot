/**
 * Intelligently splits a block of pasted raw text into individual emails.
 * Detects headers (From:, Subject:, Date:) as the start of an email.
 * Ensures contiguous headers don't cause fragmented splits.
 */
export function autoSplitEmails(rawText) {
  if (!rawText) return [];
  const lines = rawText.split('\n');
  const emails = [];
  let currentEmail = [];
  let inHeaderBlock = false;

  // The user's regex requirement: check if line starts with From:, Subject:, or Date:
  const isHeader = (line) => /^(From|Subject|Date):\s/i.test(line.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLineHeader = isHeader(line);

    if (isLineHeader) {
      // If we see a header, but we were NOT in a header block (meaning we were in the body),
      // we start a new email block.
      if (!inHeaderBlock && currentEmail.filter(l => l.trim().length > 0).length > 0) {
        emails.push(currentEmail.join('\n').trim());
        currentEmail = [];
      }
      inHeaderBlock = true;
      currentEmail.push(line);
    } else {
      if (line.trim() !== '') {
        inHeaderBlock = false;
      }
      currentEmail.push(line);
    }
  }

  if (currentEmail.length > 0) {
    emails.push(currentEmail.join('\n').trim());
  }

  // Filter out any completely empty artifacts
  let validEmails = emails.filter(e => e.trim().length > 10);
  
  // Backwards compatibility fallback if auto-detect found mostly nothing
  if (validEmails.length <= 1 && rawText.includes('\n---\n')) {
    const fallback = rawText.split(/(?:\n---\n)/).filter(e => e.trim().length > 10);
    if (fallback.length > 1) {
      return fallback;
    }
  }

  return validEmails;
}

export function getEmailCount(rawText) {
  return autoSplitEmails(rawText).length;
}
