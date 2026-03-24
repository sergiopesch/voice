# Test Insertion Strategy

Analyze the codebase and recommend where to add tests.

## Steps
1. Inventory all testable units:
   - API routes: `src/app/api/chat/route.ts`, `transcribe/route.ts`, `text-to-speech/route.ts`
   - Store: `src/store/useStore.ts`
   - Hook: `src/hooks/useVoiceInteraction.ts`
   - Middleware: `src/middleware.ts`
   - Types: `src/types/index.ts`
2. Prioritize by risk and complexity:
   - High: API routes (external API integration, error handling)
   - High: Voice interaction hook (complex state machine)
   - Medium: Middleware (auth logic)
   - Low: Store (simple Zustand actions)
3. For each target, recommend:
   - Test file location
   - Key test cases
   - Required mocks
   - Testing library (Vitest + React Testing Library)
4. Output a concrete test insertion plan
