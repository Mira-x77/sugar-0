import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/manrope/300.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './style.css';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products, featureGroups, reviews, faqs } from './data.js';
import { icon } from './icons.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const money = (n) => '₹' + n.toLocaleString('en-IN');

document.documentElement.classList.add('js');

/* ============================================================
   Smooth scroll
   ============================================================ */
let sceneApi = null;
const baseTitle = document.title;
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.15
});
window.__lenis = lenis;
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

let locked = false;
function lockScroll() {
  if (locked) return;
  locked = true;
  document.body.classList.add('is-locked');
  lenis.stop();
}
function unlockScroll() {
  locked = false;
  document.body.classList.remove('is-locked');
  lenis.start();
}

/* ============================================================
   Header / scroll progress / clock
   ============================================================ */
const header = $('[data-header]');
const progressBar = $('[data-scroll-progress]');
lenis.on('scroll', ({ scroll, limit }) => {
  header.classList.toggle('is-scrolled', scroll > 26);
  const p = limit > 0 ? Math.min(1, scroll / limit) : 0;
  progressBar.style.width = (p * 100).toFixed(2) + '%';
  sceneApi?.setScroll(scroll);
});

function startClock() {
  const el = $('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 1000);
}
startClock();
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ============================================================
   Text splitting
   ============================================================ */
function splitWords(el) {
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      let added = false;
      words.forEach((chunk) => {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) {
          frag.appendChild(document.createTextNode(chunk));
          return;
        }
        const outer = document.createElement('span');
        outer.className = 'word';
        const inner = document.createElement('span');
        inner.textContent = chunk;
        outer.appendChild(inner);
        frag.appendChild(outer);
        added = true;
      });
      if (added) node.replaceWith(frag);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      [...node.childNodes].forEach(walk);
    }
  };
  [...el.childNodes].forEach(walk);
  return [...el.querySelectorAll('.word > span')];
}

let heroReveal = () => {};
function setupHeroIntro() {
  const lines = $$('.hero__title-line > span');
  if (!lines.length || reduced) return;
  const intro = $$('.hero__eyebrow, .hero__lede, .hero__actions, .hero__proof');
  gsap.set(lines, { yPercent: 115 });
  gsap.set(intro, { y: 22, opacity: 0 });
  gsap.set('.hero__visual', { y: 42, opacity: 0, scale: 0.97 });
  gsap.set(['.hero__signature', '.hero__scroll'], { opacity: 0 });
  heroReveal = () => {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .to(lines, { yPercent: 0, duration: 1.15, stagger: 0.08, ease: 'power4.out' })
      .to(intro, { y: 0, opacity: 1, duration: 0.9, stagger: 0.07 }, 0.16)
      .to('.hero__visual', { y: 0, opacity: 1, scale: 1, duration: 1.15 }, 0.2)
      .to(['.hero__signature', '.hero__scroll'], { opacity: 1, duration: 0.8 }, 0.55);
  };
}

function setupSplits() {
  $$('[data-split]').forEach((el) => {
    const words = splitWords(el);
    if (!words.length) return;
    if (reduced) return;
    gsap.set(words, { yPercent: 120 });
    if (el.classList.contains('hero__title')) {
      heroReveal = () => {
        gsap.to(words, { yPercent: 0, duration: 1.35, stagger: 0.075, ease: 'power4.out', delay: 0.1 });
      };
    } else {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 87%',
        once: true,
        onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.15, stagger: 0.032, ease: 'power4.out' })
      });
    }
  });
}

/* ============================================================
   Reveals
   ============================================================ */
function setupReveals() {
  const targets = $$('.reveal, .reveal-img');
  if (!targets.length) return;
  if (reduced) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach((el) => io.observe(el));
}

/* ============================================================
   Product data rendering
   ============================================================ */
