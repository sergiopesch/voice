# Dependency Policy

## Principles
- Minimal dependency surface: every dependency must justify its inclusion
- Prefer stable, widely-used packages with active maintenance
- Prefer MIT/Apache-2.0 licensed packages

## Current Dependencies (Justified)
| Package | Purpose | Justification |
|---------|---------|---------------|
| next | Framework | Core framework; App Router, API routes, SSR |
| react/react-dom | UI | Required by Next.js |
| zustand | State | Lightweight, minimal API, no boilerplate |
| @supabase/* | Auth | Managed auth with OAuth support |
| openai | LLM client | Official SDK for OpenAI API |
| @mistralai/mistralai | LLM client | Official SDK for Mistral API |
| @google-cloud/speech | ASR | Server-side speech-to-text |
| @google-cloud/text-to-speech | TTS | Server-side text-to-speech |
| ai (Vercel AI SDK) | Streaming | Unified streaming interface |
| tailwindcss | Styling | Utility-first CSS |
| framer-motion | Animation | Voice button animation |
| @headlessui/react | Accessible UI | Dropdown/dialog primitives |
| geist | Typography | Font family |

## Adding Dependencies
- Check if the need can be met with existing deps or native APIs first
- Run `npm audit` after adding
- Document the justification in this table
- Avoid packages with >5 transitive dependencies when a lighter alternative exists

## Removing Dependencies
- Remove unused dependencies promptly
- Check for imports before removing
