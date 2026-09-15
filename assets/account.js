/* "My storage": the customer's bookings, behind the login wall.
   The wall is enforced here — nothing is rendered without a session — but it
   explains what it guards and signs you in without leaving the screen.
   Tapping a booking opens booking.html, which owns invoices and modify/end. */
(function () {
  "use strict";

  var screen = document.getElementById("screen");
  var signout = document.getElementById("signout-btn");
  var spacer = document.getElementById("appbar-spacer");
  var reason = new URLSearchParams(window.location.search).get("reason") || "unit";

  function balance() { spacer.hidden = !signout.hidden; }
  function facility(id) {
    return window.ESA_FACILITIES.filter(function (f) { return f.id === id; })[0] || window.ESA_FACILITIES[0];
  }
  var icon = function (path, size) {
    return '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' + path + '</svg>';
  };
  var P = {
    box:   '<path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5z"/><path d="m4 8.5 8 4.5 8-4.5M12 13v7"/>',
    card:  '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
    doc:   '<path d="M6 3.5h9L19 8v12.5H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>',
    lock:  '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    help:  '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.4a2.4 2.4 0 1 1 3.2 2.2c-.6.2-.9.8-.9 1.4v.4M12 16.6h.01"/>',
    hist:  '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3.2 2"/>'
  };
  var CHEV = '<span class="chev">' + icon('<path d="m9 5 7 7-7 7"/>', 17) + '</span>';

  var REASONS = {
    unit:    { head: "Sign in to manage your unit",  line: "Your bookings, invoices and access code live here." },
    pay:     { head: "Sign in to pay your invoice",  line: "You&rsquo;ll go straight to the invoice once you&rsquo;re in." },
    gate:    { head: "Sign in for your access code", line: "Codes change, so we only show yours after sign-in." },
    profile: { head: "Sign in to your account",      line: "Update your contact details and payment methods." }
  };

  /* ---------------- the wall ------------------------------------------- */
  function perk(path, title, sub) {
    return '<li><span class="ic">' + icon(path) + '</span>' +
      '<span><strong>' + title + '</strong><span>' + sub + '</span></span></li>';
  }

  function wall() {
    var r = REASONS[reason] || REASONS.unit;
    signout.hidden = true;
    balance();
    screen.innerHTML =
      '<div class="wall">' +
        '<div class="wall-preview" aria-hidden="true">' +
          '<div class="peek">' +
            '<div class="unit-card">' +
              '<div class="top"><div><h2>Unit 04-118 &middot; 50 sq ft</h2>' +
                '<p class="sub">Kallang &middot; air-conditioned</p></div>' +
                '<span class="badge">Active</span></div>' +
              '<div class="due"><span>Next invoice &middot; due 1 Oct</span>' +
                '<strong style="color:var(--ink);font-size:16px">S$189</strong></div>' +
              '<div class="btns"><span class="btn btn-accent">Pay now</span>' +
                '<span class="btn btn-outline">Access code</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="wall-lock"><span class="ic">' + icon(P.lock, 24) + '</span>' +
          '<span>Your details, kept private</span></div>' +
        '</div>' +
        '<h1 id="wall-head" tabindex="-1">' + r.head + '</h1>' +
        '<p class="reason">' + r.line + '</p>' +
        '<ul class="wall-perks">' +
          perk(P.card, "Pay invoices and set up GIRO", "Card or bank transfer, receipts emailed") +
          perk(P.lock, "Get your access code any time", "Even when the office is closed") +
          perk(P.doc, "Extend or end a booking", "Without a trip to the store") +
        '</ul>' +
        '<button class="btn btn-primary btn-block btn-lg" type="button" id="wall-signin">' +
          'Continue with mobile number</button>' +
        '<button class="textlink" type="button" id="wall-password">Use email and password instead</button>' +
        '<div class="or">or</div>' +
        '<a class="btn btn-outline btn-block" href="map.html">Browse storage as a guest</a>' +
        '<p class="legal">Not a customer yet? Reserving a unit takes about two minutes &mdash; ' +
          'no account needed to enquire.</p>' +
      '</div>';

    document.getElementById("wall-head").focus({ preventScroll: true });
    document.getElementById("wall-signin").addEventListener("click", function () {
      ESA.authSheet({ reason: r.line.replace(/&rsquo;/g, "’"), onDone: account });
    });
    document.getElementById("wall-password").addEventListener("click", function () {
      window.location.href = "login.html?next=" + encodeURIComponent("account.html?reason=" + reason);
    });
  }

  /* ---------------- bookings ------------------------------------------- */
  function statusChip(b) {
    if (b.status === "ended")  return '<span class="status status-ended">Ended</span>';
    if (b.status === "ending") return '<span class="status status-ending">Move-out ' + b.moveOut + '</span>';
    return '<span class="status status-active">Active</span>';
  }

  function bookingCard(b) {
    var f = facility(b.facilityId);
    return '<a class="unit-card" href="booking.html?id=' + b.id + '" style="display:block">' +
      '<div class="top">' +
        '<div><h2>Unit ' + b.unit + ' &middot; ' + b.size + '</h2>' +
        '<p class="sub">' + f.name + ' &middot; ' + b.type + '</p></div>' +
        statusChip(b) +
      '</div>' +
      (b.status === "ended"
        ? '<div class="due"><span>Ended ' + b.ended + '</span>' +
          '<span style="font-weight:700;color:var(--muted)">' + b.invoices.length + ' invoices</span></div>'
        : '<div class="due"><span>Next invoice &middot; due ' + b.nextInvoice.due + '</span>' +
          '<strong style="color:var(--ink);font-size:16px">' + ESA.money(b.nextInvoice.amount) + '</strong></div>') +
      '<div class="btns" style="align-items:center">' +
        '<span style="font-size:13px;font-weight:700;color:var(--brand-500)">View booking</span>' +
        '<span style="margin-left:auto;color:var(--muted)">' + icon('<path d="m9 5 7 7-7 7"/>', 17) + '</span>' +
      '</div></a>';
  }

  function row(href, path, title, sub) {
    return '<a class="acct-row" href="' + href + '">' +
      '<span class="ic">' + icon(path, 19) + '</span>' +
      '<span><strong>' + title + '</strong><span>' + sub + '</span></span>' + CHEV + '</a>';
  }

  function account(user) {
    user = user || ESA.session();
    signout.hidden = false;
    balance();

    var active = window.ESA_BOOKINGS.filter(function (b) { return b.status !== "ended"; });
    var past   = window.ESA_BOOKINGS.filter(function (b) { return b.status === "ended"; });

    screen.innerHTML =
      '<div class="acct">' +
        (user.name ? '<p class="hint" style="margin:0 0 10px">Signed in as ' + user.name + '</p>' : '') +
        '<p class="acct-head" style="margin-top:0">Your bookings</p>' +
        active.map(bookingCard).join("") +

        '<p class="acct-head">Billing</p>' +
        '<div class="acct-rows">' +
          row("booking.html?id=" + active[0].id + "#invoices", P.doc, "Invoice history", "All invoices across your units") +
          row("profile.html", P.card, "Payment methods", "GIRO &middot; DBS &bull;&bull;&bull;&bull; 4417") +
        '</div>' +

        (past.length
          ? '<p class="acct-head">Past bookings</p><div class="acct-rows">' +
            past.map(function (b) {
              return row("booking.html?id=" + b.id, P.hist, "Unit " + b.unit + " &middot; " + b.size,
                         facility(b.facilityId).name + " &middot; ended " + b.ended);
            }).join("") + '</div>'
          : "") +

        '<p class="acct-head">Help</p>' +
        '<div class="acct-rows">' +
          row("map.html", P.box, "Rent another unit", "Compare sizes and facilities") +
          row("home.html", P.help, "Get help", "Call, WhatsApp or email the store") +
        '</div>' +

        '<button class="btn btn-outline btn-block" type="button" id="signout-row" style="margin-top:18px">Sign out</button>' +
      '</div>';

    document.getElementById("signout-row").addEventListener("click", doSignOut);

    /* honour the intent that sent the customer to the wall */
    if (reason === "pay" || reason === "gate") {
      window.location.replace("booking.html?id=" + active[0].id + "&action=" + reason);
    }
  }

  function doSignOut() {
    ESA.signOut();
    ESA.toast("Signed out.");
    reason = "unit";
    wall();
  }

  signout.addEventListener("click", doSignOut);

  if (ESA.session()) account(); else wall();
})();
