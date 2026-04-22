# Release Checklist

## Before release

- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] `.env.example` reflects required configuration
- [ ] README and deployment docs are up to date
- [ ] No secrets or local logs are included in the commit

## Integration checks

- [ ] Health endpoint responds correctly
- [ ] Registration and login work
- [ ] Profile save works
- [ ] Email analysis works with sample data
- [ ] Real OpenAI analysis works in the target environment
- [ ] Google sign-in and Gmail sync work if enabled

## Release notes

- [ ] Summarize user-facing changes
- [ ] List breaking configuration changes
- [ ] Link related issues or roadmap items if applicable