const productsEl = $('[data-products]');
function productCard(p) {
  return `
    <article class="product-card" data-id="${p.id}">
      <a class="product-card__link" href="#/product/${p.id}" aria-label="View ${p.name} details"></a>
      <div class="product-card__media">
        <img src="${p.image}" alt="${p.alt}" loading="lazy" />
        <span class="product-card__badge">${p.badge}</span>
        <a class="product-card__view" href="#/product/${p.id}" aria-label="View details for ${p.name}" data-view="${p.id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10"/></svg>
        </a>
      </div>
      <div class="product-card__body">
        <span class="product-card__kicker">${p.index} — ${p.kicker}</span>
        <h3 class="product-card__title">${p.name}</h3>
        <div class="product-card__meta">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>
        <div class="product-card__foot">
          <div class="product-card__price">${money(p.price)}<small>incl. taxes</small></div>
          <div class="product-card__actions">
            <button class="product-card__add" type="button" data-add="${p.id}">
              Add to bag
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </article>`;
}
if (productsEl) productsEl.innerHTML = products.map(productCard).join('');

/* ============================================================
   Cart
   ============================================================ */
const CART_KEY = 'sugar0-cart-v1';
let cart = [];
try {
  const raw = localStorage.getItem(CART_KEY);
  if (raw) cart = JSON.parse(raw);
  if (!Array.isArray(cart)) cart = [];
} catch { cart = []; }
cart = cart.filter((line) => products.some((p) => p.id === line.id) && line.qty > 0);

