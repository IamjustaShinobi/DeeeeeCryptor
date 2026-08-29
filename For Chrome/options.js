(function () {
  "use strict";
  const api = typeof browser !== "undefined" ? browser : chrome;
  const input = document.getElementById("api-key");
  const status = document.getElementById("status");

  api.storage.local.get("apiKey").then(({ apiKey }) => {
    if (apiKey) input.value = apiKey;
  });

  document.getElementById("btn-save").addEventListener("click", async () => {
    await api.storage.local.set({ apiKey: input.value.trim() });
    status.textContent = "Saved.";
    setTimeout(() => (status.textContent = ""), 1500);
  });

  document.getElementById("btn-clear").addEventListener("click", async () => {
    input.value = "";
    await api.storage.local.remove("apiKey");
    status.textContent = "Cleared.";
    setTimeout(() => (status.textContent = ""), 1500);
  });
})();
