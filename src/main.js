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
import { initScene } from './scene.js';
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
      <div class="product-card__media">
        <img src="${p.image}" alt="${p.alt}" loading="lazy" />
        <span class="product-card__badge">${p.badge}</span>
        <button class="product-card__view" type="button" data-view="${p.id}" aria-label="View details for ${p.name}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10"/></svg>
        </button>
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
   Product modal
   ============================================================ */
const modal = $('[data-product-modal]');
let modalProduct = null;
let modalFocus = null;
function openProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  modalProduct = p;
  modalFocus = document.activeElement;
  $('[data-modal-image]').src = p.image;
  $('[data-modal-image]').alt = p.alt;
  $('[data-modal-kicker]').textContent = `${p.index} — ${p.kicker}`;
  $('[data-modal-title]').textContent = p.name;
  $('[data-modal-price]').innerHTML = `${money(p.price)} <span>· ${p.size}</span>`;
  $('[data-modal-desc]').textContent = p.desc;
  $('[data-modal-usage]').textContent = p.usage;
  $('[data-modal-ingredients]').textContent = p.ingredients;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  lockScroll();
  setTimeout(() => $('[data-product-modal-close]')?.focus(), 120);
}
function closeProduct() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  unlockScroll();
  if (modalFocus) modalFocus.focus();
}
$$('[data-view]').forEach((btn) => btn.addEventListener('click', () => openProduct(btn.dataset.view)));
$$('[data-product-modal-close]').forEach((btn) => btn.addEventListener('click', closeProduct));
$('[data-modal-add]')?.addEventListener('click', () => {
  if (!modalProduct) return;
  addToCart(modalProduct.id);
  closeProduct();
  openCart();
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
   Hero product switch
   ============================================================ */
let currentProduct = 'jar';
const switchButtons = $$('.product-switch__btn');
const studioKicker = $('[data-studio-kicker]');
const studioName = $('[data-studio-name]');
const studioPrice = $('[data-studio-price]');
const studioDesc = $('[data-studio-desc]');
const studioBest = $('[data-studio-best]');
const studioIngredients = $('[data-studio-ingredients]');
const studioAdd = $('[data-studio-add]');
const studioView = $('[data-studio-view]');

function applyStudioProduct(p) {
  if (!p) return;
  if (studioKicker) studioKicker.textContent = `${p.index} — ${p.kicker}`;
  if (studioName) studioName.textContent = p.name;
  if (studioPrice) studioPrice.innerHTML = `${money(p.price)} <span>· ${p.size}</span>`;
  if (studioDesc) studioDesc.textContent = p.desc;
  if (studioBest) studioBest.textContent = p.tags.join(' · ');
  if (studioIngredients) studioIngredients.textContent = p.ingredients;
  if (studioAdd) studioAdd.dataset.add = p.id;
  if (studioView) studioView.dataset.view = p.id;
  $$('[data-product-index]').forEach((el) => { el.textContent = p.index; });
  $$('[data-product-name]').forEach((el) => { el.textContent = p.short; });
  $$('[data-product-size]').forEach((el) => { el.textContent = p.size; });
}

function animateStudioProduct(p) {
  if (reduced) {
    applyStudioProduct(p);
    return;
  }
  const els = $$('.studio__kicker, .studio__name, .studio__price, .studio__desc, .studio__meta');
  gsap.timeline()
    .to(els, { y: -10, opacity: 0, duration: 0.22, stagger: 0.02 })
    .call(() => applyStudioProduct(p))
    .fromTo(els, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.025, ease: 'power2.out' });
}

applyStudioProduct(products[0]);

switchButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.product;
    if (id === currentProduct) return;
    currentProduct = id;
    const p = products.find((x) => x.id === id);
    switchButtons.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    sceneApi?.setProduct(id);
    animateStudioProduct(p);
  });
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
    setTimeout(() => scrollToTarget(link.getAttribute('href')), 90);
  });
});

/* ============================================================
   Smooth anchors
   ============================================================ */
function scrollToTarget(hash) {
  if (!hash || hash === '#') return;
  const target = hash === '#top' ? document.body : document.querySelector(hash);
  if (!target) return;
  lenis.scrollTo(target, { offset: hash === '#top' ? 0 : -70, duration: 1.35 });
}
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const hash = a.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    if (mobileMenu.classList.contains('is-open')) closeMenu();
    if (cartEl.classList.contains('is-open')) closeCart();
    scrollToTarget(hash);
  });
});

/* Escape closes overlays */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('is-open')) closeProduct();
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
  const stage = $('[data-stage]');
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
   Loader + scene boot
   ============================================================ */
const preloader = $('[data-preloader]');
const loaderBar = $('[data-loader-bar]');
const loaderPercent = $('[data-loader-percent]');
let sceneReady = false;
let sceneStarted = false;
let loaderDone = false;
const loadStart = performance.now();
const loadObj = { v: 0 };

function setLoader(v) {
  const pct = Math.round(v);
  loaderBar.style.width = pct + '%';
  loaderPercent.textContent = pct + '%';
}

function startScene() {
  if (!sceneApi || sceneStarted) return;
  sceneStarted = true;
  sceneApi.start();
  sceneApi.setProduct(currentProduct, true);
}

function finishLoader() {
  if (loaderDone) return;
  loaderDone = true;
  setLoader(100);
  startScene();
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

function maybeFinishLoader() {
  if (loaderDone) return;
  const elapsed = performance.now() - loadStart;
  if (sceneReady && elapsed > 1700) finishLoader();
  else setTimeout(maybeFinishLoader, 120);
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

  gsap.to(loadObj, {
    v: 94,
    duration: 1.5,
    ease: 'power2.out',
    onUpdate: () => setLoader(loadObj.v)
  });

  try {
    sceneApi = await initScene($('#scene'));
  window.__sugarScene = sceneApi;
  } catch (err) {
    console.warn('3D scene unavailable', err);
    sceneApi = null;
  }
  if (!sceneApi) {
    const wrap = $('[data-canvas-wrap]');
    if (wrap) {
      wrap.innerHTML = '<img class="stage__fallback" src="/assets/jar.webp" alt="Sugar-0% stevia powder jar with copper lid" />';
      $('[data-stage]')?.classList.add('no-webgl');
    }
  }
  sceneReady = true;
  if (loaderDone) startScene();
  else maybeFinishLoader();

  // safety net: never leave the loader stuck
  setTimeout(() => { if (!loaderDone) finishLoader(); }, 5200);
}

boot();

window.addEventListener('load', () => ScrollTrigger.refresh());
