/* =====================================================================
   DEE'S TASTERA — PWA INSTALL EXPERIENCE
   Shows an install prompt where supported, and clear manual instructions
   on browsers that do not expose beforeinstallprompt.
   ===================================================================== */

const INSTALL = {
  delaySeconds: 10,
  snoozeDays: 7,
  title: "Keep Dee's Tastera on your phone",
  text: "Open the menu and order in one tap. No app store, no download wait."
};

// Register the service worker. PWAs must be served over HTTPS or localhost.
if ("serviceWorker" in navigator &&
    (location.protocol === "https:" ||
     ["localhost", "127.0.0.1"].includes(location.hostname))) {
  addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch(error => console.warn("Dee's Tastera: service worker registration failed.", error));
  });
}

(() => {
  const standalone =
    matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const link = document.getElementById("installLink");

  if (standalone) {
    if (link) link.hidden = true;
    return;
  }

  let deferredPrompt = null;
  let popupShown = false;
  let showTimer = null;

  const wasSnoozed = () => {
    try {
      const lastDismissed = Number(localStorage.getItem("dt-install-snooze") || 0);
      return lastDismissed > 0 &&
        Date.now() - lastDismissed < INSTALL.snoozeDays * 864e5;
    } catch {
      return false;
    }
  };

  function closePopup(snooze = false) {
    const popup = document.getElementById("installCard");
    if (popup) {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 500);
    }

    if (snooze) {
      try {
        localStorage.setItem("dt-install-snooze", String(Date.now()));
      } catch {}
    }
  }

  async function startInstall() {
    if (!deferredPrompt) {
      showPopup(true);
      return;
    }

    deferredPrompt.prompt();

    try {
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        closePopup(false);
        if (link) link.hidden = true;
      }
    } catch (error) {
      console.warn("Dee's Tastera: install prompt could not be completed.", error);
    }

    deferredPrompt = null;
  }

  function popupContent() {
    let instructions = "";

    if (!deferredPrompt) {
      instructions = isIOS
        ? '<p class="fine">In Safari, tap the <b>Share</b> button, then choose <b>Add to Home Screen</b>.</p>'
        : '<p class="fine">Open your browser menu (⋮ or Share) and look for <b>Install app</b> or <b>Add to Home screen</b>. The option depends on your browser.</p>';
    }

    const installButton = deferredPrompt
      ? '<button class="btn btn-primary btn-sm" id="doInstall">Install</button>'
      : "";

    return `
      <div class="install-top">
        <img src="./icons/icon-192.png" alt="" width="48" height="48">
        <span class="install-kicker">DEE'S TASTERA</span>
        <button class="install-close" id="notNow" type="button" aria-label="Dismiss install message">×</button>
      </div>
      <div class="install-copy">
        <b>${INSTALL.title}</b>
        <p>${INSTALL.text}</p>
        ${instructions}
      </div>
      <div class="install-btns">
        ${installButton}
        <button class="install-later" id="notNowSecondary" type="button">
          ${instructions ? "Got it" : "Not now"}
        </button>
      </div>`;
  }

  function showPopup(force = false) {
    if (document.getElementById("installCard")) return;
    if (!force && (popupShown || wasSnoozed())) return;

    // Avoid covering the order drawer. Retry after it closes.
    if (typeof drawerOpen !== "undefined" && drawerOpen) {
      setTimeout(() => showPopup(force), 4000);
      return;
    }

    popupShown = true;

    const popup = document.createElement("div");
    popup.className = "install glass";
    popup.id = "installCard";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-label", "Install Dee's Tastera");
    popup.innerHTML = popupContent();

    // Keep the invitation in normal document flow, directly after the nav.
    // Its expanded height pushes the hero down; closing it collapses that space.
    const nav = document.getElementById("nav");
    if (nav?.parentNode) {
      nav.insertAdjacentElement("afterend", popup);
    } else {
      document.body.prepend(popup);
    }

    requestAnimationFrame(() => popup.classList.add("show"));

    const dismiss = () => closePopup(true);
    popup.querySelector("#notNow").addEventListener("click", dismiss);
    popup.querySelector("#notNowSecondary")?.addEventListener("click", dismiss);

    const installButton = popup.querySelector("#doInstall");
    if (installButton) {
      installButton.addEventListener("click", startInstall);
    }
  }

  // Some browsers expose a native install prompt. Capture it for our button.
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;

    // If the fallback instructions are already visible, replace them with
    // the native Install button now that the browser prompt is available.
    const existing = document.getElementById("installCard");
    if (existing) {
      existing.innerHTML = popupContent();
      const dismiss = () => closePopup(true);
      existing.querySelector("#notNow").addEventListener("click", dismiss);
      existing.querySelector("#notNowSecondary")?.addEventListener("click", dismiss);
      existing.querySelector("#doInstall")?.addEventListener("click", startInstall);
    }
  });

  window.addEventListener("appinstalled", () => {
    closePopup(false);
    if (link) link.hidden = true;
    if (typeof toast === "function") {
      toast("Installed. Find Dee's Tastera on your home screen");
    }
  });

  // Important: show a useful fallback even when beforeinstallprompt never fires.
  showTimer = setTimeout(() => showPopup(false), INSTALL.delaySeconds * 1000);

  // Footer link always gives the visitor another way to see install guidance.
  if (link) {
    link.addEventListener("click", event => {
      event.preventDefault();
      if (deferredPrompt) startInstall();
      else showPopup(true);
    });
  }
})();
