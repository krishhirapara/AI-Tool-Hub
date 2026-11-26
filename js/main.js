/* =========================================================
   AI ToolHub - main.js
   ALL interactivity lives here. Sections:
    1. Helpers
    2. Dark / light mode
    3. Mobile menu
    4. Highlight current page link
    5. Footer year
    6. Back to top button
    7. Search forms (homepage + 404 page)
    8. Tool card builder
    9. Homepage sections (categories, featured, latest)
   10. Tools page (search, filters, sorting, URL sync)
   11. "Similar tools" on review pages
   12. Forms (validation + newsletter)

   How pages connect to this file:
   - <body data-base=""> on main-folder pages, "../" in /tools/ and /blog/
   - <body data-page="home|tools|blog|about|contact">
   - <body data-tool="slug"> on tool review pages
   ========================================================= */
(function () {
  "use strict";

  // Keep ratings hidden until I have tested the tools.
  var SHOW_RATINGS = false;

  /* ---------- 1. HELPERS ---------- */
  var BASE = document.body.getAttribute("data-base") || "";   // path prefix for links/images
  var TOOLS = window.TOOLS_DATA || [];
  var CATEGORIES = window.TOOL_CATEGORIES || [];

  function $(selector, parent) { return (parent || document).querySelector(selector); }
  function $all(selector, parent) { return Array.prototype.slice.call((parent || document).querySelectorAll(selector)); }

  // Makes text safe to put inside HTML
  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 2. DARK / LIGHT MODE ----------
     The first choice is set by a tiny inline script in each page's <head>
     (so there is no flash). This code handles the button click. */
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) { /* storage blocked: ignore */ }
    var btn = $("#theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function initTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current);                       // sync button labels
    var btn = $("#theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var now = document.documentElement.getAttribute("data-theme");
        setTheme(now === "dark" ? "light" : "dark");
      });
    }
  }

  /* ---------- 3. MOBILE MENU ---------- */
  function initMenu() {
    var button = $("#menu-toggle");
    var nav = $("#site-nav");
    if (!button || !nav) return;

    function closeMenu() {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    }

    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close when a link is clicked
    $all("a", nav).forEach(function (link) { link.addEventListener("click", closeMenu); });

    // Close with the Escape key and return focus to the button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        button.focus();
      }
    });

    // Close if the window becomes wide (desktop layout)
    window.addEventListener("resize", function () { if (window.innerWidth > 767) closeMenu(); });
  }

  /* ---------- 4. HIGHLIGHT CURRENT PAGE LINK ---------- */
  function initCurrentLink() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    $all("#site-nav a[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  /* ---------- 5. FOOTER YEAR ---------- */
  function initYear() {
    $all(".js-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- SCROLL FEEDBACK ---------- */
  function initScrollFeedback() {
    var header = $(".site-header");
    var progress = null;
    if (document.body.getAttribute("data-page") === "blog") {
      progress = document.createElement("div");
      progress.className = "reading-progress";
      progress.setAttribute("role", "progressbar");
      progress.setAttribute("aria-label", "Article reading progress");
      progress.setAttribute("aria-valuemin", "0");
      progress.setAttribute("aria-valuemax", "100");
      progress.setAttribute("aria-valuenow", "0");
      progress.innerHTML = '<span></span>';
      document.body.appendChild(progress);
    }
    var scheduled = false;
    function update() {
      scheduled = false;
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var value = max > 0 ? Math.min(100, Math.max(0, Math.round(y / max * 100))) : 100;
        progress.style.setProperty("--reading-progress", String(value / 100));
        progress.setAttribute("aria-valuenow", String(value));
      }
    }
    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* ---------- 6. BACK TO TOP BUTTON ---------- */
  function initBackToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    function toggle() { btn.classList.toggle("is-visible", window.scrollY > 400); }
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
    btn.addEventListener("click", function () { window.scrollTo({ top: 0 }); });  // smooth via CSS
  }

  /* ---------- 7. SEARCH FORMS (homepage hero + 404 page) ----------
     Any <form data-search-form> sends the visitor to tools.html?q=... */
  function initSearchForms() {
    $all("form[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("input", form);
        var q = input ? input.value.trim() : "";
        window.location.href = BASE + "tools.html" + (q ? "?q=" + encodeURIComponent(q) : "");
      });
    });
  }

  /* ---------- 8. TOOL CARD BUILDER ---------- */
  function toolCard(tool) {
    var priceClass = "badge--" + tool.pricingType.toLowerCase();
    var reviewUrl = BASE + "tools/" + tool.slug + ".html";
    return (
      '<article class="card tool-card">' +
        '<div class="tool-card__top">' +
          '<img class="tool-logo" src="' + BASE + "images/tools/" + tool.slug + '.png" alt="' + esc(tool.name) + ' logo" width="48" height="48" loading="lazy">' +
          "<div>" +
            '<h3 class="tool-card__name"><a href="' + reviewUrl + '">' + esc(tool.name) + "</a></h3>" +
            '<div class="badges">' +
              '<span class="badge badge--cat">' + esc(tool.category) + "</span>" +
              '<span class="badge ' + priceClass + '">' + esc(tool.pricingType) + "</span>" +
            "</div>" +
          "</div>" +
        "</div>" +
        "<p>" + esc(tool.shortDescription) + "</p>" +
        (tool.strength ? '<p class="tool-card__strength"><strong>Best at:</strong> ' + esc(tool.strength) + '</p>' : "") +
        (SHOW_RATINGS ? '<p class="rating" aria-label="Editor\'s rating ' + tool.rating.toFixed(1) + ' out of 5">&#9733; ' + tool.rating.toFixed(1) + ' <span>Editor\'s rating</span></p>' : "") +
        '<div class="card__actions">' +
          '<a class="btn btn--primary btn--sm" href="' + reviewUrl + '">Read review</a>' +
          '<a class="btn btn--ghost btn--sm" href="' + esc(tool.affiliateUrl) + '" target="_blank" rel="sponsored noopener noreferrer">Visit site<span class="visually-hidden"> (opens in a new tab)</span></a>' +
        "</div>" +
      "</article>"
    );
  }

  function renderCards(container, list) {
    container.innerHTML = list.map(toolCard).join("");
    container.classList.remove("cards-updating");
    void container.offsetWidth;
    container.classList.add("cards-updating");
  }

  /* ---------- 9. HOMEPAGE SECTIONS ---------- */
  function initHome() {
    // Category cards with live counts
    var catGrid = $("#category-grid");
    if (catGrid) {
      catGrid.innerHTML = CATEGORIES.map(function (cat) {
        var count = TOOLS.filter(function (t) { return t.category === cat.name; }).length;
        return (
          '<a class="card category-card" href="' + BASE + "tools.html?category=" + encodeURIComponent(cat.name) + '">' +
            '<div class="category-card__icon" aria-hidden="true">' + cat.icon + "</div>" +
            "<h3>" + esc(cat.name) + "</h3>" +
            "<p>" + esc(cat.description) + "</p>" +
            '<span class="count" data-count="' + count + '" data-count-label="' + (count === 1 ? " tool" : " tools") + '">' + count + (count === 1 ? " tool" : " tools") + "</span>" +
          "</a>"
        );
      }).join("");
    }

    // Featured tools (featured = true), best rated first
    var featuredGrid = $("#featured-grid");
    if (featuredGrid) {
      var featured = TOOLS.filter(function (t) { return t.featured; })
        .sort(function (a, b) { return SHOW_RATINGS ? b.rating - a.rating : a.name.localeCompare(b.name); });
      renderCards(featuredGrid, featured);
    }

    // Latest added: newest dateAdded first, show 4
    var latestGrid = $("#latest-grid");
    if (latestGrid) {
      var latest = TOOLS.slice().sort(function (a, b) {
        return b.dateAdded < a.dateAdded ? -1 : b.dateAdded > a.dateAdded ? 1 : 0;
      }).slice(0, 4);
      renderCards(latestGrid, latest);
    }
  }

  /* ---------- 10. TOOLS PAGE ---------- */
  function initToolsPage() {
    var grid = $("#tools-grid");
    if (!grid) return;

    var searchInput = $("#search-input");
    var searchForm = $("#tools-search-form");
    var catBox = $("#category-filters");
    var priceBox = $("#price-filters");
    var sortSelect = $("#sort-select");
    var clearBtn = $("#clear-filters");
    var noResults = $("#no-results");
    var noResultsClear = $("#no-results-clear");
    var countEl = $("#results-count");

    var PRICES = ["All", "Free", "Freemium", "Paid"];
    var DEFAULTS = { q: "", category: "All", price: "All", sort: "az" };
    var SORTS = SHOW_RATINGS ? ["az", "za", "newest", "rating"] : ["az", "za", "newest"];
    var state = { q: "", category: "All", price: "All", sort: "az" };

    // Build filter buttons from data
    function buildButtons(box, values, group) {
      box.innerHTML = values.map(function (v) {
        return '<button type="button" class="filter-btn" data-group="' + group + '" data-value="' + esc(v) + '" aria-pressed="false">' + esc(v) + "</button>";
      }).join("");
    }
    buildButtons(catBox, ["All"].concat(CATEGORIES.map(function (c) { return c.name; })), "category");
    buildButtons(priceBox, PRICES, "price");

    // Read the URL (?q= ?category= ?price= ?sort=) into state, checking values are valid
    function readUrl() {
      var p = new URLSearchParams(window.location.search);
      var cat = p.get("category") || DEFAULTS.category;
      var price = p.get("price") || DEFAULTS.price;
      var sort = p.get("sort") || DEFAULTS.sort;
      var validCat = cat === "All" || CATEGORIES.some(function (c) { return c.name === cat; });
      state.q = (p.get("q") || "").trim();
      state.category = validCat ? cat : DEFAULTS.category;
      state.price = PRICES.indexOf(price) > -1 ? price : DEFAULTS.price;
      state.sort = SORTS.indexOf(sort) > -1 ? sort : DEFAULTS.sort;
    }

    // Write state to the URL. push = true adds a Back-button step.
    function writeUrl(push) {
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q);
      if (state.category !== DEFAULTS.category) p.set("category", state.category);
      if (state.price !== DEFAULTS.price) p.set("price", state.price);
      if (state.sort !== DEFAULTS.sort) p.set("sort", state.sort);
      var qs = p.toString();
      var url = window.location.pathname + (qs ? "?" + qs : "");
      try {
        if (push) history.pushState(null, "", url);
        else history.replaceState(null, "", url);
      } catch (e) { /* some browsers block this on file:// pages: the filters still work */ }
    }

    function matchesSearch(tool, q) {
      if (!q) return true;
      var words = q.toLowerCase().split(/\s+/);
      var haystack = (tool.name + " " + tool.category + " " + tool.shortDescription + " " +
                      tool.longDescription + " " + tool.tags.join(" ") + " " + tool.pricingType).toLowerCase();
      return words.every(function (w) { return haystack.indexOf(w) > -1; });
    }

    function sortList(list) {
      var s = state.sort;
      return list.sort(function (a, b) {
        if (s === "za") return b.name.localeCompare(a.name);
        if (s === "newest") return b.dateAdded < a.dateAdded ? -1 : b.dateAdded > a.dateAdded ? 1 : 0;
        if (s === "rating") return b.rating - a.rating || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);       // "az"
      });
    }

    // Draw everything based on the current state
    function render() {
      var list = TOOLS.filter(function (t) {
        return matchesSearch(t, state.q) &&
               (state.category === "All" || t.category === state.category) &&
               (state.price === "All" || t.pricingType === state.price);
      });
      list = sortList(list);

      searchInput.value = state.q;
      sortSelect.value = state.sort;
      $all(".filter-btn").forEach(function (b) {
        var group = b.getAttribute("data-group");
        b.setAttribute("aria-pressed", state[group] === b.getAttribute("data-value") ? "true" : "false");
      });

      countEl.textContent = "Showing " + list.length + " of " + TOOLS.length + " tools";
      renderCards(grid, list);
      grid.hidden = list.length === 0;
      noResults.hidden = list.length !== 0;

      var filtersOn = state.q || state.category !== "All" || state.price !== "All" || state.sort !== "az";
      clearBtn.hidden = !filtersOn;
    }

    function clearAll() {
      state.q = DEFAULTS.q; state.category = DEFAULTS.category;
      state.price = DEFAULTS.price; state.sort = DEFAULTS.sort;
      writeUrl(true);
      render();
    }

    // Events
    searchInput.addEventListener("input", function () {
      state.q = searchInput.value.trim();
      writeUrl(false);                 // typing replaces (no Back-button spam)
      render();
    });
    if (searchForm) searchForm.addEventListener("submit", function (e) { e.preventDefault(); });

    [catBox, priceBox].forEach(function (box) {
      box.addEventListener("click", function (e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        state[btn.getAttribute("data-group")] = btn.getAttribute("data-value");
        writeUrl(true);
        render();
      });
    });

    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      writeUrl(true);
      render();
    });

    clearBtn.addEventListener("click", clearAll);
    if (noResultsClear) noResultsClear.addEventListener("click", clearAll);

    // Back / Forward buttons
    window.addEventListener("popstate", function () { readUrl(); render(); });

    readUrl();
    render();
  }

  /* ---------- 11. "SIMILAR TOOLS" ON REVIEW PAGES ----------
     Needs <body data-tool="slug"> and <div id="similar-tools"></div> */
  function initSimilarTools() {
    var box = $("#similar-tools");
    var slug = document.body.getAttribute("data-tool");
    if (!box || !slug) return;
    var current = TOOLS.filter(function (t) { return t.slug === slug; })[0];
    if (!current) return;
    if (current.strength) {
      var prose = $(".prose");
      if (prose && !$(".tool-strength", prose)) {
        var strength = document.createElement("p");
        strength.className = "callout tool-strength";
        strength.innerHTML = "<strong>Best at:</strong> " + esc(current.strength);
        prose.insertBefore(strength, prose.firstChild);
      }
    }
    var similar = current.similar.map(function (s) {
      return TOOLS.filter(function (t) { return t.slug === s; })[0];
    }).filter(Boolean);
    if (similar.length) renderCards(box, similar);
  }

  /* ---------- 12. FORMS (validation + submissions) ----------
     Each enhanced form needs:
       - each field: an id, and a <p class="field-error" id="FIELDID-error">
       - a <div class="form-status" role="status" aria-live="polite" hidden>
     Field rules come from attributes: required, type="email", minlength. */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateField(field) {
    var value = field.value.trim();
    var message = "";
    var label = field.getAttribute("data-label") || "This field";

    if (field.required && !value) {
      message = label + " is required.";
    } else if (field.type === "email" && value && !EMAIL_RE.test(value)) {
      message = "Please enter a valid email address, like name@example.com.";
    } else if (field.getAttribute("minlength") && value && value.length < parseInt(field.getAttribute("minlength"), 10)) {
      message = label + " should be at least " + field.getAttribute("minlength") + " characters.";
    }

    var errorEl = document.getElementById(field.id + "-error");
    if (errorEl) errorEl.textContent = message;
    if (message) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", field.id + "-error");
    } else {
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
    }
    return !message;
  }

  function showStatus(form, type, text) {
    var status = $(".form-status", form);
    if (!status) return;
    status.hidden = false;
    status.className = "form-status form-status--" + type;
    status.setAttribute("role", type === "error" ? "alert" : "status");
    status.textContent = text;
  }

  function initForms() {
    var newsletterHook = "data-" + "net" + "lify-form";
    $all("form[" + newsletterHook + "], form[data-contact-form]").forEach(function (form) {
      var isContactForm = form.hasAttribute("data-contact-form");
      form.setAttribute("novalidate", "novalidate");       // we show our own messages
      var fields = $all("input:not([type=hidden]):not([name=bot-field]):not([name=botcheck]), select, textarea", form);

      // Re-check a field when the visitor leaves it
      fields.forEach(function (f) {
        f.addEventListener("blur", function () { validateField(f); });
        f.addEventListener("input", function () { if (f.getAttribute("aria-invalid")) validateField(f); });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var allGood = true;
        var firstBad = null;
        fields.forEach(function (f) {
          if (!validateField(f)) { allGood = false; if (!firstBad) firstBad = f; }
        });
        if (!allGood) {
          showStatus(form, "error", "Please fix the highlighted fields and try again.");
          if (firstBad) firstBad.focus();
          return;
        }

        if (isContactForm) {
          var contactTrap = form.elements.botcheck;
          if (contactTrap && contactTrap.checked) return;

          var contactSubmitBtn = $("button[type=submit]", form);
          if (contactSubmitBtn) contactSubmitBtn.disabled = true;
          fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
            .then(function (response) {
              if (!response.ok) throw new Error("Form not accepted");
              return response.json();
            }).then(function (result) {
              if (!result.success) throw new Error("Form not accepted");
              showStatus(form, "success", "Thanks! We'll reply you soon. Please check your main inbox and your spam folder, and mark us as 'Not spam' if needed..");
              form.reset();
            }).catch(function () {
              showStatus(form, "error", "Sorry, something went wrong. Please try again.");
            }).then(function () {
              if (contactSubmitBtn) contactSubmitBtn.disabled = false;
            });
          return;
        }

        // Honeypot: real people never fill it. If it has text, pretend success and do nothing.
        var trap = form.elements["bot-field"];
        if (trap && trap.value) { showStatus(form, "success", "Thank you! Your message has been sent."); form.reset(); return; }

        var submitBtn = $("button[type=submit]", form);
        if (submitBtn) submitBtn.disabled = true;

        // Send the newsletter signup in the background (no page reload)
        var emailField = form.elements.email;
        var emailValue = emailField ? emailField.value.trim().toLowerCase() : "";
        try {
          var lastAttempt = Number(localStorage.getItem("aith_newsletter_last_attempt") || 0);
          if (lastAttempt && Date.now() - lastAttempt < 60000) {
            showStatus(form, "error", "Please wait a minute before trying again.");
            if (submitBtn) submitBtn.disabled = false;
            return;
          }
          localStorage.setItem("aith_newsletter_last_attempt", String(Date.now()));
        } catch (e) { /* Storage may be disabled; continue with submission. */ }
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailValue })
        }).then(function (response) {
          if (response.status !== 200 && response.status !== 201) throw new Error("Form not accepted");
          showStatus(form, "success", form.getAttribute("data-success") || "Thank you! Your message has been sent.");
          form.reset();
        }).catch(function () {
          showStatus(form, "error", "Sorry, we could not sign you up right now. Please try again in a moment.");
        }).then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
      });
    });
  }

  /* ---------- 13. SCROLL REVEAL ----------
     Adds 'reveal' class to page elements, then watches them with
     IntersectionObserver. When each enters the viewport, 'is-visible'
     is toggled as elements enter and leave, so they animate in both
     scroll directions.
     Must be called last so all dynamically rendered cards are in the DOM. */
  function initReveal() {
    if (!window.IntersectionObserver) return;   // graceful fallback
    document.documentElement.classList.add("js-ready");

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function countUp(el) {
      var target = Number(el.getAttribute("data-count"));
      if (!Number.isFinite(target) || el.getAttribute("data-counted") === "true") return;
      el.setAttribute("data-counted", "true");
      if (reducedMotion) return;
      var label = el.getAttribute("data-count-label") || "";
      var start = performance.now();
      el.textContent = "0" + label;
      function frame(now) {
        var progress = Math.min(1, (now - start) / 450);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + label;
        if (progress < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.hasAttribute("data-count")) countUp(entry.target);
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.08 });

    // Landmark / prose elements present on all pages
    $all('.section__head, .tool-hero, .page-title, .prose, .content-block, .faq, .callout').forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });

    $all('.card').forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
    $all('.count[data-count]').forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 14. BUTTON CLICK FADE ----------
     Adds a short fade overlay to every button and button-style link. */
  function initButtonFade() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('button, .btn');
      if (!btn) return;
      var oldFade = $('.button-click-fade', btn);
      if (oldFade) oldFade.remove();
      var fade = document.createElement('span');
      fade.className = 'button-click-fade';
      fade.setAttribute('aria-hidden', 'true');
      btn.appendChild(fade);
      fade.addEventListener('animationend', function () { fade.remove(); });
    });
  }

  /* ---------- START EVERYTHING ---------- */
  initTheme();
  initMenu();
  initCurrentLink();
  initYear();
  initBackToTop();
  initScrollFeedback();
  initSearchForms();
  initHome();
  initToolsPage();
  initSimilarTools();
  initForms();
  initReveal();   // must be last — all dynamic cards must already be in the DOM
  initButtonFade();
})();

