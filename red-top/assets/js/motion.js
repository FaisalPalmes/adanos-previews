// Scroll movement. All optional: without this file, without JavaScript or with reduced motion the page is complete and still.
// Only transform and opacity change, and the page always scrolls at its own speed.
(() => {
  const root = document.documentElement, A = window.ADANOS;
  if (!root.classList.contains('motion-ok') || !('IntersectionObserver' in window)) return;
  const $$ = s => [...document.querySelectorAll(s)];
  const wide = matchMedia('(min-width: 900px)');
  const barH = () => parseFloat(getComputedStyle(root).getPropertyValue('--bar')) || 64;

  // Headings rise into place once, the first time they come on screen.
  root.classList.add('rv-ready');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin: '0px 0px -10% 0px'});
  $$('[data-rv]').forEach(el => io.observe(el));

  // ----- Pages turn -----
  // Each section holds still once its bottom edge reaches the bottom of the screen, and the next one slides up over it.
  // A section taller than the screen scrolls through first. If that would leave its heading cut in half by the header bar,
  // it holds a little later instead, once the whole heading has gone under the bar.
  const pages = $$('.pg');
  let tops = [], pins = [];                                   // where each page starts in the document, and where it holds
  const within = (el, page) => { let y = 0; while (el && el !== page) { y += el.offsetTop; el = el.offsetParent; } return y; };
  const pin = () => {
    const on = wide.matches, vh = innerHeight, bar = barH();
    root.classList.toggle('pin', on);
    let y = 0;
    pages.forEach((p, i) => {
      if (i) y += parseFloat(getComputedStyle(p).marginTop) || 0;
      tops[i] = y;
      const h = p.offsetHeight;
      let t = Math.min(0, vh - h);
      const head = p.querySelector('.sec-head');
      if (head && t < 0) {
        const a = within(head, p), b = a + head.offsetHeight;
        if (t + a < bar + 12 && t + b > bar) t = bar - b;
      }
      pins[i] = t;
      if (on) p.style.setProperty('--pin', t + 'px');
      y += h;
    });
  };
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(pin); pages.forEach(p => ro.observe(p)); }
  addEventListener('resize', pin);
  pin();

  // Keyboard focus is always in the clear: below the header bar, above the bottom of the screen, and not under a page
  // that has slid over. Work out the scroll positions at which the focused thing's own page is the one on top and the
  // thing is fully in view, and move to the nearest of them.
  addEventListener('focusin', e => {
    const el = e.target, page = el.closest && el.closest('.pg'), i = pages.indexOf(page);
    if (!root.classList.contains('pin') || i < 0) return;
    const r = el.getBoundingClientRect(), vh = innerHeight, bar = barH();
    const covered = pages.slice(i + 1).some(p => p.getBoundingClientRect().top < r.bottom + 8);
    if (!covered && r.top >= bar + 8 && r.bottom <= vh - 8) return;
    const y = r.top - page.getBoundingClientRect().top;       // where it sits inside its page
    const most = Math.min(tops[i] + y - bar - 20, tops[i] - pins[i]);   // furthest down: still clear of the bar, page not yet held
    const least = tops[i] + y + r.height + 20 - vh;                     // furthest up: its bottom edge on screen
    A.jumpTo(Math.max(0, least > most ? most : Math.min(most, Math.max(least, scrollY))));
  });

  // ----- The stack -----
  // Bun, layers and bun wait above their places, then drop one after another (bottom bun first) once most of the burger
  // is on screen, so every piece is seen landing. Scrolling back above it resets it for the next time.
  const burger = document.getElementById('burger');
  const pieces = burger ? [...burger.querySelectorAll('.piece')].reverse() : [];
  if (pieces.length) {
    pieces.forEach((p, n) => p.style.setProperty('--n', n));
    const arm = () => { if (wide.matches) { burger.classList.remove('stack-go'); burger.classList.add('stack-wait'); } else burger.classList.remove('stack-wait', 'stack-go'); };
    const go = () => { burger.classList.remove('stack-wait'); burger.classList.add('stack-go'); };
    arm();
    let tick = false;
    const check = () => {
      tick = false;
      if (!wide.matches) return;
      const r = burger.getBoundingClientRect(), vh = innerHeight;
      const seen = Math.min(r.bottom, vh) - Math.max(r.top, barH());
      // most of it in view is enough; a burger that has reached the top of the screen always drops, so it can never stay empty
      if (burger.classList.contains('stack-wait') && (seen >= Math.min(r.height, vh - barH()) * 0.72 || r.top <= barH() + 24)) go();
      else if (burger.classList.contains('stack-go') && r.top > vh) arm();
    };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(check); } }, {passive: true});
    addEventListener('resize', () => { if (!wide.matches) arm(); check(); });
    check();
  }
})();
