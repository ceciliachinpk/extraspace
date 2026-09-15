/* Locations screen: Leaflet map + a draggable results sheet kept in sync. */
(function () {
  "use strict";

  var params  = new URLSearchParams(window.location.search);
  var listEl  = document.getElementById("result-list");
  var countEl = document.getElementById("results-count");
  var sheetEl = document.getElementById("locsheet");
  var grab    = document.getElementById("grab");
  var markers = {};

  var redo    = document.getElementById("redo");
  var filterBtn = document.getElementById("filter-btn");
  var state = { size: params.get("size") || "all", features: [], sort: "distance" };

  var SIZE_LABEL = { all: "storage", locker: "lockers", small: "small units",
                     medium: "medium units", large: "large units", wine: "wine storage" };

  /* Wine is stocked at a subset of facilities, so say so up front rather than
     letting the filter look broken. */
  function contextBanner(count) {
    if (state.size !== "wine") return "";
    return '<div style="margin:0 16px 12px;padding:13px 14px;border-radius:var(--r-md);' +
      'background:var(--sand);font-size:13px;line-height:1.45">' +
      '<strong style="color:var(--ink)">Wine storage is at ' + count + ' of our Singapore facilities.</strong><br>' +
      'Lockers and rooms are held at 13&ndash;15&deg;C and 70% humidity, from 24 to 240 bottles.</div>';
  }
  if (params.get("type") === "aircon")    state.features.push("aircon");
  if (params.get("type") === "nonaircon") state.features.push("nonaircon");
  if (params.get("type") === "wine")      { state.size = "wine"; }
  if (params.get("type") === "business")  state.features.push("business");

  /* ---------------- map ------------------------------------------------ */
  var map = L.map("map", { zoomControl: false, attributionControl: true })
              .setView([1.335, 103.85], 11);
  L.control.zoom({ position: "topleft" }).addTo(map);
  var mapReady = false;   /* suppresses "Search this area" during programmatic moves */
  window.ESA_BASEMAP(map);   /* local vector coastline — no tile server */

  function pinIcon(price, active) {
    return L.divIcon({
      className: "",
      html: '<div class="pin' + (active ? " active" : "") + '">' + ESA.money(price) + "</div>",
      iconSize: [56, 30], iconAnchor: [28, 32], popupAnchor: [0, -30]
    });
  }

  /* ---------------- filtering ------------------------------------------ */
  function unitsMatching(f) {
    return f.units.filter(function (u) {
      if (state.size !== "all" && u.cat !== state.size) return false;
      if (state.features.indexOf("aircon") > -1 && !u.aircon) return false;
      if (state.features.indexOf("nonaircon") > -1 && u.aircon) return false;
      if (state.features.indexOf("wine") > -1 && u.cat !== "wine") return false;
      return true;
    });
  }

  function facilityMatches(f) {
    if (state.features.indexOf("24-7") > -1 && f.features.indexOf("24/7 access") === -1) return false;
    if (state.features.indexOf("loading") > -1 &&
        f.features.indexOf("Loading bay") === -1 && f.features.indexOf("Drive-up loading") === -1) return false;
    if (state.features.indexOf("business") > -1 && f.features.indexOf("Business storage") === -1) return false;
    return unitsMatching(f).length > 0;
  }

  function fromPrice(f) {
    var us = unitsMatching(f);
    return us.length ? Math.min.apply(null, us.map(function (u) { return u.price; })) : null;
  }

  /* Price to show on a card or pin. Relaxed suggestions match the size but not
     the feature filters, so fall back to size-only pricing instead of null. */
  function cardPrice(f) {
    return fromPrice(f) || ESA.fromPriceFor(f, state.size === "all" ? null : state.size);
  }

  function visible() {
    var list = window.ESA_FACILITIES.filter(facilityMatches);
    list.sort(function (a, b) {
      if (state.sort === "price")  return fromPrice(a) - fromPrice(b);
      if (state.sort === "rating") return b.rating - a.rating;
      return a.distance - b.distance;
    });
    return list;
  }

  /* ---------------- rendering ------------------------------------------ */
  function resultHTML(f) {
    /* A card can be rendered for a relaxed suggestion, where the full filter
       set matches nothing — fall back to size-only pricing rather than null. */
    var cat = state.size === "all" ? null : state.size;
    var count = unitsMatching(f).length;
    var price = cardPrice(f);
    if (!count) count = f.units.filter(function (u) { return !cat || u.cat === cat; }).length;
    return '<article class="result" data-id="' + f.id + '" tabindex="0" role="link" ' +
      'aria-label="' + ESA.strip(f.name) + ', from ' + ESA.money(price) + ' per month">' +
      ESA.photo(f.img, f.photo) +
      '<div>' +
        '<h2>' + f.name + '</h2>' +
        '<p class="addr">' + f.address + ' &middot; ' + f.distance.toFixed(1) + ' km</p>' +
        '<div class="meta">' +
          '<span class="rating"><span class="stars" aria-hidden="true">&#9733;</span>' + f.rating.toFixed(1) +
            ' (' + f.reviews + ')</span>' +
          '<span>' + count + (count === 1 ? " size" : " sizes") + ' left</span>' +
        '</div>' +
        (ESA.hasCat(f, "wine") && state.size !== "wine"
          ? '<span class="badge badge-navy" style="margin:0 6px 8px 0">Wine storage</span>' : '') +
        (f.promo ? '<span class="badge badge-promo" style="margin-bottom:8px">' + f.promo + '</span>' : '') +
        '<div class="foot">' +
          '<span class="price">' + ESA.money(price) + '<small>/mo</small></span>' +
          '<a class="btn btn-primary btn-sm" href="facility.html?id=' + f.id + '">View</a>' +
        '</div>' +
      '</div></article>';
  }

  /* Facilities with the chosen size, ignoring the feature filters — used to
     offer a way forward when the full filter set returns nothing. */
  function relaxed() {
    return window.ESA_FACILITIES
      .filter(function (f) { return state.size === "all" || ESA.hasCat(f, state.size); })
      .sort(function (a, b) { return a.distance - b.distance; });
  }

  function emptyHTML() {
    var alt = relaxed();
    var label = SIZE_LABEL[state.size] || "storage";
    if (!alt.length) {
      return '<div class="empty"><h2 style="font-size:16px">No ' + label + ' in Singapore yet</h2>' +
        '<p style="font-size:13px">We&rsquo;re adding new facilities all the time. Ask the team what&rsquo;s coming.</p>' +
        '<a class="btn btn-outline btn-sm" href="tel:+6567041030">Call us</a></div>';
    }
    return '<div style="padding:18px 16px 8px">' +
        '<h2 style="font-size:15px;margin:0 0 4px">Nothing matches every filter</h2>' +
        '<p style="font-size:13px;margin:0 0 12px">' + alt.length +
          (alt.length === 1 ? ' facility has ' : ' facilities have ') + label +
          ', but not with the extras you picked.</p>' +
        '<button class="btn btn-primary btn-sm" type="button" id="relax-btn">Show those ' +
          alt.length + '</button></div>' +
      '<p class="hint" style="padding:14px 16px 6px;border-top:1px solid var(--line)">' +
        'Nearest with ' + label + '</p>' + alt.slice(0, 3).map(resultHTML).join("");
  }

  function render() {
    var list = visible();

    listEl.innerHTML = list.length
      ? contextBanner(list.length) + list.map(resultHTML).join("")
      : emptyHTML();

    var relax = document.getElementById("relax-btn");
    if (relax) relax.addEventListener("click", function () {
      state.features = [];
      document.querySelectorAll("#filter-sheet input[type=checkbox]").forEach(function (c) { c.checked = false; });
      filterBtn.classList.remove("on");
      render();
    });

    countEl.textContent = list.length
      ? list.length + (list.length === 1 ? " facility" : " facilities") +
        (state.size === "all" ? "" : " with " + SIZE_LABEL[state.size])
      : "No exact matches";

    Object.keys(markers).forEach(function (id) { map.removeLayer(markers[id]); });
    markers = {};

    var pinIndex = 0;
    (list.length ? list : relaxed().slice(0, 3)).forEach(function (f) {
      var m = L.marker([f.lat, f.lng], { icon: pinIcon(cardPrice(f)) }).addTo(map);
      /* pins drop in sequence rather than all appearing at once */
      var pinEl = m.getElement();
      if (pinEl && pinEl.firstChild) {
        var drop = pinEl.firstChild;
        window.setTimeout(function () { drop.classList.add("esa-in"); }, Math.min(pinIndex, 9) * 70);
      }
      pinIndex += 1;
      m.bindPopup(
        '<h3>' + f.name + '</h3><p>' + f.address + '<br>' + f.postal + '</p>' +
        '<p style="margin-bottom:10px;color:var(--ink);font-weight:700">' + ESA.money(cardPrice(f)) + '/mo and up</p>' +
        '<a class="btn btn-primary btn-sm" href="facility.html?id=' + f.id + '">View units</a>'
      );
      m.on("click", function () {
        highlight(f.id, true);
        diveInto(f, rowFor(f.id));
      });
      markers[f.id] = m;
    });

    var pinned = list.length ? list : relaxed().slice(0, 3);
    if (pinned.length) {
      mapReady = false;
      map.fitBounds(pinned.map(function (f) { return [f.lat, f.lng]; }),
                    { paddingTopLeft: [40, 50], paddingBottomRight: [40, 220], maxZoom: 13 });
      window.setTimeout(function () { mapReady = true; redo.hidden = true; }, 500);
    }
    wireResults();
  }

  function highlight(id, scrollTo) {
    document.querySelectorAll(".result").forEach(function (el) {
      var on = el.dataset.id === id;
      el.classList.toggle("active", on);
      if (on && scrollTo) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    Object.keys(markers).forEach(function (mid) {
      var el = markers[mid].getElement();
      if (el && el.firstChild) el.firstChild.classList.toggle("active", mid === id);
    });
  }

  /* "Dive in": fly the map to the facility, clear the sheet out of the way,
     then navigate. The tapped thumbnail is handed to the view transition so it
     grows into the facility hero where the browser supports it. */
  var diving = false;
  function diveInto(f, rowEl) {
    if (diving) return;
    diving = true;
    var thumb = rowEl && rowEl.querySelector(".photo");
    if (thumb) thumb.style.viewTransitionName = "facility-hero";
    document.body.classList.add("diving");

    var went = false;
    function go() {
      if (went) return;
      went = true;
      window.location.href = "facility.html?id=" + f.id;
    }
    map.once("moveend", go);
    map.flyTo([f.lat, f.lng], 16, { duration: 0.55 });
    window.setTimeout(go, 950);   /* fallback if moveend never arrives */
  }

  function rowFor(id) {
    return document.querySelector('.result[data-id="' + id + '"]');
  }

  function wireResults() {
    document.querySelectorAll(".result").forEach(function (el) {
      var id = el.dataset.id;
      var facility = window.ESA_FACILITIES.filter(function (x) { return x.id === id; })[0];
      el.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        diveInto(facility, el);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          diveInto(facility, el);
        }
      });
    });
  }

  /* ---------------- results sheet: tap + drag -------------------------- */
  function setFull(full) {
    sheetEl.classList.toggle("full", full);
    grab.setAttribute("aria-expanded", full ? "true" : "false");
    grab.querySelector(".sr-only").textContent = full ? "Collapse results list" : "Expand results list";
  }
  grab.addEventListener("click", function () { setFull(!sheetEl.classList.contains("full")); });

  var dragY = null;
  sheetEl.addEventListener("pointerdown", function (e) {
    if (!e.target.closest(".locsheet-grab, .locsheet-head")) return;
    dragY = e.clientY;
    sheetEl.setPointerCapture(e.pointerId);
  });
  sheetEl.addEventListener("pointerup", function (e) {
    if (dragY === null) return;
    var dy = e.clientY - dragY;
    if (Math.abs(dy) > 24) setFull(dy < 0);
    dragY = null;
  });

  /* ---------------- controls ------------------------------------------- */
  document.getElementById("size-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll("#size-chips .chip").forEach(function (c) {
      c.setAttribute("aria-pressed", "false");
    });
    chip.setAttribute("aria-pressed", "true");
    state.size = chip.dataset.size;
    render();
  });

  var filterSheet = ESA.sheet("filter-sheet");
  filterBtn.addEventListener("click", filterSheet.open);

  document.getElementById("filter-apply").addEventListener("click", function () {
    state.features = [];
    document.querySelectorAll("#filter-sheet input[type=checkbox]").forEach(function (c) {
      if (c.checked) state.features.push(c.dataset.feature);
    });
    var sort = document.querySelector("#filter-sheet input[name=sort]:checked");
    state.sort = sort ? sort.value : "distance";
    document.getElementById("sort-label").textContent =
      state.sort === "price" ? "Lowest price" : state.sort === "rating" ? "Top rated" : "Nearest";
    filterBtn.classList.toggle("on", state.features.length > 0);
    filterSheet.close();
    render();
  });

  document.getElementById("filter-clear").addEventListener("click", function () {
    document.querySelectorAll("#filter-sheet input[type=checkbox]").forEach(function (c) { c.checked = false; });
    document.querySelector("#filter-sheet input[value=distance]").checked = true;
  });

  document.getElementById("sort-btn").addEventListener("click", filterSheet.open);

  document.getElementById("area-form").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("q").blur();
    render();  /* a production build would geocode this term */
  });

  document.getElementById("locate-fab").addEventListener("click", function () {
    mapReady = false;
    map.setView([1.3040, 103.8320], 13, { animate: true });
    window.setTimeout(function () { mapReady = true; redo.hidden = true; }, 600);
    ESA.toast("Showing facilities near your location.");
  });

  map.on("dragend zoomend", function () { if (mapReady) redo.hidden = false; });
  redo.addEventListener("click", function () { redo.hidden = true; render(); });

  /* reflect deep-linked filters, and scroll the active chip into view so a
     deep link doesn't look like nothing is selected */
  document.querySelectorAll("#size-chips .chip").forEach(function (c) {
    var on = c.dataset.size === state.size;
    c.setAttribute("aria-pressed", on ? "true" : "false");
    if (on && state.size !== "all") c.scrollIntoView({ inline: "center", block: "nearest" });
  });
  state.features.forEach(function (f) {
    var box = document.querySelector('#filter-sheet input[data-feature="' + f + '"]');
    if (box) box.checked = true;
  });
  filterBtn.classList.toggle("on", state.features.length > 0);

  render();
  setTimeout(function () { map.invalidateSize(); }, 200);
})();
