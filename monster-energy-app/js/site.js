/* Landing page: reveal-on-scroll.
   Anything that reaches the fold is shown — including content jumped past,
   so nothing can get stuck invisible. */
(function () {
  'use strict';

  const items = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!items.length) return;

  const showAll = () => items.forEach(el => el.classList.add('in'));

  if (!('IntersectionObserver' in window)) { showAll(); return; }

  const pending = new Set(items);

  function reveal(el) {
    el.classList.add('in');
    pending.delete(el);
    io.unobserve(el);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  items.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.07 + 's';
    io.observe(el);
  });

  /* catch-up pass: reveal anything at or above the fold, which covers a
     restored scroll position and fast jumps down the page */
  let ticking = false;
  function sweep() {
    ticking = false;
    pending.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
    });
    if (!pending.size) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  sweep();
})();
