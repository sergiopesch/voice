export function cleanTranscript(raw: string): string {
  let text = raw.trim();

  // Capitalize first letter
  if (text.length > 0) {
    text = text[0]!.toUpperCase() + text.slice(1);
  }

  // Ensure trailing period if no sentence-ending punctuation
  if (text.length > 0 && !/[.!?]$/.test(text)) {
    text += ".";
  }

  // Collapse multiple spaces
  text = text.replace(/\s{2,}/g, " ");

  return text;
}
