/* Velino storefront. Each page has its own address (#shop, #wishlist, #product-rani ...).
   Pages are drawn from the functions in PAGES below; products and slides come from catalog.js. */
(() => {
'use strict';

const D = window.VELINO;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const icon = (id, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const logo = () => '<svg class="logo" aria-hidden="true"><use href="#logo"/></svg>';
const dateIn = days => { const d = new Date(); d.setDate(d.getDate() + days); return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); };
const byId = id => D.products.find(p => p.id === id);
const catLabel = id => (D.categories.find(c => c.id === id) || {}).label || id;
const occLabel = id => (D.occasions.find(c => c.id === id) || {}).label || id;
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

/* ============ STATE ============ */
const emptyFilters = () => ({ cat: new Set(), occ: new Set(), price: new Set(), size: new Set(), color: new Set(), q: '' });
const S = {
  cart: store.get('velino.site.cart', []).filter(l => byId(l.id)),
  wish: store.get('velino.site.wish', []).filter(byId),
  pin: store.get('velino.site.pin', ''),
  f: emptyFilters(),
  sort: 'featured',
  pdp: null,
  order: null
};
const saveCart = () => store.set('velino.site.cart', S.cart);
const saveWish = () => store.set('velino.site.wish', S.wish);

/* ============ SHARED PIECES ============ */
const small = src => src.replace(/\.webp$/, '-600.webp');
const viewName = (p, i) => (p.views && p.views[i]) || `Photo ${i + 1}`;
function photo(p, i = 0, cls = '', sizes = '(max-width:720px) 50vw, (max-width:1100px) 33vw, 25vw') {
  if (p.images && p.images[i]) return `<img class="${cls}" src="${esc(small(p.images[i]))}" srcset="${esc(small(p.images[i]))} 600w, ${esc(p.images[i])} 1000w" sizes="${sizes}" width="1000" height="1250" alt="${i === 0 ? esc(p.name) : ''}" loading="lazy" decoding="async">`;
  const n = D.products.indexOf(p) % 3 + 1;
  return `<span class="ph ph--${n}">${logo()}<small>Image coming soon</small></span>`;
}
const priceHTML = p => `<p class="price"><span>${inr(p.price)}</span>${p.compareAt ? `<s>${inr(p.compareAt)}</s>` : ''}</p>`;
const heartBtn = (p, cls = 'wish') => `<button class="${cls}" type="button" data-wish="${p.id}" aria-pressed="${S.wish.includes(p.id)}" aria-label="Save ${esc(p.name)} to wishlist">${icon('heart')}</button>`;

function card(p) {
  return `<article class="pcard">
    <a class="pcard-media" href="#product-${p.id}" aria-label="${esc(p.name)}, ${inr(p.price)}">
      ${p.isNew ? '<span class="tag">New</span>' : ''}
      ${photo(p, 0)}${p.images && p.images[1] ? photo(p, 1, 'alt') : ''}
    </a>
    ${heartBtn(p)}
    <div class="pcard-info">
      <h3><a href="#product-${p.id}">${esc(p.name)}</a></h3>
      <p class="cat">${esc(p.type || catLabel(p.category))}</p>
      ${priceHTML(p)}
      ${p.colors.length > 1 ? `<div class="dots" aria-label="${p.colors.map(c => D.colors[c].label).join(', ')}">${p.colors.map(c => `<i style="background:${D.colors[c].hex}"></i>`).join('')}</div>` : ''}
    </div>
  </article>`;
}
const pageHead = (title, sub, crumb) => `<div class="wrap page-head">
    ${crumb ? `<ol class="crumbs" aria-label="Breadcrumb"><li><a href="#home">Home</a></li><li aria-current="page">${esc(crumb)}</li></ol>` : ''}
    <h1 class="t-xl">${title}</h1>
    ${sub ? `<p class="lede">${sub}</p>` : ''}
  </div>`;
const perks = () => `<ul class="perks">
    <li class="perk">${icon('truck')}Free delivery across India</li>
    <li class="perk">${icon('swap')}Easy size exchanges</li>
    <li class="perk">${icon('cash')}Cash on delivery</li>
    <li class="perk">${icon('chat')}Help finding your fit</li>
  </ul>`;

/* ============ HOME ============ */
function slideHTML(s, i) {
  return `<article class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${D.slides.length}: ${esc(s.label)}">
      <a class="slide-link" href="#${s.link}" draggable="false"><img src="${esc(s.image)}" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" draggable="false" ${i === 0 ? 'fetchpriority="high"' : ''}></a>
    </article>`;
}
function homePage() {
  const best = D.products.filter(p => p.bestseller).slice(0, 4);
  const fresh = D.products.filter(p => p.isNew).slice(0, 4);
  const sheet = (body, tone = '') => `<div class="stack ${tone}" data-stack><div class="stack-inner">${body}</div></div>`;
  return sheet(`
  <section class="show wrap" aria-roledescription="carousel" aria-label="Velino highlights" style="--slide-ms:6500ms">
    <h1 class="sr-only">Velino: fashionable and comfortable occasion footwear at affordable prices</h1>
    <div class="show-frame">
    <div class="slides" id="slides">${D.slides.map(slideHTML).join('')}</div>
    <div class="show-bar">
      <p class="show-now" aria-live="off"><b id="show-count">1 / ${D.slides.length}</b><span id="show-label">${esc(D.slides[0].label)}</span></p>
      <div class="show-ctrl">
        <div class="show-bars">${D.slides.map((s, i) => `<button type="button" data-slide="${i}" aria-label="Go to slide ${i + 1}: ${esc(s.label)}"><i></i></button>`).join('')}</div>
        <button class="icon-btn" type="button" id="show-toggle" aria-label="Pause slideshow">${icon('pause')}</button>
        <button class="icon-btn" type="button" id="show-prev" aria-label="Previous slide">${icon('back')}</button>
        <button class="icon-btn" type="button" id="show-next" aria-label="Next slide">${icon('arrow')}</button>
      </div>
    </div>
    </div>
  </section>`, 'stack--hero')
  + sheet(`<section class="sec wrap" aria-labelledby="h-promise">
    <div class="promise">
      <h2 class="t-xl promise-head" id="h-promise">Style, comfort or price? <em>You shouldn’t have to choose.</em></h2>
      <p class="lede promise-text">Velino makes occasion footwear for women who want all three, in designs you can wear again and again.</p>
    </div>
    <div class="pillars">
      <div class="pillar"><h3>Fashionable</h3><p>Contemporary designs that go with lehengas, sarees, gowns and jeans alike.</p></div>
      <div class="pillar"><h3>Comfortable</h3><p>Made to be worn all evening, with soft linings that are kind to your feet.</p></div>
      <div class="pillar pillar--accent"><h3>Affordable</h3><p>Occasion-ready pairs at prices that leave room in your budget.</p></div>
    </div>
  </section>`, 'stack--paper')
  + sheet(`<section class="sec wrap" aria-labelledby="h-best">
    <div class="sec-head"><h2 class="t-xl" id="h-best">Bestsellers</h2><a class="link" href="#shop">Shop all ${icon('arrow')}</a></div>
    <div class="pgrid pgrid--row" style="--cols:${best.length}">${best.map(card).join('')}</div>
  </section>`)
  + sheet(`<section class="sec wrap" aria-labelledby="h-styles">
    <div class="styles-grid">
      <div class="styles-head">
        <h2 class="t-xl" id="h-styles">Shop by style</h2>
        <p class="muted">Or start with where you’re headed.</p>
        <div class="occ-row">${D.occasions.map(o => `<a class="chip" href="#shop-${o.id}">${esc(o.label)}</a>`).join('')}</div>
      </div>
      <div class="style-rows">
        ${D.categories.filter(c => D.products.some(p => p.category === c.id)).map(c => `<a class="style-row" href="#shop-${c.id}"><b>${esc(c.label)}</b><span>${plural(D.products.filter(p => p.category === c.id).length, 'style', 'styles')} ${icon('arrow')}</span></a>`).join('')}
      </div>
    </div>
  </section>`, 'stack--paper')
  + sheet(`<section class="sec wrap" aria-labelledby="h-story">
    <div class="story">
      <div class="story-img"><img src="assets/slides/vase-wall.webp" alt="A stone vase of white flowers against a warm wall with leaf shadows." loading="lazy"></div>
      <div class="story-body">
        <h2 class="t-xl" id="h-story">One pair. <em>Every occasion.</em></h2>
        <p class="lede">A shoe you wear once is an expensive shoe. Our designs are made to restyle across outfits and events, so you get more from every pair.</p>
        <a class="btn btn--ghost" href="#about">Our story ${icon('arrow', 'ic-go')}</a>
      </div>
    </div>
  </section>`)
  + sheet(`<section class="sec" aria-labelledby="h-comfort">
    <div class="wrap comfort">
      <div class="comfort-head">
        <h2 class="t-xl" id="h-comfort">Comfort that lasts the whole event.</h2>
        <p class="lede">Beauty shouldn’t mean sore feet. Here’s what goes into every Velino pair.</p>
      </div>
      <div class="comfort-img"><img src="assets/slides/sandals-close.webp" alt="White strappy Velino sandals with a cushioned sole." loading="lazy"></div>
      <div class="features">
        <div class="feature">${icon('layers')}<h3>Cushioned footbed</h3><p>Soft support under every step.</p></div>
        <div class="feature">${icon('feather')}<h3>Bite-free straps</h3><p>Smooth linings that don’t rub or cut in.</p></div>
        <div class="feature">${icon('arch')}<h3>Arch support</h3><p>Shaped to take pressure off your toes.</p></div>
        <div class="feature">${icon('grip')}<h3>Steady grip</h3><p>Soles made for marble floors and lawns.</p></div>
      </div>
    </div>
  </section>`, 'stack--paper')
  + sheet(`<section class="sec wrap" aria-labelledby="h-new">
    <div class="sec-head"><h2 class="t-xl" id="h-new">New arrivals</h2><a class="link" href="#new-arrivals">See what’s new ${icon('arrow')}</a></div>
    <div class="pgrid pgrid--row" style="--cols:${fresh.length}">${fresh.map(card).join('')}</div>
    <div class="home-perks">${perks()}</div>
  </section>`);
}
/* Home page scroll layers. Each section stays still underneath while the next one slides up over it.
   The browser's own sticky positioning does the moving (see "home scroll layers" in styles.css), so no
   script runs while scrolling. This only works out where each section stops, in page pixels. */
function mountScrollFx() {
  if (reduceMotion) return () => {};
  document.body.classList.add('fx');
  const stacks = $$('[data-stack]', app);
  const siteHeader = $('.site-header');
  let vw = 0, vh = 0, heights = [];

  const offsetIn = (el, root) => { let y = 0, n = el; while (n && n !== root) { y += n.offsetTop; n = n.offsetParent; } return y; };

  function build() {
    vw = window.innerWidth; vh = window.innerHeight;
    const hdr = siteHeader.getBoundingClientRect().bottom;
    let flow = app.getBoundingClientRect().top + window.scrollY;
    heights = stacks.map(s => s.offsetHeight);
    stacks.forEach((stack, i) => {
      const h = heights[i];
      // A section taller than the screen scrolls until its end is in view, then holds there.
      stack.style.top = (h <= vh - hdr + 1 ? hdr : vh - h) + 'px';
      stack.style.zIndex = i + 1;
      // A section's rounded top flattens just before it reaches the header, so nothing peeks through its corners.
      stack.style.setProperty('--fx-from', Math.round(flow - hdr - 90) + 'px');
      stack.style.setProperty('--fx-to', Math.round(flow - hdr) + 'px');
      // Photos drift slowly inside their frames while their section passes.
      $$('.story-img img, .comfort-img img', stack).forEach(img => {
        const frame = img.parentElement, from = flow + offsetIn(frame, stack) - vh;
        img.dataset.fx = 'drift';
        img.style.setProperty('--fx-from', Math.round(from) + 'px');
        img.style.setProperty('--fx-to', Math.round(from + vh + frame.offsetHeight) + 'px');
      });
      flow += h;
    });
  }
  const onResize = () => {
    // phone address bars change the height while scrolling; only rebuild for real size changes
    if (window.innerWidth === vw && Math.abs(window.innerHeight - vh) < 120) return;
    build();
  };
  build();
  window.addEventListener('resize', onResize);
  const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { if (stacks.some((s, i) => s.offsetHeight !== heights[i])) build(); }) : null;
  if (ro) stacks.forEach(s => ro.observe(s));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (document.body.classList.contains('fx')) build(); });

  return () => {
    window.removeEventListener('resize', onResize);
    if (ro) ro.disconnect();
    document.body.classList.remove('fx');
  };
}
function mountSlideshow() {
  const root = $('.show');
  const slides = $$('.slide', root), bars = $$('[data-slide]', root);
  const MS = 6500;
  let i = 0, timer = null, playing = !reduceMotion && slides.length > 1, held = false, started = 0, left = MS;

  const arm = () => {
    clearTimeout(timer);
    if (!playing || held) return;
    started = Date.now();
    timer = setTimeout(() => go(i + 1), left);
  };
  const paint = () => {
    root.classList.toggle('is-playing', playing);
    root.classList.toggle('is-held', held);
    const t = $('#show-toggle');
    t.innerHTML = icon(playing ? 'pause' : 'play');
    t.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
  };
  function go(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { const on = k === i; s.classList.toggle('is-active', on); s.inert = !on; });
    bars.forEach((b, k) => {
      b.classList.remove('is-active');
      b.classList.toggle('is-done', k < i);
      if (k === i) { b.setAttribute('aria-current', 'true'); void b.offsetWidth; b.classList.add('is-active'); }
      else b.removeAttribute('aria-current');
    });
    $('#show-count').textContent = `${i + 1} / ${slides.length}`;
    $('#show-label').textContent = D.slides[i].label;
    left = MS;
    arm();
  }
  const hold = on => {
    if (held === on) return;
    if (on && playing) left = Math.max(400, left - (Date.now() - started));
    held = on;
    if (on) clearTimeout(timer); else arm();
    paint();
  };

  root.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) hold(true); });
  root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) hold(false); });
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  });
  $('#show-prev').addEventListener('click', () => go(i - 1));
  $('#show-next').addEventListener('click', () => go(i + 1));
  $('#show-toggle').addEventListener('click', () => { playing = !playing; left = MS; held = false; paint(); go(i); });
  bars.forEach((b, k) => b.addEventListener('click', () => go(k)));

  let downX = null, swiped = false;
  const area = $('#slides');
  area.addEventListener('pointerdown', e => { downX = e.clientX; });
  area.addEventListener('pointerup', e => {
    if (downX === null) return;
    const dx = e.clientX - downX; downX = null;
    swiped = Math.abs(dx) > 10;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
  });
  area.addEventListener('click', e => { if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; } }, true);
  const onVis = () => hold(document.hidden);
  document.addEventListener('visibilitychange', onVis);

  paint(); go(0);
  return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVis); };
}