const cartEl = $('[data-cart]');
const scrim = $('[data-scrim]');
const cartItemsEl = $('[data-cart-items]');
const cartEmpty = $('[data-cart-empty]');
const cartFoot = $('[data-cart-foot]');
const cartSubtotal = $('[data-cart-subtotal]');
const cartCountEls = $$('[data-cart-count]');
const pinInput = $('[data-pin-input]');
const pinStatus = $('[data-pin-status]');
let deliveryPin = '';
let lastFocus = null;

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
}
function cartQty() { return cart.reduce((n, line) => n + line.qty, 0); }
function cartSubtotalValue() {
  return cart.reduce((sum, line) => {
    const p = products.find((x) => x.id === line.id);
    return sum + (p ? p.price * line.qty : 0);
  }, 0);
}
function renderCart() {
  const count = cartQty();
  cartCountEls.forEach((el) => {
    el.textContent = count;
    el.classList.toggle('is-hidden', count === 0);
    el.classList.remove('is-bump');
    void el.offsetWidth;
    el.classList.add('is-bump');
  });
  cartEl.classList.toggle('is-empty', count === 0);
  if (!count) {
    cartItemsEl.innerHTML = '';
    cartSubtotal.textContent = money(0);
    return;
  }
  cartItemsEl.innerHTML = cart.map((line) => {
    const p = products.find((x) => x.id === line.id);
    return `
      <div class="cart-item" data-line="${p.id}">
        <div class="cart-item__img"><img src="${p.image}" alt="${p.alt}" /></div>
        <div class="cart-item__info">
          <span class="cart-item__kicker">${p.kicker}</span>
          <div class="cart-item__name">${p.name}</div>
          <div class="cart-item__size">${p.size}</div>
          <div class="cart-item__qty">
            <button type="button" data-qty="-1" data-id="${p.id}" aria-label="Decrease quantity of ${p.name}">−</button>
            <span>${line.qty}</span>
            <button type="button" data-qty="1" data-id="${p.id}" aria-label="Increase quantity of ${p.name}">+</button>
          </div>
        </div>
        <div>
          <div class="cart-item__price">${money(p.price * line.qty)}</div>
          <button type="button" class="cart-item__remove" data-remove="${p.id}">Remove</button>
        </div>
      </div>`;
  }).join('');
  cartSubtotal.textContent = money(cartSubtotalValue());
}
function addToCart(id, qty = 1, silent = false) {
  const line = cart.find((l) => l.id === id);
  if (line) line.qty = Math.min(20, line.qty + qty);
  else cart.push({ id, qty });
  saveCart();
  renderCart();
  const p = products.find((x) => x.id === id);
  if (!silent && p) showToast(`${p.name} added to your bag.`);
}
function changeQty(id, delta) {
  const line = cart.find((l) => l.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter((l) => l.id !== id);
  saveCart();
  renderCart();
}
function removeLine(id) {
  cart = cart.filter((l) => l.id !== id);
  saveCart();
  renderCart();
}
function openCart() {
  lastFocus = document.activeElement;
  renderCart();
  cartEl.classList.add('is-open');
  scrim.classList.add('is-open');
  cartEl.setAttribute('aria-hidden', 'false');
  lockScroll();
  setTimeout(() => $('[data-cart-close]')?.focus(), 120);
}
function closeCart() {
  cartEl.classList.remove('is-open');
  scrim.classList.remove('is-open');
  cartEl.setAttribute('aria-hidden', 'true');
  if (!mobileMenu.classList.contains('is-open')) unlockScroll();
  if (lastFocus) lastFocus.focus();
}

$$('[data-cart-open]').forEach((btn) => btn.addEventListener('click', openCart));
$('[data-cart-close]')?.addEventListener('click', closeCart);
scrim?.addEventListener('click', closeCart);
$('[data-cart-shop]')?.addEventListener('click', () => {
  closeCart();
  setTimeout(() => scrollToTarget('#collection'), 80);
});
cartEl.addEventListener('click', (e) => {
  const add = e.target.closest('[data-qty]');
  if (add) {
    changeQty(add.dataset.id, Number(add.dataset.qty));
    return;
  }
  const rem = e.target.closest('[data-remove]');
  if (rem) removeLine(rem.dataset.remove);
});

$('[data-checkout]')?.addEventListener('click', () => {
  if (!cart.length) return;
  const lines = cart.map((line) => {
    const p = products.find((x) => x.id === line.id);
    return `${line.qty} × ${p.name} (${p.size}) — ${money(p.price * line.qty)}`;
  });
  const body = [
    'Hello Sugar-0% team,',
    '',
    'I would like to place an order:',
    '',
    ...lines,
    '',
    `Subtotal: ${money(cartSubtotalValue())}`,
    deliveryPin ? `Delivery PIN: ${deliveryPin}` : 'Delivery PIN: (not checked yet)',
    '',
    'Name:',
    'Delivery address:',
    'Phone:',
    '',
    'Please confirm availability and delivery.'
  ].join('\r\n');
  window.location.href = `mailto:naturalsweetsolutions@gmail.com?subject=${encodeURIComponent('Sugar-0% order enquiry')}&body=${encodeURIComponent(body)}`;
  showToast('Opening your email app with the order…');
});

/* Delivery PIN checker — front-end estimate only; the team confirms before dispatch. */
const serviceablePrefixes = new Set(['11', '12', '13', '14', '16', '20', '21', '22', '24', '26', '27', '28', '30', '31', '32', '33', '34', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '48', '49', '50', '52', '56', '57', '58', '59', '60', '61', '62', '63', '64', '67', '68', '69', '70', '71', '73', '74', '75', '76', '78', '79', '80', '81', '82', '83', '84', '85']);
function checkDeliveryPin() {
  if (!pinInput || !pinStatus) return;
  const pin = pinInput.value.replace(/\D/g, '').slice(0, 6);
  pinInput.value = pin;
  pinStatus.classList.remove('is-ok', 'is-bad');
  if (pin.length !== 6) {
    deliveryPin = '';
    pinStatus.classList.add('is-bad');
    pinStatus.textContent = 'Please enter a valid 6-digit PIN code.';
    return;
  }
  deliveryPin = pin;
  if (serviceablePrefixes.has(pin.slice(0, 2))) {
    pinStatus.classList.add('is-ok');
    pinStatus.textContent = `Deliverable to ${pin} · estimated 2–4 working days. Final availability is confirmed by our team.`;
  } else {
    pinStatus.classList.add('is-ok');
    pinStatus.textContent = `We’ve noted ${pin}. We’re expanding quickly — our team will confirm the best delivery option by email.`;
  }
  showToast('Delivery PIN noted for your order.');
}
pinInput?.addEventListener('input', () => {
  pinInput.value = pinInput.value.replace(/\D/g, '').slice(0, 6);
  pinStatus?.classList.remove('is-ok', 'is-bad');
  deliveryPin = '';
});
pinInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    checkDeliveryPin();
  }
});
$('[data-pin-check]')?.addEventListener('click', checkDeliveryPin);

renderCart();

/* ============================================================
   Toast
   ============================================================ */
let toastTimer;
const toastEl = $('[data-toast]');
const toastText = $('[data-toast-text]');
function showToast(text) {
  toastText.textContent = text;
  toastEl.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 3200);
}

/* ============================================================
   Dedicated product view (hash route: #/product/<id>)
   ============================================================ */
const pvEl = $('[data-product-view]');
let pvProduct = null;
let pvMode = 'photo';
let pvSceneApi = null;
let pvLoadPromise = null;

