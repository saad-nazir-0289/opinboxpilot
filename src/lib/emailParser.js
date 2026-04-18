/**
 * Intelligently splits a block of pasted raw text into individual emails.
 * Detects headers (From:, Subject:, Date:) as the start of an email.
 * Ensures contiguous headers don't cause fragmented splits.
 */
export function autoSplitEmails(rawText) {
  if (!rawText) return [];

  // Heuristic 1: If it contains "Email X of Y" or similar, use that to split
  if (/Email\s+\d+\s*(?:of\s*\d+)?/i.test(rawText)) {
      const parts = rawText
          // Insert a split marker before each "Email X"
          .replace(/(Email\s+\d+\s*(?:of\s*\d+)?)/gi, '\n===EMAIL_DELIM===\n$1')
          .split('===EMAIL_DELIM===')
          .map(e => e.trim())
          .filter(e => e.length > 10);
          
      // Check if the split actually yielded multiple parts (e.g. at least 2)
      if (parts.length > 1) return parts;
  }
  
  // Heuristic 2: User specifically used --- separators
  if (rawText.includes('\n---\n')) {
      const parts = rawText.split(/(?:\n---\n)/).map(e => e.trim()).filter(e => e.length > 10);
      if (parts.length > 1) return parts;
  }

  // Heuristic 3: Line-by-line standard header detection (From:, Subject:, Date:)
  const lines = rawText.split('\n');
  const emails = [];
  let currentEmail = [];
  let inHeaderBlock = false;

  const isHeader = (line) => /^(From|Subject|Date):\s/i.test(line.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLineHeader = isHeader(line);

    if (isLineHeader) {
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

  let validEmails = emails.filter(e => e.trim().length > 10);
  
  // Heuristic 4: If STILL only 1 email, but we see multiple "Subject: " in the text as glued text
  if (validEmails.length <= 1) {
      const subjectMatches = rawText.match(/Subject:\s/gi);
      if (subjectMatches && subjectMatches.length > 1) {
          const parts = rawText
              .replace(/(Subject:\s)/gi, '\n===EMAIL_DELIM===\n$1')
              .split('===EMAIL_DELIM===')
              .map(e => e.trim())
              .filter(e => e.length > 10);
          if (parts.length > 1) return parts;
      }
  }

  return validEmails;
}

export function getEmailCount(rawText) {
  return autoSplitEmails(rawText).length;
}
