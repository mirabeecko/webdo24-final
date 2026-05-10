'use strict';

/* ===========================================================
   WebDo24 — Načisto
   Lehký, čistý JS bez závislostí.
   =========================================================== */

const $  = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Sticky header state ===== */
(function header() {
  const h = $('#siteHeader');
  if (!h) return;
  const update = () => h.classList.toggle('scrolled', window.scrollY > 12);
  update();
  window.addEventListener('scroll', update, { passive: true });
})();

/* ===== Mobile menu ===== */
(function mobMenu() {
  const toggle = $('#menuToggle');
  const menu = $('#mobMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();

/* ===== Reveal animations ===== */
(function reveal() {
  const els = $$('.rev, .revL, .revR');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
})();

/* ===== Parallax ===== */
(function parallax() {
  if (prefersReduced) return;
  const layers = $$('[data-parallax]');
  if (!layers.length) return;

  let ticking = false;
  function update() {
    const vh = window.innerHeight;
    layers.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const offset = (rect.top - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
})();

/* ===== FAQ accordion ===== */
(function faq() {
  $$('.faq-item').forEach(item => {
    const q = $('.faq-q', item);
    const a = $('.faq-a', item);
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });
})();

/* ===== Slot countdown (resets at midnight) ===== */
(function slotCountdown() {
  const el = $('#slot-timer');
  if (!el) return;
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const t = end - now;
    if (t <= 0) { el.textContent = '00:00:00'; return; }
    const h = Math.floor(t / 3600000);
    const m = Math.floor((t % 3600000) / 60000);
    const s = Math.floor((t % 60000) / 1000);
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  tick(); setInterval(tick, 1000);
})();

/* ===== Portfolio modal ===== */
const portfolioModal = $('#portfolio-modal');
const portfolioFrame = $('#portfolio-modal-iframe');
const portfolioUrl   = $('#portfolio-modal-url');
const portfolioExt   = $('#portfolio-modal-external');

function openPortfolio(url, name) {
  if (!portfolioModal) return;
  portfolioFrame.src = url;
  portfolioUrl.textContent = url.replace(/^https?:\/\//, '');
  portfolioExt.href = url;
  portfolioModal.classList.add('open');
  portfolioModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closePortfolio() {
  if (!portfolioModal) return;
  portfolioModal.classList.remove('open');
  portfolioModal.setAttribute('aria-hidden', 'true');
  portfolioFrame.src = '';
  document.body.style.overflow = '';
}
window.openPortfolio = openPortfolio;
window.closePortfolio = closePortfolio;
if (portfolioModal) {
  $('#portfolio-modal-close')?.addEventListener('click', closePortfolio);
  portfolioModal.addEventListener('click', (e) => { if (e.target === portfolioModal) closePortfolio(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePortfolio(); });
}

/* ===== Contact form (mock) ===== */
function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (!btn) return false;
  const orig = btn.textContent;
  btn.textContent = 'Odesílám…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Odesláno — ozveme se do 30 minut';
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; e.target.reset(); }, 4500);
  }, 900);
  return false;
}
window.handleContact = handleContact;

/* ===== Social proof notifications ===== */
(function notifications() {
  const stack = $('#notif-wrap');
  if (!stack || prefersReduced) return;

  const NOTIFS = [
    {e:'🏢', t:'Martin V. z Prahy zarezervoval slot pro web realitní kanceláře'},
    {e:'🍕', t:'Pizzerie Bella potvrdila náhled webu a zaplatila zálohu'},
    {e:'💇', t:'Barbershop Royal podepsal smlouvu na nový web'},
    {e:'🔧', t:'Autoservis Novák dokončil onboarding za 12 minut'},
    {e:'⚖️', t:'Advokátní kancelář Horáček přechází na Model PRO'},
    {e:'🏋️', t:'Fitness PowerGym právě spustilo nový web'},
    {e:'📸', t:'Fotograf Marek schválil náhled webu — produkce běží'},
    {e:'🛍️', t:'Butik Mode objednal doménu a profesionální e-mail'},
    {e:'☕', t:'Kavárna Artisan přidala hodnocení 5 hvězdiček'},
    {e:'🏠', t:'Realitní kancelář Brno potvrdila objednávku PRO'},
    {e:'💻', t:'IT startup DataFlow zaplatil za balíček ELITE'},
    {e:'🌿', t:'Zahradní centrum GreenBrno zobrazilo náhled webu'},
    {e:'🍰', t:'Cukrárna Sweet Dreams spustila web s rezervacemi'},
    {e:'🚗', t:'Autopůjčovna DriveOstrava dokončila web'},
    {e:'🌟', t:'Eventová agentura EventPro spustila web'},
    {e:'🔌', t:'Elektroinstalace Novotný podepsala smlouvu'},
    {e:'🎭', t:'Taneční škola Rytmus dokončila registraci'},
    {e:'🐾', t:'Psí salon Woofy zaplatil zálohu na nový web'},
    {e:'🏊', t:'Aquapark klub zaplatil za roční plán'},
    {e:'🌺', t:'Květinářství Florea spustilo web s e-shopem'},
    {e:'🏥', t:'Fyzioterapie MoveWell zaplatila zálohu'},
    {e:'🚀', t:'Tech startup SpeedOlom dokončil onboarding'},
    {e:'🎓', t:'Doučování Olomouc přidalo hodnocení 5 hvězd'},
    {e:'💼', t:'Účetní firma HK zarezervovala slot pro nový web'}
  ];

  let queue = [];
  function refill() {
    queue = NOTIFS.map((_, i) => i);
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
  }
  refill();
  function nextNotif() { if (!queue.length) refill(); return NOTIFS[queue.pop()]; }
  function timeLabel() {
    const r = Math.random();
    if (r < 0.5) return 'právě teď';
    if (r < 0.85) return 'před ' + (Math.floor(Math.random() * 8) + 1) + ' min';
    return 'před ' + (Math.floor(Math.random() * 45) + 15) + ' min';
  }

  function show() {
    if (document.hidden) { schedule(); return; }
    const n = nextNotif();
    const el = document.createElement('div');
    el.className = 'notif-card in';
    el.innerHTML = `
      <span class="emoji">${n.e}</span>
      <div style="min-width:0;flex:1;">
        <div style="font-weight:500;color:var(--ink);line-height:1.35;">${n.t}</div>
        <div style="font-size:11.5px;color:var(--ink-3);margin-top:3px;">${timeLabel()}</div>
      </div>
      <button aria-label="Zavřít" style="background:none;border:none;cursor:pointer;color:var(--ink-3);font-size:18px;line-height:1;padding:0 2px;">×</button>
    `;
    el.querySelector('button').addEventListener('click', () => remove(el));
    stack.appendChild(el);
    while (stack.children.length > 2) remove(stack.firstElementChild);
    setTimeout(() => remove(el), 6800);
    schedule();
  }
  function remove(el) {
    if (!el || !el.parentNode) return;
    el.classList.remove('in'); el.classList.add('out');
    setTimeout(() => el.remove(), 400);
  }
  const RHYTHM = [9000, 7000, 14000, 11000, 6000];
  let i = 0;
  function schedule() { setTimeout(show, RHYTHM[i++ % RHYTHM.length]); }
  setTimeout(show, 4500);
})();
