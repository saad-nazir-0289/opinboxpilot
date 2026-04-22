import test from 'node:test';
import assert from 'node:assert/strict';

import { scoreAndRank } from '../src/lib/scorer.js';

const profile = {
  degree: 'BS',
  program: 'Computer Science',
  semester: '6th',
  cgpa: '3.5 – 4.0',
  skills: 'React Node.js machine learning',
  interests: 'research internships',
  preferredTypes: ['internship', 'research'],
  financialNeed: true,
  locationPreference: 'remote',
  pastExperience: 'web development projects',
  nationality: 'Pakistani',
};

function createOpportunity(overrides = {}) {
  return {
    id: 'opp-1',
    is_opportunity: true,
    title: 'Default Opportunity',
    type: 'internship',
    organization: 'Example Org',
    deadline: '2026-06-01',
    deadline_raw: 'June 1, 2026',
    days_until_deadline: 12,
    summary: 'React and Node.js internship with mentoring.',
    eligibility: ['BS students in CS'],
    required_docs: ['Resume'],
    stipend_or_benefit: '$1000',
    link: 'https://example.com/apply',
    contact: 'team@example.com',
    location: 'remote',
    cgpa_requirement: 3.0,
    degree_requirement: ['BS'],
    program_requirement: ['CS'],
    is_financial_need_based: false,
    confidence: 'high',
    ...overrides,
  };
}

test('prioritizes stronger profile fit and urgency', () => {
  const strong = createOpportunity({
    id: 'strong',
    title: 'Strong Match',
    days_until_deadline: 5,
  });
  const weak = createOpportunity({
    id: 'weak',
    title: 'Weak Match',
    type: 'grant',
    degree_requirement: ['PhD'],
    cgpa_requirement: 3.9,
    location: 'international',
    days_until_deadline: 45,
    stipend_or_benefit: null,
  });

  const ranked = scoreAndRank([weak, strong], profile);

  assert.equal(ranked[0].id, 'strong');
  assert.ok(ranked[0].score > ranked[1].score);
});

test('moves expired opportunities below active ones', () => {
  const active = createOpportunity({ id: 'active', title: 'Active', days_until_deadline: 10 });
  const expired = createOpportunity({
    id: 'expired',
    title: 'Expired',
    days_until_deadline: -2,
    deadline_raw: 'Two days ago',
  });

  const ranked = scoreAndRank([expired, active], profile);

  assert.equal(ranked[ranked.length - 1].id, 'expired');
});

test('deduplicates opportunities by title and deadline', () => {
  const first = createOpportunity({ id: 'dup-1', title: 'Duplicate Title' });
  const second = createOpportunity({ id: 'dup-2', title: 'Duplicate Title' });

  const ranked = scoreAndRank([first, second], profile);

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].title, 'Duplicate Title');
});
