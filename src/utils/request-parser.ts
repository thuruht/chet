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

  // 2) If not parsed yet, try encoded payload detection (header or presence in raw body)
  if (!body) {
    // Quick attempt: if rawBody looks like urlencoded form (contains '='), try URLSearchParams
    try {
      if (rawBody && /[=&]/.test(rawBody)) {
        const usp = new URLSearchParams(rawBody);
        const candidate = usp.get('payloadB64') || usp.get('payload_b64') || usp.get('payload');
        if (candidate) {
          const dec = b64decode(candidate);
          recordAttempt('urlencoded_raw_payload_decoded', dec);
          try { 
            body = JSON.parse(dec);
          }
          catch (e) {
            const repairs = tryRepairMangledJson(dec || '');
            for (let i = 0; i < repairs.length; i++) {
              const attempt = repairs[i];
              recordAttempt(`urlencoded_raw_repair_${i}`, attempt);
              try { 
                body = JSON.parse(attempt);
                break; 
              } catch (_) { 
                body = null; 
              }
            }
          }
        }
      }
    } catch (_) {}
    
    const isEncodedHeader = request.headers.get('x-encoded-payload') === '1';
    if (isEncodedHeader) {
      // Robustly detect encoded payload no matter how proxies delivered it
      // 1) Try URLSearchParams on rawBody first (handles application/x-www-form-urlencoded)
      try {
        if (!body && rawBody && /[=&]/.test(rawBody)) {
          const usp2 = new URLSearchParams(rawBody);
          const cand2 = usp2.get('payloadB64') || usp2.get('payload_b64') || usp2.get('payload');
          if (cand2) {
            const dec2 = b64decode(cand2);
            recordAttempt('encoded_header_urlencoded_payload_decoded', dec2);
            try { 
              body = JSON.parse(dec2);
            }
            catch (e) {
              const repairs = tryRepairMangledJson(dec2 || '');
              for (let i = 0; i < repairs.length; i++) {
                const attempt = repairs[i];
                recordAttempt(`encoded_header_urlencoded_repair_${i}`, attempt);
                try { 
                  body = JSON.parse(attempt);
                  break; 
                } catch (_) { 
                  body = null; 
                }
              }
            }
          }
        }
      } catch (_) {}

      // 2) Try query string (some proxies convert body to query params)
      if (!body) {
        try {
          const u = new URL(request.url);
          const qCand = u.searchParams.get('payloadB64') || u.searchParams.get('payload_b64') || u.searchParams.get('payload');
          if (qCand) {
            const decQ = b64decode(qCand);
            recordAttempt('encoded_header_query_payload_decoded', decQ);
            try { 
              body = JSON.parse(decQ);
            }
            catch (e) {
              const repairs = tryRepairMangledJson(decQ || '');
              for (let i = 0; i < repairs.length; i++) {
                const attempt = repairs[i];
                recordAttempt(`encoded_header_query_repair_${i}`, attempt);
                try { 
                  body = JSON.parse(attempt);
                  break; 
                } catch (_) { 
                  body = null; 
                }
              }
            }
          }
        } catch (_) {}
      }

      // 3) If still nothing, treat raw body as raw base64 string
      if (!body) {
        try {
          const decoded = b64decode((rawBody || '').trim());
          recordAttempt('decoded_base64', decoded);
          try {
            body = JSON.parse(decoded);
          } catch (e) {
            // Try repair heuristics on the decoded string
            const repairs = tryRepairMangledJson(decoded || '');
            for (let i = 0; i < repairs.length; i++) {
              const attempt = repairs[i];
              recordAttempt(`decoded_repair_${i}`, attempt);
              try { 
                body = JSON.parse(attempt);
                break; 
              } catch (_) { 
                body = null; 
              }
            }
          }
        } catch (e) {
          // if that failed, try extracting payloadB64 field or regex
          try {
            const parsedOuter = JSON.parse(rawBody || '');
            if (parsedOuter && parsedOuter.payloadB64) {
              const dec = b64decode(parsedOuter.payloadB64);
              recordAttempt('outer_payloadB64_decoded', dec);
              try {
                body = JSON.parse(dec);
              } catch (_) {
                const repairs = tryRepairMangledJson(dec || '');
                for (let i = 0; i < repairs.length; i++) {
                  const attempt = repairs[i];
                  recordAttempt(`outer_payload_repair_${i}`, attempt);
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
            const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+_\-/=]+)"|([A-Za-z0-9+_\-/=]+))/i;
            const m = (rawBody || '').match(regex);
            const candidate = m ? (m[1] || m[2]) : null;
            if (candidate) {
              try {
                const dec2 = b64decode(candidate);
                recordAttempt('regex_candidate_decoded', dec2);
                try { 
                  body = JSON.parse(dec2);
                } catch (_) {
                  const repairs = tryRepairMangledJson(dec2 || '');
                  for (let i = 0; i < repairs.length; i++) {
                    const attempt = repairs[i];
                    recordAttempt(`regex_decoded_repair_${i}`, attempt);
                    try { 
                      body = JSON.parse(attempt);
                      break; 
                    } catch (_) { 
                      body = null; 
                    }
                  }
                }
              } catch (_) { }
            }
            if (!body) {
              const m2 = (rawBody || '').match(/([A-Za-z0-9+_\-/=]{40,})/);
              if (m2) {
                try {
                  const dec3 = b64decode(m2[1]);
                  recordAttempt('loose_b64_decoded', dec3);
                  try { 
                    body = JSON.parse(dec3);
                  } catch (_) {
                    const repairs = tryRepairMangledJson(dec3 || '');
                    for (let i = 0; i < repairs.length; i++) {
                      const attempt = repairs[i];
                      recordAttempt(`loose_b64_repair_${i}`, attempt);
                      try { 
                        body = JSON.parse(attempt);
                        break; 
                      } catch (_) { 
                        body = null; 
                      }
                    }
                  }
                } catch (_) {}
              }
            }
          }
        }
      }
    } else {
      const looksLikeEncodedInBody = /payloadB64\s*[:=]/i.test(rawBody || '') || /[A-Za-z0-9+/=]{40,}/.test(rawBody || '');
      if (looksLikeEncodedInBody) {
        try {
          try {
            const parsedOuter = JSON.parse(rawBody || '');
            if (parsedOuter && parsedOuter.payloadB64) {
              body = JSON.parse(b64decode(parsedOuter.payloadB64));
            }
          } catch (_) {
            const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+_\-/=]+)"|([A-Za-z0-9+_\-/=]+))/i;
            const m = (rawBody || '').match(regex);
            const candidate = m ? (m[1] || m[2]) : null;
            if (candidate) {
              try { 
                body = JSON.parse(b64decode(candidate));
              } catch (_) { }
            }
            if (!body) {
              const m2 = (rawBody || '').match(/([A-Za-z0-9+_\-/=]{40,})/);
              if (m2) {
                try { 
                  body = JSON.parse(b64decode(m2[1]));
                } catch (_) { }
              }
            }
          }
        } catch (_) {
          const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+/=]+)"|([A-Za-z0-9+/=]+))/i;
          const m = (rawBody || '').match(regex);
          const candidate = m ? (m[1] || m[2]) : null;
          if (candidate) {
            try { 
              body = JSON.parse(b64decode(candidate));
            } catch (_) { }
          }
          if (!body) {
            const m2 = (rawBody || '').match(/([A-Za-z0-9+/=]{40,})/);
            if (m2) {
              try { 
                body = JSON.parse(b64decode(m2[1]));
              } catch (_) { }
            }
          }
        }
      }
    }
  }

  // 3) If still not parsed, try direct JSON parse (most common path)
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

  // 2) If not parsed yet, try encoded payload detection (header or presence in raw body)
  if (!body) {
    // Quick attempt: if rawBody looks like urlencoded form (contains '='), try URLSearchParams
    try {
      if (rawBody && /[=&]/.test(rawBody)) {
        const usp = new URLSearchParams(rawBody);
        const candidate = usp.get('payloadB64') || usp.get('payload_b64') || usp.get('payload');
        if (candidate) {
          const dec = b64decode(candidate);
          recordAttempt('urlencoded_raw_payload_decoded', dec);
          try { 
            body = JSON.parse(dec);
          }
          catch (e) {
            const repairs = tryRepairMangledJson(dec || '');
            for (let i = 0; i < repairs.length; i++) {
              const attempt = repairs[i];
              recordAttempt(`urlencoded_raw_repair_${i}`, attempt);
              try { 
                body = JSON.parse(attempt);
                break; 
              } catch (_) { 
                body = null; 
              }
            }
          }
        }
      }
    } catch (_) {}
    
    const isEncodedHeader = request.headers.get('x-encoded-payload') === '1';
    if (isEncodedHeader) {
      // Robustly detect encoded payload no matter how proxies delivered it
      // 1) Try URLSearchParams on rawBody first (handles application/x-www-form-urlencoded)
      try {
        if (!body && rawBody && /[=&]/.test(rawBody)) {
          const usp2 = new URLSearchParams(rawBody);
          const cand2 = usp2.get('payloadB64') || usp2.get('payload_b64') || usp2.get('payload');
          if (cand2) {
            const dec2 = b64decode(cand2);
            recordAttempt('encoded_header_urlencoded_payload_decoded', dec2);
            try { 
              body = JSON.parse(dec2);
            }
            catch (e) {
              const repairs = tryRepairMangledJson(dec2 || '');
              for (let i = 0; i < repairs.length; i++) {
                const attempt = repairs[i];
                recordAttempt(`encoded_header_urlencoded_repair_${i}`, attempt);
                try { 
                  body = JSON.parse(attempt);
                  break; 
                } catch (_) { 
                  body = null; 
                }
              }
            }
          }
        }
      } catch (_) {}

      // 2) Try query string (some proxies convert body to query params)
      if (!body) {
        try {
          const u = new URL(request.url);
          const qCand = u.searchParams.get('payloadB64') || u.searchParams.get('payload_b64') || u.searchParams.get('payload');
          if (qCand) {
            const decQ = b64decode(qCand);
            recordAttempt('encoded_header_query_payload_decoded', decQ);
            try { 
              body = JSON.parse(decQ);
            }
            catch (e) {
              const repairs = tryRepairMangledJson(decQ || '');
              for (let i = 0; i < repairs.length; i++) {
                const attempt = repairs[i];
                recordAttempt(`encoded_header_query_repair_${i}`, attempt);
                try { 
                  body = JSON.parse(attempt);
                  break; 
                } catch (_) { 
                  body = null; 
                }
              }
            }
          }
        } catch (_) {}
      }

      // 3) If still nothing, treat raw body as raw base64 string
      if (!body) {
        try {
          const decoded = b64decode((rawBody || '').trim());
          recordAttempt('decoded_base64', decoded);
          try {
            body = JSON.parse(decoded);
          } catch (e) {
            // Try repair heuristics on the decoded string
            const repairs = tryRepairMangledJson(decoded || '');
            for (let i = 0; i < repairs.length; i++) {
              const attempt = repairs[i];
              recordAttempt(`decoded_repair_${i}`, attempt);
              try { 
                body = JSON.parse(attempt);
                break; 
              } catch (_) { 
                body = null; 
              }
            }
          }
        } catch (e) {
          // if that failed, try extracting payloadB64 field or regex
          try {
            const parsedOuter = JSON.parse(rawBody || '');
            if (parsedOuter && parsedOuter.payloadB64) {
              const dec = b64decode(parsedOuter.payloadB64);
              recordAttempt('outer_payloadB64_decoded', dec);
              try {
                body = JSON.parse(dec);
              } catch (_) {
                const repairs = tryRepairMangledJson(dec || '');
                for (let i = 0; i < repairs.length; i++) {
                  const attempt = repairs[i];
                  recordAttempt(`outer_payload_repair_${i}`, attempt);
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
            const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+_\-/=]+)"|([A-Za-z0-9+_\-/=]+))/i;
            const m = (rawBody || '').match(regex);
            const candidate = m ? (m[1] || m[2]) : null;
            if (candidate) {
              try {
                const dec2 = b64decode(candidate);
                recordAttempt('regex_candidate_decoded', dec2);
                try { 
                  body = JSON.parse(dec2);
                } catch (_) {
                  const repairs = tryRepairMangledJson(dec2 || '');
                  for (let i = 0; i < repairs.length; i++) {
                    const attempt = repairs[i];
                    recordAttempt(`regex_decoded_repair_${i}`, attempt);
                    try { 
                      body = JSON.parse(attempt);
                      break; 
                    } catch (_) { 
                      body = null; 
                    }
                  }
                }
              } catch (_) { }
            }
            if (!body) {
              const m2 = (rawBody || '').match(/([A-Za-z0-9+_\-/=]{40,})/);
              if (m2) {
                try {
                  const dec3 = b64decode(m2[1]);
                  recordAttempt('loose_b64_decoded', dec3);
                  try { 
                    body = JSON.parse(dec3);
                  } catch (_) {
                    const repairs = tryRepairMangledJson(dec3 || '');
                    for (let i = 0; i < repairs.length; i++) {
                      const attempt = repairs[i];
                      recordAttempt(`loose_b64_repair_${i}`, attempt);
                      try { 
                        body = JSON.parse(attempt);
                        break; 
                      } catch (_) { 
                        body = null; 
                      }
                    }
                  }
                } catch (_) {}
              }
            }
          }
        }
      }
    } else {
      const looksLikeEncodedInBody = /payloadB64\s*[:=]/i.test(rawBody || '') || /[A-Za-z0-9+/=]{40,}/.test(rawBody || '');
      if (looksLikeEncodedInBody) {
        try {
          try {
            const parsedOuter = JSON.parse(rawBody || '');
            if (parsedOuter && parsedOuter.payloadB64) {
              body = JSON.parse(b64decode(parsedOuter.payloadB64));
            }
          } catch (_) {
            const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+_\-/=]+)"|([A-Za-z0-9+_\-/=]+))/i;
            const m = (rawBody || '').match(regex);
            const candidate = m ? (m[1] || m[2]) : null;
            if (candidate) {
              try { 
                body = JSON.parse(b64decode(candidate));
              } catch (_) { }
            }
            if (!body) {
              const m2 = (rawBody || '').match(/([A-Za-z0-9+_\-/=]{40,})/);
              if (m2) {
                try { 
                  body = JSON.parse(b64decode(m2[1]));
                } catch (_) { }
              }
            }
          }
        } catch (_) {
          const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+/=]+)"|([A-Za-z0-9+/=]+))/i;
          const m = (rawBody || '').match(regex);
          const candidate = m ? (m[1] || m[2]) : null;
          if (candidate) {
            try { 
              body = JSON.parse(b64decode(candidate));
            } catch (_) { }
          }
          if (!body) {
            const m2 = (rawBody || '').match(/([A-Za-z0-9+/=]{40,})/);
            if (m2) {
              try { 
                body = JSON.parse(b64decode(m2[1]));
              } catch (_) { }
            }
          }
        }
      }
    }
  }

  // 3) If still not parsed, try direct JSON parse (most common path)
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