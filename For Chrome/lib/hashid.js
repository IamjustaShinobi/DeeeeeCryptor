/**
 * Hash identification. Local regex/length heuristics run instantly and offline;
 * identifyRemote() additionally calls the free, keyless Hashes.com identifier
 * endpoint for a broader/more confident match. Exposed on window.CTFHashID.
 */
(function (global) {
  "use strict";

  // Ordered by specificity — checked top to bottom, first match wins for the "best guess".
  const PATTERNS = [
    { name: "bcrypt", re: /^\$2[abxy]?\$\d{2}\$[./A-Za-z0-9]{53}$/ },
    { name: "md5crypt / Apache MD5", re: /^\$1\$[./A-Za-z0-9]{0,8}\$[./A-Za-z0-9]{22}$/ },
    { name: "sha256crypt", re: /^\$5\$/ },
    { name: "sha512crypt", re: /^\$6\$/ },
    { name: "phpass / WordPress", re: /^\$P\$[./A-Za-z0-9]{31}$/ },
    { name: "NTLM / MD4 (hex)", re: /^[0-9a-fA-F]{32}$/, ambiguousWith: "MD5" },
    { name: "MD5 (hex)", re: /^[0-9a-fA-F]{32}$/ },
    { name: "SHA-1 (hex)", re: /^[0-9a-fA-F]{40}$/ },
    { name: "SHA-224 (hex)", re: /^[0-9a-fA-F]{56}$/ },
    { name: "SHA-256 (hex)", re: /^[0-9a-fA-F]{64}$/ },
    { name: "SHA-384 (hex)", re: /^[0-9a-fA-F]{96}$/ },
    { name: "SHA-512 (hex)", re: /^[0-9a-fA-F]{128}$/ },
    { name: "MySQL 4.1+ (SHA1-based)", re: /^\*[0-9A-F]{40}$/ },
    { name: "CRC32 (hex)", re: /^[0-9a-fA-F]{8}$/ },
    { name: "LM/NTLM hash pair", re: /^[0-9a-fA-F]{32}:[0-9a-fA-F]{32}$/ }
  ];

  function identifyLocal(hash) {
    const t = hash.trim();
    if (!t) return [];
    const matches = [];
    for (const p of PATTERNS) {
      if (p.re.test(t)) matches.push(p.name);
    }
    return matches;
  }

  // Uses Hashes.com's free identifier endpoint — no API key required for this call.
  // Docs: https://hashes.com/en/docs  (GET /en/api/identifier?hash=...)
  async function identifyRemote(hash) {
    const url = "https://hashes.com/en/api/identifier?hash=" + encodeURIComponent(hash.trim());
    try {
      const res = await fetch(url);
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      const data = await res.json();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e.message || "network error" };
    }
  }

  global.CTFHashID = { identifyLocal, identifyRemote };
})(window);
