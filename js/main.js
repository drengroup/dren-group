/* ============================================================
   DREN.GROUP — Main JavaScript
   ============================================================ */

'use strict';

// ============================================================
// NAV: Scroll behavior + mobile menu
// ============================================================
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('menu-open');
    const spans = navToggle.querySelectorAll('span');
    if (nav.classList.contains('menu-open')) {
      spans[0].style.transform = 'rotate(45deg) translate(4.5px, 4.5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4.5px, -4.5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on nav link click
  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('menu-open');
      const spans = navToggle.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

// ============================================================
// CANVAS: Animated particle grid background
// ============================================================
function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;
  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 150;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(tick);
  }

  // Pause when not visible
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) tick();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });
  observer.observe(canvas);

  resize();
  init();
  tick();

  window.addEventListener('resize', () => {
    resize();
    init();
  }, { passive: true });
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ============================================================
// CASE CARD EXPAND
// ============================================================
function initCaseCards() {
  const cards = document.querySelectorAll('.case-card');
  cards.forEach(card => {
    const header = card.querySelector('.case-card__header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isExpanded = card.classList.contains('expanded');
      // Collapse all
      cards.forEach(c => c.classList.remove('expanded'));
      // Toggle clicked
      if (!isExpanded) card.classList.add('expanded');
    });
  });
}

// ============================================================
// QUESTIONNAIRE FLOW
// ============================================================
function initQuestionnaire() {
  const form = document.getElementById('questionnaire');
  if (!form) return;

  const steps = form.querySelectorAll('.q-step');
  const progressSteps = form.querySelectorAll('.questionnaire__progress-step');
  const result = form.querySelector('.q-result');
  const answers = {};
  let currentStep = 0;

  function updateProgress(stepIndex) {
    progressSteps.forEach((s, i) => {
      s.classList.remove('done', 'active');
      if (i < stepIndex) s.classList.add('done');
      else if (i === stepIndex) s.classList.add('active');
    });
  }

  function showStep(index) {
    steps.forEach(s => s.classList.remove('active'));
    if (steps[index]) {
      steps[index].classList.add('active');
      updateProgress(index);
    }
    currentStep = index;
  }

  function getRouting() {
    const interest = answers['approach'] || '';
    const challenge = answers['challenge'] || '';

    if (interest === 'custom' || challenge === 'regulatory') {
      return {
        heading: "Let's talk to our engineering team",
        text: "Your needs sound like a custom infrastructure build. Our engineers love exactly this kind of complexity.",
        cta: "Schedule Engineering Call",
        href: "https://calendly.com/drengroup/engineering"
      };
    } else if (interest === 'tadr') {
      return {
        heading: "Schedule a TADR discovery call",
        text: "TADR was built for businesses like yours. Let's show you what's possible.",
        cta: "Book TADR Discovery",
        href: "https://calendly.com/drengroup/tadr"
      };
    } else {
      return {
        heading: "Let's figure this out together",
        text: "Every good solution starts with a conversation. No jargon, no pitch deck — just a real discussion about what you're building.",
        cta: "Send a message",
        href: "mailto:hola@dren.group"
      };
    }
  }

  function showResult() {
    steps.forEach(s => s.classList.remove('active'));
    progressSteps.forEach(s => s.classList.add('done'));

    if (result) {
      const routing = getRouting();
      result.querySelector('.q-result__heading').textContent = routing.heading;
      result.querySelector('.q-result__text').textContent = routing.text;
      const ctaBtn = result.querySelector('.q-result__cta');
      if (ctaBtn) {
        ctaBtn.textContent = routing.cta;
        ctaBtn.href = routing.href;
      }
      result.classList.add('visible');
    }
  }

  // Option clicks
  form.querySelectorAll('.q-option').forEach(option => {
    option.addEventListener('click', () => {
      const step = option.closest('.q-step');
      const key = step?.dataset.key;
      const value = option.dataset.value;

      // Deselect siblings
      step?.querySelectorAll('.q-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      if (key) answers[key] = value;

      // Auto-advance after brief delay
      setTimeout(() => {
        const nextIndex = currentStep + 1;
        if (nextIndex < steps.length) {
          showStep(nextIndex);
        } else {
          showResult();
        }
      }, 350);
    });
  });

  // Next buttons
  form.querySelectorAll('.q-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.closest('.q-step');
      const textarea = step?.querySelector('textarea');
      if (textarea && step.dataset.key) {
        answers[step.dataset.key] = textarea.value;
      }

      const nextIndex = currentStep + 1;
      if (nextIndex < steps.length) {
        showStep(nextIndex);
      } else {
        showResult();
      }
    });
  });

  // Back buttons
  form.querySelectorAll('.q-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) showStep(currentStep - 1);
    });
  });

  // Keyboard shortcuts for options
  document.addEventListener('keydown', e => {
    const active = form.querySelector('.q-step.active');
    if (!active) return;

    const keys = ['a','b','c','d'];
    const idx = keys.indexOf(e.key.toLowerCase());
    if (idx >= 0) {
      const options = active.querySelectorAll('.q-option');
      if (options[idx]) options[idx].click();
    }
  });

  // Initialize
  showStep(0);
}

// ============================================================
// MARQUEE: duplicate for seamless loop
// ============================================================
function initMarquee() {
  const track = document.querySelector('.marquee__track');
  if (!track) return;
  const clone = track.innerHTML;
  track.innerHTML += clone;
}

// ============================================================
// SMOOTH ANCHOR SCROLLING
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================================
// ACTIVE NAV HIGHLIGHTING
// ============================================================
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__link[href^="#"]');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.style.color = '');
        const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
        if (active) active.style.color = 'var(--text-primary)';
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initReveal();
  initCaseCards();
  initQuestionnaire();
  initMarquee();
  initSmoothScroll();
  initActiveNav();
});
