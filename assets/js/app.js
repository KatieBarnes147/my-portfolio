// assets/js/app.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== Mobile nav toggle =====
  const nav = document.querySelector(".navigation");
  const burger = document.getElementById("burger-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  const closeNav = () => {
    nav.classList.remove("show");
    burger?.setAttribute("aria-expanded", "false");
  };

  burger?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("show");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a link (mobile) or pressing Esc
  navLinks.forEach((a) =>
    a.addEventListener("click", () => {
      closeNav();
    })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  // ===== Scroll-to-top button =====
  const toTopBtn = document.getElementById("scroll-up");
  const showTopBtn = () => {
    if (!toTopBtn) return;
    const show = window.scrollY > 400;
    toTopBtn.style.opacity = show ? "1" : "0";
    toTopBtn.style.pointerEvents = show ? "auto" : "none";
  };
  showTopBtn();
  window.addEventListener("scroll", () => requestAnimationFrame(showTopBtn));
  toTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ===== Scrollspy + URL hash sync (no color changes) =====
  const sections = document.querySelectorAll("section[id]");
  const linkFor = (id) =>
    document.querySelector(`.nav-link[href="#${CSS.escape(id)}"]`);

  let suppressHash = false; // avoid hash flicker on programmatic scroll
  navLinks.forEach((a) =>
    a.addEventListener("click", () => {
      suppressHash = true;
      setTimeout(() => (suppressHash = false), 800);
    })
  );

  const setActive = (id) => {
    if (!id) return;
    navLinks.forEach((a) => a.classList.remove("active"));
    const current = linkFor(id);
    current?.classList.add("active");

    if (!suppressHash && id !== (location.hash || "").slice(1)) {
      history.replaceState(null, "", `#${id}`);
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    {
      // section is "active" when ~60% visible
      rootMargin: "-20% 0px -40% 0px",
      threshold: 0.1,
    }
  );
  sections.forEach((s) => io.observe(s));
});
// === Fancy Cursor (desktop only) ===
(() => {
  const isTouch = window.matchMedia('(pointer: coarse)').matches || !window.matchMedia('(hover: hover)').matches;
  if (isTouch) return; // skip on touch devices

  // Create elements
  const outer = document.createElement('div');
  outer.className = 'cursor-outer';
  const inner = document.createElement('div');
  inner.className = 'cursor-inner';
  document.body.append(outer, inner);

  // Lerp helpers (smooth follow)
  const lerp = (a, b, n) => (1 - n) * a + n * b;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let outerX = mouseX, outerY = mouseY;
  let innerX = mouseX, innerY = mouseY;

  function animate() {
    outerX = lerp(outerX, mouseX, 0.15);
    outerY = lerp(outerY, mouseY, 0.15);
    innerX = lerp(innerX, mouseX, 0.35);
    innerY = lerp(innerY, mouseY, 0.35);

    outer.style.transform = `translate3d(${outerX}px, ${outerY}px, 0)`;
    inner.style.transform = `translate3d(${innerX}px, ${innerY}px, 0)`;

    requestAnimationFrame(animate);
  }
  animate();

  // visibility + press
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    outer.classList.remove('cursor--hidden');
    inner.classList.remove('cursor--hidden');
  });
  window.addEventListener('mouseenter', () => {
    outer.classList.remove('cursor--hidden');
    inner.classList.remove('cursor--hidden');
  });
  window.addEventListener('mouseleave', () => {
    outer.classList.add('cursor--hidden');
    inner.classList.add('cursor--hidden');
  });
  window.addEventListener('mousedown', () => {
    outer.classList.add('is-active');
    inner.classList.add('is-active');
  });
  window.addEventListener('mouseup', () => {
    outer.classList.remove('is-active');
    inner.classList.remove('is-active');
  });

  // Enlarge over interactive things
  const hoverTargets = document.querySelectorAll('a, button, .btn, .chip, .card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      outer.classList.add('is-hover'); inner.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      outer.classList.remove('is-hover'); inner.classList.remove('is-hover');
    });
  });
})();
// === Cursor Sparkles (subtle, performance-safe) ===
(() => {
  const isTouch = matchMedia('(pointer: coarse)').matches || !matchMedia('(hover: hover)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || reduce) return;

  const COLORS = ['var(--tertiary)', 'var(--secondary)', 'var(--primary)'];
  const MAX_SPARKS = 100;       // hard cap in DOM
  const SPAWN_PER_FRAME = 2;    // how many to spawn while moving
  const MIN_SPEED = 0.5;        // px/ms
  const MAX_SPEED = 1.3;        // px/ms

  const sparks = [];
  let lastX = innerWidth / 2, lastY = innerHeight / 2;
  let lastMoveTime = performance.now();
  let prevTime = performance.now();
  let moving = false;
  let angle = 0;

  class Spark {
    constructor() {
      this.el = document.createElement('span');
      this.el.className = 'cursor-spark';
      this.reset();
      document.body.appendChild(this.el);
    }
    reset() {
      this.active = false;
      this.life = 0;
      this.duration = 800; // ms
      this.x = 0; this.y = 0;
      this.vx = 0; this.vy = 0;
      this.size = 4;
      this.color = COLORS[0];
      this.el.style.opacity = 0;
    }
    spawn(x, y, a) {
      this.active = true;
      this.duration = 600 + Math.random() * 450; // 0.6–1.05s
      this.life = this.duration;
      this.size = 3 + Math.random() * 4;
      const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
      const spread = (Math.random() - 0.5) * 0.7; // radians variation
      const rad = a + spread;

      this.vx = Math.cos(rad) * speed;
      this.vy = Math.sin(rad) * speed;
      this.x = x;
      this.y = y;
      this.color = COLORS[(Math.random() * COLORS.length) | 0];

      this.el.style.background = this.color;
      this.el.style.boxShadow = `0 0 10px ${this.color}, 0 0 18px ${this.color}`;
      this.el.style.width = this.el.style.height = `${this.size}px`;
      this.el.style.opacity = 1;
    }
    update(dt) {
      if (!this.active) return;
      this.life -= dt;
      if (this.life <= 0) {
        this.active = false;
        this.el.style.opacity = 0;
        return;
      }
      // move
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // ease out (shrink + fade)
      const t = this.life / this.duration;                  // 1 -> 0
      const scale = 0.8 * t + 0.2;                          // keep a tiny dot at end
      this.el.style.opacity = Math.min(1, t * 1.1);
      this.el.style.transform = `translate3d(${this.x - this.size / 2}px, ${this.y - this.size / 2}px, 0) scale(${scale})`;
    }
  }

  // Pool
  for (let i = 0; i < MAX_SPARKS; i++) sparks.push(new Spark());
  function getInactiveSpark() {
    for (let i = 0; i < sparks.length; i++) {
      if (!sparks[i].active) return sparks[i];
    }
    return null;
  }

  // Track movement
  window.addEventListener('mousemove', (e) => {
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    angle = Math.atan2(dy, dx) || angle;

    lastX = e.clientX; lastY = e.clientY;
    lastMoveTime = now;
    moving = true;

    // spawn a few right away for crispness
    for (let i = 0; i < SPAWN_PER_FRAME; i++) {
      const s = getInactiveSpark();
      if (!s) break;
      s.spawn(lastX, lastY, angle);
    }
  });

  // RAF loop
  function tick(now) {
    const dt = Math.min(34, now - prevTime); // clamp delta (ms)
    prevTime = now;

    // continuously sprinkle while moving
    if (moving && (now - lastMoveTime) < 120) {
      for (let i = 0; i < 1; i++) {
        const s = getInactiveSpark();
        if (!s) break;
        s.spawn(lastX, lastY, angle);
      }
    } else {
      moving = false;
    }

    // update sparks
    for (let i = 0; i < sparks.length; i++) {
      sparks[i].update(dt);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
/* === FIX: if any earlier code used Math.Pi by mistake, fix it so the rest runs === */
try { if (Math.Pi) { /* noop */ } } catch(e) { /* ignore */ }
/* ^ If you see "Math.Pi is undefined" in console, search/replace to Math.PI in your scripts. */

/* === Cursor Sparkles (desktop + touch) === */
(() => {
  const COLORS = ['var(--tertiary)', 'var(--secondary)', 'var(--primary)'];
  const MAX_SPARKS = 100;
  const sparks = [];

  class Spark {
    constructor() {
      this.el = document.createElement('span');
      this.el.className = 'cursor-spark';
      this.reset();
      document.body.appendChild(this.el);
    }
    reset() {
      this.active = false;
      this.life = 0;
      this.duration = 800;
      this.x = 0; this.y = 0;
      this.vx = 0; this.vy = 0;
      this.size = 4;
      this.color = COLORS[0];
      this.el.style.opacity = 0;
      this.el.style.transform = 'translate3d(-9999px,-9999px,0)';
    }
    spawn(x, y, ang) {
      this.active = true;
      this.duration = 600 + Math.random() * 450;
      this.life = this.duration;
      this.size = 3 + Math.random() * 4;
      const speed = 0.5 + Math.random() * 1.0; // px/ms
      const spread = (Math.random() - 0.5) * 0.8;
      const a = ang + spread;

      this.vx = Math.cos(a) * speed;
      this.vy = Math.sin(a) * speed;
      this.x = x; this.y = y;
      this.color = COLORS[(Math.random() * COLORS.length) | 0];

      this.el.style.background = this.color;
      this.el.style.boxShadow = `0 0 10px ${this.color}, 0 0 18px ${this.color}`;
      this.el.style.width = this.el.style.height = `${this.size}px`;
      this.el.style.opacity = 1;
    }
    update(dt) {
      if (!this.active) return;
      this.life -= dt;
      if (this.life <= 0) { this.active = false; this.el.style.opacity = 0; return; }

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      const t = this.life / this.duration; // 1 -> 0
      const scale = 0.8 * t + 0.2;
      this.el.style.opacity = Math.min(1, t * 1.1);
      this.el.style.transform = `translate3d(${this.x - this.size/2}px, ${this.y - this.size/2}px, 0) scale(${scale})`;
    }
  }

  for (let i = 0; i < MAX_SPARKS; i++) sparks.push(new Spark());
  const getInactive = () => sparks.find(s => !s.active);

  let lastX = innerWidth/2, lastY = innerHeight/2, angle = 0, moving = false, prev = performance.now();

  function spawnBurst(x, y, a, count = 6) {
    for (let i = 0; i < count; i++) {
      const s = getInactive(); if (!s) break;
      s.spawn(x, y, a + (i - count/2) * 0.12);
    }
  }

  // Mouse
  window.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    angle = Math.atan2(dy, dx) || angle;
    lastX = e.clientX; lastY = e.clientY;
    moving = true;
    // small continuous sprinkle
    const s1 = getInactive(); if (s1) s1.spawn(lastX, lastY, angle);
  });

  // Touch (enable simple bursts)
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0]; if (!t) return;
    lastX = t.clientX; lastY = t.clientY;
    angle = Math.random() * Math.PI * 2;
    spawnBurst(lastX, lastY, angle, 5);
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; if (!t) return;
    spawnBurst(t.clientX, t.clientY, Math.random() * Math.PI * 2, 8);
  }, { passive: true });

  function loop(now) {
    const dt = Math.min(34, now - prev); // cap dt for stability
    prev = now;

    if (moving) {
      // extra sprinkle when moving
      const s2 = getInactive(); if (s2) s2.spawn(lastX, lastY, angle);
      moving = false;
    }
    for (let i = 0; i < sparks.length; i++) sparks[i].update(dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();



