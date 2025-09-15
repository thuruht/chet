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
  const jsonMatch = line.match(/{.*}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return null;
  }
}
