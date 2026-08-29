/**
 * Small built-in wordlist for fully local/offline hash cracking. This is a
 * base list of well-known common passwords (the kind published every year in
 * public "most common passwords" reports) expanded with common mutations
 * (digits, years, leetspeak, case) to get reasonable CTF-easy-mode coverage
 * without shipping a multi-MB dictionary inside the extension.
 * Exposed on window.CTFWordlist.
 */
(function (global) {
  "use strict";

  const BASE_WORDS = [
    "password", "123456", "123456789", "qwerty", "letmein", "welcome",
    "admin", "root", "toor", "login", "guest", "test", "flag", "ctf",
    "hacker", "hackme", "iloveyou", "monkey", "dragon", "master", "shadow",
    "superman", "batman", "trustno1", "sunshine", "princess", "football",
    "baseball", "starwars", "freedom", "whatever", "abc123", "letmein1",
    "changeme", "secret", "default", "pass", "pass123", "hello", "hello123",
    "computer", "internet", "michael", "jennifer", "jordan", "hunter",
    "hunter2", "ninja", "mustang", "access", "flower", "summer", "winter",
    "spring", "autumn", "cookie", "biscuit", "purple", "orange", "yellow",
    "black", "white", "silver", "golden", "diamond", "phoenix", "falcon",
    "eagle", "tiger", "lion", "wolf", "bear", "shark", "cyber", "matrix",
    "network", "system", "server", "client", "developer", "security",
    "backdoor", "exploit", "payload", "shellcode", "malware", "rootme",
    "bruteforce", "cracked", "decoded", "encoded", "cipher", "puzzle"
  ];

  const SUFFIXES = ["", "1", "12", "123", "1234", "!", "!!", "01", "007", "99", "2023", "2024", "2025"];

  function leet(word) {
    return word
      .replace(/a/gi, "4")
      .replace(/e/gi, "3")
      .replace(/i/gi, "1")
      .replace(/o/gi, "0")
      .replace(/s/gi, "5");
  }

  /** Yields an expanded candidate list: base words × case variants × suffixes × leetspeak. */
  function generateCandidates() {
    const seen = new Set();
    const out = [];
    const add = (w) => {
      if (!seen.has(w)) {
        seen.add(w);
        out.push(w);
      }
    };
    for (const base of BASE_WORDS) {
      const variants = [base, base.toLowerCase(), base[0].toUpperCase() + base.slice(1), base.toUpperCase(), leet(base)];
      for (const v of variants) {
        for (const suf of SUFFIXES) add(v + suf);
      }
    }
    return out;
  }

  global.CTFWordlist = { BASE_WORDS, generateCandidates };
})(window);
