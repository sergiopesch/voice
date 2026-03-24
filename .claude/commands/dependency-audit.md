# Dependency Audit

Audit project dependencies for security, licensing, and bloat.

## Steps
1. Run `npm audit` and report findings by severity
2. Run `npm ls --depth=0` to list direct dependencies
3. For each direct dependency, check:
   - Is it still used? (grep for imports)
   - Last publish date and maintenance status
   - License compatibility (prefer MIT/Apache-2.0)
   - Known vulnerabilities
4. Check for unused dependencies (installed but not imported)
5. Check for duplicate functionality (e.g., multiple HTTP clients)
6. Estimate bundle impact: `npx next build` and check `.next/` output size
7. Report: safe / needs attention / action required, with specific recommendations
