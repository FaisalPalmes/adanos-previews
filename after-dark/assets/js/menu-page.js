// Full menu page: every section from menu.js, with a sticky section bar that follows the scroll.
(() => {
  const A = window.ADANOS, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const two = n => String(n).padStart(2, '0');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // In each section the dishes with a photo are listed first, then the rest, so each list keeps one text edge.
  const row = ([n, d, p, m, ph]) => `
        <li class="item">${ph ? `<span class="thumb">${A.photo(ph)}</span>` : ''}
          <div><h3>${esc(n)}</h3><p>${esc(d)}</p></div>
          <p class="pr"><b>${A.money(p)}</b>${m ? `<span>Meal ${A.money(m)}</span>` : ''}</p></li>`;
  const list = (items, cls) => items.length ? `<ul class="items${cls}">${items.map(row).join('')}</ul>` : '';

  $('#cats').innerHTML = A.menu.map(g => `<a href="#${A.slug(g.cat)}">${esc(g.cat)}</a>`).join('');
  $('#groups').innerHTML = A.menu.map((g, k) => { const id = A.slug(g.cat); return `
    <section class="mgroup" id="${id}" aria-labelledby="h-${id}">
      <header class="mg-head"><span class="mg-n" aria-hidden="true">${two(k + 1)} / ${two(A.menu.length)}</span><h2 id="h-${id}">${esc(g.cat)}</h2>
        ${g.note ? `<p class="mg-note">${esc(g.note)}</p>` : ''}<p class="mg-count">${g.items.length} items</p></header>
      <div class="mg-body">${list(g.items.filter(i => i[4]), ' items-photo')}${list(g.items.filter(i => !i[4]), '')}</div>
    </section>`; }).join('');

  const bar = $('#cats'), links = $$('#cats a'), groups = $$('.mgroup');
  // Links like menu.html#milkshakes: the browser tries its own jump before the sections exist,
  // so repeat it now, and again once fonts and images have settled. scroll-margin-top in the CSS
  // keeps the heading clear of the sticky header and section bar.
  if (location.hash.length > 1) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const jump = () => { const t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView({block: 'start', behavior: 'instant'}); };
    jump();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(jump));
    addEventListener('load', () => setTimeout(jump, 50), {once: true});
  }

  // When the pills run past the page grid, arrows at each end move the bar along.
  const prev = $('[data-cats-prev]'), next = $('[data-cats-next]');
  const ends = () => {
    const max = bar.scrollWidth - bar.clientWidth;
    prev.hidden = bar.scrollLeft < 4;
    next.hidden = bar.scrollLeft > max - 4;
  };
  const slide = dir => bar.scrollBy({left: dir * bar.clientWidth * .5, behavior: calm ? 'auto' : 'smooth'});
  prev.addEventListener('click', () => slide(-1));
  next.addEventListener('click', () => slide(1));
  let bk = false;
  bar.addEventListener('scroll', () => { if (!bk) { bk = true; requestAnimationFrame(() => { bk = false; ends(); }); } }, {passive: true});

  // Mark the section on screen and keep its pill in view. Only the bar scrolls sideways, never the page.
  const line = () => $('header.top').offsetHeight + $('.cats-bar').offsetHeight + 48;
  let current;
  const mark = () => {
    let cur = groups[0];
    const y = line();
    groups.forEach(g => { if (g.getBoundingClientRect().top < y) cur = g; });
    if (cur.id === current) return;
    current = cur.id;
    links.forEach(a => {
      const on = a.hash === '#' + current;
      if (on) { a.setAttribute('aria-current', 'true'); bar.scrollTo({left: a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2, behavior: calm ? 'auto' : 'smooth'}); }
      else a.removeAttribute('aria-current');
    });
  };
  let tk = false;
  addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(() => { tk = false; mark(); }); } }, {passive: true});
  addEventListener('resize', () => { mark(); ends(); });
  mark();
  ends();
})();
