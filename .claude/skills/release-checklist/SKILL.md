# Release Checklist

## When to Use
Invoke before tagging a release or deploying to production.

## What It Does
Runs through a comprehensive pre-release checklist:

## Checklist
1. **Build**: `npm run build` passes
2. **Lint**: `npm run lint` passes with zero errors
3. **Types**: `npx tsc --noEmit` passes
4. **Tests**: All tests pass (when test suite exists)
5. **Security**: `npm audit` shows no critical/high vulnerabilities
6. **Secrets**: No `.env` files or credentials in git history
7. **Docs**: README reflects current features and setup
8. **Changelog**: Changes are documented
9. **Version**: `package.json` version is updated
10. **Dependencies**: No unused or outdated critical dependencies
11. **Browser compat**: Tested in Chrome (required) and noted Firefox limitations
12. **Error states**: All error paths show user-friendly messages

## Output
Checklist with PASS/FAIL for each item and blocking issues highlighted.