function findProduct(id) { return products.find((x) => x.id === id); }

function setPvMode(mode) {
  if (!pvEl) return;
  pvMode = mode === '360' ? '360' : 'photo';
  const stage = $('[data-pv-stage]', pvEl);
  const canvasWrap = $('[data-pv-canvas-wrap]', pvEl);
  const photo = $('[data-pv-image]', pvEl);
  const hint = $('[data-pv-hint]', pvEl);
  const is360 = pvMode === '360';
  $$('[data-pv-mode]', pvEl).forEach((btn) => {
    const on = btn.dataset.pvMode === pvMode;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  stage?.classList.toggle('is-360', is360);
  stage?.classList.toggle('is-loading', is360 && !pvSceneApi);
  if (canvasWrap) canvasWrap.hidden = !is360;
  if (photo) photo.classList.toggle('is-hidden', is360);
  if (hint) hint.hidden = !is360;
  if (is360) initProductScene();
}

async function initProductScene() {
  if (!pvProduct || !$('#pv-scene')) return;
  if (!pvLoadPromise) {
    pvLoadPromise = import('./scene.js').then(async (mod) => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const api = await mod.initScene($('#pv-scene'));
      if (!api) throw new Error('WebGL unavailable');
      return api;
    });
  }
  try {
    if (!pvSceneApi) {
      pvSceneApi = await pvLoadPromise;
      sceneApi = pvSceneApi;
      window.__sugarScene = pvSceneApi;
      pvSceneApi.start();
      pvSceneApi.setProduct(pvProduct.id, true);
    } else {
      pvSceneApi.setProduct(pvProduct.id, true);
    }
    $('[data-pv-canvas-wrap]', pvEl)?.classList.remove('no-webgl');
    $('[data-pv-stage]', pvEl)?.classList.remove('is-loading');
  } catch (err) {
    console.warn('360° view unavailable', err);
    pvLoadPromise = null;
    pvSceneApi = null;
    $('[data-pv-canvas-wrap]', pvEl)?.classList.add('no-webgl');
    $('[data-pv-stage]', pvEl)?.classList.remove('is-loading');
    setPvMode('photo');
    showToast('360° view is unavailable on this device — showing the photo instead.');
  }
}

function populateProductView(p) {
  if (!pvEl || !p) return;
  const set = (sel, value) => { const el = $(sel, pvEl); if (el) el.textContent = value; };
  set('[data-pv-kicker]', `${p.index} — ${p.kicker}`);
  set('[data-pv-title]', p.name);
  set('[data-pv-desc]', p.desc);
  set('[data-pv-usage]', p.usage);
  set('[data-pv-ingredients]', p.ingredients);
  set('[data-pv-size]', p.size);
  set('[data-pv-badge]', p.badge);
  set('[data-pv-index]', p.index);
  set('[data-pv-crumb]', `${p.index} — ${p.short}`);
  const price = $('[data-pv-price]', pvEl);
  if (price) price.innerHTML = `${money(p.price)} <span>· ${p.size} · incl. taxes</span>`;
  const tags = $('[data-pv-tags]', pvEl);
  if (tags) tags.innerHTML = p.tags.map((t) => `<span>${t}</span>`).join('');
  const img = $('[data-pv-image]', pvEl);
  if (img) { img.src = p.image; img.alt = p.alt; }
  setPvMode('photo');
  if (pvSceneApi) pvSceneApi.setProduct(p.id, true);
}

function showProductView(id) {
  const p = findProduct(id);
  if (!p || !pvEl) return;
  pvProduct = p;
  populateProductView(p);
  document.body.classList.add('is-product-view');
  pvEl.classList.add('is-open');
  pvEl.setAttribute('aria-hidden', 'false');
  document.title = `${p.name} — Sugar-0%`;
  if (mobileMenu?.classList.contains('is-open')) closeMenu();
  if (cartEl.classList.contains('is-open')) closeCart();
  requestAnimationFrame(() => lenis.resize());
  lenis.scrollTo(0, { immediate: true });
  window.scrollTo(0, 0);
  setTimeout(() => $('[data-pv-title]', pvEl)?.focus({ preventScroll: true }), 60);
}

function hideProductView() {
  if (!pvEl) return;
  document.body.classList.remove('is-product-view');
  pvEl.classList.remove('is-open');
  pvEl.setAttribute('aria-hidden', 'true');
  document.title = baseTitle;
  requestAnimationFrame(() => {
    lenis.resize();
    ScrollTrigger.refresh();
  });
}

function handleRoute() {
  const match = location.hash.match(/^#\/product\/([a-z0-9-]+)/i);
  if (match && findProduct(match[1])) {
    showProductView(match[1]);
    return;
  }
  const wasOpen = pvEl?.classList.contains('is-open');
  hideProductView();
  if (wasOpen) {
    lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }
}
window.addEventListener('hashchange', handleRoute);

if (pvEl) {
  $$('[data-pv-mode]', pvEl).forEach((btn) => {
    btn.addEventListener('click', () => setPvMode(btn.dataset.pvMode));
  });
  $('[data-pv-add]', pvEl)?.addEventListener('click', () => {
    if (!pvProduct) return;
    addToCart(pvProduct.id);
    openCart();
  });
}

/* ============================================================
   Floating enquiry
   ============================================================ */
const enquiryEl = $('[data-enquiry-modal]');
let enquiryFocus = null;
function openEnquiry() {
  if (!enquiryEl) return;
  enquiryFocus = document.activeElement;
  enquiryEl.classList.add('is-open');
  enquiryEl.setAttribute('aria-hidden', 'false');
  lockScroll();
  setTimeout(() => $('#enq-name')?.focus(), 140);
}
function closeEnquiry() {
  if (!enquiryEl) return;
  enquiryEl.classList.remove('is-open');
  enquiryEl.setAttribute('aria-hidden', 'true');
  if (!cartEl.classList.contains('is-open') && !mobileMenu?.classList.contains('is-open') && !pvEl?.classList.contains('is-open')) unlockScroll();
  enquiryFocus?.focus?.();
}
$$('[data-enquiry-open]').forEach((btn) => btn.addEventListener('click', openEnquiry));
$$('[data-enquiry-close]').forEach((btn) => btn.addEventListener('click', closeEnquiry));
$('[data-enquiry-form]')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#enq-name');
  const contact = $('#enq-contact');
  const topic = $('#enq-topic');
  const message = $('#enq-message');
  let valid = true;
  const mark = (field, ok) => {
    field.closest('.field')?.classList.toggle('is-error', !ok);
    if (!ok) valid = false;
  };
  mark(name, name.value.trim().length > 1);
  mark(contact, contact.value.trim().length > 4);
  if (!valid) {
    showToast('Please add your name and a way to reach you.');
    return;
  }
  const body = [
    'Hello Sugar-0% team,',
    '',
    `Name: ${name.value.trim()}`,
    `Contact: ${contact.value.trim()}`,
    `Interested in: ${topic.value}`,
    '',
    message.value.trim() || '(No message)',
    '',
    'Sent from the Sugar-0% website.'
  ].join('\r\n');
  window.location.href = `mailto:naturalsweetsolutions@gmail.com?subject=${encodeURIComponent('Sugar-0% enquiry — ' + topic.value)}&body=${encodeURIComponent(body)}`;
  showToast('Opening your email app with your enquiry…');
  setTimeout(closeEnquiry, 700);
});

