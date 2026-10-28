/* VELORA — interactions (vanilla JS, no dependencies) */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const PRODUCTS = {
    nocturne: { name: 'The Nocturne Dress', price: '₹8,900', label: 'New Arrival', sizes: ['XS', 'S', 'M', 'L'],
      desc: 'A fluid, floor-grazing silhouette in deep burgundy crêpe, cut close through the body with a softly draped train.' },
    bordeaux: { name: 'The Bordeaux Blazer', price: '₹12,500', label: 'Bestseller', sizes: ['XS', 'S', 'M', 'L', 'XL'],
      desc: 'Sharply tailored with a relaxed shoulder. Structured wool-blend in a rich bordeaux tone, made to move from boardroom to dinner.' },
    muse: { name: 'The Muse Evening Gown', price: '₹15,900', label: 'New Arrival', sizes: ['XS', 'S', 'M', 'L'],
      desc: 'A fluid wrap gown with a sculpted neckline and a graceful slit — evening elegance, effortlessly worn.' },
    belt: { name: 'The Signature Quilted Bag', price: '₹3,200', label: 'Accessory', sizes: ['One size'],
      desc: 'Quilted leather with a gold chain strap and a soft, burnished hardware finish. The quiet finishing touch.' },
  };

  let bagCount = 0;
  let toastTimer;
  let lastFocus = null;

  /* ---------- Toast ---------- */
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  /* ---------- Header: sticky background + active link ---------- */
  function initHeader() {
    const header = $('#siteHeader');
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });

    const links = $$('.primary-nav a');
    const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => spy.observe(t));
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const toggle = $('#menuToggle');
    const header = $('#siteHeader');
    const setOpen = (open) => {
      header.classList.toggle('menu-open', open);
      document.body.classList.toggle('no-scroll', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
    $$('.primary-nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Overlays (search + quick view) with focus handling ---------- */
  function openOverlay(overlay, focusSel) {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    const target = $(focusSel, overlay) || $('[data-close]', overlay);
    if (target) target.focus();
  }

  function closeOverlay(overlay) {
    overlay.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function trapFocus(e, overlay) {
    if (e.key !== 'Tab') return;
    const focusable = $$('button, input, [href]', overlay).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initOverlays() {
    $$('.overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target.closest('[data-close]')) closeOverlay(overlay); });
      overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay(overlay);
        trapFocus(e, overlay);
      });
    });
  }

  /* ---------- Shopping bag ---------- */
  function addToBag(name) {
    bagCount += 1;
    const badge = $('#bagCount');
    badge.textContent = bagCount;
    badge.hidden = false;
    $('#bagBtn').setAttribute('aria-label', `Shopping bag, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`);
    showToast(`${name} added to your bag`);
  }

  /* ---------- Quick view ---------- */
  function openQuickView(id, sourceImg) {
    const product = PRODUCTS[id];
    if (!product) return;
    const overlay = $('#quickView');
    $('#qvTitle').textContent = product.name;
    $('#qvPrice').textContent = product.price;
    $('#qvLabel').textContent = product.label;
    $('#qvDesc').textContent = product.desc;
    $('#qvMessage').textContent = '';
    const img = $('#qvImage');
    img.src = sourceImg.currentSrc || sourceImg.src;
    img.alt = sourceImg.alt;
    $('#qvSizes').innerHTML = '<legend>Size</legend>' + product.sizes.map((size, i) =>
      `<label><input type="radio" name="size" value="${size}"${i === 0 && product.sizes.length === 1 ? ' checked' : ''}><span>${size}</span></label>`).join('');
    overlay.dataset.product = id;
    openOverlay(overlay, '#qvSizes input');
  }

  function initQuickView() {
    $$('[data-quick-view]').forEach((btn) => btn.addEventListener('click', () => {
      openQuickView(btn.dataset.quickView, $('img', btn.closest('.product')));
    }));
    $('#qvAdd').addEventListener('click', () => {
      const overlay = $('#quickView');
      const size = $('input[name="size"]:checked', overlay);
      const message = $('#qvMessage');
      if (!size) { message.textContent = 'Please select a size.'; message.className = 'form-message is-error'; return; }
      addToBag(PRODUCTS[overlay.dataset.product].name);
      closeOverlay(overlay);
    });
    $('#bagBtn').addEventListener('click', () => {
      showToast(bagCount ? `You have ${bagCount} ${bagCount === 1 ? 'item' : 'items'} in your bag (demo — no checkout)` : 'Your bag is empty');
    });
    $('#accountBtn').addEventListener('click', () => showToast('Account sign-in is not part of this frontend demo'));
    $$('[data-demo-link]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); showToast('This page is not part of the demo'); }));
  }

  /* ---------- Product filtering (categories + filter bar) ---------- */
  function applyFilter(filter) {
    let visible = 0;
    $$('.product').forEach((card) => {
      const match = filter === 'all' || card.dataset.cat.split(' ').includes(filter);
      card.hidden = !match;
      if (match) { visible += 1; card.classList.add('is-visible'); }
    });
    $('#emptyNote').hidden = visible > 0;
    $$('.filter').forEach((btn) => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function initFilters() {
    $$('.filter').forEach((btn) => btn.addEventListener('click', () => applyFilter(btn.dataset.filter)));
    $$('.category-tile').forEach((tile) => tile.addEventListener('click', () => applyFilter(tile.dataset.filter)));
  }

  /* ---------- Search ---------- */
  function initSearch() {
    const overlay = $('#searchOverlay');
    const input = $('#searchInput');
    const message = $('#searchMessage');
    $('#searchToggle').addEventListener('click', () => { message.textContent = ''; openOverlay(overlay, '#searchInput'); });
    $('#searchForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim().toLowerCase();
      if (!query) { message.textContent = 'Type a piece, e.g. “dress” or “blazer”.'; message.className = 'form-message is-error'; return; }
      const match = Object.entries(PRODUCTS).find(([, p]) => p.name.toLowerCase().includes(query));
      if (!match) { message.textContent = `No pieces found for “${input.value.trim()}”.`; message.className = 'form-message is-error'; return; }
      closeOverlay(overlay);
      applyFilter('all');
      $('#products').scrollIntoView({ behavior: 'smooth' });
      const card = $(`.product[data-id="${match[0]}"]`);
      setTimeout(() => $('img', card) && openQuickView(match[0], $('img', card)), 500);
      input.value = '';
    });
  }

  /* ---------- Newsletter (frontend-only validation) ---------- */
  function initNewsletter() {
    const form = $('#newsletterForm');
    const input = $('#emailInput');
    const message = $('#formMessage');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const setMessage = (text, type) => { message.textContent = text; message.className = `form-message is-${type}`; };
    input.addEventListener('input', () => { form.classList.remove('is-invalid'); input.removeAttribute('aria-invalid'); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!emailPattern.test(value)) {
        form.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        setMessage(value ? 'Please enter a valid email address.' : 'Please enter your email address.', 'error');
        input.focus();
        return;
      }
      form.classList.remove('is-invalid');
      form.reset();
      setMessage('Thank you — welcome to the world of VELORA. (Demo: no email was sent.)', 'success');
    });
  }

  /* ---------- Init ---------- */
  function init() {
    $('#year').textContent = new Date().getFullYear();
    initHeader();
    initMobileMenu();
    initReveal();
    initOverlays();
    initQuickView();
    initFilters();
    initSearch();
    initNewsletter();
  }

  init();
})();
