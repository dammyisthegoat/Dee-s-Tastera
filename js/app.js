/* =====================================================================
   DEE'S TASTERA — APP LOGIC (you shouldn't need to edit this file;
   numbers, text and menu items are all in js/config.js)
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => CONFIG.currency + n.toLocaleString("en-NG");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let cart = {}, cat = "All", view = "order", drawerOpen = false, lastFocus = null;
let form = { name:"", phone:"", mode:"Delivery", address:"", notes:"" };
try { cart = JSON.parse(localStorage.getItem("dt-cart")) || {}; } catch (e) {}
try { Object.assign(form, JSON.parse(localStorage.getItem("dt-form")) || {}, { notes:"" }); } catch (e) {}  // remember returning customers
let orderRef = "";
const makeRef = () => "DT-" + Date.now().toString(36).slice(-5).toUpperCase();
const waUrl = () => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message())}`;
const save = () => { try { localStorage.setItem("dt-cart", JSON.stringify(cart)); } catch (e) {} };
const items = () => Object.entries(cart).map(([id, q]) => ({ ...MENU.find(m => m.id === id), q })).filter(i => i.name);
const count = () => items().reduce((a, i) => a + i.q, 0);
const subtotal = () => items().reduce((a, i) => a + i.q * i.price, 0);

/* ---------- fill in business details ---------- */
$("#heroBg").style.backgroundImage = `url("${CONFIG.hero}")`;
if (CONFIG.portrait) $("#portrait").innerHTML = `<img src="${esc(CONFIG.portrait)}" alt="Dee, the cook behind Dee's Tastera" loading="lazy">`;
$("#waLink").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hi Dee! I have a question about your food.")}`;
$("#igLink").href = CONFIG.instagram; $("#igLink").textContent = CONFIG.instagramLabel;
$("#phoneTxt").textContent = CONFIG.phone; $("#locTxt").textContent = CONFIG.location;
$("#mailLink").href = "mailto:" + CONFIG.email; $("#mailLink").textContent = CONFIG.email;
$("#yr").textContent = new Date().getFullYear();

/* ---------- menu ---------- */
const cats = ["All", ...new Set(MENU.map(m => m.cat))];
const renderCats = () => $("#cats").innerHTML = cats.map(c => `<button aria-pressed="${c === cat}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
function ctl(m) {
  const q = cart[m.id] || 0;
  if (!CONFIG.acceptingOrders) return `<button class="add" disabled>Closed for now</button>`;
  if (m.avail === "soldout") return `<button class="add" disabled>Not today</button>`;
  return q
    ? `<div class="stepper"><button data-act="dec" data-id="${m.id}" aria-label="One less ${esc(m.name)}">−</button><b>${q}</b><button data-act="inc" data-id="${m.id}" aria-label="One more ${esc(m.name)}">+</button></div>`
    : `<button class="add" data-act="inc" data-id="${m.id}">Add to order</button>`;
}
function renderMeals() {
  $("#meals").innerHTML = MENU.filter(m => cat === "All" || m.cat === cat).map((m, i) => `
  <article class="meal glass" data-reveal style="--d:${(i % 2) * .08}s" data-m="${m.id}">
    <div class="ph"><img src="${esc(m.img)}" alt="${esc(m.name)}" loading="lazy" width="700" height="480" onerror="this.style.display='none'"></div>
    <div class="meal-body"><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p>
      <div class="meal-foot"><div><span class="price">${money(m.price)}</span><span class="tag ${m.avail}">${TEXT.availability[m.avail]}</span></div><span class="ctl">${ctl(m)}</span></div></div>
  </article>`).join("");
  $$("#meals [data-reveal]").forEach(el => io ? io.observe(el) : el.classList.add("in"));
}

/* ---------- cart ---------- */
function change(id, d) {
  const m = MENU.find(x => x.id === id); if (!m || m.avail === "soldout") return;
  const q = (cart[id] || 0) + d;
  q <= 0 ? delete cart[id] : cart[id] = Math.min(q, 99);
  save(); sync(); if (d > 0 && q === 1) toast(`${m.name} is in your order`);
}
function sync() {
  $$(".meal").forEach(el => $(".ctl", el).innerHTML = ctl(MENU.find(x => x.id === el.dataset.m)));
  const n = count(), bar = $("#bar"), nc = $("#navCount");
  $("#barTxt").textContent = `${n} item${n === 1 ? "" : "s"} · ${money(subtotal())}`;
  nc.hidden = !n; nc.textContent = n; nc.classList.remove("pop"); void nc.offsetWidth; if (n) nc.classList.add("pop");
  bar.classList.toggle("show", n > 0 && !drawerOpen);
  bar.classList.remove("bump"); void bar.offsetWidth; if (n) bar.classList.add("bump");
  if (drawerOpen) renderDrawer();
}

/* ---------- the WhatsApp message (edit wording in config.js → TEXT) ---------- */
function message() {
  const lines = items().map(i => `• ${i.q} × ${i.name} (${money(i.q * i.price)})`);
  return [`*Order ${orderRef}*`, TEXT.orderIntro, ``, ...lines, ``, `*Subtotal:* ${money(subtotal())}`, ``,
    `*Name:* ${form.name.trim()}`, `*Phone:* ${form.phone.trim()}`,
    form.mode === "Delivery" ? `*Delivery to:* ${form.address.trim()}` : `*Collection:* I'll pick it up`,
    form.notes.trim() ? `*Notes:* ${form.notes.trim()}` : "", ``, TEXT.orderOutro].join("\n").replace(/\n{3,}/g, "\n\n");
}

