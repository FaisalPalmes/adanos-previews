// Shared by every page: open/closed status, phone links, Order buttons and their message, header state,
// the phone navigation sheet and the phone order bar.
(() => {
  const A = window.ADANOS;
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);

  A.money = n => "£" + n.toFixed(2);
  A.slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
  // Photos where the food already fills the frame: the point a crop should hold on to, the pixel size, and
  // how far to zoom. The rest are the burger-on-the-counter shots, which the CSS zooms in on.
  const tight = {'black-angus': ['46% 15%', 1200, 1600, 1.2], 'half-chicken': ['38% 46%', 1480, 1600, 1.06], 'lamb-chops': ['50% 44%', 901, 1600, 1.06]};
  A.photo = (ph, alt = '') => {
    const t = tight[ph], [pos, w, h] = t || ['50% 57%', 1200, 900];
    return `<img src="assets/img/${ph}.jpg" alt="${alt.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" loading="lazy" width="${w}" height="${h}" style="--pos:${pos}${t ? `;--org:${pos};--zoom:${t[3]}` : ''}">`;
  };
  A.fmtHour = h => h === 12 ? '12pm' : h === 24 || h === 0 ? 'midnight' : h > 12 ? (h - 12) + 'pm' : h + 'am';

  // Open or closed right now. head/sub feed the open sign, short feeds the phone header.
  A.openState = (d = new Date()) => {
    const day = d.getDay(), [o, c] = A.hours[day], t = d.getHours() + d.getMinutes() / 60;
    const st = t >= o && t < c ? {open: true, head: 'Open', sub: `until ${A.fmtHour(c)}`}
      : t < o ? {open: false, head: 'Closed', sub: `opens ${A.fmtHour(o)}`}
      : {open: false, head: 'Closed', sub: `opens ${A.fmtHour(A.hours[(day + 1) % 7][0])} tomorrow`};
    st.text = `${st.open ? 'Open now' : 'Closed'} · ${st.sub}`;
    st.short = st.open ? `Open till ${A.fmtHour(c)}` : 'Closed';
    return st;
  };
  const showStatus = () => {
    const st = A.openState();
    $$('[data-status]').forEach(el => {
      el.classList.toggle('open', st.open); el.classList.toggle('closed', !st.open);
      el.querySelectorAll('[data-st]').forEach(s => { s.textContent = st.text; });
      el.querySelectorAll('[data-st-short]').forEach(s => { s.textContent = st.short; });
    });
    $$('[data-sign]').forEach(el => {
      el.classList.toggle('open', st.open); el.classList.toggle('closed', !st.open);
      el.querySelector('b').textContent = st.head;
      el.querySelector('span').textContent = st.sub[0].toUpperCase() + st.sub.slice(1) + (/tomorrow$/.test(st.sub) ? '.' : ' today.');
    });
  };
  showStatus();
  setInterval(showStatus, 60000);

  $$('[data-tel]').forEach(a => { a.href = A.tel; });
  $$('[data-phone]').forEach(el => { el.textContent = A.phone; });
  $$('[data-address]').forEach(el => { el.textContent = A.address; });
  $$('[data-maps]').forEach(a => { a.href = A.maps; });
  $$('[data-instagram]').forEach(a => { a.href = A.instagram; });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  if (!A.previewNotes) $$('.swap-note').forEach(el => el.remove());

  // Every "Order for collection" button reads A.orderUrl. Empty means online ordering isn't connected yet,
  // so the button shows a short message with the phone number instead. Focus moves to the message, so the
  // Call link and the close button are the next two stops, and goes back to the button when it closes.
  const toast = $('#toast');
  let opener = null, timer;
  const hideToast = () => {
    if (!toast.classList.contains('show')) return;
    clearTimeout(timer);
    toast.classList.remove('show');
    if (toast.contains(document.activeElement) && opener) opener.focus({preventScroll: true});
  };
  const waitThenHide = () => { clearTimeout(timer); timer = setTimeout(() => { if (toast.matches(':hover, :focus-within')) waitThenHide(); else hideToast(); }, 8000); };
  $$('[data-order]').forEach(b => {
    if (A.orderUrl) { b.href = A.orderUrl; b.target = '_blank'; b.rel = 'noopener'; return; }
    b.addEventListener('click', e => {
      e.preventDefault();
      opener = b;
      toast.innerHTML = `<p>Online ordering opens soon. Call ${A.phone} to order for collection.</p><a class="btn btn-ink" href="${A.tel}">Call</a>
        <button class="toast-x" type="button" aria-label="Close message"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`;
      toast.querySelector('.toast-x').addEventListener('click', hideToast);
      toast.classList.add('show');
      toast.focus({preventScroll: true});
      waitThenHide();
    });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') hideToast(); });

  // Phone navigation sheet. The header stays above it, so the toggle doesn't move.
  // While it is open the rest of the page is inert and Tab cycles through the header and the sheet.
  const top = $('.top'), sheet = $('#sheet'), toggle = $('[data-sheet-toggle]');
  const rest = [...$$('.skip, main, footer, .mbar')];
  const isOpen = () => sheet.classList.contains('open');
  const setSheet = open => {
    sheet.classList.toggle('open', open);
    top.classList.toggle('sheet-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    rest.forEach(el => { el.inert = open; });
  };
  if (sheet && toggle) {
    toggle.addEventListener('click', () => setSheet(!isOpen()));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) setSheet(false); });
    addEventListener('keydown', e => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setSheet(false); toggle.focus(); return; }
      if (e.key !== 'Tab') return;
      const stops = [...top.querySelectorAll('a, button'), ...sheet.querySelectorAll('a, button')].filter(el => el.offsetParent !== null);
      const first = stops[0], last = stops[stops.length - 1], at = document.activeElement;
      if (e.shiftKey && (at === first || !stops.includes(at))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (at === last || !stops.includes(at))) { e.preventDefault(); first.focus(); }
    });
    matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) setSheet(false); });
  }

  // Header: clear at the very top of the film, dark glass once the page moves, solid over the lit panels.
  // The phone order bar slides up once the hero buttons have gone.
  const hero = $('[data-hero]'), lights = [...$$('[data-light]')], mbar = $('.mbar');
  function upHead() {
    const y = top.offsetHeight / 2;
    const onLight = lights.some(s => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    top.classList.toggle('over-light', onLight);
    top.classList.toggle('scrolled', scrollY > 8);
    if (mbar) mbar.classList.toggle('show', !hero || scrollY > innerHeight * 0.7);
  }
  let tk = false;
  addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(() => { tk = false; upHead(); }); } }, {passive: true});
  addEventListener('resize', upHead);
  upHead();
})();
