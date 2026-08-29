(function () {
  "use strict";

  const api = typeof browser !== "undefined" ? browser : chrome;

  // ---------- tab switching ----------

  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
    });
  });

  // ---------- decode panel ----------

  const decodeInput = document.getElementById("decode-input");
  const decodeResults = document.getElementById("decode-results");
  const methodGrid = document.getElementById("method-grid");

  const MANUAL_METHODS = [
    { label: "Base64", fn: (t) => window.CTFDecoders.decodeBase64(t) },
    { label: "Base64URL", fn: (t) => window.CTFDecoders.decodeBase64Url(t) },
    { label: "Base32", fn: (t) => window.CTFDecoders.decodeBase32(t) },
    { label: "Base58", fn: (t) => window.CTFDecoders.decodeBase58(t) },
    { label: "Hex", fn: (t) => window.CTFDecoders.decodeHex(t) },
    { label: "Binary", fn: (t) => window.CTFDecoders.decodeBinary(t) },
    { label: "URL", fn: (t) => window.CTFDecoders.decodeUrl(t) },
    { label: "HTML ent.", fn: (t) => window.CTFDecoders.decodeHtmlEntities(t) },
    { label: "ROT13", fn: (t) => window.CTFDecoders.rot13(t) },
    { label: "ROT47", fn: (t) => window.CTFDecoders.rot47(t) },
    { label: "Morse", fn: (t) => window.CTFDecoders.decodeMorse(t) },
    { label: "Caesar (all)", fn: null } // special-cased below
  ];

  MANUAL_METHODS.forEach((m) => {
    const btn = document.createElement("button");
    btn.className = "method-btn";
    btn.textContent = m.label;
    btn.addEventListener("click", () => runManual(m));
    methodGrid.appendChild(btn);
  });

  function scoreToBars(score) {
    // Map an unbounded englishScore to 0-5 bars, purely visual.
    const n = Math.max(0, Math.min(5, Math.round((score / 15) * 5)));
    return n;
  }

  function renderResultCard(method, output, opts) {
    opts = opts || {};
    const card = document.createElement("div");
    card.className = "result-card" + (opts.top ? " top" : "");

    const meta = document.createElement("div");
    meta.className = "result-meta";

    const name = document.createElement("span");
    name.className = "method-name";
    name.textContent = method;
    meta.appendChild(name);

    if (typeof opts.score === "number" && opts.score > -Infinity) {
      const conf = document.createElement("div");
      conf.className = "confidence";
      const bars = scoreToBars(opts.score);
      for (let i = 0; i < 5; i++) {
        const s = document.createElement("span");
        if (i < bars) s.classList.add("on");
        conf.appendChild(s);
      }
      meta.appendChild(conf);
    } else {
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "copy";
      copyBtn.addEventListener("click", () => navigator.clipboard.writeText(output));
      meta.appendChild(copyBtn);
    }

    card.appendChild(meta);

    const out = document.createElement("div");
    out.className = "result-output";
    out.textContent = output;
    card.appendChild(out);

    if (typeof opts.score === "number") {
      out.addEventListener("dblclick", () => navigator.clipboard.writeText(output));
      out.title = "Double-click to copy";
    }

    return card;
  }

  function runManual(method) {
    const text = decodeInput.value;
    decodeResults.innerHTML = "";
    if (!text.trim()) return;

    if (method.label === "Caesar (all)") {
      const results = window.CTFDecoders.caesarBruteForce(text).slice(0, 5);
      results.forEach((r, i) =>
        decodeResults.appendChild(renderResultCard(`Caesar shift ${r.shift}`, r.output, { score: r.score, top: i === 0 }))
      );
      return;
    }

    const r = method.fn(text);
    if (r.ok) {
      decodeResults.appendChild(renderResultCard(method.label, r.output));
    } else {
      const err = document.createElement("div");
      err.className = "result-error";
      err.textContent = `${method.label}: ${r.note || "could not decode"}`;
      decodeResults.appendChild(err);
    }
  }

  document.getElementById("btn-magic").addEventListener("click", () => {
    const text = decodeInput.value;
    decodeResults.innerHTML = "";
    if (!text.trim()) return;
    const results = window.CTFDecoders.magicSolve(text);
    if (!results.length) {
      const err = document.createElement("div");
      err.className = "result-error";
      err.textContent = "No confident decode found — try a manual method below, or this may not be encoded at all.";
      decodeResults.appendChild(err);
      return;
    }
    results.slice(0, 6).forEach((r, i) =>
      decodeResults.appendChild(renderResultCard(r.method, r.output, { score: r.score, top: i === 0 }))
    );
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    decodeInput.value = "";
    decodeResults.innerHTML = "";
  });

  // ---------- hash panel ----------

  const hashInput = document.getElementById("hash-input");
  const hashIdResults = document.getElementById("hash-id-results");
  const hashCrackResults = document.getElementById("hash-crack-results");
  const progressLine = document.getElementById("crack-progress");

  document.getElementById("btn-identify").addEventListener("click", async () => {
    const hash = hashInput.value.trim();
    hashIdResults.innerHTML = "";
    if (!hash) return;

    const local = window.CTFHashID.identifyLocal(hash);
    const card = document.createElement("div");
    card.className = "result-card top";
    const meta = document.createElement("div");
    meta.className = "result-meta";
    const name = document.createElement("span");
    name.className = "method-name";
    name.textContent = "local heuristic";
    meta.appendChild(name);
    card.appendChild(meta);
    const out = document.createElement("div");
    out.className = "result-output";
    out.textContent = local.length ? local.join(", ") : "No pattern match — unrecognized format.";
    card.appendChild(out);
    hashIdResults.appendChild(card);

    const remote = await window.CTFHashID.identifyRemote(hash);
    const rCard = document.createElement("div");
    rCard.className = "result-card";
    const rMeta = document.createElement("div");
    rMeta.className = "result-meta";
    const rName = document.createElement("span");
    rName.className = "method-name";
    rName.textContent = "hashes.com identifier";
    rMeta.appendChild(rName);
    rCard.appendChild(rMeta);
    const rOut = document.createElement("div");
    rOut.className = "result-output";
    if (remote.ok) {
      const d = remote.data;
      rOut.textContent = typeof d === "string" ? d : JSON.stringify(d, null, 1);
    } else {
      rOut.textContent = `Lookup failed: ${remote.error}`;
    }
    rCard.appendChild(rOut);
    hashIdResults.appendChild(rCard);
  });

  document.getElementById("btn-crack-local").addEventListener("click", async () => {
    const hash = hashInput.value.trim();
    hashCrackResults.innerHTML = "";
    if (!hash) return;

    progressLine.hidden = false;
    progressLine.textContent = "cracking… 0%";

    const result = await window.CTFHashLookup.crackLocal(hash, null, (done, total) => {
      progressLine.textContent = `cracking… ${Math.round((done / total) * 100)}%`;
    });

    progressLine.hidden = true;

    const card = document.createElement("div");
    card.className = "result-card" + (result.ok ? " top" : "");
    const meta = document.createElement("div");
    meta.className = "result-meta";
    const badge = document.createElement("span");
    badge.className = "badge " + (result.ok ? "found" : "not-found");
    badge.textContent = result.ok ? "cracked" : "not found";
    meta.appendChild(badge);
    card.appendChild(meta);
    const out = document.createElement("div");
    out.className = "result-output";
    out.textContent = result.ok
      ? `${result.plaintext}  (${result.algo})`
      : "Not in the built-in wordlist. Try the Hashes.com lookup, or use a full wordlist with a dedicated cracker (hashcat/john).";
    card.appendChild(out);
    hashCrackResults.appendChild(card);
  });

  document.getElementById("btn-crack-remote").addEventListener("click", async () => {
    const hash = hashInput.value.trim();
    hashCrackResults.innerHTML = "";
    if (!hash) return;

    const { apiKey } = await api.storage.local.get("apiKey");
    const result = await window.CTFHashLookup.lookupRemote(hash, apiKey);

    const card = document.createElement("div");
    const meta = document.createElement("div");
    meta.className = "result-meta";
    const badge = document.createElement("span");
    card.appendChild(meta);
    const out = document.createElement("div");
    out.className = "result-output";

    if (!result.ok) {
      card.className = "result-card";
      badge.className = "badge not-found";
      badge.textContent = "error";
      meta.appendChild(badge);
      out.textContent = result.error;
    } else {
      const found = result.data && result.data.found && result.data.found.length;
      card.className = "result-card" + (found ? " top" : "");
      badge.className = "badge " + (found ? "found" : "not-found");
      badge.textContent = found ? "found" : "not found";
      meta.appendChild(badge);
      out.textContent = JSON.stringify(result.data, null, 1);
    }
    card.appendChild(out);
    hashCrackResults.appendChild(card);
  });

  document.getElementById("btn-options").addEventListener("click", () => {
    if (api.runtime.openOptionsPage) api.runtime.openOptionsPage();
  });

  // ---------- load text handed off from the right-click context menu ----------

  (async function loadPendingSelection() {
    try {
      const { pendingText } = await api.storage.local.get("pendingText");
      if (pendingText) {
        decodeInput.value = pendingText;
        await api.storage.local.remove("pendingText");
        if (api.action && api.action.setBadgeText) api.action.setBadgeText({ text: "" });
      }
    } catch (e) {
      /* storage not available in this context — ignore */
    }
  })();
})();
