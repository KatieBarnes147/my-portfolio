// assets/js/app.js
(() => {
  const nav = document.querySelector('nav');
  const burger = document.getElementById('burger-menu');
  const navList = document.querySelector('.navigation');
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const scrollUp = document.getElementById('scroll-up');

  /* ---------- Mobile nav toggle ---------- */
  const closeNav = () => {
    navList?.classList.remove('show');
    burger?.setAttribute('aria-expanded', 'false');
  };
  burger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !navList.classList.contains('show');
    navList.classList.toggle('show');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close when clicking a nav link (helpful on mobile)
  links.forEach((a) => a.addEventListener('click', () => closeNav()));
  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navList.classList.contains('show')) closeNav();
  });
  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Scroll-to-top visibility ---------- */
  const toggleScrollUp = () => {
    if (!scrollUp) return;
    if (window.scrollY > 500) scrollUp.classList.add('show');
    else scrollUp.classList.remove('show');
  };
  toggleScrollUp();
  window.addEventListener('scroll', toggleScrollUp);
  scrollUp?.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* ---------- Smooth scroll for in-page links ---------- */
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    link.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Scrollspy: highlight current section in nav ---------- */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const link = links.find((a) => a.getAttribute('href') === `#${id}`);
        if (!link) return; // ignore sections without a corresponding nav link
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((sec) => spy.observe(sec));

  /* ---------- Reveal-on-scroll for titles/cards ---------- */
  const revealEls = document.querySelectorAll(
    '.section .section-title, .section .section-subtitle, .card'
  );
  const revealObs = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => {
    el.classList.add('reveal');
    revealObs.observe(el);
  });
})();
