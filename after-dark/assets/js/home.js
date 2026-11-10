// Homepage content from menu.js: hero film, signature cards, grill prices, meal builder, sweet side,
// the menu index and the opening hours.
(() => {
  const A = window.ADANOS, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const cat = n => A.menu.find(g => g.cat === n);
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const from = items => Math.min(...items.map(i => i[2]));
  const two = n => String(n).padStart(2, '0');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Hero film. The poster shows first; the film is fetched once the page has loaded and fades in when it plays.
  // data-src-small is for a lighter phone cut; for now both attributes name the same file.
  // Reduced motion and data saver keep the still poster.
  const v = $('.hero video');
  if (v) {
    const still = calm || (navigator.connection && navigator.connection.saveData);
    if (!still) {
      const start = () => {
        v.addEventListener('playing', () => v.classList.add('ready'), {once: true});
        v.src = matchMedia('(max-width: 760px)').matches ? v.dataset.srcSmall : v.dataset.src;
        v.play().catch(() => {});
        // pause it once it's off screen
        new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe($('.hero'));
      };
      if (document.readyState === 'complete') start(); else addEventListener('load', start, {once: true});
    }
  }

  // Signatures: every burger or grill item that has a photo. Each card opens its section of the menu.
  const sigs = ['Beef Burgers', 'Chicken Burgers', 'Adanos Grilled'].flatMap(c => cat(c).items.filter(i => i[4]).map(i => [i, c]));
  const sig = $('#signatures'), rail = $('#rail');
  rail.innerHTML = sigs.map(([[n, d, p, m, ph], c], k) => `
    <li class="card"><a href="menu.html#${A.slug(c)}">
      <figure>${A.photo(ph, n)}</figure>
      <div class="card-b"><p class="card-k">${two(k + 1)} · ${esc(c)}</p><h3>${esc(n)}</h3><p class="card-d">${esc(d)}</p>
      <p class="price"><b>${A.money(p)}</b>${m ? `<span>Meal ${A.money(m)}</span>` : ''}<i class="card-go" aria-hidden="true">${arrow}</i></p></div></a></li>`).join('');
  const cards = [...rail.children];

  // "for £2 more" only when every burger's meal costs the same extra
  const ups = [...cat('Beef Burgers').items, ...cat('Chicken Burgers').items].filter(i => i[3]).map(i => +(i[3] - i[2]).toFixed(2));
  if (ups.length && ups.every(u => u === ups[0])) $('[data-meal-up]').textContent = ` for ${A.money(ups[0]).replace('.00', '')} more`;

  // Progress for the row: the line follows how far the row has moved, the counter names the cards
  // that are fully on screen (03–06 / 10), and the arrows move one card at a time.
  // motion.js calls this too when the row is pinned and the page scroll drives it.
  const bar = $('.rail-progress'), count = $('[data-rail-n]'), prev = $('[data-rail-prev]'), next = $('[data-rail-next]');
  $('[data-rail-of]').textContent = two(sigs.length);
  let shown = -1;
  A.railProgress = p => {
    if (Math.abs(p - shown) < .0005) return;
    shown = p;
    bar.style.setProperty('--rp', Math.max(1 / sigs.length, p).toFixed(4));
    const left = (parseFloat(getComputedStyle(rail).paddingLeft) || 16) - 8, right = root.clientWidth + 2;
    const on = cards.map((c, i) => { const r = c.getBoundingClientRect(); return r.left >= left && r.right <= right ? i : -1; }).filter(i => i >= 0);
    if (on.length) count.textContent = two(on[0] + 1) + (on.length > 1 ? '–' + two(on[on.length - 1] + 1) : '');
    prev.disabled = p < .01; next.disabled = p > .99;
  };
  A.railProgress(0);
  let rk = false;
  rail.addEventListener('scroll', () => {
    if (rk) return;
    rk = true;
    requestAnimationFrame(() => { rk = false; const max = rail.scrollWidth - rail.clientWidth; if (max > 0) A.railProgress(Math.min(1, rail.scrollLeft / max)); });
  }, {passive: true});
  addEventListener('resize', () => { shown = -1; const max = rail.scrollWidth - rail.clientWidth; A.railProgress(max > 0 ? Math.min(1, rail.scrollLeft / max) : 0); });
  const step = dir => {
    const w = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    const behavior = calm ? 'auto' : 'smooth';
    if (sig.classList.contains('pinned')) scrollBy({top: dir * w, behavior}); else rail.scrollBy({left: dir * w, behavior});
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));

  // Grill prices beside the sauces, and the line that repeats the chosen sauce
  $('#grill-list').innerHTML = `<caption>On the grill</caption>
    <thead><tr><th scope="col"><span class="sr">Dish</span></th><th scope="col"><span class="sr">Price</span></th><th scope="col">Meal</th></tr></thead>
    <tbody>${cat('Adanos Grilled').items.map(([n, , p, m]) => `<tr><th scope="row">${esc(n)}</th><td>${A.money(p)}</td><td>${m ? A.money(m) : ''}</td></tr>`).join('')}</tbody>`;
  $$('input[name=sauce]').forEach(i => i.addEventListener('change', () => { $('[data-sauce-pick]').textContent = i.value; }));

  // Meal builder. Mains are the burgers with a photo: a burger meal is the burger with chips and a drink.
  const mains = [...cat('Beef Burgers').items, ...cat('Chicken Burgers').items].filter(i => i[3] && i[4]);
  const sides = [['No extra side', '', 0], ...cat('Sides').items.filter(i => ['Cheesy House Fries', 'Curly Fries', 'Onion Rings', 'Chilli Cheese Bites', 'Sweet Potato Fries'].includes(i[0]))];
  const shakes = cat('Milkshakes').items.slice(0, 3), waffles = cat('Waffles').items.slice(0, 2);
  const sweets = [['No thanks', '', 0], ...shakes, ...waffles];
  // kind says what a sweet option is when its name doesn't ("Oreo & Peanut Butter" is a milkshake)
  const kind = i => { const k = shakes.includes(i) ? 'Milkshake' : waffles.includes(i) ? 'Waffle' : ''; return k && !i[0].includes(k) ? k + ', ' : ''; };
  const radio = (name, list, withImg) => list.map((item, i) => { const [n, , p, , ph] = item; return `
    <div class="opt"><input type="radio" name="${name}" id="${name}-${i}" value="${i}" ${i === 0 ? 'checked' : ''}>
    <label for="${name}-${i}">${withImg && ph ? `<span class="opt-img">${A.photo(ph)}</span>` : ''}<span>${esc(n)}</span><small>${p ? (withImg ? '' : kind(item) + '+') + A.money(p) : 'Nothing added'}</small></label></div>`; }).join('');
  $('#mains').innerHTML = radio('main', mains, true);
  $('#meal-opt').innerHTML = `
    <div class="opt"><input type="radio" name="meal" id="meal-1" value="1" checked><label for="meal-1"><span>Yes, make it a meal</span><small id="mealUp"></small></label></div>
    <div class="opt"><input type="radio" name="meal" id="meal-0" value="0"><label for="meal-0"><span>Just the burger</span><small>Nothing added</small></label></div>`;
  $('#sides').innerHTML = radio('side', sides, false);
  $('#sweets').innerHTML = radio('sweet', sweets, false);
  const form = $('#builder'), live = $('#total-live'), mbarTotal = $('[data-mbar-total]');
  form.addEventListener('submit', e => e.preventDefault());
  const val = n => +form.querySelector(`input[name=${n}]:checked`).value;
  let said;
  function total(announce) {
    const m = mains[val('main')], meal = val('meal'), s = sides[val('side')], w = sweets[val('sweet')];
    const lines = [[m[0] + (meal ? ' meal' : ''), meal ? m[3] : m[2]]];
    if (meal) lines.push(['Chips & drink', 0]);
    if (s[2]) lines.push([s[0], s[2]]);
    if (w[2]) lines.push([w[0], w[2]]);
    const sum = A.money(lines.reduce((a, l) => a + l[1], 0));
    $('#mealUp').textContent = 'Chips & a drink, +' + A.money(m[3] - m[2]);
    $('#lines').innerHTML = lines.map(([n, p]) => `<li${p ? '' : ' class="sub"'}><span>${esc(n)}</span><i></i><span>${p ? A.money(p) : 'incl.'}</span></li>`).join('');
    $('#total').textContent = sum;
    if (mbarTotal) mbarTotal.textContent = sum;
    // say the new total once the choice has settled, not on every arrow key
    if (announce) { clearTimeout(said); said = setTimeout(() => { live.textContent = `Total ${sum}`; }, 500); }
  }
  form.addEventListener('change', () => total(true));
  total(false);

  // On a phone the bottom bar carries the running total while the builder is on screen,
  // and steps aside while the receipt (which has its own Order button) is on screen.
  const mbar = $('.mbar');
  if (mbar && 'IntersectionObserver' in window) {
    let inForm = false, inTicket = false;
    const set = () => { mbar.classList.toggle('in-meal', inForm && !inTicket); mbar.classList.toggle('at-ticket', inTicket); };
    new IntersectionObserver(([e]) => { inForm = e.isIntersecting; set(); }, {rootMargin: '-30% 0px -30% 0px'}).observe(form);
    new IntersectionObserver(([e]) => { inTicket = e.isIntersecting; set(); }, {threshold: .5}).observe($('#ticket .btn'));
  }

  // Sweet side: two columns of two lists, so both columns run to the same length
  const sweetCol = c => { const items = cat(c).items; return `
    <div class="sweet-col"><h3>${esc(c)} <span class="from">From ${A.money(from(items))}</span></h3>
    <ul>${items.map(([n, , p]) => `<li><span>${esc(n)}</span><b>${A.money(p)}</b></li>`).join('')}</ul></div>`; };
  $('#sweet-cols').innerHTML = [['Milkshakes', 'Smoothies'], ['Waffles', 'Ice Cream & Desserts']].map(col => `<div>${col.map(sweetCol).join('')}</div>`).join('');

  // The full menu, linking into each section of the menu page
  $('#cat-list').innerHTML = A.menu.map(g => `
    <li><a href="menu.html#${A.slug(g.cat)}"><span><span class="n">${esc(g.cat)}</span><small>${g.items.length} items · from ${A.money(from(g.items))}</small></span><span class="ar" aria-hidden="true">${arrow}</span></a></li>`).join('');

  // Opening hours from the data, today marked
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], today = new Date().getDay();
  $('#hours tbody').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => `<tr${d === today ? ' class="today"' : ''}><th scope="row">${days[d]}</th><td>${A.fmtHour(A.hours[d][0])}–${A.fmtHour(A.hours[d][1])}</td></tr>`).join('');
})();
