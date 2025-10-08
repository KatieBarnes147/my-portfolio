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