/* ---------- drawer ---------- */
const payBox = () => CONFIG.account && CONFIG.account.number ? `<div class="pay glass"><p class="eyebrow">Payment details</p>
  <div class="pay-row"><div><b>${esc(CONFIG.account.number)}</b><span>${esc(CONFIG.account.bank)} · ${esc(CONFIG.account.name)}</span></div><button class="btn btn-sm btn-ghost-d" id="copyAcct">Copy</button></div>
  <p class="fine">Please wait for Dee to confirm your total before you pay.</p></div>` : "";
function renderDrawer() {
  const body = $("#dBody"), foot = $("#dFoot"), list = items();
  $("#dTitle").textContent = view === "review" ? "Almost there" : view === "sent" ? "Order ready" : "Your order";
  if (!CONFIG.acceptingOrders) {
    body.innerHTML = `<div class="empty"><strong>Kitchen's closed</strong>${esc(CONFIG.closedMessage)}</div>`;
    foot.innerHTML = `<a class="btn btn-primary" style="width:100%" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}">Message Dee</a>`; return;
  }
  if (view === "sent" && list.length) {
    body.innerHTML = `<div class="empty"><strong>Nearly done</strong>${esc(TEXT.afterSend)}</div>
      <p class="fine" style="text-align:center">${esc(TEXT.payNote)}</p>${payBox()}
      <div style="display:grid;gap:8px;margin-top:18px"><a class="btn btn-primary" target="_blank" rel="noopener" href="${waUrl()}">WhatsApp didn't open? Tap here</a><button class="btn btn-ghost-d" id="copy">Copy my order instead</button></div>`;
    foot.innerHTML = `<button class="btn btn-ghost-d" style="width:100%" id="done">Done, start a new order</button>`; return;
  }
  if (!list.length) {
    view = "order";
    body.innerHTML = `<div class="empty"><strong>Your tray is empty</strong>Pick something tasty from the menu.</div>`;
    foot.innerHTML = `<button class="btn btn-primary" style="width:100%" data-close>Back to the menu</button>`; return;
  }
  if (view === "order") {
    const keep = document.activeElement && document.activeElement.id;
    body.innerHTML = list.map(i => `<div class="line"><div><div class="nm">${esc(i.name)}</div><div class="sub">${money(i.price)} each · ${money(i.q * i.price)}</div></div>
      <button class="rm" data-act="rm" data-id="${i.id}">Remove</button>
      <div class="stepper"><button data-act="dec" data-id="${i.id}" aria-label="One less ${esc(i.name)}">−</button><b>${i.q}</b><button data-act="inc" data-id="${i.id}" aria-label="One more ${esc(i.name)}">+</button></div></div>`).join("") + `
      <div class="field"><label>How do you want to get it?</label><div class="seg">${["Delivery", "Collection"].map(m => `<button data-mode="${m}" aria-pressed="${form.mode === m}">${m}</button>`).join("")}</div></div>
      <div class="field"><label for="f-name">Your name</label><input id="f-name" autocomplete="name" value="${esc(form.name)}"></div>
      <div class="field"><label for="f-phone">Phone number</label><input id="f-phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(form.phone)}"></div>
      ${form.mode === "Delivery" ? `<div class="field"><label for="f-address">Delivery address</label><input id="f-address" autocomplete="street-address" value="${esc(form.address)}"></div>` : `<p class="fine">Dee will confirm where and when to collect.</p>`}
      <div class="field"><label for="f-notes">Anything Dee should know? (optional)</label><textarea id="f-notes" rows="3" placeholder="Spice level, allergies, best time to reach you…">${esc(form.notes)}</textarea></div><p class="err" id="err" role="alert"></p>`;
    foot.innerHTML = `<div class="total"><span>Subtotal</span><span>${money(subtotal())}</span></div><button class="btn btn-primary" style="width:100%" id="toReview">Review my order</button><p class="fine">Delivery fees, if any, are confirmed by Dee.</p>`;
    if (keep) { const k = document.getElementById(keep); k && k.focus(); }
  } else {
    body.innerHTML = `<p class="fine">This is exactly what Dee will see on WhatsApp. Check it over, then send. Nothing is paid or confirmed until Dee replies.</p><div class="review">${esc(message())}</div>${payBox()}
      ${/^2340+$/.test(CONFIG.whatsapp) ? `<p class="warn">Heads up: add Dee's real WhatsApp number in js/config.js.</p>` : ""}`;
    foot.innerHTML = `<div class="total"><span>Subtotal</span><span>${money(subtotal())}</span></div><button class="btn btn-primary" style="width:100%" id="send">Send to Dee on WhatsApp</button><button class="btn" style="width:100%;margin-top:6px;color:var(--espresso)" id="back">Edit my order</button>`;
  }
}
function openDrawer() {
  lastFocus = document.activeElement; drawerOpen = true; view = "order"; renderDrawer();
  $("#drawer").classList.add("open"); $("#drawer").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("open");
  document.body.style.overflow = "hidden"; $("#bar").classList.remove("show"); toggleNav(false); setTimeout(() => $("#close").focus(), 60);
}
function closeDrawer() {
  drawerOpen = false; $("#drawer").classList.remove("open"); $("#drawer").setAttribute("aria-hidden", "true"); $("#scrim").classList.remove("open");
  document.body.style.overflow = ""; sync(); lastFocus && lastFocus.focus && lastFocus.focus();
}
function validate() {
  const e = !form.name.trim() ? "What should Dee call you?"
    : form.phone.replace(/\D/g, "").length < 7 ? "Add a phone number so Dee can reach you."
    : (form.mode === "Delivery" && !form.address.trim()) ? "Where should Dee bring your order?" : "";
  $("#err").textContent = e; return !e;
}
let tt; function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 1900); }

