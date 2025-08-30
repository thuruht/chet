/**
 * Utilities for robust form data handling
 */

/**
 * Attempts to decode base64 string in a variety of formats
 */
export const b64decode = (s: string) => {
  try {
    // Normalize base64url to standard base64: replace -_ back to +/ and pad with '='
    let str = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = str.length % 4;
    if (pad === 2) str += '==';
    else if (pad === 3) str += '=';
    
    if (typeof atob === 'function') return atob(str);
    // @ts-ignore - Node Buffer may not be present in Worker runtime, but in local tests it's fine
    if (typeof Buffer !== 'undefined') return Buffer.from(str, 'base64').toString('utf8');
    throw new Error('No base64 decode available');
  } catch (e) {
    throw e;
  }
};

/**
 * Tries to repair common mangling where proxies remove quotes/braces
 */
export const tryRepairMangledJson = (text: string) => {
  const attempts: string[] = [];
  // Raw as-is
  attempts.push(text);

  // Try URL-decoding (some proxies percent-encode)
  try { attempts.push(decodeURIComponent(text)); } catch (_) {}

  // Replace unquoted keys like: key: with "key":
  try {
    let s = text;
    // Quote keys (after { or ,)
    s = s.replace(/([\{,\[]\s*)([a-zA-Z_][a-zA-Z0-9_\-]*)\s*:/g, '$1"$2":');
    // Quote bareword values (value without quotes, not starting with { [ number true false null)
    s = s.replace(/:\s*([a-zA-Z_\-\/\. ]+)([,\}\]])/g, ':"$1"$2');
    attempts.push(s);
  } catch (_) {}

  // As a last resort, try to wrap simple role:value pairs into objects
  try {
    let s2 = text;
    s2 = s2.replace(/role:([a-zA-Z_\-]+)/g, '"role":"$1"');
    s2 = s2.replace(/content:([^,\}\]]+)/g, '"content":"$1"');
    attempts.push(s2);
  } catch (_) {}

  return attempts;
};

/**
 * Robust request body parser that handles proxies and form data edge cases
 */
export async function parseRequestBody(request: Request) {
  // Decide how to read the body depending on Content-Type and proxy mangling.
  // The request body can only be consumed once, so clone the request and
  // attempt to parse FormData from the clone first. This makes parsing
  // robust even if proxies strip or mangle the Content-Type header.
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  const requestClone = request.clone();
  let rawBody: string | null = null;
  let parsedForm: FormData | null = null;
  let body: any = null;
  const debugInfo: any = { attempts: [] };

  // Helper to record attempts for diagnostics
  const recordAttempt = (label: string, value: string) => {
    try { 
      debugInfo.attempts.push({ 
        label, 
        snippet: value && value.length > 200 ? value.slice(0,200) : value 
      }); 
    } catch (_) {}
  };

  try {
    // Try to parse form data from the cloned request regardless of Content-Type.
    parsedForm = await requestClone.formData();
    const fval = parsedForm.get('payloadB64') || parsedForm.get('payload_b64') || parsedForm.get('payload');
    if (fval) {
      rawBody = typeof fval === 'string' ? (fval as string) : String(fval);
    } else {
      const parts: string[] = [];
      for (const entry of parsedForm.entries()) {
        const k = String(entry[0]);
        const v = entry[1];
        parts.push(`${k}=${String(v).slice(0,200)}`);
      }
      rawBody = parts.join('&');
    }
  } catch (e) {
    // clone.formData() failed (not form data) or clone body couldn't be parsed as form; fall back
    // to reading the original request as text. This keeps the original request body unread
    // until now so we can confidently inspect it.
    rawBody = await request.text();
  }

  // 1) If we successfully parsed FormData from the clone, try to extract payloadB64
  try {
    if (parsedForm) {
      try {
        const form = parsedForm;
        const fval = form.get('payloadB64') || form.get('payload_b64') || form.get('payload');
        if (fval) {
          const candidate = typeof fval === 'string' ? fval : (fval as any).toString();
          const decoded = b64decode(candidate);
          recordAttempt('form_payload_decoded', decoded);
          try { 
            body = JSON.parse(decoded);
          } catch (e) {
            const repairs = tryRepairMangledJson(decoded || '');
            for (let i = 0; i < repairs.length; i++) {
              const attempt = repairs[i];
              recordAttempt(`form_payload_repair_${i}`, attempt);
              try { 
                body = JSON.parse(attempt);
                break; 
              } catch (_) { 
                body = null; 
              }
            }
          }
        }
      } catch (_) {
        // ignore and continue
      }
    }
  } catch (e) {
    // ignore form parsing exceptions and continue
  }

  // 2) If not parsed yet, try direct JSON parse (most common path)
  if (!body) {
    try {
      recordAttempt('raw', rawBody || '');
      body = rawBody ? JSON.parse(rawBody) : null;
    } catch (parseErr) {
      // Attempt repair heuristics
      const repairs = tryRepairMangledJson(rawBody || '');
      for (let i = 0; i < repairs.length; i++) {
        const attempt = repairs[i];
        recordAttempt(`repair_${i}`, attempt);
        try { 
          body = JSON.parse(attempt);
          break; 
        } catch (_) { 
          body = null; 
        }
      }

      if (!body) {
        console.error('Failed to parse request body. Raw body:', rawBody);
        throw new Error(`Invalid JSON: ${(parseErr as Error).message}`);
      }
    }
  }

  return { body, rawBody, debugInfo };
}

// Export module contents
export default {
  parseRequestBody,
  b64decode,
  tryRepairMangledJson
};