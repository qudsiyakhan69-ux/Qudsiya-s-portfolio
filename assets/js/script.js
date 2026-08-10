(function () {
  'use strict';

  /* ---------- intro splash: doors open on scroll / click / key ---------- */
  const splash = document.getElementById('splashScreen');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen = sessionStorage.getItem('qkSplashSeen') === '1';

  if (splash) {
    if (alreadySeen || reduceMotion) {
      splash.classList.add('splash-open', 'splash-gone');
      document.documentElement.classList.remove('no-scroll');
    } else {
      document.documentElement.classList.add('no-scroll');

      let opened = false;
      const openDoors = () => {
        if (opened) return;
        opened = true;
        splash.classList.add('splash-open');
        sessionStorage.setItem('qkSplashSeen', '1');
        setTimeout(() => {
          splash.classList.add('splash-gone');
          document.documentElement.classList.remove('no-scroll');
        }, 1000);
      };

      splash.addEventListener('wheel', openDoors, { passive: true });
      splash.addEventListener('touchmove', openDoors, { passive: true });
      splash.addEventListener('click', openDoors);
      splash.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') openDoors();
      });

      /* fallback so visitors who never scroll/click/tap aren't stuck */
      setTimeout(openDoors, 6000);
    }
  }

  /* ---------- header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('progressBar');
  const backToTop = document.getElementById('backToTop');

  /* ---------- mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- active nav link on scroll ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function updateActiveNav() {
    let currentId = sections[0] && sections[0].id;
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    backToTop.classList.toggle('visible', y > 500);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';

    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    revealObserver.observe(el);
  });

  /* ---------- starfield ---------- */
  const starfield = document.getElementById('starfield');
  if (starfield) {
    const count = window.innerWidth < 720 ? 40 : 90;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      star.style.width = star.style.height = (Math.random() * 1.6 + 1).toFixed(1) + 'px';
      frag.appendChild(star);
    }
    starfield.appendChild(frag);
  }

  /* ---------- cursor glow (desktop only) ---------- */
  const cursorGlow = document.getElementById('cursorGlow');
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (cursorGlow && !isTouch) {
    let mx = -400, my = -400, cx = -400, cy = -400;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    (function raf() {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursorGlow.style.left = cx + 'px';
      cursorGlow.style.top = cy + 'px';
      requestAnimationFrame(raf);
    })();
  }

  /* ---------- 3D tilt on cards ---------- */
  if (!isTouch) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });

    /* hero portrait parallax tilt */
    const portraitStage = document.getElementById('portraitFrame');
    if (portraitStage) {
      portraitStage.addEventListener('mousemove', (e) => {
        const r = portraitStage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        portraitStage.style.transform = `perspective(900px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
      });
      portraitStage.addEventListener('mouseleave', () => {
        portraitStage.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      });
    }

    /* hero background parallax depth (moves the whole blob/star layer,
       kept separate from each blob's own CSS animation so the two don't fight) */
    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');
    if (hero && heroBg) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        heroBg.style.transform = `translate(${(px * 22).toFixed(1)}px, ${(py * 22).toFixed(1)}px)`;
      });
      hero.addEventListener('mouseleave', () => {
        heroBg.style.transform = 'translate(0, 0)';
      });
    }
  }

  /* ---------- portrait fallback if no photo file yet ---------- */
  const portraitFrame = document.getElementById('portraitFrame');
  const heroPortrait = document.getElementById('heroPortrait');
  if (portraitFrame && heroPortrait) {
    heroPortrait.addEventListener('error', () => {
      portraitFrame.classList.add('no-image');
    });
    if (heroPortrait.complete && heroPortrait.naturalWidth === 0) {
      portraitFrame.classList.add('no-image');
    }
  }

  /* ---------- contact form -> mailto ---------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:qudsiyakhan69@gmail.com?subject=${subject}&body=${body}`;

      formNote.textContent = 'Opening your email client...';
      setTimeout(() => { formNote.textContent = ''; }, 4000);
    });
  }
})();
