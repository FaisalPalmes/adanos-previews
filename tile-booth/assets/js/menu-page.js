// Full menu page. This file is loaded straight after the empty menu container, so the sections are built
// before the browser reaches the order band and footer. The behaviour (section bar, deep links, printing)
// is wired once the whole page is there.
(() => {
  const A = window.ADANOS, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = A.esc, two = n => String(n).padStart(2, '0');
  const SAY = '<span class="vh">, </span>'; // a pause for screen readers where the layout alone separates two things

  $('#mcats').innerHTML = A.menu.map(g => `<a href="#${A.slug(g.cat)}">${esc(g.cat)}</a>`).join('');

  $('#msecs').innerHTML = A.menu.map((g, i) => {
    const id = A.slug(g.cat), shots = g.items.filter(it => it[4]);
    return `
    <section class="msec" id="${id}" aria-labelledby="h-${id}">
      <div class="msec-rail">
        <span class="msec-n" aria-hidden="true">${two(i + 1)}</span>
        <h2 id="h-${id}">${esc(g.cat)}</h2>
        ${g.note ? `<p class="msec-note">${esc(g.note)}</p>` : ''}
        <p class="msec-count">${g.items.length} ${g.items.length === 1 ? 'item' : 'items'}</p>
      </div>
      <div class="msec-body">
        ${shots.length ? `<div class="mphotos mphotos--${shots.length}">${shots.map(([n, , , , ph]) => `<figure class="mphoto"><div class="frame" data-reveal>${A.photo(ph, n, {zoom: 1.1})}</div><figcaption>${esc(n)}</figcaption></figure>`).join('')}</div>` : ''}
        <div class="mitems">${g.items.map(([n, d, p, m]) => `
          <article class="mitem">
            <div class="mitem-top"><h3>${esc(n)}</h3><span class="dots" aria-hidden="true"></span>${SAY}${A.price(p)}</div>
            <div class="mitem-bot"><p>${esc(d)}</p>${m ? `${SAY}<span class="meal-pr">Meal ${A.money(m)}</span>` : ''}</div>
          </article>`).join('')}
        </div>
      </div>
    </section>`;
  }).join('');

  A.ready(() => {
    const bar = $('#mcats'), nav = bar.closest('.mcats'), links = $$('#mcats a'), secs = $$('.msec');
    const calm = matchMedia('(prefers-reduced-motion: reduce)');
    // .msec has scroll-margin-top in the CSS, so a heading lands clear of the header and the section bar.
    const go = (id, behavior) => { const t = document.getElementById(id); if (t) t.scrollIntoView({block: 'start', behavior}); return !!t; };
    links.forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!go(id, calm.matches ? 'auto' : 'smooth')) return;
      e.preventDefault();
      history.replaceState(null, '', '#' + id);
    }));

    // Links like menu.html#milkshakes: land on the section now, again once the fonts are in, and once the page has loaded.
    const fromHash = () => location.hash.length > 1 && go(decodeURIComponent(location.hash.slice(1)), 'instant');
    if (fromHash()) {
      if (document.fonts) document.fonts.ready.then(() => requestAnimationFrame(fromHash));
      addEventListener('load', () => setTimeout(fromHash, 60), {once: true});
    }
    addEventListener('hashchange', fromHash);

    // Mark the section being read. A section that has just landed under the bars (a link or a tap in the bar)
    // wins; otherwise it is the one crossing a line a third of the way down the space under the bars, so a short
    // section in the middle of the screen is the one marked. Keep its link in view in the bar.
    let current = null;
    function markCurrent() {
      const under = nav.getBoundingClientRect().bottom, line = under + Math.max(40, (innerHeight - under) * .34);
      let cur = secs[0];
      secs.forEach(s => { if (s.getBoundingClientRect().top <= line) cur = s; });
      cur = secs.find(s => { const t = s.getBoundingClientRect().top; return t > under - 70 && t < under + 60; }) || cur;
      if (cur.id === current) return;
      current = cur.id;
      links.forEach(a => {
        const on = a.getAttribute('href') === '#' + current;
        on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
        // move only the bar sideways; scrollIntoView would move the page too
        if (on) bar.scrollTo({left: a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2, behavior: calm.matches ? 'auto' : 'smooth'});
      });
    }
    let tick = false;
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; markCurrent(); }); } }, {passive: true});
    addEventListener('resize', markCurrent);
    markCurrent();

    // Where the bar holds more sections than fit: fade that edge and offer an arrow to reach them.
    const prev = $('[data-mcats-prev]'), next = $('[data-mcats-next]');
    const edges = () => {
      const l = bar.scrollLeft > 4, r = bar.scrollLeft < bar.scrollWidth - bar.clientWidth - 4;
      nav.classList.toggle('more-l', l); nav.classList.toggle('more-r', r);
      // an arrow that has done its job hands the keyboard to the other one before it goes
      if (!l && document.activeElement === prev) next.focus();
      if (!r && document.activeElement === next) { prev.hidden = false; prev.focus(); }
      prev.hidden = !l; next.hidden = !r;
    };
    const nudge = dir => bar.scrollBy({left: dir * bar.clientWidth * .6, behavior: calm.matches ? 'auto' : 'smooth'});
    prev.addEventListener('click', () => nudge(-1));
    next.addEventListener('click', () => nudge(1));
    let tock = false;
    bar.addEventListener('scroll', () => { if (!tock) { tock = true; requestAnimationFrame(() => { tock = false; edges(); }); } }, {passive: true});
    addEventListener('resize', edges);
    edges();

    const print = $('[data-print]');
    if (print) print.addEventListener('click', () => window.print());
  });
})();
