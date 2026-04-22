import test from 'node:test';
import assert from 'node:assert/strict';

import { autoSplitEmails, getEmailCount } from '../src/lib/emailParser.js';

test('splits emails using explicit separators', () => {
  const input = [
    'From: first@example.com',
    'Subject: First email',
    '',
    'Hello one',
    '---',
    'From: second@example.com',
    'Subject: Second email',
    '',
    'Hello two',
  ].join('\n');

  const result = autoSplitEmails(input);

  assert.equal(result.length, 2);
  assert.match(result[0], /First email/);
  assert.match(result[1], /Second email/);
});

test('splits emails using repeated Subject headers when messages are glued together', () => {
  const input = 'Subject: First update body text Subject: Second update body text';

  const result = autoSplitEmails(input);

  assert.equal(result.length, 2);
});

test('counts emails detected from Email X of Y markers', () => {
  const input = [
    'Email 1 of 2',
    'From: first@example.com',
    'Subject: First',
    '',
    'Body one',
    'Email 2 of 2',
    'From: second@example.com',
    'Subject: Second',
    '',
    'Body two',
  ].join('\n');

  assert.equal(getEmailCount(input), 2);
});
