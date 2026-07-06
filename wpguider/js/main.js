(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ----------------------------------------------------------
     Mobile nav toggle
     ---------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----------------------------------------------------------
     Smooth scroll (Lenis) + GSAP ScrollTrigger sync
     ---------------------------------------------------------- */
  var lenis = null;
  if (window.Lenis && !prefersReducedMotion) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", window.ScrollTrigger ? ScrollTrigger.update : function () {});
    if (window.gsap) {
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); });
    }

    // Anchor links use Lenis scrollTo
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -70 });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Custom cursor
     ---------------------------------------------------------- */
  var cursor = document.getElementById("cursor");
  var cursorLabel = document.getElementById("cursorLabel");
  if (cursor && isFinePointer && window.gsap) {
    var cursorX = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
    var cursorY = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });

    window.addEventListener("mousemove", function (e) {
      cursorX(e.clientX);
      cursorY(e.clientY);
    });

    document.querySelectorAll("[data-hover]").forEach(function (el) {
      var type = el.getAttribute("data-hover");
      el.addEventListener("mouseenter", function () {
        cursor.classList.add(type === "cursor-view" ? "is-view" : "is-link");
        if (type === "cursor-view") cursorLabel.textContent = "View";
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-view", "is-link");
        cursorLabel.textContent = "";
      });
    });
  }

  /* ----------------------------------------------------------
     Hero mouse-parallax on image tiles
     ---------------------------------------------------------- */
  var heroGrid = document.getElementById("heroGrid");
  if (heroGrid && isFinePointer && window.gsap && !prefersReducedMotion) {
    var tiles = gsap.utils.toArray(".parallax");
    var moveTweens = tiles.map(function (tile) {
      var speed = parseFloat(tile.getAttribute("data-speed")) || 0.3;
      return { el: tile, speed: speed, x: gsap.quickTo(tile, "x", { duration: 0.6, ease: "power3.out" }), y: gsap.quickTo(tile, "y", { duration: 0.6, ease: "power3.out" }) };
    });

    heroGrid.addEventListener("mousemove", function (e) {
      var rect = heroGrid.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      moveTweens.forEach(function (t) {
        t.x(relX * 40 * t.speed);
        t.y(relY * 40 * t.speed);
      });
    });

    heroGrid.addEventListener("mouseleave", function () {
      moveTweens.forEach(function (t) { t.x(0); t.y(0); });
    });
  }

  /* ----------------------------------------------------------
     Hero headline reveal (manual per-word split, no paid plugin)
     ---------------------------------------------------------- */
  if (window.gsap) {
    var lines = document.querySelectorAll(".hero-line");
    lines.forEach(function (line) {
      var text = line.textContent;
      line.textContent = "";
      var span = document.createElement("span");
      span.textContent = text;
      line.appendChild(span);
    });

    var heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    heroTl
      .from(".hero-line span", {
        yPercent: 110,
        duration: prefersReducedMotion ? 0.01 : 1,
        stagger: 0.1,
      })
      .to(".hero-meta", { opacity: 1, y: 0, duration: 0.7 }, "-=0.6")
      .from(".tile", {
        opacity: 0,
        y: 40,
        duration: prefersReducedMotion ? 0.01 : 0.9,
        stagger: 0.06,
      }, "-=0.7");

    gsap.set(".hero-meta", { y: 16 });
  }

  /* ----------------------------------------------------------
     Scroll reveals + counters
     ---------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".reveal-up").forEach(function (el) {
      if (el.closest(".hero")) return; // hero handled by intro timeline
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
        }
      );
    });

    // Counters
    document.querySelectorAll("[data-counter]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(obj.val); },
          });
        },
      });
    });

    // Header shadow on scroll
    ScrollTrigger.create({
      start: 10,
      onUpdate: function (self) {
        var header = document.getElementById("siteHeader");
        header.style.boxShadow = self.scroll() > 10 ? "0 1px 0 rgba(0,0,0,0.08)" : "none";
      },
    });
  } else {
    document.querySelectorAll(".reveal-up").forEach(function (el) { el.style.opacity = "1"; el.style.transform = "none"; });
  }

  /* ----------------------------------------------------------
     Service row -> floating preview image follows cursor
     ---------------------------------------------------------- */
  var preview = document.getElementById("servicePreview");
  var previewMedia = preview ? preview.querySelector(".service-preview-media") : null;
  if (preview && isFinePointer && window.gsap) {
    var previewX = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3.out" });
    var previewY = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3.out" });

    document.querySelectorAll(".service-row").forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        previewMedia.className = "service-preview-media " + row.getAttribute("data-preview");
        preview.classList.add("is-visible");
      });
      row.addEventListener("mouseleave", function () {
        preview.classList.remove("is-visible");
      });
    });

    window.addEventListener("mousemove", function (e) {
      previewX(e.clientX);
      previewY(e.clientY);
    });
  }

  /* ----------------------------------------------------------
     Magnetic button
     ---------------------------------------------------------- */
  var magneticBtn = document.getElementById("magneticCta");
  if (magneticBtn && isFinePointer && window.gsap && !prefersReducedMotion) {
    var inner = magneticBtn.querySelector(".magnetic-btn-inner");
    var btnX = gsap.quickTo(magneticBtn, "x", { duration: 0.5, ease: "power3.out" });
    var btnY = gsap.quickTo(magneticBtn, "y", { duration: 0.5, ease: "power3.out" });
    var innerX = gsap.quickTo(inner, "x", { duration: 0.5, ease: "power3.out" });
    var innerY = gsap.quickTo(inner, "y", { duration: 0.5, ease: "power3.out" });

    magneticBtn.addEventListener("mousemove", function (e) {
      var rect = magneticBtn.getBoundingClientRect();
      var relX = e.clientX - rect.left - rect.width / 2;
      var relY = e.clientY - rect.top - rect.height / 2;
      btnX(relX * 0.3);
      btnY(relY * 0.3);
      innerX(relX * 0.5);
      innerY(relY * 0.5);
    });
    magneticBtn.addEventListener("mouseleave", function () {
      btnX(0); btnY(0); innerX(0); innerY(0);
    });
  }
})();
