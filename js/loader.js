(() => {
  const root = document.documentElement, el = document.getElementById("loader");
  if (!el) return;
  if (!root.classList.contains("loading")) { el.remove(); return; }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MIN_MS = reduced ? 400 : 2900, MAX_MS = 5000, start = performance.now();
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem("dtk-seen", "1"); } catch (e) {}
    el.classList.add("done");
    root.classList.remove("loading");
    dispatchEvent(new Event("dtk:ready"));
    setTimeout(() => el.remove(), 1200);
  }

  const fonts = document.fonts && document.fonts.load
    ? Promise.race([document.fonts.load("1em Pacifico"), new Promise(r => setTimeout(r, 2500))])
    : Promise.resolve();
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise(r => addEventListener("load", r, { once: true }));

  Promise.all([fonts, loaded]).then(() => setTimeout(finish, Math.max(0, MIN_MS - (performance.now() - start))));
  setTimeout(finish, MAX_MS);
})();
