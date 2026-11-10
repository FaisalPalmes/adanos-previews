// Menu page: every section from menu.js, with a sticky bar of section links that marks where you are.
(() => {
  const A = window.ADANOS, $ = s => document.querySelector(s), esc = A.esc;

  $('#cats').innerHTML = A.menu.map(g => `<a href="#${A.slug(g.cat)}">${A.name(g.cat)}</a>`).join('');
  $('#groups').innerHTML = A.menu.map(g => {
    const id = A.slug(g.cat), words = A.name(g.cat).split(' '), last = words.pop();
    // the item count rides with the last word of the heading, so it never drops onto a line of its own
    return `
    <section class="mgroup" id="${id}" aria-labelledby="h-${id}">
      <header class="mg-head">
        <h2 class="d" id="h-${id}">${words.join(' ')} <span class="last">${last}<span class="mg-count" aria-label="${g.items.length} items">${g.items.length}</span></span></h2>
        ${g.note ? `<p class="sticker mg-note">${esc(g.note)}</p>` : ''}
      </header>
      <div class="items">${g.items.map(([n, d, p, m, ph]) => `
        <article class="item${ph ? ' has-ph' : ''}">
          ${ph ? `<figure class="frame item-ph"><img src="${A.thumb(ph)}" alt="${esc(n)}" loading="lazy" width="720" height="720"></figure>` : ''}
          <div class="item-b"><h3>${esc(n)}</h3><p>${esc(d)}</p></div>
          <div class="item-pr"><b>${A.money(p)}</b>${m ? `<span class="chip">Meal ${A.money(m)}</span>` : ''}</div>
        </article>`).join('')}
      </div>
    </section>`;
  }).join('');

  const bar = $('#catbar'), row = $('#cats'), links = [...row.querySelectorAll('a')];
  const groups = [...document.querySelectorAll('.mgroup')];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Each section's scroll-margin (in the CSS) uses this, so a heading always lands just under the bar.
  const size = () => document.documentElement.style.setProperty('--bar-h', bar.offsetHeight + 'px');
  // The row of links fades at whichever end still has more to scroll to.
  const ends = () => {
    row.classList.toggle('more-l', row.scrollLeft > 8);
    row.classList.toggle('end', row.scrollLeft >= row.scrollWidth - row.clientWidth - 8);
  };
  size(); ends();
  addEventListener('resize', () => { size(); ends(); });
  row.addEventListener('scroll', ends, {passive: true});

  const go = (id, smooth) => {
    const t = document.getElementById(id);
    if (!t) return;
    if (smooth) t.scrollIntoView({block: 'start', behavior: 'smooth'}); else A.jumpIn(t);
  };
  links.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const id = a.hash.slice(1);
    history.replaceState(null, '', '#' + id);
    go(id, !calm);
  }));
  // Links like menu.html#milkshakes: the browser jumps before the sections exist, so repeat it once fonts and layout have settled.
  if (location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const jump = () => go(location.hash.slice(1), false);
    jump();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(jump));
    addEventListener('load', () => setTimeout(jump, 60), {once: true});
  }

  // Mark the section under the bar, and keep its link in view inside the bar (scrolling only the bar, never the page).
  let cur = '';
  const mark = () => {
    const edge = bar.offsetHeight + 60;
    bar.classList.toggle('stuck', bar.getBoundingClientRect().top <= 0);
    let now = groups[0];
    groups.forEach(g => { if (g.getBoundingClientRect().top < edge) now = g; });
    if (now.id === cur) return;
    cur = now.id;
    links.forEach(a => {
      const on = a.hash === '#' + cur;
      if (on) {
        a.setAttribute('aria-current', 'true');
        const left = a.offsetLeft - row.offsetLeft - row.clientWidth / 2 + a.offsetWidth / 2;
        try { row.scrollTo({left, behavior: calm ? 'auto' : 'smooth'}); } catch (e) { row.scrollLeft = left; }
      } else a.removeAttribute('aria-current');
    });
  };
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; mark(); }); } }, {passive: true});
  mark();
})();
