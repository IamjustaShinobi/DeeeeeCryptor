/**
 * Two independent ways to go from hash -> plaintext:
 *  1. crackLocal()   — fully offline, runs the built-in wordlist against MD5/SHA1/SHA256/SHA512.
 *  2. lookupRemote() — queries Hashes.com's cracked-hash database (requires the user's own
 *                      API key, since that endpoint is a paid/credit-based service — see
 *                      https://hashes.com/en/docs). We never ship or hardcode a key.
 * Exposed on window.CTFHashLookup.
 */
(function (global) {
  "use strict";

  async function sha(algo, text) {
    const buf = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest(algo, buf);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const HASHERS = {
    MD5: async (t) => global.md5(t),
    "SHA-1": (t) => sha("SHA-1", t),
    "SHA-256": (t) => sha("SHA-256", t),
    "SHA-512": (t) => sha("SHA-512", t)
  };

  /**
   * Tries the built-in wordlist against the target hash for each candidate algorithm.
   * @param {string} targetHash
   * @param {string[]} algos - subset of Object.keys(HASHERS) to try; defaults to all.
   * @param {(done:number, total:number)=>void} onProgress
   */
  async function crackLocal(targetHash, algos, onProgress) {
    const hash = targetHash.trim().toLowerCase();
    const algoList = (algos && algos.length ? algos : Object.keys(HASHERS)).filter((a) => HASHERS[a]);
    const candidates = global.CTFWordlist.generateCandidates();
    const total = candidates.length * algoList.length;
    let done = 0;

    for (const candidate of candidates) {
      for (const algo of algoList) {
        const digest = await HASHERS[algo](candidate);
        done++;
        if (done % 200 === 0 && onProgress) onProgress(done, total);
        if (digest === hash) {
          if (onProgress) onProgress(total, total);
          return { ok: true, plaintext: candidate, algo };
        }
      }
    }
    if (onProgress) onProgress(total, total);
    return { ok: false };
  }

  /**
   * Queries Hashes.com's search API. Requires an API key (Hashes.com account, paid credits).
   * The key is supplied by the user via the options page and stored in extension storage —
   * this code never embeds or transmits a key of ours.
   */
  async function lookupRemote(targetHash, apiKey) {
    if (!apiKey) return { ok: false, error: "No Hashes.com API key configured. Add one in extension options." };
    try {
      const body = new FormData();
      body.append("key", apiKey);
      body.append("hashes[]", targetHash.trim());
      const res = await fetch("https://hashes.com/en/api/search", { method: "POST", body });
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      const data = await res.json();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e.message || "network error" };
    }
  }

  global.CTFHashLookup = { crackLocal, lookupRemote, HASHERS };
})(window);
