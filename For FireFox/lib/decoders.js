/**
 * CTF Toolkit — decoder library.
 * Pure functions, no dependencies. Exposed on window.CTFDecoders.
 * Every decode function returns { ok: bool, output: string, note?: string } and
 * never throws — callers can run all of them blindly for "magic" auto-solve mode.
 */
(function (global) {
  "use strict";

  const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const B58_ALPHABET = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const MORSE_MAP = {
    ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F",
    "--.": "G", "....": "H", "..": "I", ".---": "J", "-.-": "K", ".-..": "L",
    "--": "M", "-.": "N", "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R",
    "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X",
    "-.--": "Y", "--..": "Z", "-----": "0", ".----": "1", "..---": "2",
    "...--": "3", "....-": "4", ".....": "5", "-....": "6", "--...": "7",
    "---..": "8", "----.": "9", ".-.-.-": ".", "--..--": ",", "..--..": "?",
    "-.-.--": "!", "-..-.": "/", "-....-": "-", ".--.-.": "@", "---...": ":",
    ".----.": "'", "-.--.": "(", "-.--.-": ")", ".-..-.": '"'
  };

  const fail = (note) => ({ ok: false, output: "", note });
  const ok = (output, note) => ({ ok: true, output, note });

  // ---------- scoring (used by brute-force / magic mode to rank candidates) ----------

  const COMMON_WORDS = new Set([
    "the", "flag", "and", "you", "are", "this", "with", "for", "have", "not",
    "was", "that", "ctf", "is", "in", "to", "of", "it", "a", "your", "here",
    "http", "https", "www", "com", "key", "pass", "password", "secret", "hint"
  ]);

  function printableRatio(str) {
    if (!str.length) return 0;
    let printable = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if ((c >= 32 && c <= 126) || c === 9 || c === 10 || c === 13) printable++;
    }
    return printable / str.length;
  }

  function englishScore(str) {
    if (!str) return -Infinity;
    const pr = printableRatio(str);
    if (pr < 0.85) return -Infinity; // binary garbage, discard outright
    const lower = str.toLowerCase();
    const words = lower.match(/[a-z]{2,}/g) || [];
    let hits = 0;
    for (const w of words) if (COMMON_WORDS.has(w)) hits++;
    const flagBonus = /flag\{.*\}|ctf\{.*\}/i.test(str) ? 10 : 0;
    return pr * 5 + hits * 2 + flagBonus;
  }

  // ---------- Base64 / Base64URL ----------

  function decodeBase64(text) {
    const t = text.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(t) || t.length < 4) return fail("not base64");
    try {
      const bin = atob(t);
      return ok(binToStr(bin));
    } catch (e) {
      return fail("invalid base64 padding");
    }
  }

  function decodeBase64Url(text) {
    const t = text.trim().replace(/\s+/g, "");
    if (!/^[A-Za-z0-9_-]+$/.test(t) || t.length < 4) return fail("not base64url");
    try {
      let std = t.replace(/-/g, "+").replace(/_/g, "/");
      while (std.length % 4) std += "=";
      const bin = atob(std);
      return ok(binToStr(bin));
    } catch (e) {
      return fail("invalid base64url");
    }
  }

  function binToStr(bin) {
    try {
      // Try UTF-8 first (handles most real-world text correctly).
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch (e) {
      return bin;
    }
  }

  // ---------- Base32 ----------

  function decodeBase32(text) {
    const t = text.trim().toUpperCase().replace(/\s+/g, "").replace(/=+$/, "");
    if (!/^[A-Z2-7]+$/.test(t) || t.length < 4) return fail("not base32");
    let bits = "";
    for (const ch of t) {
      const idx = B32_ALPHABET.indexOf(ch);
      if (idx === -1) return fail("bad base32 char");
      bits += idx.toString(2).padStart(5, "0");
    }
    let out = "";
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      out += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
    }
    if (!out) return fail("empty base32 result");
    return ok(binToStr(out));
  }

  // ---------- Base58 (Bitcoin alphabet) ----------

  function decodeBase58(text) {
    const t = text.trim();
    if (!t.length || !/^[1-9A-HJ-NP-Za-km-z]+$/.test(t)) return fail("not base58");
    let num = 0n;
    for (const ch of t) {
      const idx = B58_ALPHABET.indexOf(ch);
      if (idx === -1) return fail("bad base58 char");
      num = num * 58n + BigInt(idx);
    }
    let hex = num.toString(16);
    if (hex.length % 2) hex = "0" + hex;
    let bytes = hex.length ? hex.match(/.{2}/g).map((b) => parseInt(b, 16)) : [];
    // Preserve leading-zero bytes (encoded as leading '1's in base58).
    for (const ch of t) {
      if (ch === "1") bytes.unshift(0);
      else break;
    }
    const bin = bytes.map((b) => String.fromCharCode(b)).join("");
    if (!bin) return fail("empty base58 result");
    return ok(binToStr(bin));
  }

  // ---------- Hex ----------

  function decodeHex(text) {
    let t = text.trim().replace(/^0x/i, "").replace(/[\s,:]+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(t) || t.length < 2 || t.length % 2 !== 0) return fail("not hex");
    let bin = "";
    for (let i = 0; i < t.length; i += 2) bin += String.fromCharCode(parseInt(t.slice(i, i + 2), 16));
    return ok(binToStr(bin));
  }

  // ---------- Binary (8-bit groups) ----------

  function decodeBinary(text) {
    const t = text.trim().replace(/[\s,]+/g, " ").trim();
    const cleaned = t.replace(/ /g, "");
    if (!/^[01]+$/.test(cleaned) || cleaned.length < 8) return fail("not binary");
    let groups;
    if (t.includes(" ")) {
      groups = t.split(" ").filter(Boolean);
      if (!groups.every((g) => /^[01]{1,8}$/.test(g))) return fail("irregular binary groups");
    } else {
      groups = cleaned.match(/.{1,8}/g);
    }
    let bin = "";
    for (const g of groups) bin += String.fromCharCode(parseInt(g.padStart(8, "0"), 2));
    return ok(binToStr(bin));
  }

  // ---------- URL encoding ----------

  function decodeUrl(text) {
    if (!/%[0-9a-fA-F]{2}/.test(text)) return fail("no percent-encoding found");
    try {
      return ok(decodeURIComponent(text));
    } catch (e) {
      return fail("malformed percent-encoding");
    }
  }

  // ---------- HTML entities ----------

  function decodeHtmlEntities(text) {
    if (!/&[a-zA-Z#0-9]+;/.test(text)) return fail("no entities found");
    const el = document.createElement("textarea");
    el.innerHTML = text;
    return ok(el.value);
  }

  // ---------- ROT13 / ROT47 ----------

  function rot13(text) {
    const out = text.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
    return ok(out);
  }

  function rot47(text) {
    const out = text.replace(/[!-~]/g, (c) => String.fromCharCode(33 + ((c.charCodeAt(0) + 14) % 94)));
    return ok(out);
  }

  // ---------- Caesar brute force (all 25 shifts, ranked) ----------

  function caesarShift(text, shift) {
    return text.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((((c.charCodeAt(0) - base + shift) % 26) + 26) % 26) + base);
    });
  }

  function caesarBruteForce(text) {
    const candidates = [];
    for (let shift = 1; shift < 26; shift++) {
      const output = caesarShift(text, shift);
      candidates.push({ shift, output, score: englishScore(output) });
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }

  // ---------- Morse code ----------

  function decodeMorse(text) {
    const t = text.trim();
    if (!/^[.\- \/\n]+$/.test(t) || !/[.-]/.test(t)) return fail("not morse");
    const words = t.split(/\s*\/\s*|\n/).filter(Boolean);
    const out = words
      .map((w) =>
        w
          .trim()
          .split(/\s+/)
          .map((sym) => MORSE_MAP[sym] || "")
          .join("")
      )
      .join(" ");
    if (!out.trim()) return fail("unrecognized morse symbols");
    return ok(out);
  }

  // ---------- XOR single-byte brute force ----------
  // Works on hex-encoded ciphertext (most common CTF presentation for XOR challenges).

  function xorBruteForce(text) {
    const hexResult = decodeHex(text);
    let bytes;
    if (hexResult.ok) {
      bytes = Array.from(hexResult.output).map((c) => c.charCodeAt(0));
    } else {
      // Fall back to treating the raw text as bytes.
      bytes = Array.from(text).map((c) => c.charCodeAt(0));
    }
    if (!bytes.length) return [];
    const candidates = [];
    for (let key = 0; key < 256; key++) {
      const out = bytes.map((b) => String.fromCharCode(b ^ key)).join("");
      candidates.push({ key: "0x" + key.toString(16).padStart(2, "0"), output: out, score: englishScore(out) });
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  }

  // ---------- "Magic" auto-solve: try every simple decoder, rank by plausibility ----------

  const SIMPLE_DECODERS = [
    { name: "Base64", fn: decodeBase64 },
    { name: "Base64URL", fn: decodeBase64Url },
    { name: "Base32", fn: decodeBase32 },
    { name: "Base58", fn: decodeBase58 },
    { name: "Hex", fn: decodeHex },
    { name: "Binary", fn: decodeBinary },
    { name: "URL encoding", fn: decodeUrl },
    { name: "HTML entities", fn: decodeHtmlEntities },
    { name: "ROT13", fn: rot13 },
    { name: "ROT47", fn: rot47 },
    { name: "Morse", fn: decodeMorse }
  ];

  function magicSolve(text) {
    const results = [];
    for (const { name, fn } of SIMPLE_DECODERS) {
      const r = fn(text);
      if (r.ok && r.output && r.output !== text) {
        results.push({ method: name, output: r.output, score: englishScore(r.output) });
      }
    }
    // Caesar: only worth trying if the input is mostly letters (a ciphertext, not noise).
    if (/^[a-zA-Z\s.,!?'"-]+$/.test(text) && text.replace(/\s/g, "").length >= 4) {
      const best = caesarBruteForce(text)[0];
      if (best && best.score > -Infinity) {
        results.push({ method: `Caesar (shift ${best.shift})`, output: best.output, score: best.score });
      }
    }
    // XOR: only worth trying if input looks like hex bytes.
    if (/^(0x)?[0-9a-fA-F\s]+$/.test(text) && text.replace(/\s/g, "").length >= 8) {
      const best = xorBruteForce(text)[0];
      if (best && best.score > -Infinity) {
        results.push({ method: `XOR (key ${best.key})`, output: best.output, score: best.score });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results;
  }

  global.CTFDecoders = {
    decodeBase64,
    decodeBase64Url,
    decodeBase32,
    decodeBase58,
    decodeHex,
    decodeBinary,
    decodeUrl,
    decodeHtmlEntities,
    rot13,
    rot47,
    caesarBruteForce,
    decodeMorse,
    xorBruteForce,
    magicSolve,
    englishScore
  };
})(window);
