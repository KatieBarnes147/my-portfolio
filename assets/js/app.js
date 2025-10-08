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
