/* Shared app behaviour: bottom sheets, password reveal, toasts, small helpers. */

/* ---------------------------------------------------------------------------
   Storage shim. The prototype is distributed as a zipped folder, so it gets
   opened from file:// and from inside an iframe — both of which can have
   Web Storage denied outright. When that happens we fall back to a JSON bag
   parked in window.name, which survives navigation inside the same tab and is
   not subject to origin rules. Everything the app persists is throwaway demo
   state, so tab-scoped is good enough.
--------------------------------------------------------------------------- */
window.ESA_STORE = (function () {
  function probe(kind) {
    try {
      var s = window[kind], k = "__esa_probe";
      s.setItem(k, "1"); s.removeItem(k);
      return s;
    } catch (e) { return null; }
  }
  var PREFIX = "ESA:";
  function bag() {
    try {
      if (window.name.indexOf(PREFIX) === 0) {
        return JSON.parse(window.name.slice(PREFIX.length)) || {};
      }
    } catch (e) {}
    return {};
  }
  function flush(o) { try { window.name = PREFIX + JSON.stringify(o); } catch (e) {} }

  function shim(kind, ns) {
    var native = probe(kind);
    return {
      native: !!native,
      get: function (k) {
        if (native) { try { return native.getItem(k); } catch (e) {} }
        var v = bag()[ns + k];
        return v === undefined ? null : v;
      },
      set: function (k, v) {
        if (native) { try { native.setItem(k, v); return; } catch (e) {} }
        var o = bag(); o[ns + k] = String(v); flush(o);
      },
      remove: function (k) {
        if (native) { try { native.removeItem(k); return; } catch (e) {} }
        var o = bag(); delete o[ns + k]; flush(o);
      },
      json: function (k) {
        try { return JSON.parse(this.get(k)); } catch (e) { return null; }
      }
    };
  }

  var local = shim("localStorage", "L:");
  var session = shim("sessionStorage", "S:");
  return {
    local: local,
    session: session,
    clear: function () {
      try { window.localStorage.clear(); } catch (e) {}
      try { window.sessionStorage.clear(); } catch (e) {}
      flush({});
    }
  };
})();


/* ?reset=1 wipes the fake session, booking overrides and splash flag, then
   reloads without the param — lets a reviewer replay the journey cold.
   Kept outside the ESA module so it runs before anything reads storage. */
(function () {
  if (window.location.search.indexOf("reset=1") === -1) return;
  window.ESA_STORE.clear();
  window.location.replace(window.location.pathname);
})();

