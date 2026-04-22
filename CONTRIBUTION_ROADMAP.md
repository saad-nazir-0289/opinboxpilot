# 100-Commit Roadmap

This roadmap breaks the project into 100 real, contribution-sized improvements. The goal is to grow the repository through small, reviewable, meaningful commits instead of artificial contribution inflation.

## Documentation And Developer Experience

1. Rewrite the README with a clearer product overview
2. Add an architecture walkthrough document
3. Add a 100-commit contribution roadmap
4. Add frontend environment variable documentation
5. Add backend environment variable documentation
6. Document local development workflow
7. Document Gmail OAuth setup steps
8. Document OpenAI API setup steps
9. Document MongoDB Atlas setup steps
10. Add troubleshooting guidance for common startup failures

## Configuration And Project Structure

11. Move frontend API base URL to environment configuration
12. Centralize frontend backend URL construction in one helper
13. Add a frontend environment example file
14. Add a backend health check endpoint
15. Add request-friendly JSON error responses for startup issues
16. Normalize log and generated file ignores
17. Add a small constants module for shared limits
18. Separate backend config parsing from server bootstrap
19. Add validation for required backend environment variables
20. Add safer defaults for local development mode

## Authentication And Security

21. Improve auth error messaging for invalid credentials
22. Prevent leaking sensitive fields in auth responses
23. Add explicit auth middleware tests
24. Store only the minimum required user fields in JWTs
25. Add token expiry messaging in the frontend
26. Add logout handling for expired sessions
27. Add backend guardrails for malformed Authorization headers
28. Improve Google OAuth failure redirect handling
29. Add optional secure-cookie session support planning notes
30. Add a public security checklist for deployment

## Backend API Quality

31. Add health endpoint response metadata
32. Validate `/api/analyze` request payload shape
33. Validate `/api/profile` update payload shape
34. Return consistent error envelopes across routes
35. Extract OpenAI request construction into a helper
36. Extract Gmail fetch logic into a dedicated module
37. Add pagination options for Gmail fetch count
38. Add safer handling for empty Gmail payloads
39. Add backend logging around analysis duration
40. Add backend tests for analysis route edge cases

## AI And Analysis Pipeline

41. Extract analysis limits into named constants
42. Add a user-facing note when analysis input is truncated
43. Improve empty-email validation before calling OpenAI
44. Improve JSON parsing fallback for malformed model output
45. Add deterministic post-processing for missing optional fields
46. Add duplicate opportunity filtering tests
47. Add scoring regression tests for priority ranking
48. Add parser regression tests for email splitting heuristics
49. Add support for configurable analysis model names
50. Add prompt versioning notes for future iterations

## Frontend Data Flow

51. Create a shared frontend API configuration module
52. Reduce duplicated fetch URL construction in auth/profile/store code
53. Improve loading state handling for profile fetch
54. Improve dashboard error states when backend is unreachable
55. Add user feedback for Gmail sync success
56. Add user feedback for Gmail sync empty result state
57. Add user feedback for PDF extraction completion
58. Prevent duplicate analysis submissions while processing
59. Add a reusable API error formatting helper
60. Add route-safe redirects for missing profile prerequisites

## Frontend UX Improvements

61. Improve login form submission states
62. Add inline validation hints for required profile fields
63. Improve mobile layout for the dashboard action bar
64. Improve mobile layout for results stat pills
65. Improve textarea accessibility labels and hints
66. Improve button semantics for non-submit actions
67. Add empty-state guidance when no opportunities are found
68. Add clearer sample-data messaging in the dashboard
69. Improve results panel copy for rejected emails
70. Add accessible status messages for async actions

## Testing Infrastructure

71. Add a test script to `package.json`
72. Add parser unit tests for header-based splitting
73. Add parser unit tests for custom separator splitting
74. Add parser unit tests for "Email X of Y" splitting
75. Add scorer unit tests for urgency ranking
76. Add scorer unit tests for profile-fit ranking
77. Add scorer unit tests for expired opportunity ordering
78. Add scorer unit tests for duplicate filtering
79. Add auth middleware tests where feasible
80. Add route smoke tests for backend startup behavior

## Performance And Maintainability

81. Extract repeated inline style objects where practical
82. Replace unstable list keys in results rendering
83. Reduce unnecessary re-renders in dashboard interactions
84. Add lightweight memoization for derived UI values
85. Move static placeholder content into dedicated constants
86. Simplify profile completion calculations
87. Remove dead parameters in frontend API helpers
88. Remove unused env placeholders from examples
89. Extract commonly reused route strings into constants
90. Add code comments only where logic is non-obvious

## Deployment And Operations

91. Add production build verification steps
92. Add a `npm run preview` deployment note to docs
93. Add Render/Railway deployment documentation
94. Add Vercel frontend deployment guidance
95. Add MongoDB network access deployment guidance
96. Add environment variable checklist for production
97. Add log redaction guidance for secrets
98. Add post-deploy smoke test checklist
99. Add contribution guide for future maintainers
100. Add release checklist documentation
