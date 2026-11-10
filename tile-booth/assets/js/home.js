// Homepage: hero video, burgers, grill list, menu explorer, meal builder, sweet side, room photos, opening hours.
(() => {
  const A = window.ADANOS, $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = A.esc, cat = n => A.menu.find(g => g.cat === n);
  const from = items => Math.min(...items.map(i => i[2]));
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const mealTag = m => m ? ` <span class="meal-pr">Meal ${A.money(m)}</span>` : '';
  const SAY = '<span class="vh">, </span>'; // a pause for screen readers where the layout alone separates two things

  /* ----- hero video: poster first; phones get the smaller file; no autoplay with reduced motion or data saver ----- */
  const v = $('.arch video'), toggle = $('[data-video-toggle]');
  if (v && !calm.matches && !(navigator.connection && navigator.connection.saveData)) {
    let userPaused = false;
    v.addEventListener('playing', () => { v.classList.add('ready'); toggle.hidden = false; }, {once: true});
    v.src = (matchMedia('(max-width: 760px)').matches && v.dataset.srcSmall) || v.dataset.src;
    v.play().catch(() => {});
    toggle.addEventListener('click', () => {
      userPaused = !v.paused;
      userPaused ? v.pause() : v.play().catch(() => {});
      toggle.classList.toggle('is-paused', userPaused);
      $('span', toggle).textContent = userPaused ? 'Play the video' : 'Pause the video';
    });
    // rest it while it's off screen
    new IntersectionObserver(([e]) => { if (userPaused) return; e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe(v);
  }

  /* ----- captions that quote the menu: name, description and price straight from the data ----- */
  const all = A.menu.flatMap(g => g.items);
  $$('[data-item]').forEach(el => {
    const it = all.find(i => i[0] === el.dataset.item);
    if (it) el.innerHTML = `<b><span>${esc(it[0])}</span>${SAY}${A.price(it[2])}</b>${SAY}${esc(it[1])}`;
  });

  /* ----- 02 the burgers: every beef and chicken burger that has a photo -----
     The signature leads; the tallest stack takes the upright frame; the rest sit in two rows of mixed widths. */
  const burgers = [...cat('Beef Burgers').items, ...cat('Chicken Burgers').items].filter(i => i[4]);
  const lead = burgers.find(i => i[0] === 'Adanos Burger') || burgers[0];
  const tall = burgers.find(i => i[0] === 'Meat Stack') || burgers[1];
  const rest = burgers.filter(i => i !== lead && i !== tall);
  const widths = ['s-w5', 's-w4', 's-w3', 's-w3', 's-w4', 's-w5'];
  const card = ([n, d, p, m, ph], cls, kicker) => `
    <article class="sig-card ${cls}">
      <div class="frame" data-reveal>${A.photo(ph, n)}</div>
      <div class="sig-txt">${kicker ? `<p class="cap-k">${kicker}</p>` : ''}<h3>${esc(n)}</h3><p>${esc(d)}</p><p class="sig-pr">${A.price(p)}${mealTag(m)}</p></div>
    </article>`;
  $('#sigs').innerHTML = card(lead, 's-lead', 'The signature') + card(tall, 's-tall') + rest.map((it, i) => card(it, widths[i % widths.length])).join('');

  /* ----- 03 the grill list ----- */
  $('#grill-list').innerHTML = cat('Adanos Grilled').items.map(([n, , p, m]) =>
    `<li><span class="n">${esc(n)}</span><span class="dots" aria-hidden="true"></span>${SAY}${A.price(p)}${m ? `${SAY}<span class="meal-pr">Meal ${A.money(m)}</span>` : '<span></span>'}</li>`).join('');

  /* ----- 04 the menu explorer ----- */
  (() => {
    const fold = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    // Words people use that the menu spells another way, and what a section is known for.
    const ALSO = {chips: ['fries'], chip: ['fries'], fries: ['chips'], fry: ['chips'], shake: ['milkshake'], shakes: ['milkshake']};
    const KNOWN_FOR = {'Adanos Grilled': 'peri peri grill'};
    const items = [];
    A.menu.forEach(g => g.items.forEach(([n, d, p, m, ph]) => items.push({
      id: 'ex-i' + items.length, n, d, p, m, ph, cat: g.cat, slug: A.slug(g.cat), name: fold(n), desc: fold(d),
      hay: fold(`${n} ${d} ${g.cat} ${g.note || ''} ${KNOWN_FOR[g.cat] || ''}`)
    })));
    const cats = [{slug: 'all', name: 'Everything'}, ...A.menu.map(g => ({slug: A.slug(g.cat), name: g.cat}))];
    const FIRST = 8; // "Everything" and search results start with this many; a button shows the rest
    const state = {q: '', cat: cats[1].slug, meal: false, under: false, active: null, all: false};
    const q = $('#ex-q'), clear = $('#ex-clear'), list = $('#ex-list'), count = $('#ex-count'), live = $('#ex-live'),
      empty = $('#ex-empty'), pane = $('#ex-preview'), catRow = $('#ex-cats'), allBtn = $('#ex-all'), more = $('#ex-more');
    const wide = matchMedia('(min-width: 1024px)');

    // a word matches as typed, without a plural "s" ("waffles" finds "Waffle"), or by one of its other names
    const words = () => fold(state.q).split(/\s+/).filter(Boolean);
    const stem = w => w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
    const forms = w => [...new Set([w, stem(w), ...(ALSO[w] || ALSO[stem(w)] || [])])];
    const matches = (it, ws) => (!state.meal || it.m) && (!state.under || it.p < 7) && ws.every(w => forms(w).some(f => it.hay.includes(f)));
    // how close a match is: 0 in the name, 1 in the description, 2 only through its section
    const rank = (it, ws) => Math.max(0, ...ws.map(w => { const fs = forms(w); return fs.some(f => it.name.includes(f)) ? 0 : fs.some(f => it.desc.includes(f)) ? 1 : 2; }));
    // wrap the matched letters in <mark>, working on the accent-free text so "jalapeno" marks "jalapeño"
    const mark = (text, ws) => {
      if (!ws.length) return esc(text);
      const f = fold(text), hit = new Array(text.length).fill(false);
      if (f.length !== text.length) return esc(text);
      ws.forEach(w => forms(w).some(x => {
        let i = f.indexOf(x), found = false;
        while (i >= 0) { found = true; for (let k = i; k < i + x.length; k++) hit[k] = true; i = f.indexOf(x, i + 1); }
        return found;
      }));
      let out = '', on = false;
      for (let i = 0; i < text.length; i++) {
        if (hit[i] !== on) { out += hit[i] ? '<mark>' : '</mark>'; on = hit[i]; }
        out += esc(text[i]);
      }
      return out + (on ? '</mark>' : '');
    };

    catRow.innerHTML = cats.map(c => `<label class="cat"><input type="radio" name="ex-cat" value="${c.slug}"${c.slug === state.cat ? ' checked' : ''}><span>${esc(c.name)} <small></small></span></label>`).join('');
    const catInputs = $$('input', catRow);

    const row = (it, ws) => `
      <div class="ex-item${it.ph ? ' has-ph' : ''}" role="option" id="${it.id}" aria-selected="false">
        <span class="n">${mark(it.n, ws)}</span>${SAY}
        <span class="d">${mark(it.d, ws)}</span>${SAY}
        <span class="p">${A.price(it.p)}${mealTag(it.m)}</span>
        ${it.ph ? A.photo(it.ph, '', {zoom: 1.45, crop: 'thumb'}) : ''}
      </div>`;

    let shown = [], liveTimer; // shown: the rows on screen, in order
    function render(fromTop) {
      if (fromTop) { state.active = null; state.all = false; }
      const ws = words(), hits = items.filter(it => matches(it, ws));
      if (ws.length) { const score = new Map(hits.map(it => [it, rank(it, ws)])); hits.sort((a, b) => score.get(a) - score.get(b)); } // stable: menu order within a rank
      const found = state.cat === 'all' ? hits : hits.filter(it => it.slug === state.cat);
      const capped = state.cat === 'all' && found.length > FIRST;
      shown = capped && !state.all ? found.slice(0, FIRST) : found;
      catInputs.forEach(inp => {
        const n = inp.value === 'all' ? hits.length : hits.filter(it => it.slug === inp.value).length;
        $('small', inp.parentElement).textContent = n;
        inp.parentElement.classList.toggle('none', !n);
      });
      if (state.cat === 'all') {
        // sections in the order their best match comes up (plain menu order when there is no search)
        const order = [...new Set(shown.map(it => it.cat))];
        shown = order.flatMap(name => shown.filter(it => it.cat === name));
        list.innerHTML = order.map(name => {
          const part = shown.filter(it => it.cat === name), total = found.filter(it => it.cat === name).length;
          return `<div class="ex-group" role="group" aria-label="${esc(name)}"><div class="ex-group-h" aria-hidden="true">${esc(name)}<small>${total}</small></div>${part.map(it => row(it, ws)).join('')}</div>`;
        }).join('');
      } else list.innerHTML = shown.map(it => row(it, ws)).join('');
      A.sharpen(list);

      const name = cats.find(c => c.slug === state.cat).name, n = found.length, term = state.q.trim();
      const where = state.cat === 'all' ? 'on the whole menu' : `in ${name}`;
      const partly = shown.length < n ? `, showing the first ${shown.length}` : '';
      count.innerHTML = n ? `<b>${n}</b> ${n === 1 ? 'item' : 'items'} ${esc(where)}${term ? ` for “${esc(term)}”` : ''}${state.meal || state.under ? ' · filtered' : ''}${partly}` : '';
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => { live.textContent = n ? `${n} ${n === 1 ? 'item' : 'items'} ${where}${term ? ` for “${term}”` : ''}${partly}` : 'No items match'; }, 500);

      allBtn.hidden = !capped;
      allBtn.textContent = state.all ? 'Show fewer' : `Show all ${n} items`;
      more.href = state.cat === 'all' ? 'menu.html' : `menu.html#${state.cat}`;
      more.textContent = state.cat === 'all' ? 'Open the full menu page' : `${name} on the full menu`;
      empty.hidden = !!n;
      list.hidden = !n;
      pane.classList.toggle('is-empty', !n);
      if (!n) {
        const elsewhere = state.cat !== 'all' ? hits.length : 0;
        $('.ex-empty-t', empty).textContent = term ? `Nothing ${where} matches “${term}”.` : `Nothing ${where} fits those filters.`;
        $('#ex-empty-d').textContent = elsewhere ? `${elsewhere} ${elsewhere === 1 ? 'item matches' : 'items match'} in other sections. Choose Everything to see ${elsewhere === 1 ? 'it' : 'them'}, or clear the search and filters.` : 'Try a shorter word, or clear the search and filters.';
        list.removeAttribute('aria-activedescendant');
        return;
      }
      activate(shown.some(it => it.id === state.active) ? state.active : shown[0].id);
    }

    function activate(id, scroll) {
      const it = items.find(x => x.id === id), el = document.getElementById(id);
      if (!it || !el) return;
      $$('.ex-item.on', list).forEach(o => { o.classList.remove('on'); o.setAttribute('aria-selected', 'false'); });
      el.classList.add('on');
      el.setAttribute('aria-selected', 'true');
      list.setAttribute('aria-activedescendant', id);
      if (scroll) el.scrollIntoView({block: 'nearest', behavior: calm.matches ? 'auto' : 'smooth'});
      if (state.active !== id || !pane.firstChild) { state.active = id; preview(it); }
    }

    // desktop only: the photo of the active item, or a typeset card when there's no photo
    function preview(it) {
      if (!wide.matches) { pane.innerHTML = ''; return; }
      const foot = `<p class="pv-foot"><a class="go" href="menu.html#${it.slug}">${esc(it.cat)} on the full menu</a></p>`;
      if (it.ph) {
        pane.innerHTML = `<div class="pv-frame">${A.photo(it.ph, it.n, {lazy: false})}</div>
          <div class="pv-body"><p class="pv-k">${esc(it.cat)}</p><h3>${esc(it.n)}</h3><p>${esc(it.d)}</p><p class="pv-row">${A.price(it.p)}${mealTag(it.m)}</p></div>${foot}`;
        const im = $('img', pane);
        im.complete ? im.classList.add('ready') : im.addEventListener('load', () => im.classList.add('ready'), {once: true});
        A.sharpen(pane);
      } else {
        pane.innerHTML = `<div class="pv-frame"><div class="pv-type"><span class="k">${esc(it.cat)}</span><h3 class="t">${esc(it.n)}</h3>
          <span class="b"><span class="d">${esc(it.d)}</span><span class="pv-p">${A.price(it.p)}${mealTag(it.m)}</span></span></div></div>${foot}`;
      }
    }

    // the keys only make sense with the preview beside the list, so only say so there
    const label = () => list.setAttribute('aria-label', wide.matches ? 'Menu items. Arrow keys move through them. Enter opens that section of the full menu.' : 'Menu items');

    const setCat = slug => { state.cat = slug; catInputs.forEach(i => { i.checked = i.value === slug; }); };
    q.addEventListener('input', () => {
      const was = state.q.trim();
      state.q = q.value;
      clear.hidden = !q.value;
      if (!was && state.q.trim() && state.cat !== 'all') setCat('all'); // a new search looks through the whole menu
      render(true);
    });
    q.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' && shown.length) { e.preventDefault(); list.focus(); }
      if (e.key === 'Escape' && q.value) { e.preventDefault(); q.value = ''; q.dispatchEvent(new Event('input')); }
    });
    clear.addEventListener('click', () => { q.value = ''; q.dispatchEvent(new Event('input')); q.focus(); });
    catInputs.forEach(i => i.addEventListener('change', () => { state.cat = i.value; render(true); }));
    $('#ex-meal').addEventListener('change', e => { state.meal = e.target.checked; render(true); });
    $('#ex-under').addEventListener('change', e => { state.under = e.target.checked; render(true); });
    $('#ex-reset').addEventListener('click', () => {
      q.value = ''; state.q = ''; clear.hidden = true;
      state.meal = state.under = false;
      $('#ex-meal').checked = $('#ex-under').checked = false;
      render(true);
      q.focus();
    });
    allBtn.addEventListener('click', () => {
      state.all = !state.all;
      render();
      // carry on from the first newly shown row, or go back to the top of the short list
      list.focus({preventScroll: true});
      activate(shown[state.all ? Math.min(FIRST, shown.length - 1) : 0].id, true);
    });

    list.addEventListener('mouseover', e => { const o = e.target.closest('.ex-item'); if (o && wide.matches) activate(o.id); });
    list.addEventListener('click', e => { const o = e.target.closest('.ex-item'); if (o) activate(o.id); });
    list.addEventListener('keydown', e => {
      const i = shown.findIndex(it => it.id === state.active);
      if (e.key === ' ') { e.preventDefault(); return; } // the row is already chosen; don't let Space scroll the page
      if (e.key === 'Enter' && i >= 0) { e.preventDefault(); location.href = `menu.html#${shown[i].slug}`; return; }
      const to = {ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: shown.length - 1, PageDown: i + 5, PageUp: i - 5}[e.key];
      if (to === undefined || !shown.length) return;
      e.preventDefault();
      activate(shown[Math.max(0, Math.min(shown.length - 1, to))].id, true);
    });
    wide.addEventListener('change', () => { label(); const it = items.find(x => x.id === state.active); if (it) preview(it); });
    label();
    render();
  })();

  /* ----- 05 the meal builder: burgers only, because the data says what a burger meal adds (chips and a drink) ----- */
  const mains = burgers.filter(i => i[3]);
  const sides = [['No extra side', '', 0], ...cat('Sides').items.filter(i => ['Cheesy House Fries', 'Curly Fries', 'Onion Rings', 'Chilli Cheese Bites', 'Sweet Potato Fries'].includes(i[0]))];
  const sweets = [['No thanks', '', 0], ...cat('Milkshakes').items.slice(0, 3), ...cat('Waffles').items.slice(0, 2)];
  const tick = (name, value, label, price, ph, checked) => `
    <label class="tick"><input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''}>
      <span class="tick-in"><span class="tick-box" aria-hidden="true"></span>${ph ? A.photo(ph, '', {zoom: 1.5, crop: 'tick-ph'}) : ''}<span class="tick-n">${esc(label)}</span> <span class="tick-p">${price}</span></span></label>`;
  const ticks = (name, rows, plus, photos) => rows.map(([n, , p, , ph], i) => tick(name, i, n, p ? (plus ? '+' : '') + A.money(p) : '', photos && ph, i === 0)).join('');
  $('#mains').innerHTML = ticks('main', mains, false, true);
  $('#meal-opt').innerHTML = tick('meal', 1, 'Yes, add chips & a drink', '<span id="meal-up"></span>', null, true) + tick('meal', 0, 'Just the burger', '', null, false);
  $('#sides').innerHTML = ticks('side', sides, true);
  $('#sweets').innerHTML = ticks('sweet', sweets, true);
  const builder = $('#builder'), mbar = $('[data-mbar]'), val = n => +$(`input[name=${n}]:checked`, builder).value;
  function total() {
    const m = mains[val('main')], meal = val('meal') && m[3], s = sides[val('side')], w = sweets[val('sweet')];
    const lines = [[m[0] + (meal ? ' meal' : ''), meal ? m[3] : m[2]]];
    if (meal) lines.push(['Chips & a drink', 0]);
    if (s[2]) lines.push([s[0], s[2]]);
    if (w[2]) lines.push([w[0], w[2]]);
    const sum = A.money(lines.reduce((a, l) => a + l[1], 0));
    $('#meal-up').textContent = '+' + A.money(m[3] - m[2]);
    $('#lines').innerHTML = lines.map(([n, p]) => `<li><span>${esc(n)}</span> <span>${p ? A.money(p) : 'included'}</span></li>`).join('');
    $('#total').textContent = sum;
    $('#total-mini').textContent = sum;
  }
  builder.addEventListener('change', total);
  total();
  // on a phone the order bar carries the running total while the options are on screen
  // (the "Your order" card below them shows it itself)
  if (mbar && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => mbar.classList.toggle('with-total', e.isIntersecting), {rootMargin: '-35% 0px -35% 0px'}).observe($('.pad', builder));
  }

  /* ----- 06 the sweet side: four menu cards. Open side by side on desktop; on smaller screens they fold, first one open. ----- */
  const sw = name => {
    const g = cat(name), n = g.items.length;
    return `<details class="sw"><summary><h3>${esc(name)}</h3>${SAY}<span class="sw-meta">${n} · from ${A.money(from(g.items))}</span></summary>
      <ul>${g.items.map(([t, , p]) => `<li><span>${esc(t)}</span>${SAY}${A.price(p)}</li>`).join('')}</ul></details>`;
  };
  const lists = $('#sweet-lists');
  lists.innerHTML = `<div class="sw-col">${sw('Milkshakes')}${sw('Smoothies')}</div><div class="sw-col">${sw('Waffles')}${sw('Ice Cream & Desserts')}</div>`;
  const cards = $$('.sw', lists), roomy = matchMedia('(min-width: 981px)');
  const setCards = () => cards.forEach((d, i) => { d.open = roomy.matches || i === 0; });
  lists.addEventListener('click', e => { if (roomy.matches && e.target.closest('summary')) e.preventDefault(); }); // nothing to fold on desktop
  roomy.addEventListener('change', setCards);
  setCards();

  /* ----- 07 the room: previous and next step one photo at a time; the track itself scrolls natively ----- */
  const track = $('#room-track'), nav = $('[data-room-nav]');
  if (track && nav) {
    const shots = $$('.room-shot', track), prev = $('[data-room-prev]'), next = $('[data-room-next]');
    const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const max = () => track.scrollWidth - track.clientWidth;
    // every place the track can rest: each photo's left edge, with the last ones held at the end of the track
    const stops = () => [...new Set(shots.map(s => Math.min(max(), Math.max(0, Math.round(s.offsetLeft - pad())))))];
    const go = left => track.scrollTo({left, behavior: calm.matches ? 'auto' : 'smooth'});
    const sync = () => {
      nav.hidden = max() < 8;
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft > max() - 8;
    };
    // line the first photo up with the page's left margin, scrollbar or not
    const edge = () => { const w = $('.room .wrap'), r = w.getBoundingClientRect(); track.style.setProperty('--edge', (r.left + parseFloat(getComputedStyle(w).paddingLeft)) + 'px'); };
    prev.addEventListener('click', () => { const before = stops().filter(x => x < track.scrollLeft - 8); go(before.length ? before[before.length - 1] : 0); });
    next.addEventListener('click', () => { const after = stops().filter(x => x > track.scrollLeft + 8); go(after.length ? after[0] : max()); });
    let tk = false;
    track.addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(() => { tk = false; sync(); }); } }, {passive: true});
    addEventListener('resize', () => { edge(); sync(); });
    addEventListener('load', sync);
    edge(); sync();
  }

  /* ----- 08 opening hours, today marked ----- */
  const today = A.ukNow().day;
  $('#hours').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d =>
    `<tr${d === today ? ' class="today"' : ''}><th scope="row">${A.days[d]}${d === today ? ' <span class="tag">Today</span>' : ''}</th><td>${A.fmtHour(A.hours[d][0])}–${A.fmtHour(A.hours[d][1])}</td></tr>`).join('');
})();
