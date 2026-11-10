// Shared by every page. First the helpers the page scripts use, then (once the whole page is parsed)
// the open/closed status, phone and map links, Order buttons, the phone header panel and photo sharpness.
(() => {
  const A = window.ADANOS;
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const set = (el, text) => { if (el && el.textContent !== text) el.textContent = text; };

  A.money = n => '£' + n.toFixed(2);
  // price with the pence set small: <span class="pr">£7<small>.99</small></span>
  A.price = n => { const [a, b] = n.toFixed(2).split('.'); return `<span class="pr">£${a}<small>.${b}</small></span>`; };
  A.slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  A.esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  A.fmtHour = h => h === 12 ? '12pm' : h === 24 || h === 0 ? 'midnight' : h > 12 ? (h - 12) + 'pm' : h + 'am';
  A.img = p => `assets/img/${p}.jpg`;
  A.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // run now if the page is already parsed, otherwise as soon as it is
  A.ready = fn => { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, {once: true}) : fn(); };

  // Where the food sits in each photo: [x %, y %, zoom wanted, width, height]. Used for crops at every size.
  A.photos = {
    'adanos-burger': [50, 53, 1.55, 1200, 900], 'meat-stack': [50, 47, 1.5, 1200, 900], 'daddy-burger': [49, 50, 1.55, 1200, 900],
    'cheese-burger': [50, 54, 1.6, 1200, 900], 'peri-peri': [47, 53, 1.6, 1200, 900], 'big-yummy': [54, 49, 1.5, 1200, 900],
    'hot-yummy': [50, 50, 1.5, 1200, 900], 'black-angus': [45, 36, 1, 1200, 1600], 'half-chicken': [44, 48, 1, 1480, 1600],
    'lamb-chops': [52, 50, 1, 901, 1600]
  };
  // <img> for a menu photo, cropped on the food. zoom multiplies the photo's own zoom (thumbnails go in closer).
  // crop: wrap it in a small clipping box with that class (thumbnails).
  A.photo = (p, alt, {zoom = 1, crop = '', lazy = true} = {}) => {
    const [x, y, z, w, h] = A.photos[p] || [50, 50, 1, 1200, 900];
    const img = `<img class="ph" src="${A.img(p)}" alt="${A.esc(alt)}" width="${w}" height="${h}"${lazy ? ' loading="lazy"' : ''} decoding="async" style="--x:${x}%;--y:${y}%;--zw:${(z * zoom).toFixed(2)}">`;
    return crop ? `<span class="crop ${crop}">${img}</span>` : img;
  };
  // Keep photos sharp: never zoom a photo past 1.5 source pixels per CSS pixel in the box it sits in.
  // --zw is the zoom a photo would like; --z is what its box allows right now.
  A.sharpen = (root = document) => $$('img.ph', root).forEach(im => {
    const fw = im.offsetWidth, fh = im.offsetHeight, nw = +im.getAttribute('width'), nh = +im.getAttribute('height');
    if (!fw || !fh || !nw || !nh) return;
    const want = parseFloat(im.style.getPropertyValue('--zw')) || 1;
    im.style.setProperty('--z', Math.max(1, Math.min(want, Math.min(nw / fw, nh / fh) / 1.5)).toFixed(3));
  });

  // The shop keeps UK time, wherever the visitor is.
  A.ukNow = (d = new Date()) => {
    try {
      const p = {};
      new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'})
        .formatToParts(d).forEach(x => { p[x.type] = x.value; });
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
      if (day >= 0) return {day, h: +p.hour % 24, m: +p.minute};
    } catch (e) {}
    return {day: d.getDay(), h: d.getHours(), m: d.getMinutes()};
  };

  // Open or closed right now, when that changes, and the wording for each place it shows.
  // "short" is the phone header's version: it has to fit beside the logo at 320 px in every state.
  A.openState = (now = A.ukNow()) => {
    const {day, h, m} = now, t = h + m / 60, [o, c] = A.hours[day], next = (day + 1) % 7;
    const s = {day, t, opens: o, closes: c, open: t >= o && t < c, soon: false, shownDay: day};
    const range = d => `${A.fmtHour(A.hours[d][0])}–${A.fmtHour(A.hours[d][1])}`;
    if (s.open) {
      s.soon = (c - t) * 60 <= 30;
      s.label = s.soon ? 'Closing soon' : 'Open now';
      s.line = `Until ${A.fmtHour(c)}`;
      s.text = `${s.label} · until ${A.fmtHour(c)}`;
      s.short = s.soon ? `Closes ${A.fmtHour(c)}` : `Open till ${A.fmtHour(c)}`;
      s.big = s.soon ? `Open, closing <em>at ${A.fmtHour(c)}.</em>` : `We're open <em>until ${A.fmtHour(c)}.</em>`;
      s.hours = `Today ${range(day)}`;
    } else if (t < o) {
      s.label = 'Closed';
      s.line = `Opens at ${A.fmtHour(o)}`;
      s.text = `Closed · opens ${A.fmtHour(o)}`;
      s.short = `Closed till ${A.fmtHour(o)}`;
      s.big = `Closed right now. <em>Open from ${A.fmtHour(o)}.</em>`;
      s.hours = `Today ${range(day)}`;
    } else {
      s.shownDay = next;
      s.label = 'Closed';
      s.line = `Opens ${A.fmtHour(A.hours[next][0])} tomorrow`;
      s.text = `Closed · opens ${A.fmtHour(A.hours[next][0])} tomorrow`;
      s.short = `Closed till ${A.fmtHour(A.hours[next][0])}`;
      s.big = `Closed for today. <em>Open tomorrow from ${A.fmtHour(A.hours[next][0])}.</em>`;
      s.hours = `Tomorrow ${range(next)}`;
    }
    s.cls = s.open ? (s.soon ? 'soon' : 'open') : 'closed';
    s.small = `${s.shownDay === day ? 'Today' : 'Tomorrow'}, ${A.days[s.shownDay]}: ${range(s.shownDay)}.`;
    return s;
  };

  function renderStatus() {
    const s = A.openState(), tonight = $('[data-tonight]');
    $$('[data-status]').forEach(el => {
      el.classList.remove('open', 'soon', 'closed');
      el.classList.add(s.cls);
      set($('span', el), el.dataset.status === 'short' ? s.label : s.text);
      set($('.st-short', el), s.short);
    });
    set($('[data-now-line]'), s.line);
    set($('[data-now-hours]'), s.hours);
    if (!tonight) return;
    tonight.classList.toggle('closed', !s.open);
    set($('[data-tonight-title]'), `${s.t >= 17 ? 'Tonight' : 'Today'} at Adano's`);
    const big = $('[data-tonight-big]');
    if (big.dataset.key !== s.big) { big.dataset.key = s.big; big.innerHTML = s.big; }
    const [o, c] = A.hours[s.shownDay];
    $('[data-tonight-bar]').hidden = false;
    $('.tonight-track').style.setProperty('--at', (s.open ? Math.min(100, Math.max(0, (s.t - o) / (c - o) * 100)) : 0).toFixed(1) + '%');
    set($('[data-tonight-from]'), `Opens ${A.fmtHour(o)}`);
    set($('[data-tonight-to]'), `Closes ${A.fmtHour(c)}`);
    set($('[data-tonight-small]'), s.small);
  }
  renderStatus(); // the header is already on the page, so its status is right from the first paint

  A.ready(() => {
    renderStatus();
    setInterval(renderStatus, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) renderStatus(); });

    $$('[data-tel]').forEach(a => { a.href = A.tel; });
    $$('[data-phone]').forEach(el => { el.textContent = A.phone; });
    $$('[data-address]').forEach(el => { el.textContent = A.address; });
    $$('[data-maps]').forEach(a => { a.href = A.maps; });
    $$('[data-instagram]').forEach(a => { a.href = A.instagram; });
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    if (!A.previewNotes) $$('.swap-note').forEach(el => el.remove());

    // Every "Order for collection" button reads A.orderUrl. While it's empty they show a short message instead.
    // The whole message is one phone link, so it is an easy target to tap.
    const toast = $('#toast');
    let toastTimer;
    const hideToast = () => toast.classList.remove('show');
    $$('[data-order]').forEach(b => {
      if (A.orderUrl) { b.href = A.orderUrl; b.target = '_blank'; b.rel = 'noopener'; return; }
      b.addEventListener('click', e => {
        e.preventDefault();
        toast.innerHTML = `<a href="${A.tel}">Online ordering opens soon. Call <b>${A.phone}</b> to order for collection.</a>`;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(hideToast, 7000);
      });
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') hideToast(); });

    // Phone header: the "more" button opens the other links; it closes on a choice, on Escape, or on a tap elsewhere.
    const head = $('.top'), more = $('[data-nav-more]');
    if (more) {
      const setOpen = on => { head.classList.toggle('open', on); more.setAttribute('aria-expanded', on); $('span', more).textContent = on ? 'Close links' : 'More links'; };
      more.addEventListener('click', () => setOpen(!head.classList.contains('open')));
      $('#nav-extra').addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
      document.addEventListener('click', e => { if (head.classList.contains('open') && !e.target.closest('.nav')) setOpen(false); });
      addEventListener('keydown', e => { if (e.key === 'Escape' && head.classList.contains('open')) { setOpen(false); more.focus(); } });
    }

    // Header gets its hairline and a smaller logo once the page moves.
    const onScroll = () => head.classList.toggle('scrolled', scrollY > 8);
    let tick = false;
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; onScroll(); }); } }, {passive: true});
    onScroll();

    A.sharpen();
    let wait = false;
    addEventListener('resize', () => { if (!wait) { wait = true; requestAnimationFrame(() => { wait = false; A.sharpen(); }); } });
    addEventListener('load', () => A.sharpen());
  });
})();
