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

  /* ---------- background music toggle (opt-in only, no autoplay) ---------- */
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
        musicToggle.classList.add('is-playing');
        musicToggle.setAttribute('aria-pressed', 'true');
      } else {
        bgMusic.pause();
        musicToggle.classList.remove('is-playing');
        musicToggle.setAttribute('aria-pressed', 'false');
      }
    });
  }

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

  /* ---------- word-by-word heading reveal ---------- */
  const splitEls = document.querySelectorAll('[data-split-reveal]');
  splitEls.forEach(el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    let wordIndex = 0;
    textNodes.forEach(textNode => {
      const words = textNode.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(word => {
        if (!word.trim()) {
          frag.appendChild(document.createTextNode(word));
          return;
        }
        const outer = document.createElement('span');
        outer.className = 'split-word';
        const inner = document.createElement('span');
        inner.className = 'split-word-inner';
        inner.textContent = word;
        inner.style.setProperty('--word-delay', (wordIndex * 0.06) + 's');
        outer.appendChild(inner);
        frag.appendChild(outer);
        wordIndex++;
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });
  });
  const splitObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('split-in-view');
        splitObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
  splitEls.forEach(el => splitObserver.observe(el));

  /* ---------- word-cycling hero role ---------- */
  const roleCycle = document.getElementById('roleCycle');
  if (roleCycle) {
    const roles = ['3D Animator', 'UX Designer', 'Motion Artist', 'Brand Designer'];
    let roleIndex = 0;
    setInterval(() => {
      roleCycle.classList.add('role-cycle-out');
      setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleCycle.textContent = roles[roleIndex];
        roleCycle.classList.remove('role-cycle-out');
      }, 350);
    }, 2600);
  }

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

  /* ---------- site-wide starfield (stays put behind all sections) ---------- */
  const siteStarfield = document.getElementById('siteStarfield');
  if (siteStarfield) {
    const count = window.innerWidth < 720 ? 50 : 110;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
      star.style.width = star.style.height = (Math.random() * 1.8 + 0.8).toFixed(1) + 'px';
      frag.appendChild(star);
    }
    siteStarfield.appendChild(frag);
  }

  /* ---------- cursor glow + custom cursor dot (desktop only) ---------- */
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (cursorGlow && !isTouch) {
    document.documentElement.classList.add('custom-cursor-active');
    let mx = -400, my = -400, cx = -400, cy = -400;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (cursorDot) { cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; }
    });
    (function raf() {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      cursorGlow.style.left = cx + 'px';
      cursorGlow.style.top = cy + 'px';
      requestAnimationFrame(raf);
    })();

    if (cursorDot) {
      const hoverTargets = 'a, button, .tilt-card, input, textarea';
      document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) cursorDot.classList.add('cursor-hover');
      });
      document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) cursorDot.classList.remove('cursor-hover');
      });
    }
  }

  /* ---------- work video card (hover on desktop, tap on touch) ---------- */
  const videoCard = document.getElementById('unseenRealmCard');
  if (videoCard) {
    const video = videoCard.querySelector('video');
    const playVideo = () => {
      video.play().catch(() => {});
      videoCard.classList.add('is-playing');
    };
    const pauseVideo = () => {
      video.pause();
      videoCard.classList.remove('is-playing');
    };
    if (isTouch) {
      videoCard.addEventListener('click', () => {
        if (videoCard.classList.contains('is-playing')) pauseVideo();
        else playVideo();
      });
    } else {
      videoCard.addEventListener('mouseenter', playVideo);
      videoCard.addEventListener('mouseleave', pauseVideo);
      videoCard.addEventListener('focus', playVideo);
      videoCard.addEventListener('blur', pauseVideo);
    }
  }

  /* ---------- scroll-scrubbed project showcase ---------- */
  const projectFeatures = document.querySelectorAll('[data-project-feature]');
  const pfEnabled = !reduceMotion;
  if (projectFeatures.length && pfEnabled) {
    const clamp01 = (n) => Math.max(0, Math.min(1, n));
    const lerp = (a, b, t) => a + (b - a) * t;
    const mobileQuery = window.matchMedia('(max-width: 900px)');

    const items = Array.from(projectFeatures).map(section => {
      const media = section.querySelector('.project-feature-media');
      const text = section.querySelector('.project-feature-text');
      const mediaEl = section.querySelector('.pf-media-el');
      let started = false;
      return { section, media, text, mediaEl, started };
    });

    function updateProjectFeatures() {
      const vh = window.innerHeight;
      const isMobile = mobileQuery.matches;
      items.forEach(item => {
        const rect = item.section.getBoundingClientRect();
        const total = item.section.offsetHeight - vh;
        const scrolled = -rect.top;
        const p = total > 0 ? clamp01(scrolled / total) : 0;

        const shrinkT = clamp01((p - 0.32) / 0.32);
        const scale = lerp(1, isMobile ? 0.84 : 0.56, shrinkT);
        const shiftX = isMobile ? 0 : lerp(0, -item.section.offsetWidth * 0.235, shrinkT);
        item.media.style.transform = `translate(calc(-50% + ${shiftX.toFixed(1)}px), -50%) scale(${scale.toFixed(4)})`;
        item.section.classList.toggle('pf-shrunk', shrinkT > 0.7);

        const textT = clamp01((p - 0.42) / 0.4);
        item.text.style.opacity = textT.toFixed(3);
        item.text.style.transform = isMobile
          ? `translateY(${lerp(24, 0, textT).toFixed(1)}px)`
          : `translateY(-50%) translateX(${lerp(26, 0, textT).toFixed(1)}px)`;

        if (item.mediaEl && item.mediaEl.tagName === 'VIDEO') {
          const active = rect.top < vh * 1.1 && rect.bottom > -vh * 0.1;
          if (active && !item.started) {
            item.started = true;
            item.mediaEl.play().catch(() => {});
          } else if (!active && item.started) {
            item.started = false;
            item.mediaEl.pause();
          }
        }
      });
    }

    let pfTicking = false;
    window.addEventListener('scroll', () => {
      if (!pfTicking) {
        requestAnimationFrame(() => { updateProjectFeatures(); pfTicking = false; });
        pfTicking = true;
      }
    }, { passive: true });
    updateProjectFeatures();
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
