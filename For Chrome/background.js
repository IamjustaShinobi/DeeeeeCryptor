// Cross-browser namespace shim (Chrome uses `chrome`, Firefox supports `browser` natively
// but also exposes `chrome` as an alias in MV3, so `chrome.*` works in both).
const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onInstalled.addListener(() => {
  api.contextMenus.create({
    id: "ctf-toolkit-decode",
    title: 'Decode "%s" with CTF Toolkit',
    contexts: ["selection"]
  });
});

api.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "ctf-toolkit-decode") return;
  const text = info.selectionText || "";

  await api.storage.local.set({ pendingText: text, pendingAt: Date.now() });

  // Chrome 116+ supports programmatic popup opening from a user gesture.
  if (api.action && typeof api.action.openPopup === "function") {
    try {
      await api.action.openPopup();
      return;
    } catch (e) {
      // Falls through — some contexts (e.g. Firefox without focused window) may reject this.
    }
  }

  // Fallback: badge the icon so the user knows something is waiting, since we
  // can't force-open the popup everywhere.
  try {
    await api.action.setBadgeText({ text: "•" });
    await api.action.setBadgeBackgroundColor({ color: "#ffb454" });
  } catch (e) {
    /* no-op */
  }
});