/* ============================================================
   Product add buttons
   ============================================================ */
document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (!add) return;
  addToCart(add.dataset.add);
});

/* ============================================================
   Features
   ============================================================ */
const featuresEl = $('[data-features]');
const groupIcons = { origin: 'leaf', nutrition: 'heart', taste: 'smile', convenience: 'shield' };

function renderFeatures() {
  if (!featuresEl) return;
  featuresEl.innerHTML = featureGroups.map((g) => `
    <section class="feature-panel feature-panel--${g.id}">
      <header class="feature-panel__head">
        <span class="feature-panel__badge">${icon(groupIcons[g.id] || 'leaf')}</span>
        <div class="feature-panel__titles">
          <h3>${g.label}</h3>
          <span>${String(g.items.length).padStart(2, '0')} features</span>
        </div>
      </header>
      <div class="feature-panel__grid">
        ${g.items.map((item) => `
          <article class="feature-chip">
            <span class="feature-chip__icon">${icon(item.icon)}</span>
            <span class="feature-chip__label">${item.label}<small>${item.note}</small></span>
          </article>`).join('')}
      </div>
    </section>`).join('');
}
renderFeatures();

/* ============================================================
   Sweetness lab
   ============================================================ */
const range = $('#sweetness-range');
const labVals = { scoops: 4, calories: 64, sugar: 16.8, days: 25 };
const gauge = $('[data-gauge]');
const ticksEl = $('[data-ticks]');
const lab = $('[data-lab]');

