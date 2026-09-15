/* Size estimator.
   Volumes are modelled in cubic feet: each unit is sized at 8 ft of usable
   stacking height and 70% packing efficiency, so a recommendation is a real
   calculation the sales team can defend — not a picture of a unit. */
(function () {
  "use strict";

  var mode = "home";           /* home | items */
  var preset = null;
  var counts = {};

  var panelHome  = document.getElementById("panel-home");
  var panelItems = document.getElementById("panel-items");
  var resultEl   = document.getElementById("result");
  var resetBtn   = document.getElementById("reset");

  /* ---------------- the maths ------------------------------------------ */
  function total() {
    if (mode === "home") {
      var p = window.ESA_PRESETS.filter(function (x) { return x.id === preset; })[0];
      return p ? p.cuft : 0;
    }
    return Object.keys(counts).reduce(function (sum, id) {
      var item = null;
      window.ESA_ITEMS.forEach(function (g) {
        g.items.forEach(function (i) { if (i.id === id) item = i; });
      });
      return sum + (item ? item.cuft * counts[id] : 0);
    }, 0);
  }

  function recommend(cuft) {
    var caps = window.ESA_CAPACITY;
    for (var i = 0; i < caps.length; i++) {
      if (caps[i].cuft >= cuft) return { unit: caps[i], next: caps[i + 1] || null, over: false };
    }
    return { unit: caps[caps.length - 1], next: null, over: true };
  }

  /* ---------------- panels --------------------------------------------- */
  function renderPresets() {
    panelHome.innerHTML = window.ESA_PRESETS.map(function (p) {
      return '<button class="preset' + (preset === p.id ? " sel" : "") + '" type="button" data-preset="' + p.id + '">' +
        '<span class="mark" aria-hidden="true"></span>' +
        '<span style="flex:1"><strong>' + p.label + '</strong><span>' + p.note + '</span></span>' +
        '<span style="font-size:12.5px;color:var(--muted)">' + p.cuft + ' cu ft</span></button>';
    }).join("");
    panelHome.querySelectorAll("[data-preset]").forEach(function (el) {
      el.addEventListener("click", function () {
        preset = el.dataset.preset;
        renderPresets();
        renderResult();
      });
    });
  }

  function renderItems() {
    panelItems.innerHTML = window.ESA_ITEMS.map(function (g) {
      return '<div class="grp"><h2>' + g.group + '</h2><div class="box">' +
        g.items.map(function (i) {
          var n = counts[i.id] || 0;
          return '<div class="item' + (n ? " on" : "") + '" data-item="' + i.id + '">' +
            '<span class="ico" aria-hidden="true">' +
              (i.icon ? '<img src="assets/img/items/' + i.icon + '" alt="" loading="lazy">' : '') + '</span>' +
            '<div class="txt"><strong>' + i.label + '</strong><span>' + i.cuft + ' cu ft each</span></div>' +
            '<div class="stepper">' +
              '<button type="button" data-step="-1" aria-label="Remove one ' + i.label + '"' + (n ? "" : " disabled") + '>&minus;</button>' +
              '<span class="n' + (n ? "" : " zero") + '">' + n + '</span>' +
              '<button type="button" data-step="1" aria-label="Add one ' + i.label + '">+</button>' +
            '</div></div>';
        }).join("") + '</div></div>';
    }).join("");

    panelItems.querySelectorAll("[data-item]").forEach(function (row) {
      var id = row.dataset.item;
      row.querySelectorAll("[data-step]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var next = (counts[id] || 0) + Number(btn.dataset.step);
          counts[id] = Math.max(0, Math.min(99, next));
          if (!counts[id]) delete counts[id];
          renderItems();
          renderResult();
          ESA.bump(document.querySelector('[data-item="' + id + '"] .n'));
        });
      });
    });
  }

  /* ---------------- result --------------------------------------------- */
  function renderResult() {
    var cuft = Math.round(total());
    var ctaSize = document.getElementById("cta-size");
    var ctaNote = document.getElementById("cta-note");
    var ctaGo = document.getElementById("cta-go");

    if (!cuft) {
      resultEl.innerHTML = "";
      resetBtn.hidden = true;
      ctaSize.innerHTML = "&mdash;";
      ctaNote.textContent = mode === "home" ? "Pick a home size" : "Add what you're storing";
      ctaGo.style.pointerEvents = "none";
      ctaGo.style.opacity = ".45";
      ctaGo.textContent = "See units";
      return;
    }

    var r = recommend(cuft);
    var fill = Math.min(100, Math.round((cuft / r.unit.cuft) * 100));
    var itemCount = Object.keys(counts).reduce(function (a, k) { return a + counts[k]; }, 0);

    resultEl.innerHTML =
      '<div class="result">' +
        '<p class="lead">We recommend</p>' +
        '<h2>' + r.unit.size + '</h2>' +
        '<p class="sub">from ' + ESA.money(r.unit.from) + '/mo &middot; about ' + cuft + ' cu ft' +
          (mode === "items" ? " across " + itemCount + (itemCount === 1 ? " item" : " items") : "") + '</p>' +
        '<div class="meter">' +
          '<div class="gauge' + (fill > 90 ? " over" : "") + '"><i style="width:0"></i></div>' +
          '<div class="meter-label"><span>' + fill + '% full</span>' +
          '<span>' + r.unit.cuft + ' cu ft usable</span></div>' +
        '</div>' +
        (r.over
          ? '<div class="up"><span>&#9888;</span><span>That&rsquo;s more than our largest single unit. ' +
            'We&rsquo;d split it across two units &mdash; <strong>call us and we&rsquo;ll plan it</strong>.</span></div>'
          : fill > 85 && r.next
            ? '<div class="up"><span>&#8593;</span><span>You&rsquo;re near the limit. ' +
              '<strong>' + r.next.size + '</strong> from ' + ESA.money(r.next.from) + '/mo gives you room to walk in ' +
              'and reach the back.</span></div>'
            : '<div class="up"><span>&#10003;</span><span>Comfortable fit &mdash; with space to add a little later.</span></div>') +
      '</div>';

    /* let the fill animate up to the value instead of appearing at it */
    var bar = resultEl.querySelector(".gauge i");
    if (bar) window.setTimeout(function () { bar.style.width = fill + "%"; }, 30);

    resetBtn.hidden = false;
    ctaSize.innerHTML = r.unit.size;
    ctaNote.innerHTML = "from " + ESA.money(r.unit.from) + "/mo &middot; " + fill + "% full";
    ctaGo.style.pointerEvents = "";
    ctaGo.style.opacity = "";
    ctaGo.textContent = "See " + r.unit.size + " units";
    ctaGo.href = "map.html?size=" + r.unit.cat;
  }

  /* ---------------- tabs ----------------------------------------------- */
  function show(next) {
    mode = next;
    document.getElementById("tab-home").setAttribute("aria-selected", String(next === "home"));
    document.getElementById("tab-items").setAttribute("aria-selected", String(next === "items"));
    panelHome.hidden = next !== "home";
    panelItems.hidden = next !== "items";
    renderResult();
  }
  document.getElementById("tab-home").addEventListener("click", function () { show("home"); });
  document.getElementById("tab-items").addEventListener("click", function () { show("items"); });

  resetBtn.addEventListener("click", function () {
    preset = null;
    counts = {};
    renderPresets();
    renderItems();
    renderResult();
    document.getElementById("screen").scrollTo({ top: 0, behavior: "smooth" });
  });

  renderPresets();
  renderItems();
  renderResult();
})();

/* Sign in is reachable from the browse journey too — ESA.loginUrl() carries the
   current screen in ?next=, so signing in returns you exactly here. */
(function () {
  var btn = document.getElementById("signin-btn");
  if (!btn) return;
  if (ESA.session()) btn.setAttribute("aria-label", "My storage");
  btn.addEventListener("click", function () {
    window.location.href = ESA.session() ? "account.html" : ESA.loginUrl();
  });
})();
