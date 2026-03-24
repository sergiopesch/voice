# Review Current Branch

Review all changes on the current branch compared to master.

## Steps
1. Run `git diff master...HEAD` to see all changes
2. Run `git log master..HEAD --oneline` to see commit history
3. For each changed file, check:
   - Code correctness and edge cases
   - TypeScript type safety (no `any` without justification)
   - Security: no leaked secrets, proper input validation
   - Performance: no unnecessary re-renders or blocking calls
   - Style: consistent with project conventions
4. Report findings as a structured list with file:line references
