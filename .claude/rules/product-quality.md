# Product Quality Rules

## Craftsmanship
- No placeholder or demo-grade code in main branches
- Every user-facing interaction must feel intentional and polished
- Handle loading, error, and empty states explicitly

## Code Clarity
- Functions should do one thing with a clear name
- Avoid nested ternaries deeper than one level
- Extract complex logic into named functions, not inline lambdas

## Performance
- Avoid unnecessary re-renders: memoize where profiling shows benefit
- API routes must respond within 5s or stream partial results
- Audio processing must not block the main thread
- Monitor bundle size; lazy-load heavy components

## UX Standards
- Voice feedback must be immediate (visual indicator within 100ms of mic activation)
- Errors must be user-readable, not stack traces
- Transcription display must update in real-time without jank
- TTS playback must not overlap with active recording