/* ---------- clicks, typing, keyboard ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("button,a"); if (!t) return;
  if (t.dataset.cat) { cat = t.dataset.cat; renderCats(); renderMeals(); return; }
  if (t.dataset.act) { const id = t.dataset.id; t.dataset.act === "rm" ? (delete cart[id], save(), sync()) : change(id, t.dataset.act === "inc" ? 1 : -1); return; }
  if (t.dataset.mode) { form.mode = t.dataset.mode; renderDrawer(); return; }
  if (t.hasAttribute("data-open-order")) return openDrawer();
  if (t.hasAttribute("data-close") || t.id === "close") return closeDrawer();
  if (t.id === "toReview") { if (validate()) { orderRef = makeRef(); view = "review"; renderDrawer(); $("#dBody").scrollTop = 0; } return; }
  if (t.id === "back") { view = "order"; renderDrawer(); return; }
  if (t.id === "send") { window.open(waUrl(), "_blank", "noopener"); view = "sent"; renderDrawer(); return; }
  if (t.id === "copyAcct") { navigator.clipboard && navigator.clipboard.writeText(CONFIG.account.number).then(() => toast("Account number copied")); return; }
  if (t.id === "copy") { navigator.clipboard && navigator.clipboard.writeText(message()).then(() => toast("Order copied. Paste it to Dee on WhatsApp")); return; }
  if (t.id === "done") { cart = {}; save(); view = "order"; closeDrawer(); toast("Thank you! Dee will be in touch"); return; }
  if (t.closest("#links")) toggleNav(false);
});
document.addEventListener("input", e => { const k = { "f-name":"name", "f-phone":"phone", "f-address":"address", "f-notes":"notes" }[e.target.id]; if (k) { form[k] = e.target.value; try { localStorage.setItem("dt-form", JSON.stringify(form)); } catch (x) {} } });
$("#scrim").onclick = closeDrawer;
document.addEventListener("keydown", e => {
  if (e.key === "Escape") drawerOpen ? closeDrawer() : toggleNav(false);
  if (e.key === "Tab" && drawerOpen) {
    const f = $$("button,input,textarea", $("#drawer")).filter(x => !x.disabled && x.offsetParent), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});
function toggleNav(o) { $("#links").classList.toggle("open", o); $("#burger").setAttribute("aria-expanded", o); }
$("#burger").onclick = () => toggleNav(!$("#links").classList.contains("open"));

/* ---------- hover glow that follows the cursor on glass panels ---------- */
document.addEventListener("pointermove", e => {
  if (e.pointerType !== "mouse") return;
  const g = e.target.closest(".glass"); if (!g) return;
  const r = g.getBoundingClientRect(); g.style.setProperty("--mx", e.clientX - r.left + "px"); g.style.setProperty("--my", e.clientY - r.top + "px");
});