/* ============ SHOP ============ */
function matches(p, f = S.f) {
  if (f.cat.size && !f.cat.has(p.category)) return false;
  if (f.occ.size && !p.occasions.some(o => f.occ.has(o))) return false;
  if (f.color.size && !p.colors.some(c => f.color.has(c))) return false;
  if (f.size.size && ![...f.size].some(s => p.sizes.includes(+s) && !p.soldOut.includes(+s))) return false;
  if (f.price.size && !D.priceBands.some(b => f.price.has(b.id) && p.price >= b.min && p.price <= b.max)) return false;
  if (f.q && !searchHit(p, f.q)) return false;
  return true;
}
function searchHit(p, q) {
  const hay = `${p.name} ${catLabel(p.category)} ${p.occasions.map(occLabel).join(' ')} ${p.colors.map(c => D.colors[c].label).join(' ')} ${p.tags || ''}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w.replace(/s$/, '')));
}
function results() {
  const list = D.products.filter(p => matches(p));
  if (S.sort === 'low') list.sort((a, b) => a.price - b.price);
  if (S.sort === 'high') list.sort((a, b) => b.price - a.price);
  if (S.sort === 'new') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  return list;
}
function filterForm(prefix) {
  const count = fn => D.products.filter(fn).length;
  const box = (key, value, text, n, extra = '') => `<label class="fopt" for="${prefix}${key}-${value}"><input type="checkbox" id="${prefix}${key}-${value}" data-f="${key}" value="${value}" ${S.f[key].has(String(value)) ? 'checked' : ''}>${extra}<span>${esc(text)}</span><em>${n}</em></label>`;
  const group = (title, body) => `<details class="fgroup" open><summary>${title}${icon('chev')}</summary>${body}</details>`;
  const sizes = [...new Set(D.products.flatMap(p => p.sizes))].sort((a, b) => a - b);
  return group('Style', `<div class="fopts">${D.categories.map(c => box('cat', c.id, c.label, count(p => p.category === c.id))).join('')}</div>`)
    + group('Occasion', `<div class="fopts">${D.occasions.map(o => box('occ', o.id, o.label, count(p => p.occasions.includes(o.id)))).join('')}</div>`)
    + group('Price', `<div class="fopts">${D.priceBands.map(b => box('price', b.id, b.label, count(p => p.price >= b.min && p.price <= b.max))).join('')}</div>`)
    + group('Size (UK)', `<div class="fsizes">${sizes.map(s => `<label class="fsize" for="${prefix}size-${s}"><input type="checkbox" id="${prefix}size-${s}" data-f="size" value="${s}" ${S.f.size.has(String(s)) ? 'checked' : ''} aria-label="UK ${s}"><span>${s}</span></label>`).join('')}</div>`)
    + group('Colour', `<div class="fopts">${Object.entries(D.colors).map(([id, c]) => box('color', id, c.label, count(p => p.colors.includes(id)), `<i style="background:${c.hex}"></i>`)).join('')}</div>`);
}
function activeFilters() {
  const f = S.f, out = [];
  const add = (key, value, text) => out.push(`<button class="chip" type="button" data-unfilter="${key}" data-value="${esc(value)}" aria-label="Remove filter: ${esc(text)}">${esc(text)}${icon('close')}</button>`);
  if (f.q) add('q', '', `“${f.q}”`);
  f.cat.forEach(v => add('cat', v, catLabel(v)));
  f.occ.forEach(v => add('occ', v, occLabel(v)));
  f.price.forEach(v => add('price', v, D.priceBands.find(b => b.id === v).label));
  f.size.forEach(v => add('size', v, `UK ${v}`));
  f.color.forEach(v => add('color', v, D.colors[v].label));
  return out.length ? out.join('') + '<button class="clear" type="button" data-clear-filters>Clear all</button>' : '';
}
function renderResults() {
  const list = results();
  const active = activeFilters();
  const box = $('#shop-results');
  if (!box) return;
  $('#shop-count').textContent = plural(list.length, 'style', 'styles');
  const af = $('#active-filters'); af.innerHTML = active; af.hidden = !active;
  box.innerHTML = list.length ? `<div class="pgrid">${list.map(card).join('')}</div>`
    : `<div class="empty"><h2>No styles match that yet</h2><p>Try removing a filter to see more of the collection.</p><button class="btn" type="button" data-clear-filters>Clear all filters</button></div>`;
  const applyBtn = $('#filter-dlg-apply');
  if (applyBtn) applyBtn.textContent = `Show ${plural(list.length, 'style', 'styles')}`;
}
function shopPage() {
  const f = S.f;
  const title = f.cat.size === 1 && !f.occ.size ? catLabel([...f.cat][0]) : f.occ.size === 1 && !f.cat.size ? occLabel([...f.occ][0]) : 'Shop all';
  return `${pageHead(esc(title), '', 'Shop')}
  <div class="wrap shop">
    <aside class="shop-side" aria-label="Filters"><form id="side-filters">${filterForm('')}</form></aside>
    <div>
      <div class="shop-tools">
        <span class="shop-count" id="shop-count" aria-live="polite"></span>
        <div class="shop-tools-r">
          <button class="btn btn--ghost btn--sm filter-open" type="button" data-open-filters>${icon('sliders')}Filters</button>
          <label class="select"><span class="sr-only">Sort by</span>
            <select id="sort">
              <option value="featured">Featured</option>
              <option value="new">Newest first</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>${icon('chev')}
          </label>
        </div>
      </div>
      <div class="active-filters" id="active-filters" hidden></div>
      <div id="shop-results"></div>
    </div>
  </div>`;
}
function mountShop() {
  $('#sort').value = S.sort;
  $('#sort').addEventListener('change', e => { S.sort = e.target.value; renderResults(); });
  renderResults();
}
const syncFilterInputs = () => $$('input[data-f]').forEach(i => { i.checked = S.f[i.dataset.f].has(i.value); });

/* ============ NEW ARRIVALS ============ */
function newPage() {
  const list = D.products.filter(p => p.isNew);
  return `${pageHead('New arrivals', 'Our festive edit: embroidery, pearls and beadwork for every celebration.', 'New arrivals')}
  <div class="wrap" style="padding-bottom:var(--sec)">
    ${list.length ? `<div class="pgrid">${list.map(card).join('')}</div>` : `<div class="empty"><h2>New styles are on the way</h2><p>Sign up at the bottom of this page and you’ll be first to know.</p><a class="btn" href="#shop">Shop the collection</a></div>`}
  </div>`;
}

/* ============ PRODUCT ============ */
function productPage(id) {
  const p = byId(id);
  if (!p) return notFound();
  S.pdp = { id, color: p.colors[0], size: null, img: 0 };
  const count = p.images ? p.images.length : 0;
  const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  const related = D.products.filter(x => x.id !== id && x.category === p.category).concat(D.products.filter(x => x.id !== id && x.category !== p.category)).slice(0, 4);
  return `<div class="wrap page-head" style="padding-bottom:16px">
      <ol class="crumbs" aria-label="Breadcrumb"><li><a href="#home">Home</a></li><li><a href="#shop">Shop</a></li><li aria-current="page">${esc(p.name)}</li></ol>
    </div>
  <div class="wrap pdp">
    <div class="gallery ${count > 1 ? '' : 'gallery--single'}">
      ${count > 1 ? `<div class="g-thumbs" role="group" aria-label="Product photos">${p.images.map((src, i) => `<button class="g-thumb" type="button" data-thumb="${i}" aria-pressed="${i === 0}" aria-label="${esc(viewName(p, i))}"><img src="${esc(small(src))}" width="600" height="750" alt="" decoding="async"></button>`).join('')}</div>` : ''}
      <div class="g-main" id="g-main">${count ? `<img src="${esc(p.images[0])}" width="1000" height="1250" alt="${esc(p.name)}, ${esc(viewName(p, 0)).toLowerCase()}">` : photo(p)}</div>
    </div>
    <div class="pdp-info">
      <div>
        <h1>${esc(p.name)}</h1>
        <p class="pdp-cat">${esc(p.type || catLabel(p.category))} · ${p.occasions.map(occLabel).join(', ')}</p>
      </div>
      <p class="pdp-price"><span>${inr(p.price)}</span>${p.compareAt ? `<s>${inr(p.compareAt)}</s><b>${off}% off</b>` : ''}</p>
      <p class="muted">${esc(p.description)}</p>
      <fieldset>
        <legend class="sr-only">Colour</legend>
        <div class="opt-head"><span><b>Colour:</b> <span id="pdp-color">${D.colors[p.colors[0]].label}</span></span></div>
        <div class="swatches">${p.colors.map((c, i) => `<label class="swatch" title="${D.colors[c].label}"><input type="radio" name="pdp-color" id="pdp-c-${c}" value="${c}" ${i === 0 ? 'checked' : ''} aria-label="${D.colors[c].label}"><i style="background:${D.colors[c].hex}"></i></label>`).join('')}</div>
      </fieldset>
      <fieldset>
        <legend class="sr-only">Size</legend>
        <div class="opt-head"><span><b>Size:</b> <span id="pdp-size">Select UK size</span></span><a class="link-plain" href="#size-guide">Size guide</a></div>
        <div class="sizes" id="pdp-sizes">${p.sizes.map(s => { const out = p.soldOut.includes(s); return `<label class="size"><input type="radio" name="pdp-size" id="pdp-s-${s}" value="${s}" ${out ? 'disabled' : ''} aria-label="UK ${s}${out ? ', sold out' : ''}"><span>${s}</span></label>`; }).join('')}</div>
        <p class="size-err" id="pdp-err" role="alert"></p>
      </fieldset>
      <div class="pdp-actions">
        <button class="btn" type="button" id="pdp-add">Add to bag</button>
        <button class="btn btn--ghost btn-heart" type="button" data-wish="${p.id}" aria-pressed="${S.wish.includes(p.id)}" aria-label="Save ${esc(p.name)} to wishlist">${icon('heart')}</button>
      </div>
      <form id="pin-form">
        <div class="opt-head"><label for="pin-input"><b>Check delivery</b></label></div>
        <div class="pin-row"><input class="input" id="pin-input" inputmode="numeric" maxlength="6" autocomplete="postal-code" placeholder="Enter pincode" value="${esc(S.pin)}"><button class="btn btn--ghost btn--sm" type="submit" style="min-height:50px">Check</button></div>
        <p class="pin-msg" id="pin-msg" role="status"></p>
      </form>
      <div>
        <details class="acc"><summary>Comfort and materials${icon('plus')}</summary><div class="acc-body"><ul>${(p.details || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul></div></details>
        <details class="acc"><summary>Delivery and exchanges${icon('plus')}</summary><div class="acc-body"><p>Free delivery across India. Cash on delivery available. Wrong size? Exchange it for free. <a class="link-plain" href="#shipping-returns">Read more</a></p></div></details>
      </div>
    </div>
  </div>
  <section class="wrap" style="padding-bottom:var(--sec)" aria-labelledby="h-rel">
    <div class="sec-head"><h2 class="t-xl" id="h-rel">You may also like</h2></div>
    <div class="pgrid pgrid--row">${related.map(card).join('')}</div>
  </section>`;
}
function checkPin() {
  const v = $('#pin-input').value.trim(), m = $('#pin-msg');
  if (!/^[1-9]\d{5}$/.test(v)) { m.className = 'pin-msg err'; m.textContent = 'Enter a 6-digit pincode, like 500081.'; return; }
  S.pin = v; store.set('velino.site.pin', v);
  m.className = 'pin-msg ok';
  m.textContent = `Delivers to ${v} by ${dateIn(5)}. Cash on delivery available.`;
}
function addFromPDP() {
  const p = byId(S.pdp.id);
  if (!S.pdp.size) {
    $('#pdp-err').textContent = 'Please choose your size first.';
    const g = $('#pdp-sizes'); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
    const first = $('#pdp-sizes input:not(:disabled)'); if (first) first.focus();
    return;
  }
  addToCart(p.id, S.pdp.color, S.pdp.size);
  toastAdded(p, S.pdp.color, S.pdp.size);
}

/* ============ WISHLIST ============ */
function toggleWish(id) {
  const p = byId(id);
  if (S.wish.includes(id)) { S.wish = S.wish.filter(x => x !== id); }
  else { S.wish.push(id); toastPlain(`<b>Saved to your wishlist</b><p>${esc(p.name)}</p><div class="toast-acts"><a href="#wishlist">View wishlist</a></div>`); }
  saveWish(); updateCounts();
  $$(`[data-wish="${id}"]`).forEach(b => b.setAttribute('aria-pressed', S.wish.includes(id)));
  if (current.name === 'wishlist') renderCurrent();
}
function wishlistPage() {
  const list = S.wish.map(byId);
  if (!list.length) {
    return `${pageHead('Wishlist', '', 'Wishlist')}
    <div class="wrap" style="padding-bottom:var(--sec)"><div class="empty"><h2>Nothing saved yet</h2><p>Tap the heart on any style and it will wait for you here.</p><a class="btn" href="#shop">Start shopping ${icon('arrow', 'ic-go')}</a></div></div>`;
  }
  return `${pageHead('Wishlist', plural(list.length, 'saved style', 'saved styles'), 'Wishlist')}
  <div class="wrap" style="padding-bottom:var(--sec)">
    <div class="pgrid">${list.map(p => `<div class="wl-item">${card(p)}
      <div class="wl-actions">
        <label class="select"><span class="sr-only">Size for ${esc(p.name)}</span><select id="wl-size-${p.id}" class="wl-size"><option value="">Size</option>${p.sizes.map(s => `<option value="${s}" ${p.soldOut.includes(s) ? 'disabled' : ''}>UK ${s}${p.soldOut.includes(s) ? ' (sold out)' : ''}</option>`).join('')}</select>${icon('chev')}</label>
        <button class="btn btn--sm" type="button" data-wl-add="${p.id}">Move to bag</button>
      </div>
      <p class="wl-msg" id="wl-msg-${p.id}" role="alert"></p>
    </div>`).join('')}</div>
  </div>`;
}

/* ============ BAG ============ */
function addToCart(id, color, size, qty = 1) {
  const key = `${id}|${color}|${size}`;
  const line = S.cart.find(l => l.key === key);
  if (line) line.qty = Math.min(5, line.qty + qty);
  else S.cart.push({ key, id, color, size: +size, qty });
  saveCart(); updateCounts(true);
}
function totals(ship = 0) {
  let sub = 0, mrp = 0, n = 0;
  S.cart.forEach(l => { const p = byId(l.id); sub += p.price * l.qty; mrp += (p.compareAt || p.price) * l.qty; n += l.qty; });
  return { sub, mrp, n, ship, total: sub + ship, saved: mrp - sub };
}
const totalsHTML = t => `
  <div><dt>Subtotal (${plural(t.n, 'item', 'items')})</dt><dd>${inr(t.sub)}</dd></div>
  <div><dt>Delivery</dt><dd>${t.ship ? inr(t.ship) : 'Free'}</dd></div>
  ${t.saved > 0 ? `<div class="save"><dt>You save</dt><dd>${inr(t.saved)}</dd></div>` : ''}
  <div class="grand"><dt>Total</dt><dd>${inr(t.total)}</dd></div>`;
function cartLine(l) {
  const p = byId(l.id);
  return `<article class="line">
    <a class="line-img" href="#product-${p.id}" aria-label="${esc(p.name)}">${photo(p, 0, '', '140px')}</a>
    <div class="line-info">
      <h3><a href="#product-${p.id}">${esc(p.name)}</a></h3>
      <p class="line-meta">${D.colors[l.color].label} · UK ${l.size}</p>
      <div class="line-tools">
        <div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}">
          <button type="button" data-qty="${esc(l.key)}" data-d="-1" aria-label="Decrease quantity" ${l.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button>
          <output>${l.qty}</output>
          <button type="button" data-qty="${esc(l.key)}" data-d="1" aria-label="Increase quantity" ${l.qty >= 5 ? 'disabled' : ''}>${icon('plus')}</button>
        </div>
        <button class="tbtn" type="button" data-remove="${esc(l.key)}">Remove</button>
        <button class="tbtn" type="button" data-to-wish="${esc(l.key)}">Move to wishlist</button>
      </div>
    </div>
    <p class="line-price">${inr(p.price * l.qty)}${p.compareAt ? `<s>${inr(p.compareAt * l.qty)}</s>` : ''}</p>
  </article>`;
}
function emptyBag() {
  return `${pageHead('Your bag', '', 'Bag')}
  <div class="wrap" style="padding-bottom:var(--sec)"><div class="empty"><h2>Your bag is empty</h2><p>Find a pair you’ll want to wear again and again.</p><a class="btn" href="#shop">Start shopping ${icon('arrow', 'ic-go')}</a></div></div>`;
}
function cartPage() {
  if (!S.cart.length) return emptyBag();
  const t = totals();
  return `${pageHead('Your bag', '', 'Bag')}
  <div class="wrap two-col">
    <div>${S.cart.map(cartLine).join('')}</div>
    <aside class="summary" aria-label="Order summary">
      <h2>Order summary</h2>
      <dl class="totals">${totalsHTML(t)}</dl>
      <a class="btn btn--block" href="#checkout">Checkout ${icon('arrow', 'ic-go')}</a>
      <p class="pay-note">UPI, cards, net banking and cash on delivery</p>
    </aside>
  </div>`;
}

/* ============ CHECKOUT ============ */
const CHECK = {
  'co-name': v => v.length >= 2 || 'Enter your full name.',
  'co-phone': v => /^[6-9]\d{9}$/.test(v) || 'Enter a 10-digit mobile number.',
  'co-pin': v => /^[1-9]\d{5}$/.test(v) || 'Enter a 6-digit pincode.',
  'co-addr': v => v.length >= 6 || 'Enter your house number, street and area.',
  'co-city': v => v.length >= 2 || 'Enter your city.',
  'co-state': v => v.length >= 2 || 'Enter your state.'
};
function fieldCheck(id) {
  const el = document.getElementById(id), r = CHECK[id](el.value.trim()), err = document.getElementById(id + '-err');
  if (r === true) { el.removeAttribute('aria-invalid'); err.textContent = ''; return true; }
  el.setAttribute('aria-invalid', 'true'); err.textContent = r; return false;
}
const shipCost = () => { const e = $('#ship-exp'); return e && e.checked ? 99 : 0; };
function checkoutSummary() {
  const t = totals(shipCost());
  $('#co-totals').innerHTML = totalsHTML(t);
  $('#co-submit').textContent = `Place order · ${inr(t.total)}`;
}
const field = (id, label, attrs = '', full = false) => `<div class="field ${full ? 'field--full' : ''}"><label for="${id}">${label}</label><input class="input" id="${id}" name="${id}" ${attrs} aria-describedby="${id}-err"><p class="err-msg" id="${id}-err"></p></div>`;
function checkoutPage() {
  if (!S.cart.length) return emptyBag();
  return `${pageHead('Checkout', '', 'Checkout')}
  <form class="wrap two-col" id="co-form" novalidate>
    <div>
      <section class="form-sec" aria-labelledby="co-1">
        <h2 id="co-1"><i>1</i>Delivery address</h2>
        <div class="fields">
          ${field('co-name', 'Full name', 'autocomplete="name"', true)}
          <div class="field"><label for="co-phone">Mobile number</label><div class="phone"><span>+91</span><input class="input" id="co-phone" name="co-phone" inputmode="numeric" maxlength="10" autocomplete="tel-national" aria-describedby="co-phone-err"></div><p class="err-msg" id="co-phone-err"></p></div>
          ${field('co-pin', 'Pincode', `inputmode="numeric" maxlength="6" autocomplete="postal-code" value="${esc(S.pin)}"`)}
          ${field('co-addr', 'House, street and area', 'autocomplete="street-address"', true)}
          ${field('co-city', 'City', 'autocomplete="address-level2"')}
          ${field('co-state', 'State', 'autocomplete="address-level1"')}
        </div>
      </section>
      <section class="form-sec" aria-labelledby="co-2">
        <h2 id="co-2"><i>2</i>Delivery speed</h2>
        <div class="radios">
          <label class="radio"><input type="radio" name="ship" id="ship-std" value="std" checked><div><b>Standard</b><small>Arrives by ${dateIn(5)}</small></div><span>Free</span></label>
          <label class="radio"><input type="radio" name="ship" id="ship-exp" value="exp"><div><b>Express</b><small>Arrives by ${dateIn(2)}</small></div><span>₹99</span></label>
        </div>
      </section>
      <section class="form-sec" aria-labelledby="co-3">
        <h2 id="co-3"><i>3</i>Payment</h2>
        <div class="radios">
          <label class="radio"><input type="radio" name="pay" id="pay-upi" value="UPI" checked><div><b>UPI</b><small>GPay, PhonePe, Paytm or any UPI app</small></div></label>
          <label class="radio"><input type="radio" name="pay" id="pay-cod" value="Cash on delivery"><div><b>Cash on delivery</b><small>Pay when your order arrives</small></div></label>
          <label class="radio"><input type="radio" name="pay" id="pay-card" value="Card or net banking"><div><b>Card or net banking</b><small>Visa, Mastercard, RuPay and major banks</small></div></label>
        </div>
        <p class="notice">${icon('info')}<span>This is a prototype. No payment is taken and no order is placed.</span></p>
      </section>
    </div>
    <aside class="summary" aria-label="Order summary">
      <h2>Your order</h2>
      <div class="sum-lines">${S.cart.map(l => { const p = byId(l.id); return `<div class="sum-line"><span class="line-img">${photo(p, 0, '', '56px')}</span><div><b>${esc(p.name)} × ${l.qty}</b><span>${D.colors[l.color].label} · UK ${l.size}</span></div><span class="amt">${inr(p.price * l.qty)}</span></div>`; }).join('')}</div>
      <dl class="totals" id="co-totals"></dl>
      <button class="btn btn--block" type="submit" id="co-submit">Place order</button>
    </aside>
  </form>`;
}
function mountCheckout() {
  const form = $('#co-form');
  if (!form) return;
  checkoutSummary();
  form.addEventListener('change', e => { if (e.target.name === 'ship') checkoutSummary(); });
  Object.keys(CHECK).forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => { if (el.value) fieldCheck(id); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') fieldCheck(id); });
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = Object.keys(CHECK).filter(id => !fieldCheck(id));
    if (bad.length) { document.getElementById(bad[0]).focus(); return; }
    const fd = new FormData(form), ship = shipCost(), t = totals(ship);
    S.order = { no: 'VEL-' + Math.floor(100000 + Math.random() * 900000), name: $('#co-name').value.trim().split(' ')[0], eta: dateIn(ship ? 2 : 5), pay: fd.get('pay'), total: t.total };
    S.cart = []; saveCart(); updateCounts();
    go('order-confirmed');
  });
}
function confirmedPage() {
  const o = S.order;
  if (!o) return notFound();
  return `<div class="wrap done">
    <span class="done-tick">${icon('check')}</span>
    <h1 class="t-xl">Thank you, ${esc(o.name)}.</h1>
    <p class="lede">This was a prototype checkout, so nothing was charged and no order was placed.</p>
    <dl><dt>Order</dt><dd>${o.no}</dd><dt>Arriving by</dt><dd>${o.eta}</dd><dt>Payment</dt><dd>${esc(o.pay)}</dd><dt>Total</dt><dd>${inr(o.total)}</dd></dl>
    <a class="btn" href="#shop">Keep shopping ${icon('arrow', 'ic-go')}</a>
  </div>`;
}

/* ============ ABOUT ============ */
function aboutPage() {
  return `<section class="about-hero">
    <div class="about-hero-copy">
      <ol class="crumbs" aria-label="Breadcrumb"><li><a href="#home">Home</a></li><li aria-current="page">About</li></ol>
      <h1><strong>Confidence</strong> without compromise.</h1>
    </div>
    <div class="about-hero-img"><img src="assets/about/story.webp" alt="A woman in jeans and a linen shirt, wearing white Velino sandals."></div>
  </section>
  <section class="sec wrap" aria-label="Our mission">
    <p class="mission">To help women feel <strong>confident, beautiful and comfortable</strong> in every step they take, so they can embrace every celebration without holding back.</p>
  </section>
  <section class="sec sec--tight wrap" aria-labelledby="h-why">
    <div class="about-cols">
      <h2 class="t-lg" id="h-why">Why we started</h2>
      <div class="prose">
        <p>Weddings, parties and festive gatherings ask a lot of your feet. Most occasion footwear makes you choose: it looks beautiful but hurts, feels good but looks plain, or does both and costs far too much.</p>
        <p>Too many women spend the celebration thinking about foot bites instead of the people around them. Velino exists to change that, with footwear that brings style, comfort and an accessible price together in one pair.</p>
      </div>
    </div>
  </section>
  <section class="sec sec--paper" aria-labelledby="h-believe">
    <div class="wrap">
      <div class="sec-head"><h2 class="t-xl" id="h-believe">What we stand for</h2></div>
      <div class="choose">
        <div><h3>All three, in one pair</h3><p>Fashionable, comfortable and affordable. Unlike brands that charge a premium for it, we think you deserve all three.</p></div>
        <div><h3>Designs that work harder</h3><p>Versatile styles that restyle across outfits and occasions, so one purchase goes further.</p></div>
        <div><h3>Made for real celebrations</h3><p>Designed for long evenings, busy function days and the dance floor, not just the photos.</p></div>
      </div>
    </div>
  </section>
  <section class="sec wrap" aria-labelledby="h-about-go">
    <div class="story">
      <div class="story-img"><img src="assets/about/wall.webp" alt="Soft leaf shadows on a warm wall." loading="lazy"></div>
      <div class="story-body">
        <h2 class="t-xl" id="h-about-go">Ready to find <em>your pair?</em></h2>
        <p class="lede">Explore the collection, or see what’s just landed.</p>
        <div class="occ-row"><a class="btn" href="#shop">Shop all ${icon('arrow', 'ic-go')}</a><a class="btn btn--ghost" href="#new-arrivals">New arrivals</a></div>
      </div>
    </div>
  </section>`;
}

/* ============ HELP PAGES ============ */
const HELP = [['size-guide', 'Size guide'], ['shipping-returns', 'Delivery and exchanges'], ['faq', 'FAQ'], ['contact', 'Contact us']];
const helpShell = (key, title, body) => `${pageHead(esc(title), '', title)}
  <div class="wrap help">
    <nav class="help-nav" aria-label="Help">${HELP.map(([k, l]) => `<a href="#${k}" ${k === key ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    <div>${body}</div>
  </div>`;
const SIZES = [[3, 36, 22.5], [4, 37, 23.2], [5, 38, 24.0], [6, 39, 24.8], [7, 40, 25.5], [8, 41, 26.3]];
function sizeGuidePage() {
  return helpShell('size-guide', 'Size guide', `<div class="prose" style="max-width:720px">
    <div class="finder">
      <label for="foot-cm"><b>Know your foot length? Find your size.</b></label>
      <div class="finder-row"><input class="input" id="foot-cm" type="number" inputmode="decimal" min="20" max="29" step="0.1" placeholder="Length in cm"><span id="foot-out" role="status"></span></div>
    </div>
    <div class="table-wrap"><table class="size-table" id="size-table">
      <thead><tr><th scope="col">UK / India</th><th scope="col">EU</th><th scope="col">Foot length</th></tr></thead>
      <tbody>${SIZES.map(([u, e, c]) => `<tr data-uk="${u}"><td>${u}</td><td>${e}</td><td>${c.toFixed(1)} cm</td></tr>`).join('')}</tbody>
    </table></div>
    <h2>How to measure your foot</h2>
    <ul>
      <li>Stand on a sheet of paper with your heel against a wall.</li>
      <li>Mark the tip of your longest toe, then measure from the wall to the mark.</li>
      <li>Measure in the evening, when your feet are at their largest.</li>
      <li>Between sizes? Choose the larger one.</li>
    </ul>
  </div>`);
}
function shippingPage() {
  return helpShell('shipping-returns', 'Delivery and exchanges', `<div class="prose">
    <span class="draft">Draft policy for the prototype</span>
    <h2>Delivery</h2>
    <p>Delivery is free across India on standard shipping. Most orders arrive within 3 to 5 working days. Express delivery is available at checkout.</p>
    <h2>Cash on delivery</h2>
    <p>Pay in cash or by UPI when your order arrives.</p>
    <h2>Size exchanges</h2>
    <p>If your pair doesn’t fit, you can exchange it for free within 15 days of delivery. Keep it unworn, with its original box.</p>
    <h2>Returns</h2>
    <p>Changed your mind? Return an unworn pair within 15 days for a refund to your original payment method.</p>
  </div>`);
}
function faqPage() {
  const qa = [
    ['Will Velino shoes really be comfortable all evening?', 'Comfort is the reason Velino exists. Every style is designed with a cushioned footbed, soft linings and a stable base, so you can stay on your feet through the event.'],
    ['How do I know my size?', 'Our sizes follow UK / India sizing. The <a class="link-plain" href="#size-guide">size guide</a> converts your foot length to the right size.'],
    ['Can I wear one pair to different events?', 'Yes, that’s the idea. Our designs are made to go with traditional and western outfits alike.'],
    ['What if the size is wrong?', 'You can exchange it for free. See <a class="link-plain" href="#shipping-returns">delivery and exchanges</a> for details.'],
    ['Do you offer cash on delivery?', 'Yes. You can also pay by UPI, card or net banking.'],
    ['How do I care for my shoes?', 'Wipe them with a soft dry cloth and store them in their box, away from direct sunlight.']
  ];
  return helpShell('faq', 'FAQ', `<div class="faq-list">${qa.map(([q, a]) => `<details class="acc"><summary>${q}${icon('plus')}</summary><div class="acc-body"><p>${a}</p></div></details>`).join('')}</div>`);
}
function contactPage() {
  return helpShell('contact', 'Contact us', `<form class="contact-form" id="contact-form" novalidate>
    <p class="lede">Questions about fit, an order or a style? Send us a message.</p>
    <div class="field"><label for="ct-name">Your name</label><input class="input" id="ct-name" autocomplete="name"></div>
    <div class="field"><label for="ct-email">Email address</label><input class="input" id="ct-email" type="email" autocomplete="email"></div>
    <div class="field"><label for="ct-msg">Message</label><textarea class="input" id="ct-msg" rows="5"></textarea></div>
    <p class="err-msg" id="ct-err" role="alert"></p>
    <div><button class="btn" type="submit">Send message</button></div>
    <p class="notice" id="ct-done" role="status" hidden>${icon('info')}<span>Message form is working, but this prototype doesn’t send anything yet.</span></p>
  </form>`);
}
function notFound() {
  return `<div class="wrap done">
    <h1 class="t-xl">We can’t find that page.</h1>
    <p class="lede">It may have moved. The collection is still here.</p>
    <a class="btn" href="#shop">Go to the shop ${icon('arrow', 'ic-go')}</a>
  </div>`;
}

/* ============ TOAST ============ */
const toastEl = $('#toast');
let toastTimer;
function showToast(html, plain) {
  toastEl.className = 'toast' + (plain ? ' toast--plain' : '');
  toastEl.innerHTML = html;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}
function hideToast() { toastEl.hidden = true; clearTimeout(toastTimer); }
const toastPlain = html => showToast(`<div>${html}</div>`, true);
function toastAdded(p, color, size) {
  showToast(`<span class="line-img">${photo(p, 0, '', '56px')}</span><div><b>Added to your bag</b><p>${esc(p.name)} · ${D.colors[color].label} · UK ${size}</p><div class="toast-acts"><a href="#cart">View bag</a><a href="#checkout">Checkout</a></div></div>`);
}
toastEl.addEventListener('pointerenter', () => clearTimeout(toastTimer));
toastEl.addEventListener('pointerleave', () => { toastTimer = setTimeout(hideToast, 2500); });

/* ============ COUNTS ============ */
function updateCounts(bump) {
  const n = S.cart.reduce((a, l) => a + l.qty, 0), c = $('#cart-count'), w = $('#wish-count');
  c.textContent = n; c.hidden = !n;
  w.textContent = S.wish.length; w.hidden = !S.wish.length;
  $('.hdr-icons [data-nav="cart"]').setAttribute('aria-label', `Bag, ${plural(n, 'item', 'items')}`);
  $('.hdr-icons [data-nav="wishlist"]').setAttribute('aria-label', `Wishlist, ${plural(S.wish.length, 'item', 'items')}`);
  if (bump) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
}

/* ============ ROUTER ============ */
const PAGES = {
  home: { title: 'Velino', nav: 'home', html: homePage, mount: () => { const stopShow = mountSlideshow(), stopFx = mountScrollFx(); return () => { stopShow(); stopFx(); }; } },
  shop: { title: 'Shop', nav: 'shop', html: shopPage, mount: mountShop },
  'new-arrivals': { title: 'New arrivals', nav: 'new-arrivals', html: newPage },
  about: { title: 'About', nav: 'about', html: aboutPage },
  wishlist: { title: 'Wishlist', nav: 'wishlist', html: wishlistPage },
  cart: { title: 'Bag', nav: 'cart', html: cartPage },
  checkout: { title: 'Checkout', nav: 'cart', html: checkoutPage, mount: mountCheckout },
  'order-confirmed': { title: 'Thank you', nav: '', html: confirmedPage },
  'size-guide': { title: 'Size guide', nav: '', html: sizeGuidePage },
  'shipping-returns': { title: 'Delivery and exchanges', nav: '', html: shippingPage },
  faq: { title: 'FAQ', nav: '', html: faqPage },
  contact: { title: 'Contact us', nav: '', html: contactPage },
  product: { title: 'Product', nav: 'shop' },
  missing: { title: 'Page not found', nav: '', html: notFound }
};
let current = { name: '', key: '' };
let cleanup = null;
let viaLink = false;
let memoryRoute = null;
let firstLoad = true;
const scrollMemory = {};

function parseRoute() {
  const raw = memoryRoute || location.hash.slice(1) || 'home';
  if (raw === 'content') return { name: 'home', key: 'home' };
  if (raw.startsWith('product-')) return { name: 'product', id: raw.slice(8), key: raw };
  if (raw.startsWith('shop-')) return { name: 'shop', preset: raw.slice(5), key: raw };
  return PAGES[raw] ? { name: raw, key: raw } : { name: 'missing', key: raw };
}
function applyPreset(p) {
  S.f = emptyFilters();
  if (D.categories.some(c => c.id === p)) S.f.cat.add(p);
  else if (D.occasions.some(o => o.id === p)) S.f.occ.add(p);
}
function renderCurrent() {
  const r = current;
  if (cleanup) { cleanup(); cleanup = null; }
  const page = PAGES[r.name];
  document.body.dataset.page = r.name;
  app.innerHTML = `<div class="page">${r.name === 'product' ? productPage(r.id) : page.html()}</div>`;
  if (r.name === 'product') {
    const p = byId(r.id);
    document.title = p ? `${p.name} · Velino` : 'Velino';
    if (S.pin && $('#pin-input')) checkPin();
  } else {
    document.title = page.title === 'Velino' ? 'Velino' : `${page.title} · Velino`;
  }
  if (page.mount) cleanup = page.mount() || null;
}
function route() {
  const next = parseRoute();
  const prevName = current.name;
  const wasLink = viaLink;
  viaLink = false;
  $$('dialog[open]').forEach(d => d.close());
  hideToast();

  if (next.name === 'shop') {
    if (next.preset && (wasLink || firstLoad)) applyPreset(next.preset);
    else if (!next.preset && wasLink && prevName !== 'product' && !keepFilters) S.f = emptyFilters();
    keepFilters = false;
  }
  current = next;
  renderCurrent();

  const navKey = PAGES[next.name].nav;
  $$('[data-nav]').forEach(a => { if (a.dataset.nav === navKey) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  window.scrollTo(0, wasLink || firstLoad ? 0 : (scrollMemory[next.key] || 0));
  if (!firstLoad) {
    $('#route-status').textContent = document.title;
    if (wasLink) $('#content').focus({ preventScroll: true });
  }
  firstLoad = false;
}
let keepFilters = false;
function go(token) {
  viaLink = true;
  if (location.hash === '#' + token && !memoryRoute) { route(); return; }
  location.hash = token;
  if (location.hash !== '#' + token) { memoryRoute = token; route(); }
}
window.addEventListener('hashchange', () => { memoryRoute = null; route(); });
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const header = $('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-stuck', window.scrollY > 4);
  if (current.key) scrollMemory[current.key] = window.scrollY;
}, { passive: true });

/* ============ SEARCH ============ */
function renderSearch() {
  const q = $('#search-q').value.trim(), box = $('#search-results');
  if (!q) {
    box.innerHTML = `<p class="search-status">Popular</p><div class="occ-row">${D.categories.map(c => `<a class="chip" href="#shop-${c.id}">${esc(c.label)}</a>`).join('')}${D.occasions.map(o => `<a class="chip" href="#shop-${o.id}">${esc(o.label)}</a>`).join('')}</div>`;
    return;
  }
  const list = D.products.filter(p => searchHit(p, q)).slice(0, 6);
  box.innerHTML = list.length
    ? `<p class="search-status">Press Enter to see all results for “${esc(q)}”</p><div class="search-grid">${list.map(card).join('')}</div>`
    : `<p class="search-status">Nothing found for “${esc(q)}”. Try “heels” or “wedding”.</p>`;
}
$('#search-q').addEventListener('input', renderSearch);
$('#search-form').addEventListener('submit', e => {
  e.preventDefault();
  const q = $('#search-q').value.trim();
  if (!q) return;
  S.f = emptyFilters(); S.f.q = q;
  $('#search-dlg').close();
  keepFilters = true;
  go('shop');
});

/* ============ EVENTS ============ */
$$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

document.addEventListener('click', e => {
  const t = e.target;
  const hit = sel => t.closest(sel);
  let el;

  if ((el = hit('[data-skip]'))) { e.preventDefault(); $('#content').focus(); return; }
  if ((el = hit('[data-open-dialog]'))) {
    const d = document.getElementById(el.dataset.openDialog);
    if (d.id === 'search-dlg') { $('#search-q').value = ''; renderSearch(); }
    if (!d.open) d.showModal();
    if (d.id === 'search-dlg') $('#search-q').focus();
    return;
  }
  if ((el = hit('[data-close-dialog]'))) { el.closest('dialog').close(); return; }
  if ((el = hit('[data-open-filters]'))) {
    $('#filter-dlg-body').innerHTML = `<form id="dlg-filters">${filterForm('m-')}</form>`;
    renderResults();
    $('#filter-dlg').showModal();
    return;
  }
  if ((el = hit('[data-wish]'))) { e.preventDefault(); toggleWish(el.dataset.wish); return; }
  if ((el = hit('[data-unfilter]'))) {
    const k = el.dataset.unfilter;
    if (k === 'q') S.f.q = ''; else S.f[k].delete(el.dataset.value);
    syncFilterInputs(); renderResults();
    return;
  }
  if ((el = hit('[data-clear-filters]'))) { S.f = emptyFilters(); syncFilterInputs(); renderResults(); return; }
  if ((el = hit('[data-thumb]'))) {
    const p = byId(S.pdp.id), i = +el.dataset.thumb;
    $('#g-main').innerHTML = `<img src="${esc(p.images[i])}" width="1000" height="1250" alt="${esc(p.name)}, ${esc(viewName(p, i)).toLowerCase()}">`;
    $$('[data-thumb]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.thumb === i));
    return;
  }
  if (t.closest('#pdp-add')) { addFromPDP(); return; }
  if ((el = hit('[data-wl-add]'))) {
    const id = el.dataset.wlAdd, p = byId(id), size = document.getElementById('wl-size-' + id).value;
    if (!size) { document.getElementById('wl-msg-' + id).textContent = 'Choose a size first.'; document.getElementById('wl-size-' + id).focus(); return; }
    addToCart(id, p.colors[0], +size);
    S.wish = S.wish.filter(x => x !== id); saveWish(); updateCounts();
    renderCurrent();
    toastAdded(p, p.colors[0], +size);
    return;
  }
  if ((el = hit('[data-qty]'))) {
    const key = el.dataset.qty, d = el.dataset.d, l = S.cart.find(x => x.key === key);
    if (l) { l.qty = Math.max(1, Math.min(5, l.qty + +d)); saveCart(); updateCounts(); renderCurrent(); const again = $(`[data-qty="${CSS.escape(key)}"][data-d="${d}"]`); if (again && !again.disabled) again.focus(); }
    return;
  }
  if ((el = hit('[data-remove]'))) {
    const i = S.cart.findIndex(x => x.key === el.dataset.remove);
    if (i > -1) {
      const [line] = S.cart.splice(i, 1); saveCart(); updateCounts(); renderCurrent();
      showToast(`<div><b>Removed ${esc(byId(line.id).name)}</b><div class="toast-acts"><button type="button" id="undo-remove">Undo</button></div></div>`, true);
      $('#undo-remove').addEventListener('click', () => { S.cart.splice(i, 0, line); saveCart(); updateCounts(); renderCurrent(); hideToast(); });
    }
    return;
  }
  if ((el = hit('[data-to-wish]'))) {
    const i = S.cart.findIndex(x => x.key === el.dataset.toWish);
    if (i > -1) {
      const [line] = S.cart.splice(i, 1);
      if (!S.wish.includes(line.id)) S.wish.push(line.id);
      saveCart(); saveWish(); updateCounts(); renderCurrent();
      toastPlain(`<b>Moved to your wishlist</b><div class="toast-acts"><a href="#wishlist">View wishlist</a></div>`);
    }
    return;
  }
  if ((el = hit('a[href^="#"]'))) {
    e.preventDefault();
    const token = el.getAttribute('href').slice(1);
    const d = el.closest('dialog'); if (d) d.close();
    go(token);
    return;
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('input[data-f]')) {
    const set = S.f[t.dataset.f];
    if (t.checked) set.add(t.value); else set.delete(t.value);
    syncFilterInputs(); renderResults();
    return;
  }
  if (t.name === 'pdp-color') { S.pdp.color = t.value; $('#pdp-color').textContent = D.colors[t.value].label; return; }
  if (t.name === 'pdp-size') { S.pdp.size = +t.value; $('#pdp-size').textContent = `UK ${t.value}`; $('#pdp-err').textContent = ''; return; }
  if (t.classList.contains('wl-size')) { const m = document.getElementById('wl-msg-' + t.id.replace('wl-size-', '')); if (m) m.textContent = ''; }
});

document.addEventListener('input', e => {
  if (e.target.id !== 'foot-cm') return;
  const cm = parseFloat(e.target.value), out = $('#foot-out');
  $$('#size-table tr').forEach(r => r.classList.remove('hit'));
  if (!cm || cm < 20 || cm > 29) { out.textContent = ''; return; }
  const row = SIZES.find(r => cm <= r[2]) || SIZES[SIZES.length - 1];
  out.innerHTML = `Your size is <b>UK ${row[0]}</b>`;
  $(`#size-table tr[data-uk="${row[0]}"]`).classList.add('hit');
});

document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'pin-form') { e.preventDefault(); checkPin(); return; }
  if (f.id === 'news-form') {
    e.preventDefault();
    const inp = $('#news-email'), msg = $('#news-msg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { msg.textContent = 'Enter a valid email address, like you@example.com.'; inp.focus(); return; }
    $('#news-fields').hidden = true;
    msg.textContent = 'Thank you. Sign-ups will start working when the store goes live.';
    return;
  }
  if (f.id === 'contact-form') {
    e.preventDefault();
    const ok = $('#ct-name').value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('#ct-email').value.trim()) && $('#ct-msg').value.trim();
    $('#ct-err').textContent = ok ? '' : 'Please fill in your name, a valid email and a message.';
    $('#ct-done').hidden = !ok;
    return;
  }
  if (f.id === 'side-filters' || f.id === 'dlg-filters') e.preventDefault();
});

/* ============ START ============ */
updateCounts();
route();
})();
