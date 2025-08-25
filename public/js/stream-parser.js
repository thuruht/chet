// Minimal stream parsing helper used by public/chat.js
// Exposes a function that accepts a string chunk and an existing buffer and returns
// { lines: [complete lines], buffer: remaining }

export function processChunk(sseBuffer, chunk) {
  sseBuffer += chunk;
  const lines = [];
  let newlineIndex;
  while ((newlineIndex = sseBuffer.indexOf('\n')) !== -1) {
    const line = sseBuffer.slice(0, newlineIndex).trim();
    sseBuffer = sseBuffer.slice(newlineIndex + 1);
    if (line) lines.push(line);
  }
  return { lines, buffer: sseBuffer };
}

// Helper to extract JSON objects from a line if possible
export function tryParseJsonFromLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('{')) return null;
  const firstBrace = line.indexOf('{');
  const lastBrace = line.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  const maybeJson = line.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(maybeJson);
  } catch (e) {
    return null;
  }
}
