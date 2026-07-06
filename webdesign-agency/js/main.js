(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
     Scroll cue
     ---------------------------------------------------------- */
  var scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var target = document.getElementById("services");
      if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ----------------------------------------------------------
     Motion: GSAP ScrollTrigger reveals
     ---------------------------------------------------------- */
  if (window.gsap && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    var heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    heroTl
      .from(".hero-title .line", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.08 })
      .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
      .to(".hero-actions", { opacity: 1, y: 0, duration: 0.7 }, "-=0.55")
      .to(".hero-stats", { opacity: 1, y: 0, duration: 0.7 }, "-=0.55")
      .from(".hero-card-main", { opacity: 0, y: 24, scale: 0.96, duration: 0.8 }, "-=0.8")
      .from(".hero-card-float", { opacity: 0, y: 24, duration: 0.7 }, "-=0.6")
      .from(".hero-card-bars span", { scaleY: 0, duration: 0.6, stagger: 0.06, ease: "back.out(1.6)" }, "-=0.5");

    gsap.set([".hero-sub", ".hero-actions", ".hero-stats"], { y: 16 });

    // Generic scroll reveals for everything below the hero
    var revealTargets = gsap.utils.toArray(".reveal-up:not(.hero-title .line):not(.hero-sub):not(.hero-actions):not(.hero-stats)");
    revealTargets.forEach(function (el) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Stagger service/process/testimonial cards within their grids
    [".service-grid", ".process-list", ".testimonial-grid"].forEach(function (selector) {
      var grid = document.querySelector(selector);
      if (!grid) return;
      gsap.fromTo(
        grid.children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: grid,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Work grid cards
    var workGrid = document.querySelector(".work-grid");
    if (workGrid) {
      gsap.fromTo(
        workGrid.children,
        { opacity: 0, y: 32, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: workGrid,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Nav background intensifies on scroll
    ScrollTrigger.create({
      start: 40,
      onUpdate: function (self) {
        var header = document.querySelector(".nav-glass");
        if (!header) return;
        header.style.boxShadow = self.progress > 0 || window.scrollY > 40
          ? "0 8px 32px rgba(0,0,0,0.5)"
          : "";
      },
    });
  } else {
    // No motion library or reduced motion: content is already visible via CSS fallback
    document.querySelectorAll(".reveal-up").forEach(function (el) {
      el.style.opacity = "1";
    });
  }

  /* ----------------------------------------------------------
     Contact form (client-side only demo)
     ---------------------------------------------------------- */
  var form = document.getElementById("ctaForm");
  var emailInput = document.getElementById("email");
  var emailError = document.getElementById("emailError");
  var formStatus = document.getElementById("formStatus");

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        field.setAttribute("data-touched", "true");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var emailValid = isValidEmail(emailInput.value.trim());
      emailInput.setAttribute("data-touched", "true");
      if (emailError) emailError.hidden = emailValid;

      if (!form.checkValidity() || !emailValid) {
        formStatus.textContent = "";
        var firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      formStatus.textContent = "Thanks — we'll get back to you within one business day.";
      form.reset();
      form.querySelectorAll("[data-touched]").forEach(function (el) {
        el.removeAttribute("data-touched");
      });
    });
  }
})();