if (ticksEl) {
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const r1 = 94;
    const r2 = i % 5 === 0 ? 88 : 91;
    ticks.push(`<line x1="${100 + Math.cos(angle) * r1}" y1="${100 + Math.sin(angle) * r1}" x2="${100 + Math.cos(angle) * r2}" y2="${100 + Math.sin(angle) * r2}"/>`);
  }
  ticksEl.innerHTML = ticks.join('');
}

let labTween = null;

function updateLab(value, animate = true) {
  const v = Number(value);
  const cal = v * 16;
  const sugar = v * 4.2;
  const days = Math.floor(100 / v);
  const use = v;

  $('[data-tsp]').textContent = `${v} tsp`;
  $('[data-jar-use]').textContent = `${use}%`;
  $('[data-meter]').style.width = `${Math.max(2, use)}%`;
  range.style.setProperty('--fill', `${(v / 20) * 100}%`);
  if (gauge) gauge.style.strokeDashoffset = String(540.35 * (1 - v / 20));
  $$('.lab__presets button').forEach((b) => b.classList.toggle('is-active', Number(b.dataset.preset) === v));

  const targets = { scoops: v, calories: cal, sugar, days };
  const write = () => {
    $('[data-scoops]').textContent = Math.round(labVals.scoops);
    $('[data-calories]').textContent = Math.round(labVals.calories);
    $('[data-sugar]').innerHTML = `${labVals.sugar.toFixed(1)}<span>g</span>`;
    $('[data-jar-days]').textContent = Math.round(labVals.days);
  };

  labTween?.kill();
  if (animate && !reduced) {
    labTween = gsap.to(labVals, {
      ...targets,
      duration: 0.55,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: write
    });
  } else {
    Object.assign(labVals, targets);
    write();
  }
}

if (range) {
  updateLab(range.value, false);
  range.addEventListener('input', () => updateLab(range.value));
  $$('.lab__presets button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = Number(btn.dataset.preset);
      range.value = v;
      updateLab(v);
    });
  });
}

/* ============================================================
   Reviews
   ============================================================ */
const slider = $('[data-reviews]');
const dotsEl = $('[data-review-dots]');
let reviewIndex = 0;
let autoTimer = null;

function reviewCard(r) {
  return `
    <article class="review-card">
      <span class="review-card__mark">“</span>
      <blockquote>${r.quote}</blockquote>
      <div class="review-card__foot">
        <div class="review-card__who">
          <strong>${r.name}</strong>
          <span>${r.detail} · ${r.location}</span>
        </div>
        <span class="review-card__stars" aria-label="${r.rating} out of 5 stars">${'★'.repeat(r.rating)}</span>
      </div>
    </article>`;
}
if (slider) {
  slider.innerHTML = reviews.map(reviewCard).join('');
  dotsEl.innerHTML = reviews.map((_, i) => `<button type="button" aria-label="Go to note ${i + 1}" data-dot="${i}"${i === 0 ? ' class="is-active"' : ''}></button>`).join('');

  const cards = $$('.review-card', slider);
  function goToReview(i, smooth = true) {
    reviewIndex = (i + cards.length) % cards.length;
    const card = cards[reviewIndex];
    slider.scrollTo({ left: card.offsetLeft - slider.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
    updateDots();
  }
  function updateDots() {
    const width = cards[0].offsetWidth + 20;
    const idx = Math.round(slider.scrollLeft / width);
    reviewIndex = Math.max(0, Math.min(cards.length - 1, idx));
    $$('[data-dot]', dotsEl).forEach((d, i) => d.classList.toggle('is-active', i === reviewIndex));
  }
  function restartAuto() {
    clearInterval(autoTimer);
    if (reduced) return;
    autoTimer = setInterval(() => {
      if (document.hidden) return;
      const rect = slider.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      goToReview(reviewIndex + 1);
    }, 6000);
  }
  $('[data-review-prev]')?.addEventListener('click', () => { goToReview(reviewIndex - 1); restartAuto(); });
  $('[data-review-next]')?.addEventListener('click', () => { goToReview(reviewIndex + 1); restartAuto(); });
  dotsEl.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-dot]');
    if (!dot) return;
    goToReview(Number(dot.dataset.dot));
    restartAuto();
  });
  slider.addEventListener('scroll', () => {
    clearTimeout(slider._scrollT);
    slider._scrollT = setTimeout(updateDots, 90);
  }, { passive: true });
  slider.addEventListener('pointerenter', () => clearInterval(autoTimer));
  slider.addEventListener('pointerleave', restartAuto);
  restartAuto();
}

