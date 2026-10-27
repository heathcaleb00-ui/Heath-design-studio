/* Heath Design Studio — site behavior
   - Mobile navigation, header state, current-section highlighting
   - Reveal on scroll (skipped for reduced motion)
   - "The Experience" live demos: viewport readout, keyboard detection, load time, compare slider
   - Quote form: plan preselect, redesign-only field, accessible validation, Netlify AJAX submit
*/
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CONTACT_EMAIL = "heathcaleb00@gmail.com";
  var CONTACT_TEL = "+12149942239";
  var CONTACT_TEL_DISPLAY = "(214) 994-2239";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (mq) {
      if (mq.matches) setNav(false);
    });
  }

  /* ---------- Header state ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Current section in nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sectionMap = { services: "#services", about: "#about", pricing: "#pricing", faq: "#faq", quote: "#quote" };

  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var href = sectionMap[entry.target.id];
          navLinks.forEach(function (link) {
            if (link.getAttribute("href") === href) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    Object.keys(sectionMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Demo: live viewport readout ---------- */
  var vwOut = document.querySelector("[data-vw]");
  var layoutOut = document.querySelector("[data-layout]");
  var devices = document.querySelectorAll("[data-device]");
  var lastDevice = "";

  function updateViewport() {
    if (!vwOut) return;
    var w = document.documentElement.clientWidth;
    var device = w < 720 ? "mobile" : w < 1080 ? "tablet" : "desktop";
    vwOut.textContent = w + "px";
    if (device !== lastDevice) {
      lastDevice = device;
      layoutOut.textContent = { mobile: "Phone layout", tablet: "Tablet layout", desktop: "Desktop layout" }[device];
      devices.forEach(function (d) { d.classList.toggle("is-active", d.getAttribute("data-device") === device); });
    }
  }
  var resizeFrame;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateViewport);
  });
  updateViewport();

  /* ---------- Demo: keyboard detection ---------- */
  var kbdStatus = document.querySelector("[data-kbd-status]");
  var kbdText = document.querySelector("[data-kbd-text]");
  if (kbdStatus) {
    document.addEventListener("keydown", function onFirstTab(e) {
      if (e.key !== "Tab") return;
      kbdStatus.classList.add("is-on");
      kbdText.textContent = "Keyboard navigation detected. Keep tabbing.";
      document.removeEventListener("keydown", onFirstTab);
    });
  }

  /* ---------- Demo: real page load time ---------- */
  var loadEl = document.querySelector("[data-load-time]");
  if (loadEl && window.performance && performance.getEntriesByType) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        var nav = performance.getEntriesByType("navigation")[0];
        if (!nav || !nav.loadEventEnd) return;
        var secs = (nav.loadEventEnd / 1000).toFixed(2);
        loadEl.querySelector("span:last-child").textContent = "Loaded in " + secs + "s on your connection";
        loadEl.hidden = false;
      }, 0);
    });
  }

  /* ---------- Demo: before/after compare ---------- */
  var compare = document.querySelector(".compare");
  var range = document.getElementById("compare-range");
  if (compare && range) {
    var setPos = function () {
      compare.style.setProperty("--pos", range.value + "%");
      range.setAttribute("aria-valuetext", range.value + "% basic layout shown");
    };
    range.addEventListener("input", setPos);
    setPos();
  }

  /* ---------- Quote form ---------- */
  var form = document.getElementById("quote-form");
  var typeSelect = document.getElementById("f-type");
  var budgetSelect = document.getElementById("f-budget");
  var currentField = document.getElementById("current-site-field");

  // Redesign-only field
  function syncCurrentSite() {
    if (currentField && typeSelect) currentField.hidden = typeSelect.value !== "Website redesign";
  }
  if (typeSelect) {
    typeSelect.addEventListener("change", syncCurrentSite);
    syncCurrentSite();
  }

  // Pricing buttons preselect project type + budget (never overwrite a user's choice)
  document.querySelectorAll("[data-project]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (typeSelect && !typeSelect.value) typeSelect.value = btn.getAttribute("data-project");
      var b = btn.getAttribute("data-budget");
      if (budgetSelect && b && !budgetSelect.value) budgetSelect.value = b;
      syncCurrentSite();
    });
  });

  if (form) initForm(form);

  function initForm(form) {
    var summary = document.getElementById("form-summary");
    var success = document.getElementById("form-success");
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn.querySelector(".btn__label");
    var defaultLabel = submitLabel.textContent;

    // JS takes over validation; without JS the browser's native validation still applies.
    form.setAttribute("novalidate", "");

    var rules = {
      name: function (v) { return v ? "" : "Please enter your name."; },
      email: function (v) {
        if (!v) return "Please enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Please enter a valid email address, like name@business.com.";
      },
      project_type: function (v) { return v ? "" : "Please choose the type of project."; },
      budget: function (v) { return v ? "" : "Please choose an approximate budget, or “Not sure yet”."; },
      message: function (v) {
        if (!v) return "Please add a short description of your project.";
        return v.length < 10 ? "Please add a little more detail (at least 10 characters)." : "";
      }
    };

    function check(field) {
      var rule = rules[field.name];
      if (!rule) return "";
      var msg = rule(field.value.trim());
      var wrap = field.closest(".field");
      var err = wrap && wrap.querySelector(".field__error span");
      wrap.classList.toggle("has-error", !!msg);
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return msg;
    }

    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      var touched = false;
      field.addEventListener("blur", function () {
        if (field.value.trim()) touched = true;
        if (touched) check(field);
      });
      field.addEventListener(field.tagName === "SELECT" ? "change" : "input", function () {
        if (touched || field.getAttribute("aria-invalid") === "true") check(field);
      });
    });

    function showSummary(html) {
      summary.innerHTML = html;
      summary.classList.add("is-visible");
      summary.focus();
    }
    function hideSummary() {
      summary.classList.remove("is-visible");
      summary.innerHTML = "";
    }
    function setBusy(busy) {
      submitBtn.disabled = busy;
      submitLabel.textContent = busy ? "Sending…" : defaultLabel;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideSummary();

      var errors = [];
      Object.keys(rules).forEach(function (name) {
        var field = form.elements[name];
        var msg = field && check(field);
        if (msg) errors.push({ id: field.id, msg: msg });
      });

      if (errors.length) {
        var items = errors.map(function (er) {
          return '<li><a class="link" href="#' + er.id + '">' + er.msg + "</a></li>";
        }).join("");
        showSummary(
          "<strong>Please fix " + (errors.length === 1 ? "1 field" : errors.length + " fields") +
          ' before sending:</strong><ul style="margin-top:.5rem;display:grid;gap:.25rem">' + items + "</ul>"
        );
        return;
      }

      setBusy(true);
      var body = new URLSearchParams(new FormData(form)).toString();

      // Netlify Forms accepts url-encoded POSTs to "/" on a static site.
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Status " + res.status);
          form.hidden = true;
          success.classList.add("is-visible");
          success.focus();
        })
        .catch(function () {
          setBusy(false);
          showSummary(
            "<strong>Your request couldn't be sent.</strong> Please try again in a moment, or email " +
            '<a class="link" href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + "</a> or call " +
            '<a class="link" href="tel:' + CONTACT_TEL + '">' + CONTACT_TEL_DISPLAY + "</a>. Nothing you entered has been lost."
          );
        });
    });

    // Error-summary links move focus to the field, not just scroll.
    summary.addEventListener("click", function (e) {
      var a = e.target.closest("a[href^='#']");
      if (!a) return;
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (target) { e.preventDefault(); target.focus(); }
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