/* ---------- scroll: reveal, progress bar, nav hide/show, parallax ---------- */
const io = "IntersectionObserver" in window && !reduced
  ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" }) : null;
$$("[data-reveal]").forEach(el => io ? io.observe(el) : el.classList.add("in"));

const nav = $("#nav"), prog = $("#progress"), heroBg = $("#heroBg"), blobs = $$("[data-speed]");
let lastY = 0, ticking = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle("scrolled", y > 30);
  const hide = y > lastY + 6 && y > 320 && !drawerOpen && !$("#links").classList.contains("open");
  if (hide) { nav.classList.add("hide"); document.body.classList.add("nav-hide"); }
  else if (y < lastY - 6 || y < 320) { nav.classList.remove("hide"); document.body.classList.remove("nav-hide"); }
  lastY = y;
  if (!reduced) {
    if (y < innerHeight * 1.3) heroBg.style.transform = `translateY(${y * .22}px) scale(${1 + y / innerHeight * .08})`;
    blobs.forEach(b => { const r = b.parentElement.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) b.style.transform = `translateY(${r.top * b.dataset.speed}px)`; });
  }
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

if (!CONFIG.acceptingOrders) $("#meals").insertAdjacentHTML("beforebegin", `<div class="glass closed">${esc(CONFIG.closedMessage)}</div>`);
renderCats(); renderMeals(); sync(); onScroll();
