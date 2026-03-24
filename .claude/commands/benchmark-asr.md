# Benchmark ASR/Transcription Path

Analyze the speech-to-text pipeline for performance characteristics.

## Steps
1. Read `src/hooks/useVoiceInteraction.ts` and `src/app/api/transcribe/route.ts`
2. Identify the full latency path:
   - Silence detection timeout (currently 2000ms)
   - Audio chunk accumulation
   - Network round-trip to `/api/transcribe`
   - Google Cloud STT processing time
   - Response parsing
3. Identify memory concerns:
   - Audio chunk accumulation in `audioChunks.current`
   - No cleanup between utterances?
   - Buffer size for long sessions
4. Check for streaming opportunities:
   - Is streaming STT available and would it reduce latency?
   - Can interim results from Web Speech API eliminate server STT calls?
5. Report findings with specific latency estimates and improvement suggestions
