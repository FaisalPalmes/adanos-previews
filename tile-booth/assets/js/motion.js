// Photos unveil once as they come into view. Optional: without this file, without JavaScript or with
// reduced motion, every photo is simply there. Nothing is hidden until this script is ready to show it again.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  document.documentElement.classList.add('motion');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), {rootMargin: '0px 0px -6% 0px', threshold: .1});
  els.forEach(el => io.observe(el));
})();
