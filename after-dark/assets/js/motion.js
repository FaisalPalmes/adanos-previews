// Homepage scroll effects. All optional: without this file, without JavaScript or with reduced motion,
// the page is complete and still. Only transform, opacity and one clip-path move; the page scrolls at its normal speed.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('moving')) return;
  root.classList.add('fx');
  const A = window.ADANOS || {};
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  // pinned sections need room: a wide screen that isn't too short
  const wide = matchMedia('(min-width: 900px) and (min-height: 600px)');
  // how far through a tall section we are, 0 at its top to 1 when its bottom reaches the bottom of the screen
  const prog = el => { const r = el.getBoundingClientRect(), d = r.height - innerHeight; return d > 0 ? clamp(-r.top / d) : (r.top < 0 ? 1 : 0); };
  // where an element sits on screen, -1 above centre to 1 below
  const offY = r => clamp((r.top + r.height / 2 - innerHeight / 2) / innerHeight, -1, 1);

  // headings fade up once
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -10% 0px'});
  $$('[data-reveal]').forEach(el => io.observe(el));

  const hero = $('[data-hero]');
  const smash = $('[data-steps]'), steps = $$('.sm-step'), words = $$('.sm-title span'), ticks = $$('.sm-prog i');
  const sig = $('[data-rail]'), track = sig && sig.querySelector('.rail'), stick = sig && sig.querySelector('.sig-stick');
  const cards = track ? $$('.rail img') : [];
  const pars = $$('[data-parallax]').map(el => ({el, amt: +el.dataset.parallax, box: el.parentElement}));
  const drifts = $$('[data-drift]').map(el => ({el, amt: +el.dataset.drift, box: el.parentElement}));
  let dist = 0;

  // Wide screens: the signature row is pinned and slides sideways while the page scrolls down through it.
  // The photo height is whatever is left once the heading, the card text and the counter row are in,
  // so nothing is cut off. If that leaves too little for a photo, the row stays an ordinary swipe row.
  function layout() {
    if (!sig) return;
    track.style.transform = '';
    track.style.removeProperty('--fig-h');
    sig.style.height = '';
    sig.classList.remove('pinned');
    dist = 0;
    if (!wide.matches) return;
    track.scrollLeft = 0;
    sig.classList.add('pinned');
    const cs = getComputedStyle(stick), rs = getComputedStyle(track);
    const outer = el => { const s = getComputedStyle(el); return el.offsetHeight + parseFloat(s.marginTop) + parseFloat(s.marginBottom); };
    const text = Math.max(...[...track.children].map(c => c.querySelector('.card-b').offsetHeight));
    const free = stick.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      - outer(stick.querySelector('.sec-head')) - outer(stick.querySelector('.sig-foot'))
      - parseFloat(rs.paddingTop) - parseFloat(rs.paddingBottom) - text;
    const width = track.firstElementChild.offsetWidth;
    if (free < width * .58) { sig.classList.remove('pinned'); return; }
    track.style.setProperty('--fig-h', Math.floor(Math.min(free, width * 1.25)) + 'px');
    // the row stops when its last card reaches the right edge of the page grid
    const edge = parseFloat(rs.paddingLeft) || 32;
    dist = Math.max(0, track.lastElementChild.getBoundingClientRect().right - root.clientWidth + edge);
    sig.style.height = (dist + innerHeight) + 'px';
  }

  function frame() {
    const vh = innerHeight, vw = innerWidth;
    if (hero) {
      // p: the film eases back as the title block scrolls off it. f: the last stretch, where it draws in to a frame.
      const p = prog(hero);
      hero.style.setProperty('--p', p.toFixed(4));
      hero.style.setProperty('--f', clamp((p - .55) / .45).toFixed(4));
    }

    if (smash) {
      const p = prog(smash) * 3, i = wide.matches ? Math.min(2, Math.floor(p)) : -1;
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
      words.forEach((w, k) => w.classList.toggle('on', k === i));
      ticks.forEach((t, k) => t.style.setProperty('--s', clamp(p - k).toFixed(3)));
    }

    if (dist) {
      const p = prog(sig);
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      if (A.railProgress) A.railProgress(p);
    }
    cards.forEach(im => {
      const r = im.parentElement.getBoundingClientRect();
      if (r.right < 0 || r.left > vw || r.bottom < 0 || r.top > vh) return;
      im.style.setProperty('--tx', (-clamp((r.left + r.width / 2 - vw / 2) / vw, -1, 1) * 4).toFixed(2) + '%');
    });

    pars.forEach(({el, amt, box}) => {
      const r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      el.style.transform = `translate3d(0,${(-offY(r) * amt).toFixed(2)}%,0) scale(1.12)`;
    });
    const dScale = wide.matches ? 1 : .4; // the collage is small on a phone, so its layers move less
    drifts.forEach(({el, amt, box}) => {
      const r = box.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.transform = `translate3d(0,${(offY(r) * amt * dScale).toFixed(1)}px,0)`;
    });
  }

  // Keyboard: a card that takes focus while the pinned row has it off screen is brought into view
  // by scrolling the page the same distance the row needs to move.
  if (track) track.addEventListener('focusin', e => {
    if (!dist) return;
    const card = e.target.closest('.card'); if (!card) return;
    const r = card.getBoundingClientRect(), edge = parseFloat(getComputedStyle(track).paddingLeft) || 32;
    if (r.left < edge - 1) scrollBy({top: r.left - edge, behavior: 'instant'});
    else if (r.right > root.clientWidth - 24) scrollBy({top: r.right - root.clientWidth + edge, behavior: 'instant'});
  });

  let tk = false;
  const req = () => { if (!tk) { tk = true; requestAnimationFrame(() => { tk = false; frame(); }); } };
  const relayout = () => { layout(); frame(); };
  addEventListener('scroll', req, {passive: true});
  addEventListener('resize', relayout);
  wide.addEventListener('change', relayout);
  addEventListener('load', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
  relayout();
})();