/* ============================================================
   FAQ
   ============================================================ */
const faqEl = $('[data-faq]');
if (faqEl) {
  faqEl.innerHTML = faqs.map((f, i) => `
    <div class="accordion__item ${i === 0 ? 'is-open' : ''}">
      <button class="accordion__btn" type="button" aria-expanded="${i === 0}" aria-controls="faq-panel-${i}">
        <h3>${f.q}</h3>
        <span class="accordion__icon" aria-hidden="true"></span>
      </button>
      <div class="accordion__panel" id="faq-panel-${i}" role="region">
        <div><p>${f.a}</p></div>
      </div>
    </div>`).join('');
  faqEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.accordion__btn');
    if (!btn) return;
    const item = btn.closest('.accordion__item');
    const open = item.classList.contains('is-open');
    $$('.accordion__item', faqEl).forEach((el) => {
      el.classList.remove('is-open');
      $('.accordion__btn', el).setAttribute('aria-expanded', 'false');
    });
    if (!open) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

/* ============================================================
   Mobile menu
   ============================================================ */
const mobileMenu = $('[data-menu]');
const menuOpen = $('[data-menu-open]');
const menuClose = $('[data-menu-close]');
function openMenu() {
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  menuOpen.setAttribute('aria-expanded', 'true');
  lockScroll();
}
function closeMenu() {
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  menuOpen.setAttribute('aria-expanded', 'false');
  unlockScroll();
}
menuOpen?.addEventListener('click', openMenu);
menuClose?.addEventListener('click', closeMenu);
$$('[data-menu-link]').forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
    setTimeout(() => goToSection(link.getAttribute('href')), 90);
  });
});

/* ============================================================
   Smooth anchors
   ============================================================ */
function scrollToTarget(hash) {
  if (!hash || hash === '#' || hash.startsWith('#/')) return;
  const target = hash === '#top' ? document.body : document.querySelector(hash);
  if (!target) return;
  lenis.resize();
  lenis.scrollTo(target, { offset: 0, duration: 1.2 });
}
function goToSection(hash) {
  if (!hash || hash === '#' || hash.startsWith('#/')) return;
  if (document.body.classList.contains('is-product-view')) {
    hideProductView();
    history.replaceState(null, '', hash);
    setTimeout(() => scrollToTarget(hash), 80);
    return;
  }
  scrollToTarget(hash);
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const hash = a.getAttribute('href');
    if (!hash || hash === '#' || hash.startsWith('#/')) return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    if (mobileMenu.classList.contains('is-open')) closeMenu();
    if (cartEl.classList.contains('is-open')) closeCart();
    goToSection(hash);
  });
});

/* Escape closes overlays */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (enquiryEl?.classList.contains('is-open')) closeEnquiry();
  else if (document.body.classList.contains('is-product-view')) {
    hideProductView();
    history.replaceState(null, '', '#collection');
    setTimeout(() => scrollToTarget('#collection'), 80);
  }
  else if (cartEl.classList.contains('is-open')) closeCart();
  else if (mobileMenu.classList.contains('is-open')) closeMenu();
});

/* ============================================================
   Consult form
   ============================================================ */
