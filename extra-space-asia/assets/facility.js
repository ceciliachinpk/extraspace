/* Facility screen: renders one facility from window.ESA_FACILITIES (?id=…),
   handles unit selection, the enquiry sheet and the location map. */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var facility = window.ESA_FACILITIES.filter(function (f) { return f.id === params.get("id"); })[0]
              || window.ESA_FACILITIES[0];

  var selected = null;
  var sizeFilter = "all";

  /* ---------------- header -------------------------------------------- */
  document.title = ESA.strip(facility.name) + " Self Storage | Extra Space Asia";
  document.getElementById("bar-title").innerHTML = facility.name;
  document.getElementById("fac-name").innerHTML = facility.name;
  document.getElementById("fac-address").innerHTML = facility.address + ", " + facility.postal;
  document.getElementById("mrt-note").innerHTML = facility.mrt + " &middot; " + facility.distance.toFixed(1) + " km from you";
  document.getElementById("hours-office").innerHTML = facility.hours.office;
  document.getElementById("hours-access").innerHTML = facility.hours.access;
  document.getElementById("review-summary").innerHTML =
    facility.rating.toFixed(1) + " out of 5 from " + facility.reviews + " verified customers.";

  var call = document.getElementById("fac-call");
  call.href = "tel:" + facility.phone.replace(/[^0-9+]/g, "");
  document.getElementById("fac-directions").href =
    "https://www.openstreetmap.org/?mlat=" + facility.lat + "&mlon=" + facility.lng +
    "#map=17/" + facility.lat + "/" + facility.lng;

  document.getElementById("fac-meta").innerHTML =
    '<span class="rating"><span class="stars" aria-hidden="true">' + ESA.stars(facility.rating) + '</span>' +
      facility.rating.toFixed(1) + ' (' + facility.reviews + ')</span>' +
    (facility.promo ? '<span class="badge badge-promo">' + facility.promo + '</span>' : '') +
    '<span class="badge badge-navy">' + facility.units.length + ' sizes available</span>';

  /* ---------------- gallery ------------------------------------------- */
  /* the branch photo first, then the interior shots that apply here */
  var shots = [{ src: facility.img, caption: ESA.strip(facility.name) + " exterior" }]
    .concat((window.ESA_INTERIORS || []).filter(function (i) {
      return i.caption !== "Wine room" || ESA.hasCat(facility, "wine");
    }));
  var gallery = document.getElementById("gallery");
  gallery.innerHTML = shots.map(function (shot) {
    return ESA.photo(shot.src, facility.photo,
      '<span class="photo-cap">' + shot.caption + '</span>', shot.caption);
  }).join("");
  document.getElementById("gallery-count").textContent = "1 / " + shots.length;
  /* receiving end of the dive: the first shot morphs from the tapped thumbnail */
  var hero = gallery.querySelector(".photo");
  if (hero) hero.style.viewTransitionName = "facility-hero";
  gallery.addEventListener("scroll", function () {
    var i = Math.round(gallery.scrollLeft / gallery.clientWidth) + 1;
    document.getElementById("gallery-count").textContent = i + " / " + shots.length;
  });

  /* ---------------- amenities ----------------------------------------- */
  document.getElementById("amenities").innerHTML =
    facility.features.concat(["Free trolleys", "Online billing", "Packing supplies"])
      .map(function (a) { return "<span>" + a + "</span>"; }).join("");

  /* ---------------- units --------------------------------------------- */
  function unitHTML(u, index) {
    var tags = [u.aircon ? "Air-conditioned" : "Non air-conditioned"];
    if (u.cat === "wine") tags.push("13&ndash;15&deg;C");
    return '<div class="unit' + (selected === u ? " selected" : "") + '" data-unit="' + index + '" ' +
             'role="radio" tabindex="0" aria-checked="' + (selected === u) + '">' +
      '<div class="unit-dim" aria-hidden="true">' +
        (u.bottles ? u.bottles + '<span>bottles</span>' : u.sqft + '<span>sq ft</span>') + '</div>' +
      '<div>' +
        '<h3>' + u.size + '</h3>' +
        '<p class="sub">' + u.floor + (u.left <= 2 ? "" : " &middot; available now") + '</p>' +
        '<div class="unit-tags">' +
          tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join("") +
          (u.promo ? '<span class="badge badge-promo">' + u.promo + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="unit-right">' +
        (u.was ? '<span class="price-was">' + ESA.money(u.was) + '</span>' : '') +
        '<span class="price">' + ESA.money(u.price) + '<small>/mo</small></span>' +
        (u.left <= 2 ? '<span class="unit-left-note">Only ' + u.left + ' left</span>' : '') +
        '<div class="radio-dot" aria-hidden="true"></div>' +
      '</div></div>';
  }

  function renderUnits() {
    var list = facility.units.filter(function (u) {
      return sizeFilter === "all" || u.cat === sizeFilter;
    });
    var host = document.getElementById("unit-list");
    host.innerHTML = list.length
      ? list.map(function (u) { return unitHTML(u, facility.units.indexOf(u)); }).join("")
      : '<p class="hint" style="padding:6px 0 12px">No units of that size here right now. ' +
        '<a href="map.html?size=' + sizeFilter + '">See facilities that have it</a>.</p>';

    host.querySelectorAll(".unit").forEach(function (el) {
      function pick() {
        selected = facility.units[Number(el.dataset.unit)];
        renderUnits();
        renderCta();
      }
      el.addEventListener("click", pick);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
      });
    });
  }

  function renderCta() {
    var price = document.getElementById("cta-price");
    var note = document.getElementById("cta-note");
    if (selected) {
      price.innerHTML = ESA.money(selected.price) + '<small>/mo</small>';
      note.innerHTML = ESA.strip(selected.size);
    } else {
      var from = Math.min.apply(null, facility.units.map(function (u) { return u.price; }));
      price.innerHTML = ESA.money(from) + '<small>/mo</small>';
      note.textContent = "Lowest rate here";
    }
  }

  /* ---------------- size chips, built from what is actually here ------- */
  var CAT_LABEL = { locker: "Locker", small: "Small", medium: "Medium", large: "Large", wine: "Wine" };
  var CAT_ORDER = ["locker", "small", "medium", "large", "wine"];

  function renderChips() {
    var present = CAT_ORDER.filter(function (c) { return ESA.hasCat(facility, c); });
    var chips = [{ size: "all", label: "All" }].concat(present.map(function (c) {
      return { size: c, label: CAT_LABEL[c] };
    }));
    document.getElementById("unit-chips").innerHTML = chips.map(function (c) {
      return '<button class="chip" type="button" data-size="' + c.size + '" aria-pressed="' +
        (c.size === sizeFilter) + '">' + c.label + '</button>';
    }).join("");
  }

  /* ---------------- wine explainer ------------------------------------- */
  function renderWineNote() {
    var host = document.getElementById("wine-note");
    if (!ESA.hasCat(facility, "wine") || (sizeFilter !== "all" && sizeFilter !== "wine")) {
      host.innerHTML = "";
      return;
    }
    var wines = facility.units.filter(function (u) { return u.cat === "wine"; });
    var least = Math.min.apply(null, wines.map(function (u) { return u.bottles; }));
    var most  = Math.max.apply(null, wines.map(function (u) { return u.bottles; }));
    host.innerHTML = '<div class="wine-note">' +
      '<strong>Wine storage at ' + facility.name + '</strong>' +
      'A dedicated room held at 13&ndash;15&deg;C and 70% humidity, with vibration-damped racking. ' +
      least + ' to ' + most + ' bottles, from ' + ESA.money(Math.min.apply(null, wines.map(function (u) { return u.price; }))) + '/mo.' +
      '<ul><li>13&ndash;15&deg;C</li><li>70% humidity</li><li>Dark, no UV</li><li>Insured to S$5,000</li></ul></div>';
  }

  /* ---------------- what this facility doesn't stock ------------------- */
  function renderElsewhere() {
    var host = document.getElementById("unit-elsewhere");
    var missing = CAT_ORDER.filter(function (c) { return !ESA.hasCat(facility, c); });
    /* Lead with wine when it's missing — it's the size people hunt for. */
    var target = missing.indexOf("wine") > -1 ? "wine" : missing[0];
    if (!target) { host.innerHTML = ""; return; }

    var alt = ESA.nearestWith(target, facility.id);
    if (!alt) { host.innerHTML = ""; return; }

    var label = target === "wine" ? "wine storage" : CAT_LABEL[target].toLowerCase() + " units";
    host.innerHTML = '<a class="elsewhere" href="facility.html?id=' + alt.id + '">' +
      '<span class="ic" aria-hidden="true">' +
        '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
        '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg></span>' +
      '<span><strong>Looking for ' + label + '?</strong>' +
      '<span>Nearest is ' + ESA.strip(alt.name) + ', ' + alt.distance.toFixed(1) + ' km &middot; from ' +
        ESA.money(ESA.fromPriceFor(alt, target)) + '/mo</span></span>' +
      '<span class="chev" aria-hidden="true">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="m9 5 7 7-7 7"/></svg></span></a>';
  }

  document.getElementById("unit-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll("#unit-chips .chip").forEach(function (c) {
      c.setAttribute("aria-pressed", "false");
    });
    chip.setAttribute("aria-pressed", "true");
    sizeFilter = chip.dataset.size;
    renderUnits();
    renderWineNote();
  });

  renderChips();
  renderUnits();
  renderWineNote();
  renderElsewhere();
  renderCta();

  /* ---------------- nearby -------------------------------------------- */
  document.getElementById("nearby").innerHTML = window.ESA_FACILITIES
    .filter(function (f) { return f.id !== facility.id; })
    .slice(0, 3)
    .map(function (f) {
      var from = Math.min.apply(null, f.units.map(function (u) { return u.price; }));
      return '<a class="near-row" href="facility.html?id=' + f.id + '">' +
        ESA.photo(f.img, f.photo) +
        '<span><strong>' + f.name + '</strong><span>' + f.distance.toFixed(1) + ' km &middot; ' +
          f.rating.toFixed(1) + '&#9733;</span></span>' +
        '<span class="price">' + ESA.money(from) + '<small>/mo</small></span></a>';
    }).join("");

  /* ---------------- map ----------------------------------------------- */
  /* Zoom 11, not street level: the basemap is a coastline, so at zoom 15 the
     whole inset sits inland and renders as an empty panel. Pulled out far
     enough to show the island, this answers the question the inset is really
     for — whereabouts in Singapore this branch is. */
  var map = L.map("fac-map", { zoomControl: false, scrollWheelZoom: false, dragging: false, tap: false })
              .setView([facility.lat, facility.lng], 11);
  window.ESA_BASEMAP(map);   /* local vector coastline — no tile server */
  L.marker([facility.lat, facility.lng], {
    icon: L.divIcon({
      className: "",
      html: '<div style="background:#00245d;color:#fff;font:700 12px/1 ' +
            '-apple-system,BlinkMacSystemFont,sans-serif;padding:7px 10px;border-radius:999px;' +
            'border:2px solid #fff;box-shadow:0 6px 18px rgba(37,37,37,.25);white-space:nowrap">' +
            ESA.strip(facility.name) + '</div>',
      iconSize: [110, 30], iconAnchor: [55, 30]
    })
  }).addTo(map);

  /* ---------------- app-bar solidity on scroll ------------------------ */
  var screen = document.getElementById("screen");
  var topbar = document.getElementById("topbar");
  screen.addEventListener("scroll", function () {
    topbar.classList.toggle("solid", screen.scrollTop > 170);
  });

  /* ---------------- save / tour --------------------------------------- */
  var saveBtn = document.getElementById("save-btn");
  saveBtn.addEventListener("click", function () {
    var on = saveBtn.getAttribute("aria-pressed") !== "true";
    saveBtn.setAttribute("aria-pressed", on ? "true" : "false");
    saveBtn.querySelector("path").setAttribute("fill", on ? "#d82424" : "none");  // heart keeps the accent red
    saveBtn.querySelector("svg").setAttribute("stroke", on ? "#d82424" : "currentColor");
    ESA.toast(on ? "Saved to your list." : "Removed from your list.");
  });
  document.getElementById("tour-btn").addEventListener("click", function () {
    ESA.toast("Video tour is not part of this prototype.");
  });

  /* ---------------- enquiry sheet ------------------------------------- */
  var sheet = ESA.sheet("enquiry-sheet");
  var form = document.getElementById("enquiry-form");

  document.getElementById("enquire-btn").addEventListener("click", function () {
    var unit = selected || facility.units[0];
    document.getElementById("enquiry-sub").innerHTML =
      unit.size + " at " + facility.name + " &middot; " + ESA.money(unit.price) + "/mo";
    var d = document.getElementById("e-date");
    d.min = new Date().toISOString().slice(0, 10);
    if (!d.value) d.value = d.min;
    if (!form.querySelector(".steps")) form.insertAdjacentHTML("afterbegin", ESA.steps(1, 2));
    sheet.open();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!ESA.validate(form)) return;

    var unit = selected || facility.units[0];
    var name = document.getElementById("e-name").value.trim().split(" ")[0];
    var how = form.querySelector("input[name=contact]:checked").value;

    document.getElementById("enquiry-body").innerHTML =
      ESA.steps(2, 2) +
      '<div class="confirm">' +
        '<div class="tick" aria-hidden="true">' +
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6">' +
          '<path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>' +
        '<h3 style="font-size:18px;margin:0 0 6px">Thanks, ' + name + '</h3>' +
        '<p style="margin:0 0 4px">The ' + ESA.strip(unit.size) + ' at ' + ESA.strip(facility.name) +
          ' is held at ' + ESA.money(unit.price) + '/mo for 7 days.</p>' +
        '<p class="hint" style="margin:0 0 20px">Our team will reach out by ' + how +
          ' during office hours. Nothing has been charged.</p>' +
        '<button class="btn btn-primary btn-block" type="button" data-sheet-close>Done</button>' +
        '<a class="btn btn-outline btn-block" href="map.html" style="margin-top:10px">Browse other facilities</a>' +
      '</div>';
    document.getElementById("enquiry-body")
            .querySelector("[data-sheet-close]")
            .addEventListener("click", sheet.close);
    document.getElementById("enquiry-title").textContent = "Enquiry sent";
    document.getElementById("enquiry-sub").textContent =
      "Reference ESA-" + Math.floor(Math.random() * 900000 + 100000);
  });
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
