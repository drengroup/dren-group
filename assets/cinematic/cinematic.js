/* =================================================================
   DREN GROUP  ·  CINEMATIC v3  ·  Scroll choreography
   ================================================================= */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1.  Loader
     ------------------------------------------------------------------ */
  function runLoader () {
    const loader = document.getElementById('loader');
    const fill   = document.getElementById('loaderFill');
    if (!loader || !fill) { startIntro(); return; }
    let p = 0;
    const step = () => {
      p += Math.random() * 18 + 8;
      if (p >= 100) p = 100;
      fill.style.width = p + '%';
      if (p < 100) {
        setTimeout(step, 90 + Math.random() * 90);
      } else {
        setTimeout(() => {
          loader.classList.add('is-gone');
          setTimeout(() => { loader.style.display = 'none'; }, 800);
          startIntro();
        }, 220);
      }
    };
    setTimeout(step, 120);
  }

  /* ------------------------------------------------------------------
     2.  Lenis smooth scroll  +  GSAP ScrollTrigger bridge
     ------------------------------------------------------------------ */
  let lenis = null;
  function initLenis () {
    if (typeof Lenis === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    function raf (t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ------------------------------------------------------------------
     3.  Intro timeline (runs after loader)
     ------------------------------------------------------------------ */
  function startIntro () {
    if (typeof gsap === 'undefined') return;

    // Wrap each line__inner for the masked reveal
    document.querySelectorAll('.hero__title .line__inner, .contact__head .line__inner').forEach((el) => {
      el.style.transform = 'translateY(110%)';
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.nav', { y: -40, opacity: 0, duration: 0.8 })
      .from('.hero__eyebrow', { opacity: 0, y: 20, duration: 0.55 }, '-=0.3')
      .to('.hero__title .line__inner', {
        y: '0%', duration: 1.05, stagger: 0.14, ease: 'expo.out',
        onStart: () => document.querySelectorAll('.hero__title .line__inner').forEach((e) => e.style.transform = '')
      }, '-=0.15')
      .from('.hero__sub', { opacity: 0, y: 24, duration: 0.65 }, '-=0.55')
      .from('.hero__actions > *', { opacity: 0, y: 18, duration: 0.5, stagger: 0.1 }, '-=0.35')
      .from('.hero__stats .stat', { opacity: 0, y: 18, duration: 0.45, stagger: 0.1 }, '-=0.3')
      .from('.hero__stage', { opacity: 0, y: 30, duration: 1.1, ease: 'expo.out' }, '-=0.85')
      .from('.hero__marquee', { opacity: 0, duration: 0.8 }, '-=0.3');
  }

  /* ------------------------------------------------------------------
     4.  Nav backdrop on scroll
     ------------------------------------------------------------------ */
  function navOnScroll () {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------------------------------------------
     5.  Hero — auto-rotate product slides
     ------------------------------------------------------------------ */
  function heroRotator () {
    const slides = Array.from(document.querySelectorAll('.hero__stage .slide'));
    const dots   = Array.from(document.querySelectorAll('.hero__stage .dot'));
    const idxEl  = document.getElementById('capIdx');
    const nameEl = document.getElementById('capName');
    if (!slides.length) return;

    const names = [
      'TADR — travelagencydr.com',
      'Cuadrato — cuadrato.dren.group',
      'Dren IT — it.dren.group',
      'JurisRD — jurisrd.dren.group',
      'CEBA Scuba — cebascuba.com',
    ];

    let i = 0;
    let timer = null;
    const ROTATE_MS = 4200;

    function show (n) {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      if (idxEl)  idxEl.textContent  = String(i + 1).padStart(2, '0') + ' / 05';
      if (nameEl) nameEl.textContent = names[i] || '';
    }

    function start () {
      stop();
      timer = setInterval(() => show(i + 1), ROTATE_MS);
    }
    function stop () { if (timer) clearInterval(timer); timer = null; }

    dots.forEach((d) => {
      d.addEventListener('click', () => {
        show(parseInt(d.dataset.idx, 10) || 0);
        start();
      });
    });

    // Pause when offscreen
    const stage = document.querySelector('.hero__stage');
    if ('IntersectionObserver' in window && stage) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.isIntersecting ? start() : stop());
      }, { threshold: 0.2 });
      obs.observe(stage);
    } else {
      start();
    }
  }

  /* ------------------------------------------------------------------
     6.  Subtle device parallax on mouse
     ------------------------------------------------------------------ */
  function deviceParallax () {
    if (matchMedia('(hover: none)').matches) return;
    const device = document.getElementById('heroDevice');
    const stage  = document.querySelector('.hero__stage');
    if (!device || !stage) return;
    let rx = 0, ry = 0, tx = 0, ty = 0;
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      tx = -px * 6;
      ty = -py * 4;
    });
    stage.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    function loop () {
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      device.style.transform = `rotateY(${rx}deg) rotateX(${ry}deg) translateZ(0)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ------------------------------------------------------------------
     7.  Section reveals on scroll  (ScrollTrigger)
     ------------------------------------------------------------------ */
  function scrollReveals () {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Act marker reveals
    gsap.utils.toArray('.act:not(.act--inline)').forEach((el) => {
      gsap.from(el.children, {
        scrollTrigger: { trigger: el, start: 'top 75%' },
        opacity: 0, y: 24,
        duration: 0.8, stagger: 0.12, ease: 'power3.out'
      });
    });

    // Case reveals
    gsap.utils.toArray('.case').forEach((el) => {
      const copy = el.querySelector('.case__copy');
      const art  = el.querySelector('.case__art');
      gsap.from(copy ? copy.children : [], {
        scrollTrigger: { trigger: el, start: 'top 70%' },
        opacity: 0, y: 28, duration: 0.7, stagger: 0.08, ease: 'power3.out'
      });
      if (art) {
        gsap.from(art, {
          scrollTrigger: { trigger: el, start: 'top 70%' },
          opacity: 0, x: el.classList.contains('case--cuadrato') || el.classList.contains('case--jurisrd') ? -40 : 40,
          duration: 1.0, ease: 'expo.out'
        });
      }
    });

    // Method cards
    gsap.from('.m-card', {
      scrollTrigger: { trigger: '.method__grid', start: 'top 75%' },
      opacity: 0, y: 32, duration: 0.7, stagger: 0.12, ease: 'power3.out'
    });

    // Contact head reveal
    gsap.utils.toArray('.contact__head .line__inner').forEach((el) => el.style.transform = 'translateY(110%)');
    ScrollTrigger.create({
      trigger: '.contact',
      start: 'top 70%',
      onEnter: () => {
        gsap.to('.contact__head .line__inner', {
          y: '0%', duration: 1.0, stagger: 0.14, ease: 'expo.out',
          onStart: () => document.querySelectorAll('.contact__head .line__inner').forEach((e) => e.style.transform = '')
        });
      },
      once: true
    });
    gsap.from('.contact__body, .contact__actions', {
      scrollTrigger: { trigger: '.contact__body', start: 'top 78%' },
      opacity: 0, y: 24, duration: 0.7, stagger: 0.1, ease: 'power3.out'
    });
  }

  /* ------------------------------------------------------------------
     8.  Anchor jumps via Lenis (so they're cinematic too)
     ------------------------------------------------------------------ */
  function lenisAnchors () {
    if (!lenis) return;
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (ev) => {
        const href = a.getAttribute('href');
        if (href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        ev.preventDefault();
        lenis.scrollTo(target, { offset: -60, duration: 1.4 });
      });
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot () {
    initLenis();
    runLoader();
    navOnScroll();
    heroRotator();
    deviceParallax();
    scrollReveals();
    lenisAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
