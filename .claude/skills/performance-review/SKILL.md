# Performance Review

## When to Use
Invoke when changes touch the voice interaction loop, API routes, component rendering, or state management.

## What It Does
Reviews code for performance issues:
- Unnecessary React re-renders
- Blocking operations on the main thread
- Memory leaks (unreleased audio buffers, growing arrays)
- API route response time bottlenecks
- Bundle size impact of new code/dependencies
- Audio processing efficiency

## Review Checklist
1. Are expensive computations memoized appropriately?
2. Do effects clean up resources (timers, streams, listeners)?
3. Are audio chunks cleared after processing?
4. Do API routes avoid unnecessary work (e.g., listing voices on every TTS call)?
5. Are new imports tree-shakeable?
6. Is the silence detection timeout tuned appropriately?

## Output
Findings with estimated impact (high / medium / low) and specific optimization suggestions.
