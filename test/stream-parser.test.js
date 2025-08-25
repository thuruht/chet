import { describe, it, expect } from 'vitest';
import { processChunk, tryParseJsonFromLine } from '../public/js/stream-parser.js';

describe('stream parser helper', () => {
  it('should split chunks into lines and keep buffer', () => {
    const initial = '';
    const chunk1 = 'hello world\n{"response":"hi';
    const res1 = processChunk(initial, chunk1);
    expect(res1.lines.length).toBe(1);
    expect(res1.lines[0]).toBe('hello world');
    expect(res1.buffer).toBe('{"response":"hi');

    const chunk2 = ' there"}\npartial';
    const res2 = processChunk(res1.buffer, chunk2);
    expect(res2.lines.length).toBe(1);
    expect(res2.lines[0]).toBe('{"response":"hi there"}');
    expect(res2.buffer).toBe('partial');
  });

  it('should extract json object from a line when present', () => {
    const line = 'prefix {"response":"ok"} suffix';
    const parsed = tryParseJsonFromLine(line);
    expect(parsed).toBeTruthy();
    expect(parsed.response).toBe('ok');
  });

  it('should return null for non-json lines', () => {
    expect(tryParseJsonFromLine('plain text')).toBeNull();
    expect(tryParseJsonFromLine('{ malformed json')).toBeNull();
  });
});
