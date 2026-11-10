// Homepage content from menu.js: film, ticker, the stack, signature dishes, heat dial, meal builder, sweet side, menu index, hours.
(() => {
  const A = window.ADANOS, $ = s => document.querySelector(s), esc = A.esc;
  const cat = n => A.menu.find(g => g.cat === n);
  const from = items => Math.min(...items.map(i => i[2]));
  const link = c => `menu.html#${A.slug(c)}`;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrow = '<svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg>';

  // Fit a line of display type to the width of its box. `line` holds one inline-block child with the text.
  // Sizes are container units where the browser has them; otherwise pixels, worked out again when the window changes.
  const units = !!(window.CSS && CSS.supports && CSS.supports('width', '1cqi'));
  const fitted = [];
  const fit = (line, box, max) => {
    line.style.fontSize = '100px';
    const w = line.firstElementChild.offsetWidth || 1;
    const share = Math.min(max, 99.5 * 100 / w);          // font size as a percentage of the box width
    line.style.fontSize = units ? share.toFixed(2) + 'cqi' : (box.clientWidth * share / 100).toFixed(1) + 'px';
  };
  const fitAll = () => fitted.forEach(([line, box, max]) => fit(line, box, max));
  const fitLater = (line, box, max) => { fitted.push([line, box, max]); fit(line, box, max); };
  if (document.fonts) document.fonts.ready.then(fitAll);
  if (!units) addEventListener('resize', fitAll);

  // ----- hero: the film, the ticker and the badge rest once the hero is covered or off screen -----
  const hero = $('.hero'), nextPage = document.querySelector('.hero ~ .pg');
  const v = $('.film video'), toggle = $('.film-toggle');
  let userPaused = false, playing = false;
  if (v && !calm && !(navigator.connection && navigator.connection.saveData)) {
    const icon = n => { toggle.innerHTML = `<svg class="ic"><use href="#i-${n}"/></svg>`; };
    v.addEventListener('playing', () => { v.classList.add('on'); toggle.hidden = false; }, {once: true});
    v.src = matchMedia('(max-width: 760px)').matches ? v.dataset.srcSmall : v.dataset.src;
    playing = true;
    v.play().catch(() => {});
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      userPaused ? v.pause() : v.play().catch(() => {});
      icon(userPaused ? 'play' : 'pause');
      toggle.setAttribute('aria-label', userPaused ? 'Play the video' : 'Pause the video');
    });
  }
  let asleep = false, tick = false;
  const rest = () => {
    const now = hero.getBoundingClientRect().bottom <= 0 || !!(nextPage && nextPage.getBoundingClientRect().top <= 0);
    if (now === asleep) return;
    asleep = now;
    hero.classList.toggle('asleep', asleep);
    if (playing && !userPaused) asleep ? v.pause() : v.play().catch(() => {});
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; rest(); }); } }, {passive: true});
  rest();

  // ----- ticker: every menu category. A second copy, hidden from the keyboard and screen readers, makes the loop seamless. -----
  const ticker = $('#ticker'), track = ticker.firstElementChild;
  const cats = A.menu.map(g => `<li><a href="${link(g.cat)}">${A.name(g.cat)}</a></li>`).join('');
  track.innerHTML = `<ul aria-label="Menu categories">${cats}</ul>` + (calm ? '' : `<ul aria-hidden="true">${cats.replace(/<a /g, '<a tabindex="-1" ')}</ul>`);
  if (!calm) {
    ticker.style.setProperty('--dur', Math.round(track.firstElementChild.scrollWidth / 55) + 's');
    ticker.classList.add('run');
    // Keyboard focus stops the band and turns it into a plain row, scrolled so the focused link is in view.
    ticker.addEventListener('focusin', e => {
      ticker.classList.add('held');
      const a = e.target.getBoundingClientRect(), t = ticker.getBoundingClientRect();
      ticker.scrollLeft += a.left - t.left - (t.width - a.width) / 2;
    });
    ticker.addEventListener('focusout', e => {
      if (ticker.contains(e.relatedTarget)) return;
      ticker.scrollLeft = 0;
      ticker.classList.remove('held');
    });
  }

  // ----- the stack: the Adanos Burger's description, one part per line -----
  const star = cat('Beef Burgers').items.find(i => i[0] === 'Adanos Burger');
  const layers = $('#layers');
  if (star) {
    layers.innerHTML = star[1].split(/\s*,\s*|\s+&\s+/).map(p => `<li class="piece"><span>${esc(p).replace(/smashed/i, '<mark>$&</mark>')}</span></li>`).join('');
    document.querySelectorAll('.burger .bun').forEach(b => b.classList.add('piece'));
    const tag = $('#stack-price');
    tag.innerHTML = `${A.money(star[2])}${star[3] ? `<small>Meal ${A.money(star[3])}</small>` : ''}`;
    tag.hidden = false;
    layers.querySelectorAll('li').forEach(li => fitLater(li, layers, 30));
  }

  // ----- signature dishes: every burger or grill dish with a photo. Three lead the section, the rest follow as a list. -----
  const sigs = ['Beef Burgers', 'Chicken Burgers', 'Adanos Grilled'].flatMap(c => cat(c).items.filter(i => i[4]).map(i => [...i.slice(0, 5), c]));
  // the lead dishes, with the photo and crop each one uses at large size
  const leadPics = {
    'Black Angus Special': ['black-angus', 1200, 1600, '50% 34%'],
    'Meat Stack': ['sq-meat-stack', 720, 720, '50% 42%'],
    'Half Chicken': ['half-chicken', 1480, 1600, '50% 46%']};
  const leads = Object.keys(leadPics).map(n => sigs.find(i => i[0] === n)).filter(Boolean);
  const others = sigs.filter(i => !leads.includes(i));
  const total = A.menu.reduce((n, g) => n + g.items.length, 0);
  $('#leads').innerHTML = leads.map(([n, d, p, m, , c]) => {
    const [src, w, h, at] = leadPics[n];
    return `
    <a class="card" href="${link(c)}">
      <figure><img src="assets/img/${src}.jpg" alt="${esc(n)}" loading="lazy" width="${w}" height="${h}" style="--at:${at}"></figure>
      <span class="ptag">${A.money(p)}</span>
      <div class="card-b"><h3>${esc(n)}</h3><p>${esc(d)}</p>${m ? `<span class="chip">Meal ${A.money(m)}</span>` : ''}</div>
    </a>`;
  }).join('');
  $('#rest').innerHTML = others.map(([n, d, p, m, ph, c]) => `
    <a class="dish" href="${link(c)}">
      <img src="${A.thumb(ph)}" alt="${esc(n)}" loading="lazy" width="720" height="720">
      <div><h3>${esc(n)}</h3><p>${esc(d)}</p></div>
      <div class="pr"><b>${A.money(p)}</b>${m ? `<span class="chip">Meal ${A.money(m)}</span>` : ''}</div>
    </a>`).join('') + `
    <a class="wall-more" href="menu.html"><span><b>The full menu</b><small>${total} things to eat and drink, in ${A.menu.length} sections</small></span>${arrow}</a>`;
  // "for £2 more", only when every burger's meal costs the same extra
  const ups = [...cat('Beef Burgers').items, ...cat('Chicken Burgers').items].filter(i => i[3]).map(i => Math.round((i[3] - i[2]) * 100));
  if (ups.length && ups.every(u => u === ups[0])) $('#meal-up').textContent = ` for ${A.money(ups[0] / 100).replace('.00', '')} more`;

  // ----- heat dial: the grill list, the colour wipe and the knob -----
  $('#grill-list').innerHTML = cat('Adanos Grilled').items.map(([n, , p]) => `<li><span>${esc(n)}</span><i></i><b>${A.money(p)}</b></li>`).join('');
  const heat = $('.heat'), knob = heat.querySelector('.knob'), radios = [...heat.querySelectorAll('input[name=heat]')];
  const fills = [...heat.querySelectorAll('.heat-bg i')];
  let cur = Math.max(0, radios.findIndex(r => r.checked));
  heat.dataset.heat = cur;                                  // the stylesheet reads this (and :has() when scripts are off)
  const setHeat = i => {
    if (i === cur) return;
    // the new colour spreads out from the knob
    const k = knob.getBoundingClientRect(), s = heat.getBoundingClientRect();
    heat.style.setProperty('--wx', (k.left + k.width / 2 - s.left) + 'px');
    heat.style.setProperty('--wy', (k.top + k.height / 2 - s.top) + 'px');
    fills.forEach((f, n) => { f.className = n === i ? 'on' : n === cur ? 'was' : ''; });
    heat.classList.add('live');
    heat.dataset.heat = cur = i;
  };
  radios.forEach((r, i) => r.addEventListener('change', () => setHeat(i)));
  knob.addEventListener('click', () => { const n = (cur + 1) % radios.length; radios[n].checked = true; setHeat(n); });

  // ----- meal builder: burgers only, because the menu says what a burger meal adds (chips and a drink) -----
  const mains = sigs.filter(i => i[3] && /Burgers$/.test(i[5]));
  const sides = [['No extra side', '', 0], ...cat('Sides').items.filter(i => ['Cheesy House Fries', 'Curly Fries', 'Onion Rings', 'Chilli Cheese Bites', 'Sweet Potato Fries'].includes(i[0]))];
  const sweets = [['No thanks', '', 0], ...cat('Milkshakes').items.slice(0, 3), ...cat('Waffles').items.slice(0, 2)];
  const cost = p => p ? `<small>${A.money(p)}</small>` : '';
  const radio = (name, list, pics) => list.map(([n, , p, , ph], i) => `
    <div class="opt"><input type="radio" name="${name}" id="${name}-${i}" value="${i}" ${i === 0 ? 'checked' : ''}>
    <label for="${name}-${i}">${pics
      ? `<img src="${A.thumb(ph)}" alt="" loading="lazy" width="720" height="720"><span class="t">${esc(n)}${cost(p)}</span>`
      : `${esc(n)}${cost(p)}`}</label></div>`).join('');
  $('#mains').innerHTML = radio('main', mains, true);
  $('#meal-opt').innerHTML = `
    <div class="opt"><input type="radio" name="meal" id="meal-1" value="1" checked><label for="meal-1">Yes, add chips &amp; a drink<small id="mealUp"></small></label></div>
    <div class="opt"><input type="radio" name="meal" id="meal-0" value="0"><label for="meal-0">Just the burger</label></div>`;
  $('#sides').innerHTML = radio('side', sides, false);
  $('#sweets').innerHTML = radio('sweet', sweets, false);

  const val = n => +document.querySelector(`input[name=${n}]:checked`).value;
  const linesEl = $('#lines'), totalEl = $('#total'), barTotal = $('#mbar-total');
  let seen = [];
  function tally() {
    const m = mains[val('main')], meal = val('meal') && m[3], s = sides[val('side')], w = sweets[val('sweet')];
    const lines = [[m[0] + (meal ? ' meal' : ''), meal ? m[3] : m[2]]];
    if (meal) lines.push(['Chips & drink', 0]);
    if (s[2]) lines.push([s[0], s[2]]);
    if (w[2]) lines.push([w[0], w[2]]);
    $('#mealUp').textContent = '+' + A.money(m[3] - m[2]);
    // lines that weren't on the receipt a moment ago print in
    linesEl.innerHTML = lines.map(([n, p]) => `<li class="${p ? '' : 'sub'}${seen.includes(n) ? '' : ' new'}"><span>${esc(n)}</span><i></i><span>${p ? A.money(p) : 'incl.'}</span></li>`).join('');
    seen = lines.map(l => l[0]);
    const sum = A.money(lines.reduce((a, l) => a + l[1], 0));
    if (totalEl.textContent !== sum) {
      totalEl.textContent = sum;
      barTotal.lastElementChild.textContent = sum;
      totalEl.classList.remove('bump'); void totalEl.offsetWidth; totalEl.classList.add('bump');
    }
  }
  document.querySelectorAll('#builder input').forEach(i => i.addEventListener('change', tally));
  tally();
  const now = new Date();
  $('#rc-date').textContent = now.toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'}) + ' · ' + now.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  // On phones the receipt sits below the choices, so the order bar carries the running total while the pad is on screen
  // (and steps aside again once the receipt itself is in view).
  if ('IntersectionObserver' in window) {
    let pad = false, slip = false;
    const show = () => { barTotal.hidden = !(pad && !slip); };
    new IntersectionObserver(([e]) => { pad = e.isIntersecting; show(); }, {rootMargin: '-25% 0px -25% 0px'}).observe($('#builder .pad'));
    new IntersectionObserver(([e]) => { slip = e.isIntersecting; show(); }, {threshold: 0.6}).observe($('.receipt'));
  }
  // Swipe rows (the big cards and the builder steps on phones): keyboard focus brings its card or option into view in the row.
  document.addEventListener('focusin', e => {
    const row = e.target.closest && e.target.closest('.leads, .opts, .opts-main');
    if (!row || row.scrollWidth <= row.clientWidth + 2) return;
    const a = (e.target.closest('.card, .opt') || e.target).getBoundingClientRect(), r = row.getBoundingClientRect();
    if (a.left < r.left + 12 || a.right > r.right - 12) row.scrollLeft += a.left - r.left - (r.width - a.width) / 2;
  });

  // ----- sweet side: each list under its own fitted heading -----
  const sweetCol = c => {
    const items = cat(c).items;
    return `
    <section class="sweet-col"><h3 class="d">${esc(c).split(' &amp; ').map((l, i) => `<span data-fit><span>${i ? '&amp;&nbsp;' : ''}${l}</span></span>`).join('')}</h3>
    <p class="sweet-meta">${items.length} on the menu · from ${A.money(from(items))}</p>
    <ul class="plist">${items.map(([n, , p]) => `<li><span>${esc(n)}</span><i></i><b>${A.money(p)}</b></li>`).join('')}</ul></section>`;
  };
  $('#sweet-cols').innerHTML = [['Milkshakes', 'Smoothies'], ['Waffles', 'Ice Cream & Desserts']].map(pair => `<div class="sweet-stack">${pair.map(sweetCol).join('')}</div>`).join('');
  document.querySelectorAll('#sweet-cols [data-fit]').forEach(line => { line.firstElementChild.style.display = 'inline-block'; fitLater(line, line.parentElement, 17.5); });

  // ----- the full menu as an index: section, how many items, and where prices start -----
  $('#cat-index').innerHTML = A.menu.map(g => `
    <li><a href="${link(g.cat)}"><span class="n">${A.name(g.cat)}</span><span class="m"><small>${g.items.length} items</small><i></i><b>from ${A.money(from(g.items))}</b></span></a></li>`).join('');

  // ----- opening hours, today marked -----
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], today = now.getDay();
  $('#hours').innerHTML = '<tbody>' + [1, 2, 3, 4, 5, 6, 0].map(d => `
    <tr${d === today ? ' class="today"' : ''}><th scope="row">${days[d]}${d === today ? '<span class="now">Today</span>' : ''}</th><td>${A.fmtHour(A.hours[d][0])}–${A.fmtHour(A.hours[d][1])}</td></tr>`).join('') + '</tbody>';

  // A link that lands part-way down the page (index.html#visit): line it up again once the fonts have settled the layout.
  if (location.hash.length > 1 && document.fonts) document.fonts.ready.then(() => {
    const t = document.getElementById(location.hash.slice(1));
    if (t && scrollY > 0) A.jumpIn(t);
  });
})();
