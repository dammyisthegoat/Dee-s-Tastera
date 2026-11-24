const INSTALL = {
  delaySeconds: 10,
  snoozeDays: 7,
  title: "Keep D’Tastera Kitchen on your phone",
  text: "Open the menu and order in one tap. No app store, no download wait.",
  desktopTitle: "Keep D’Tastera Kitchen on your computer",
  desktopText: "Open the menu and order in one click, straight from your desktop or taskbar."
};

if ("serviceWorker" in navigator &&
    (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
  addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch(error => console.warn("Service worker registration failed.", error));
  });
}

(() => {
  const link = document.getElementById("installLink");
  const slot = document.getElementById("installSlot");
  const inner = document.getElementById("installInner");
  const standalone = matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isDesktop = !isIOS && !isAndroid;

  if (standalone) { if (link) link.hidden = true; return; }

  let deferredPrompt = null, popupShown = false, closeTimer = null;

  const wasSnoozed = () => {
    try {
      const last = Number(localStorage.getItem("dtk-install-snooze") || 0);
      return last > 0 && Date.now() - last < INSTALL.snoozeDays * 864e5;
    } catch { return false; }
  };

  function closePopup(snooze = false) {
    slot.classList.remove("open");
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { inner.innerHTML = ""; }, 500);
    if (snooze) { try { localStorage.setItem("dtk-install-snooze", String(Date.now())); } catch {} }
  }

  async function startInstall() {
    if (!deferredPrompt) { showPopup(true); return; }
    deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") { closePopup(false); if (link) link.hidden = true; }
    } catch (error) { console.warn("Install prompt could not be completed.", error); }
    deferredPrompt = null;
  }

  function popupHTML() {
    const steps = deferredPrompt ? "" : isIOS
      ? '<p class="fine">In Safari, tap the <b>Share</b> button, then choose <b>Add to Home Screen</b>.</p>'
      : isAndroid
      ? '<p class="fine">Tap the <b>⋮</b> menu in your browser, then choose <b>Install app</b> or <b>Add to Home screen</b>.</p>'
      : '<p class="fine">In Chrome or Edge, click the install icon at the right of the address bar, or open the browser menu and choose <b>Install</b>. Some browsers don’t support installing.</p>';
    const title = isDesktop ? INSTALL.desktopTitle : INSTALL.title;
    const text = isDesktop ? INSTALL.desktopText : INSTALL.text;
    return `<div class="install" id="installCard" role="dialog" aria-label="Install D’Tastera Kitchen">
      <div class="install-top"><img src="./icons/icon-192.png" alt="" width="44" height="44"><span class="install-kicker">D’TASTERA KITCHEN</span>
        <button class="install-close" id="notNow" type="button" aria-label="Dismiss install message">×</button></div>
      <div class="install-copy"><b>${title}</b><p>${text}</p>${steps}</div>
      <div class="install-btns">${deferredPrompt ? '<button class="btn btn-primary btn-sm" id="doInstall">Install</button>' : ""}
        <button class="install-later" id="notNowSecondary" type="button">${steps ? "Got it" : "Not now"}</button></div></div>`;
  }

  function bindPopup() {
    const dismiss = () => closePopup(true);
    inner.querySelector("#notNow").addEventListener("click", dismiss);
    inner.querySelector("#notNowSecondary").addEventListener("click", dismiss);
    const b = inner.querySelector("#doInstall"); if (b) b.addEventListener("click", startInstall);
  }

  function showPopup(force = false) {
    if (inner.querySelector("#installCard") && slot.classList.contains("open")) return;
    if (!force && (popupShown || wasSnoozed())) return;
    if (typeof drawerOpen !== "undefined" && drawerOpen) { setTimeout(() => showPopup(force), 4000); return; }
    popupShown = true;
    clearTimeout(closeTimer);
    inner.innerHTML = popupHTML();
    bindPopup();
    requestAnimationFrame(() => requestAnimationFrame(() => slot.classList.add("open")));
  }

  addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    if (inner.querySelector("#installCard")) { inner.innerHTML = popupHTML(); bindPopup(); }
  });

  addEventListener("appinstalled", () => {
    closePopup(false);
    if (link) link.hidden = true;
    if (typeof toast === "function") toast("Installed. Find D’Tastera on your home screen");
  });

  const startTimer = () => setTimeout(() => { if (!isDesktop || deferredPrompt) showPopup(false); }, INSTALL.delaySeconds * 1000);
  document.documentElement.classList.contains("loading") ? addEventListener("dtk:ready", startTimer, { once: true }) : startTimer();

  if (link) link.addEventListener("click", () => { deferredPrompt ? startInstall() : showPopup(true); });
})();