const consult = $('[data-consult]');
if (consult) {
  consult.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#consult-name');
    const email = $('#consult-email');
    const topic = $('#consult-topic');
    const message = $('#consult-message');
    let valid = true;
    const mark = (field, ok) => {
      field.closest('.field').classList.toggle('is-error', !ok);
      if (!ok) valid = false;
    };
    mark(name, name.value.trim().length > 1);
    mark(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
    if (!valid) {
      showToast('Please add your name and a valid email.');
      return;
    }
    const body = [
      'Hello Sugar-0% team,',
      '',
      `Name: ${name.value.trim()}`,
      `Email: ${email.value.trim()}`,
      `Interested in: ${topic.value}`,
      '',
      message.value.trim() || '(No message)',
      '',
      'Sent from the Sugar-0% website.'
    ].join('\r\n');
    window.location.href = `mailto:naturalsweetsolutions@gmail.com?subject=${encodeURIComponent('Sugar-0% enquiry — ' + topic.value)}&body=${encodeURIComponent(body)}`;
    showToast('Opening your email app…');
  });
}

/* ============================================================
   Scenes / motion
   ============================================================ */
function setupParallax() {
  if (reduced || window.innerWidth < 760) return;
  $$('.arch').forEach((arch) => {
    gsap.to(arch, {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: { trigger: arch, start: 'top bottom', end: 'bottom top', scrub: 1 }
    });
  });
  gsap.to('.cta__watermark', {
    xPercent: -6,
    ease: 'none',
    scrollTrigger: { trigger: '.section--cta', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });
}

function setupCursor() {
  if (window.matchMedia('(pointer: coarse)').matches || reduced) return;
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring) return;
  document.documentElement.classList.add('has-cursor');
  gsap.set([dot, ring], { x: -100, y: -100 });
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });
  window.addEventListener('mousemove', (e) => {
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', () => {
    gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
  });
  $$('a, button, .product-card, [data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('is-hover');
      gsap.to(ring, { scale: 1.55, duration: 0.35, ease: 'power3.out' });
      gsap.to(dot, { scale: 0.5, duration: 0.25 });
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('is-hover');
      gsap.to(ring, { scale: 1, duration: 0.35, ease: 'power3.out' });
      gsap.to(dot, { scale: 1, duration: 0.25 });
    });
  });
  const stage = $('[data-pv-stage]') || $('[data-stage]');
  if (stage) {
    stage.addEventListener('pointerenter', () => {
      ring.classList.add('is-drag');
      gsap.to(ring, { scale: 1.7, duration: 0.35, ease: 'power3.out' });
    });
    stage.addEventListener('pointerleave', () => {
      ring.classList.remove('is-drag');
      gsap.to(ring, { scale: 1, duration: 0.35, ease: 'power3.out' });
    });
  }
}

function setupMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches || reduced) return;
  $$('.btn, .round-btn').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(btn, { x: x * 0.16, y: y * 0.22, duration: 0.45, ease: 'power3.out' });
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

/* ============================================================
   Loader
   ============================================================ */
const preloader = $('[data-preloader]');
const loaderBar = $('[data-loader-bar]');
const loaderPercent = $('[data-loader-percent]');
let loaderDone = false;
const loadStart = performance.now();
const loadObj = { v: 0 };

function setLoader(v) {
  const pct = Math.round(v);
  loaderBar.style.width = pct + '%';
  loaderPercent.textContent = pct + '%';
}

function finishLoader() {
  if (loaderDone) return;
  loaderDone = true;
  setLoader(100);
  setTimeout(() => {
    preloader.classList.add('is-done');
    preloader.setAttribute('aria-hidden', 'true');
    unlockScroll();
    if (!reduced) heroReveal();
    else $$('[data-split] .word > span').forEach((el) => gsap.set(el, { yPercent: 0 }));
    ScrollTrigger.refresh();
    setTimeout(() => { preloader.style.display = 'none'; }, 1200);
  }, 350);
}

async function boot() {
  lockScroll();
  await document.fonts.ready;

  setupSplits();
  setupHeroIntro();
  setupReveals();
  setupParallax();
  setupCursor();
  setupMagnetic();
  startClock();
  renderCart();
  handleRoute();

  gsap.to(loadObj, {
    v: 100,
    duration: 1.35,
    ease: 'power2.out',
    onUpdate: () => setLoader(loadObj.v)
  });

  const remaining = Math.max(0, 1600 - (performance.now() - loadStart));
  setTimeout(finishLoader, remaining);

  // safety net: never leave the loader stuck
  setTimeout(() => { if (!loaderDone) finishLoader(); }, 4500);
}

boot();

window.addEventListener('load', () => ScrollTrigger.refresh());
