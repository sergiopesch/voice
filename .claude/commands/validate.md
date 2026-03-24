# Full Validation

Run the complete validation suite for the project.

## Steps
1. Run `npm run lint` and report any warnings/errors
2. Run `npm run build` and report success or failure
3. Run `npm test` if tests exist, report results
4. Run `npx tsc --noEmit` for type checking
5. Check for any `console.log` statements that should be removed from production code
6. Verify no `.env` or credential files are tracked by git
7. Summarize: PASS or FAIL with details