/* ---------- 15. PREMIUM MOTION LAYER (vanilla JS) ----------
   Progressive enhancement for the homepage and lightweight pointer feedback.
   Existing navigation, search, filters and form handlers remain the owners of
   those features; this layer only adds presentation and observes form status. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!reduced) root.classList.add("premium-motion");

  function makeSpot(parent, className) {
    var spot = document.createElement("span");
    spot.className = className;
    spot.setAttribute("aria-hidden", "true");
    parent.appendChild(spot);
    return spot;
  }

  function buildMarquee() {
    if (document.body.getAttribute("data-page") !== "home") return;
    var hero = document.querySelector(".hero");
    var tools = (window.TOOLS_DATA || []).slice(0, 10);
    if (!hero || !tools.length) return;
    var base = document.body.getAttribute("data-base") || "";
    var marquee = document.createElement("div");
    marquee.className = "premium-marquee";
    marquee.setAttribute("role", "region");
    marquee.setAttribute("aria-label", "Featured AI tools");
    var track = document.createElement("div");
    track.className = "premium-marquee-track";
    [false, true].forEach(function (copy) {
      var group = document.createElement("div");
      group.className = "premium-marquee-group";
      if (copy) group.setAttribute("aria-hidden", "true");
      group.innerHTML = tools.map(function (tool) {
        var name = String(tool.name).replace(/[&<>\"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; });
        return '<a class="premium-logo-link" href="' + base + 'tools/' + tool.slug + '.html" aria-label="' + name + ' review"' + (copy ? ' tabindex="-1"' : '') + '><img src="' + base + 'images/tools/' + tool.slug + '.png" alt="' + (copy ? '' : name) + '" width="40" height="40" loading="lazy"></a>';
      }).join("");
      track.appendChild(group);
    });
    marquee.appendChild(track);
    hero.appendChild(marquee);
  }

  function prepareHero() {
    var hero = document.querySelector(".hero");
    var title = hero && hero.querySelector("h1");
    if (!hero || !title) return;
    var bg = document.createElement("span");
    bg.className = "premium-hero-bg";
    bg.setAttribute("aria-hidden", "true");
    hero.insertBefore(bg, hero.firstChild);
    if (finePointer) makeSpot(hero, "premium-hero-spotlight");

    var walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    var wordIndex = 0;
    nodes.forEach(function (node) {
      if (!node.nodeValue.trim()) return;
      var fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part.trim()) { fragment.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement("span");
        word.className = "premium-word";
        word.style.setProperty("--word-delay", (wordIndex++ * 38) + "ms");
        word.textContent = part;
        fragment.appendChild(word);
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  var revealObserver = null;
  function initOnceReveals() {
    if (!window.IntersectionObserver) return;
    var cards = document.querySelectorAll(".tool-card, .category-card, .trust-point");
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("premium-reveal", "premium-seen");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    cards.forEach(function (card, index) {
      card.classList.add("premium-reveal");
      card.style.setProperty("--reveal-delay", (index % 4 * 70) + "ms");
      revealObserver.observe(card);
    });
  }

  function initPointerMotion() {
    if (!finePointer || reduced) return;
    var hero = document.querySelector(".hero");
    var heroSpot = hero && hero.querySelector(".premium-hero-spotlight");
    var queued = false, latest = null;
    document.addEventListener("pointermove", function (e) {
      latest = e;
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
      queued = false;
      e = latest;
      if (hero && heroSpot && hero.contains(e.target)) {
        var h = hero.getBoundingClientRect();
        heroSpot.style.transform = "translate3d(" + (e.clientX - h.left - 240) + "px," + (e.clientY - h.top - 240) + "px,0)";
      }
      var card = e.target.closest(".tool-card, .category-card, .trust-point");
      if (card) {
        if (!card.classList.contains("premium-tilt-card")) { card.classList.add("premium-tilt-card"); makeSpot(card, "premium-card-spotlight"); }
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty("--tilt-x", y * -12 + "deg"); card.style.setProperty("--tilt-y", x * 12 + "deg");
        var spot = card.querySelector(".premium-card-spotlight");
        if (spot) spot.style.transform = "translate3d(" + (e.clientX - r.left - 150) + "px," + (e.clientY - r.top - 150) + "px,0)";
      }
      var button = e.target.closest(".btn--primary");
      if (button) {
        var b = button.getBoundingClientRect();
        button.style.setProperty("--mag-x", Math.max(-6, Math.min(6, (e.clientX - b.left - b.width / 2) * .12)) + "px");
        button.style.setProperty("--mag-y", Math.max(-6, Math.min(6, (e.clientY - b.top - b.height / 2) * .12)) + "px");
      }
      });
    }, { passive: true });
    document.addEventListener("pointerout", function (e) {
      var card = e.target.closest(".premium-tilt-card"), button = e.target.closest(".btn--primary");
      if (card && !card.contains(e.relatedTarget)) { card.style.setProperty("--tilt-x", "0deg"); card.style.setProperty("--tilt-y", "0deg"); }
      if (button && !button.contains(e.relatedTarget)) { button.style.setProperty("--mag-x", "0px"); button.style.setProperty("--mag-y", "0px"); }
    });
  }

  function initParallaxAndVisibility() {
    var bg = document.querySelector(".premium-hero-bg");
    var busy = false;
    function update() {
      busy = false;
      if (bg && !document.hidden && !reduced) bg.style.transform = "translate3d(0," + (window.scrollY * 0.2) + "px,0)";
    }
    window.addEventListener("scroll", function () {
      if (busy) return;
      busy = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      root.classList.toggle("premium-paused", document.hidden);
      if (!document.hidden) update();
    });
    root.classList.toggle("premium-paused", document.hidden);
    update();
  }

  function initRipples() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest(".btn");
      if (!button || reduced) return;
      var rect = button.getBoundingClientRect();
      var diameter = Math.max(rect.width, rect.height) * 2;
      var ripple = document.createElement("span");
      ripple.className = "premium-ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.width = diameter + "px";
      ripple.style.height = diameter + "px";
      var x = event.detail ? event.clientX - rect.left - diameter / 2 : rect.width / 2 - diameter / 2;
      var y = event.detail ? event.clientY - rect.top - diameter / 2 : rect.height / 2 - diameter / 2;
      ripple.style.setProperty("--ripple-x", x + "px");
      ripple.style.setProperty("--ripple-y", y + "px");
      button.appendChild(ripple);
      ripple.addEventListener("animationend", function () { ripple.remove(); }, { once: true });
    });
  }

  function fireConfetti() {
    if (reduced) return;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.className = "premium-confetti";
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    document.body.appendChild(canvas);
    ctx.scale(dpr, dpr);
    var colors = ["#C8942A", "#1E3A5F", "#14B8A6", "#F4A261", "#8B7BE8"];
    var parts = Array.from({ length: 54 }, function () {
      return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.38, vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 7 - 2, size: Math.random() * 5 + 3, color: colors[Math.floor(Math.random() * colors.length)] };
    });
    var start = performance.now();
    function draw(now) {
      var age = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.16;
        ctx.globalAlpha = Math.max(0, 1 - age / 1250);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.65);
      });
      if (age < 1250 && !document.hidden) window.requestAnimationFrame(draw);
      else canvas.remove();
    }
    window.requestAnimationFrame(draw);
  }

  function initFormCelebration() {
    var newsletterHook = "data-" + "net" + "lify-form";
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var status = mutation.target;
        if (!status.classList || !status.classList.contains("form-status--success")) return;
        if (/(^|\s)form-status--success(\s|$)/.test(mutation.oldValue || "")) return;
        var form = status.closest("form[" + newsletterHook + "]");
        if (!form || !/^(newsletter|contact)$/.test(form.getAttribute("name"))) return;
        fireConfetti();
      });
    });
    document.querySelectorAll("form[" + newsletterHook + "] .form-status").forEach(function (status) {
      observer.observe(status, { attributes: true, attributeFilter: ["class"], attributeOldValue: true });
    });
  }

  buildMarquee();
  if (reduced) return;
  prepareHero();
  initOnceReveals();
  initPointerMotion();
  initParallaxAndVisibility();
  initRipples();
  initFormCelebration();
})();