window.ESA = (function () {
  "use strict";

  var cur = (window.ESA_MARKET && window.ESA_MARKET.currency) || "S$";

  function money(n) { return cur + n; }

  function strip(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent;
  }

  function stars(rating) {
    var full = Math.round(rating);
    var out = "";
    for (var i = 0; i < 5; i++) out += i < full ? "&#9733;" : "&#9734;";
    return out;
  }

  /* ---- session (stand-in for a real auth token) ---------------------- */
  var KEY = "esa_session";

  function session() {
    return window.ESA_STORE.local.json(KEY);
  }
  function signIn(user) {
    window.ESA_STORE.local.set(KEY, JSON.stringify(user));
  }
  function signOut() {
    window.ESA_STORE.local.remove(KEY);
  }
  /* Where an auth-gated tap should return to once the user is signed in. */
  function loginUrl() {
    return "login.html?next=" + encodeURIComponent(window.location.pathname.split("/").pop() +
                                                   window.location.search);
  }
  /* ---- step indicator -------------------------------------------------- */
  /* Team review: multi-step flows should show progress, so the customer knows
     they are part of a process rather than facing an isolated form. */
  function steps(current, total) {
    var bars = "";
    for (var i = 1; i <= total; i++) bars += '<i' + (i <= current ? ' class="on"' : '') + '></i>';
    return '<div class="steps" role="status" aria-label="Step ' + current + ' of ' + total + '">' +
      bars + '<span>Step ' + current + ' of ' + total + '</span></div>';
  }

  /* ---- page fade fallback ---------------------------------------------- */
  /* Only engages where the browser cannot do a cross-document transition for
     us, so the two never stack into a double fade. */
  (function () {
    var nativeVT = !!document.startViewTransition && window.location.protocol !== "file:";
    /* ?fade=js forces this path on so it can be checked without a file:// build */
    if (nativeVT && window.location.search.indexOf("fade=js") === -1) return;
    var root = document.documentElement;
    root.classList.add("esa-pagefade");

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.hasAttribute("download")) return;
      if (a.target && a.target !== "_self") return;

      var url;
      try { url = new URL(a.href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;
      /* in-page anchors and pure hash changes keep their default behaviour */
      if (url.hash && url.pathname === window.location.pathname &&
          url.search === window.location.search) return;

      e.preventDefault();
      root.classList.add("esa-leaving");
      var href = a.href;
      window.setTimeout(function () { window.location.href = href; }, 150);
    });
  })();

  /* ---- brand splash ---------------------------------------------------- */
  var splash = document.getElementById("splash");
  if (splash) {
    if (window.ESA_STORE.session.get("esa_splash_seen")) {
      splash.remove();
    } else {
      window.ESA_STORE.session.set("esa_splash_seen", "1");
      window.setTimeout(function () {
        splash.classList.add("gone");
        window.setTimeout(function () { if (splash.parentNode) splash.remove(); }, 360);
      }, 800);
    }
  }

  /* ---- screen motion --------------------------------------------------- */
  /* Most screens render their content from JS, so rather than touching every
     renderer this watches the app subtree and animates whatever appears. */
  var ANIM = [
    ".home-top > *", ".notif-banner", ".unit-card", ".sect-head", ".hscroll > *",
    ".quick > a", ".acct-rows > *", ".rows > *", ".grp", ".bk-head", ".alert-bar",
    ".preset", ".item", ".result", ".wall-perks > li", ".fac-head > *", ".actions > *",
    ".id-card", ".prof-actions", ".est-intro > *", ".seg", ".kv .r", ".amen span",
    ".wall-preview", ".notif-item", ".inv"
  ];
  var POP = { ".result": "pop", ".unit-card": "pop", ".wall-preview": "pop" };
  var DOWN = { ".notif-banner": "down", ".alert-bar": "down" };

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Checked per pass, not once at load: a page that starts in a background tab
     should still animate when the customer actually looks at it, and should
     never be left at opacity 0 in the meantime. */
  function canAnimate() {
    return !!window.IntersectionObserver && !reduce && !document.hidden;
  }

  var io = !!window.IntersectionObserver && !reduce
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("esa-in");
          io.unobserve(e.target);
        });
      }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" })
    : null;

  /* `instant` drops the animation altogether — used by the failsafe, because an
     animation that has started but never advanced holds its opacity:0 keyframe. */
  function play(el, instant) {
    el.classList.add("esa-in");
    if (instant) el.style.animation = "none";
    if (io) io.unobserve(el);
  }

  /* belt and braces: anything still hidden shortly after tagging is shown */
  var failsafe = null;
  function armFailsafe() {
    window.clearTimeout(failsafe);
    failsafe = window.setTimeout(function () {
      document.querySelectorAll(".esa-anim:not(.esa-in)").forEach(function (el) {
        play(el, true);
      });
    }, 600);
  }

  function animate(root, force) {
    root = root || document;
    if (!force && !canAnimate()) return;
    ANIM.forEach(function (sel) {
      var nodes = root.querySelectorAll ? root.querySelectorAll(sel) : [];
      var perParent = new Map();
      Array.prototype.forEach.call(nodes, function (el) {
        if (el.dataset.esaAnim) return;
        el.dataset.esaAnim = "1";
        var n = Math.min(perParent.get(el.parentNode) || 0, 9);
        perParent.set(el.parentNode, n + 1);
        if (POP[sel]) el.setAttribute("data-anim", POP[sel]);
        if (DOWN[sel]) el.setAttribute("data-anim", DOWN[sel]);
        el.classList.add("esa-anim");

        /* Play synchronously when it is already on screen. rAF is unreliable
           here — it does not fire in a page that is not being rendered, which
           would leave the element stuck at opacity 0. A zero-sized rect means
           we cannot tell, so assume visible and play. */
        var r = el.getBoundingClientRect();
        var unknown = r.width === 0 && r.height === 0;
        var onScreen = unknown ||
          (r.bottom > -40 && r.top < (window.innerHeight || 812) + 40);
        /* stagger with setTimeout — it fires even when the page is not being
           rendered, unlike rAF or an animation-delay */
        if (onScreen) window.setTimeout(function () { play(el); }, n * 55);
        else io.observe(el);
      });
    });
    armFailsafe();
  }

  function bump(el) {
    if (!el) return;
    el.classList.remove("bumped");
    void el.offsetWidth;
    el.classList.add("bumped");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { animate(document); });
  } else {
    animate(document);
  }

  /* if the app was opened in a background tab, animate once it is looked at */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) animate(document);
  });

  /* catch anything rendered later — filter changes, sheet contents, step swaps */
  var host = document.querySelector(".app");
  if (host && window.MutationObserver) {
    var pending = null;
    new MutationObserver(function () {
      window.clearTimeout(pending);
      pending = window.setTimeout(function () { animate(document); }, 40);
    }).observe(host, { childList: true, subtree: true });
  }

  /* ---- imagery -------------------------------------------------------- */
  /* Real photography sits inside .photo; the CSS gradient underneath shows
     while the image loads and if it ever 404s. */
  function photo(src, tone, inner, alt) {
    return '<span class="photo ' + (tone || "") + '"' + (alt ? '' : ' aria-hidden="true"') + '>' +
      (src ? '<img src="' + src + '" alt="' + (alt || "") + '" loading="lazy">' : "") +
      (inner || "") + '</span>';
  }

  /* ---- inventory helpers --------------------------------------------- */
  function hasCat(f, cat) {
    return f.units.some(function (u) { return u.cat === cat; });
  }
  /* Nearest facility that stocks `cat`, so a filter never dead-ends. */
  function nearestWith(cat, excludeId) {
    return (window.ESA_FACILITIES || [])
      .filter(function (f) { return f.id !== excludeId && hasCat(f, cat); })
      .sort(function (a, b) { return a.distance - b.distance; })[0] || null;
  }
  function fromPriceFor(f, cat) {
    var us = f.units.filter(function (u) { return !cat || u.cat === cat; });
    return us.length ? Math.min.apply(null, us.map(function (u) { return u.price; })) : null;
  }

  /* ---- bottom sheet -------------------------------------------------- */
  function sheet(id) {
    var el = document.getElementById(id);
    var backdrop = document.getElementById(id + "-backdrop");
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      el.classList.add("open");
      el.setAttribute("aria-hidden", "false");
      if (backdrop) backdrop.classList.add("open");
      var f = el.querySelector("input, button, [tabindex]");
      if (f) f.focus({ preventScroll: true });
    }
    function close() {
      el.classList.remove("open");
      el.setAttribute("aria-hidden", "true");
      if (backdrop) backdrop.classList.remove("open");
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }
    if (backdrop) backdrop.addEventListener("click", close);
    el.querySelectorAll("[data-sheet-close]").forEach(function (b) {
      b.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && el.classList.contains("open")) close();
    });
    return { open: open, close: close, el: el };
  }

  /* ---- toast --------------------------------------------------------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      (document.querySelector(".app") || document.body).appendChild(toastEl);
    }
    toastEl.innerHTML = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }

  /* ---- password reveal ----------------------------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-reveal]");
    if (!btn) return;
    var input = document.getElementById(btn.getAttribute("data-reveal"));
    if (!input) return;
    var hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    btn.textContent = hidden ? "Hide" : "Show";
    btn.setAttribute("aria-label", (hidden ? "Hide" : "Show") + " password");
  });

  /* ---- field validation ---------------------------------------------- */
  function checkField(input) {
    var wrap = input.closest(".field");
    var ok = input.checkValidity() && input.value.trim() !== "";
    if (wrap) wrap.classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  function validate(form) {
    var firstBad = null;
    form.querySelectorAll("input[required]:not([type=checkbox]), select[required]").forEach(function (input) {
      if (!checkField(input) && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  document.addEventListener("input", function (e) {
    var f = e.target.closest(".field.has-error");
    if (f && e.target.matches("input, select")) checkField(e.target);
  });

  return { money: money, strip: strip, stars: stars, sheet: sheet, toast: toast,
           validate: validate, checkField: checkField, currency: cur,
           session: session, signIn: signIn, signOut: signOut, loginUrl: loginUrl,
           hasCat: hasCat, nearestWith: nearestWith, fromPriceFor: fromPriceFor,
           photo: photo, animate: animate, bump: bump, steps: steps };
})();
