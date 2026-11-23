/* =====================================================================
   INSTALL AS APP (PWA): service worker + install pop-up + footer button
   Works on https:// or localhost (not when opening the file directly).
   ===================================================================== */
const INSTALL = {
  delaySeconds: 15,   // how long before the pop-up appears
  snoozeDays: 7,      // how long "Not now" hides it
  title: "Keep Dee's Tastera on your phone",
  text: "Open the menu and order in one tap. No app store, no download wait."
};

if ("serviceWorker" in navigator && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

(function () {
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (standalone) return;                                   // already installed
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferred = null, shown = false;
  const link = document.getElementById("installLink");
  const snoozed = () => { try { return Date.now() - Number(localStorage.getItem("dt-install-snooze")) < INSTALL.snoozeDays * 864e5; } catch (e) { return false; } };

  function hide(snooze) {
    const el = document.getElementById("installCard"); if (!el) return;
    el.classList.remove("show"); setTimeout(() => el.remove(), 500);
    if (snooze) try { localStorage.setItem("dt-install-snooze", Date.now()); } catch (e) {}
  }
  async function install() {
    if (deferred) {
      deferred.prompt(); const r = await deferred.userChoice; deferred = null; hide(false);
      if (r.outcome === "accepted" && link) link.hidden = true;
    } else show(true);                                       // iOS: show how-to
  }
  function show(force) {
    if (document.getElementById("installCard") || (!force && (shown || snoozed()))) return;
    if (!force && typeof drawerOpen !== "undefined" && drawerOpen) return setTimeout(show, 4000);
    shown = true;
    const el = document.createElement("div");
    el.className = "install glass"; el.id = "installCard"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Install app");
    const howTo = deferred ? "" : isIOS
      ? `<p class="fine">Tap the <b>Share</b> button in Safari, then <b>Add to Home Screen</b>.</p>`
      : `<p class="fine">Open your browser menu (⋮ or Share) and tap <b>Install app</b> or <b>Add to Home screen</b>.</p>`;
    el.innerHTML = `<img src="icons/icon-192.png" alt="" width="52" height="52">
      <div><b>${INSTALL.title}</b><p>${INSTALL.text}</p>${howTo}
      <div class="install-btns">${deferred ? `<button class="btn btn-primary btn-sm" id="doInstall">Install</button>` : ""}<button class="btn btn-sm btn-ghost-d" id="notNow">${howTo ? "Got it" : "Not now"}</button></div></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    el.querySelector("#notNow").onclick = () => hide(true);
    const b = el.querySelector("#doInstall"); if (b) b.onclick = install;
  }

  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; setTimeout(show, INSTALL.delaySeconds * 1000); });
  addEventListener("appinstalled", () => { hide(false); if (link) link.hidden = true; typeof toast === "function" && toast("Installed. Find Dee's Tastera on your home screen"); });
  if (isIOS) setTimeout(show, INSTALL.delaySeconds * 1000);
  if (link) link.onclick = install;
})();
