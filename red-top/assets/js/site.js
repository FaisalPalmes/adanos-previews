// Shared by every page: shop details, open/closed status, Order buttons, the header, the phone menu and the phone order bar.
(() => {
  const A = window.ADANOS, root = document.documentElement;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

  A.money = n => '£' + n.toFixed(2);
  A.slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  A.esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // For names set in large type: an ampersand stays with the word after it, so it never ends or sits alone on a line.
  A.name = s => A.esc(s).replace(/ &amp; /g, ' &amp;&nbsp;');
  A.fmtHour = h => h === 12 ? '12pm' : h === 24 || h === 0 ? 'midnight' : h > 12 ? (h - 12) + 'pm' : h + 'am';
  // Photos with a square crop (sq-<name>.jpg) for cards and thumbnails. Anything else falls back to the full photo.
  const squares = ['adanos-burger', 'meat-stack', 'daddy-burger', 'cheese-burger', 'black-angus', 'peri-peri', 'big-yummy', 'hot-yummy', 'half-chicken', 'lamb-chops'];
  A.thumb = ph => `assets/img/${squares.includes(ph) ? 'sq-' : ''}${ph}.jpg`;
  // Jump without the smooth scroll (older browsers don't know "instant" and just jump anyway).
  A.jumpTo = y => { try { scrollTo({top: y, behavior: 'instant'}); } catch (e) { scrollTo(0, y); } };
  A.jumpIn = el => { try { el.scrollIntoView({block: 'start', behavior: 'instant'}); } catch (e) { el.scrollIntoView(); } };

  A.openState = (d = new Date()) => {
    const day = d.getDay(), [o, c] = A.hours[day], t = d.getHours() + d.getMinutes() / 60;
    if (t >= o && t < c) return {open: true, text: `Open now · until ${A.fmtHour(c)}`, short: 'Open'};
    if (t < o) return {open: false, text: `Closed · opens ${A.fmtHour(o)}`, short: 'Closed'};
    return {open: false, text: `Closed · opens ${A.fmtHour(A.hours[(day + 1) % 7][0])} tomorrow`, short: 'Closed'};
  };

  // Open or closed, checked again every minute. The long label shows where there's room, the short one on phones.
  const paintStatus = () => {
    const st = A.openState();
    $$('[data-status]').forEach(el => {
      el.classList.add('live');
      el.classList.toggle('closed', !st.open);
      el.querySelector('span').innerHTML = `<span class="st-long">${st.text}</span><span class="st-short">${st.short}</span>`;
    });
  };
  paintStatus();
  setInterval(paintStatus, 60000);

  $$('[data-tel]').forEach(a => { a.href = A.tel; });
  $$('[data-phone]').forEach(el => { el.textContent = A.phone; });
  // The address as one line, or split at its commas where it's set large (the postcode never breaks in two).
  $$('[data-address]').forEach(el => {
    if (el.dataset.address === 'lines') el.innerHTML = A.address.split(/,\s*/).map(l => `<span>${A.esc(l).replace(/ (\d[A-Z]{2})$/, '&nbsp;$1')}</span>`).join(' ');
    else el.textContent = A.address;
  });
  $$('[data-maps]').forEach(a => { a.href = A.maps; });
  $$('[data-instagram]').forEach(a => { a.href = A.instagram; });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  if (!A.previewNotes) $$('.swap-note').forEach(el => el.remove());

  // Every "Order for collection" button reads A.orderUrl. Empty means online ordering isn't connected yet,
  // so the button shows a short message instead: next to the button on wide screens, above the order bar on phones.
  const toast = $('#toast'), phone = matchMedia('(max-width: 759px)');
  const hideToast = () => toast.classList.remove('show');
  $$('[data-order]').forEach(b => {
    if (A.orderUrl) { b.href = A.orderUrl; b.target = '_blank'; b.rel = 'noopener'; return; }
    b.addEventListener('click', e => {
      e.preventDefault();
      toast.textContent = `Online ordering opens soon. Call ${A.phone} to order for collection.`;
      toast.classList.toggle('at', !phone.matches);
      if (!phone.matches) {
        const r = b.getBoundingClientRect(), w = toast.offsetWidth, h = toast.offsetHeight;
        const x = Math.min(innerWidth - w / 2 - 12, Math.max(w / 2 + 12, r.left + r.width / 2));
        const above = r.top - h - 14, y = above > 76 ? above : Math.min(innerHeight - h - 12, r.bottom + 14);
        toast.style.setProperty('--tx', x + 'px');
        toast.style.setProperty('--ty', y + 'px');
      }
      toast.classList.add('show');
      clearTimeout(toast.t); toast.t = setTimeout(hideToast, 4200);
    });
  });

  // Header: see-through over the red top of the page, a solid bar once you scroll.
  const top = $('.top'), fixed = getComputedStyle(top).position === 'fixed';
  const paintTop = () => top.classList.toggle('pill', fixed && scrollY > 24 && !top.classList.contains('open'));
  let tick = false, lastY = scrollY;
  addEventListener('scroll', () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => {
      tick = false;
      paintTop();
      // the message sits beside a button, so it goes once the page has moved on
      if (Math.abs(scrollY - lastY) > 60) { lastY = scrollY; if (toast.classList.contains('at')) hideToast(); }
    });
  }, {passive: true});
  paintTop();

  // Phone menu: a full-screen sheet of links.
  const btn = $('.menu-btn'), sheet = $('#sheet'), rest = [$('main'), $('footer'), $('.mbar')];
  if (btn && sheet) {
    const setSheet = open => {
      sheet.hidden = !open;
      top.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
      btn.querySelector('[data-menu-label]').textContent = open ? 'Close' : 'Menu';
      rest.forEach(el => { if (el) el.inert = open; });
      root.style.overflow = open ? 'hidden' : '';
      paintTop();
    };
    btn.addEventListener('click', () => setSheet(sheet.hidden));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) setSheet(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) { setSheet(false); btn.focus(); } });
    const wide = matchMedia('(min-width: 1181px)'), shut = e => { if (e.matches) setSheet(false); };
    wide.addEventListener ? wide.addEventListener('change', shut) : wide.addListener(shut);
  }

  // Phone order bar: slides up once the first set of buttons has scrolled away. Pages without one show it from the start.
  const mbar = $('.mbar'), cta = $('[data-cta]');
  if (mbar) {
    if (cta && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => mbar.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(cta);
    else mbar.classList.add('show');
  }
})();
