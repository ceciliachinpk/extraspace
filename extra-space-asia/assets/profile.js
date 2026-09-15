/* Profile: account details behind the same login wall as My storage.
   Nothing personal renders without a session; the wall explains itself and
   signs you in without leaving the screen. */
(function () {
  "use strict";

  var screen = document.getElementById("screen");
  var editBtn = document.getElementById("edit-btn");
  var spacer = document.getElementById("appbar-spacer");
  var balance = function () { spacer.hidden = !editBtn.hidden; };

  var icon = (path, size) =>
    '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" ' +
    'fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' + path + '</svg>';

  var CHEV = '<span class="chev">' + icon('<path d="m9 5 7 7-7 7"/>', 17) + '</span>';

  var P = {
    card:   '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
    user:   '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
    mail:   '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    phone:  '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z"/>',
    pin:    '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    bell:   '<path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5Z"/><path d="M10.5 19.5a2 2 0 0 0 3 0"/>',
    lock:   '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    face:   '<path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5"/><path d="M9 10v1.5M15 10v1.5M9.5 15c1.5 1.2 3.5 1.2 5 0"/>',
    device: '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M11 18h2"/>',
    globe:  '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14 0 17M12 3.5c-2.5 2.5-2.5 14 0 17"/>',
    help:   '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.4a2.4 2.4 0 1 1 3.2 2.2c-.6.2-.9.8-.9 1.4v.4M12 16.6h.01"/>',
    doc:    '<path d="M6 3.5h9L19 8v12.5H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>'
  };

  function row(path, title, value, opts) {
    opts = opts || {};
    return '<button class="row' + (opts.static ? " static" : "") + '" type="button" ' +
      'data-row="' + title + '"' + (opts.static ? " disabled" : "") + '>' +
      '<span class="ic">' + icon(path) + '</span>' +
      '<span class="txt"><strong>' + title + '</strong>' +
        (value ? '<span>' + value + '</span>' : '') + '</span>' +
      (opts.chev === false ? '' : CHEV) + '</button>';
  }

  function switchRow(path, title, value, id, on) {
    return '<div class="row static">' +
      '<span class="ic">' + icon(path) + '</span>' +
      '<span class="txt"><strong>' + title + '</strong>' +
        (value ? '<span>' + value + '</span>' : '') + '</span>' +
      '<label class="switch"><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + '>' +
      '<span class="track" aria-hidden="true"></span>' +
      '<span class="sr-only">' + title + '</span></label></div>';
  }

  function group(title, inner) {
    return '<section class="grp"><p class="grp-title">' + title + '</p>' +
           '<div class="rows">' + inner + '</div></section>';
  }

  /* ---------------- the wall ------------------------------------------- */
  function wall() {
    editBtn.hidden = true;
    balance();
    screen.innerHTML =
      '<div class="wall">' +
        '<div class="wall-preview" aria-hidden="true">' +
          '<div class="peek">' +
            '<div class="id-card"><div class="avatar-lg">CC</div>' +
              '<div><h2>Cecilia Chin</h2><p>+65 9123 4567</p>' +
              '<p class="since">Customer since Mar 2026</p></div></div>' +
            '<div class="rows" style="margin-top:8px">' +
              row(P.mail, "Email", "cecilia@example.com") +
              row(P.card, "Payment method", "GIRO · DBS &bull;&bull;&bull;&bull; 4417") +
            '</div>' +
          '</div>' +
          '<div class="wall-lock"><span class="ic">' + icon(P.lock, 24) + '</span>' +
          '<span class="tag">Your details, kept private</span></div>' +
        '</div>' +
        '<h1 id="wall-head" tabindex="-1">Sign in to your account</h1>' +
        '<p class="reason">Your contact details, payment methods and notification ' +
          'settings live here.</p>' +
        '<ul class="wall-perks">' +
          '<li><span class="ic">' + icon(P.user) + '</span><span><strong>Keep your details current</strong>' +
            '<span>So invoices and access codes reach you</span></span></li>' +
          '<li><span class="ic">' + icon(P.card) + '</span><span><strong>Manage payment methods</strong>' +
            '<span>Switch card or set up GIRO</span></span></li>' +
          '<li><span class="ic">' + icon(P.bell) + '</span><span><strong>Choose what we notify you about</strong>' +
            '<span>Invoice reminders, access alerts, offers</span></span></li>' +
        '</ul>' +
        '<button class="btn btn-primary btn-block btn-lg" type="button" id="wall-signin">' +
          'Continue with mobile number</button>' +
        '<button class="textlink" type="button" id="wall-password">Use email and password instead</button>' +
        '<div class="or">or</div>' +
        '<a class="btn btn-outline btn-block" href="map.html">Browse storage as a guest</a>' +
      '</div>';

    document.getElementById("wall-head").focus({ preventScroll: true });
    document.getElementById("wall-signin").addEventListener("click", function () {
      ESA.authSheet({ reason: "Your details and payment methods live here.", onDone: profile });
    });
    document.getElementById("wall-password").addEventListener("click", function () {
      window.location.href = "login.html?reason=profile&next=profile.html";
    });
  }

  /* ---------------- the profile ---------------------------------------- */
  function profile(user) {
    user = user || ESA.session();
    var name = user.name || "Your account";
    var initials = user.name
      ? user.name.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase()
      : "ESA";
    var mobile = user.mobile
      ? "+65 " + user.mobile.slice(0, 4) + " " + user.mobile.slice(4)
      : "Add a mobile number";

    editBtn.hidden = false;
    balance();

    screen.innerHTML =
      '<div class="prof">' +
        '<section class="id-card">' +
          '<div class="avatar-lg" aria-hidden="true">' + initials + '</div>' +
          '<div><h2>' + name + '</h2><p>' + mobile + '</p>' +
          '<p class="since">Customer since Mar 2026 &middot; 1 active unit</p></div>' +
        '</section>' +
        '<div class="prof-actions">' +
          '<button class="btn btn-outline" type="button" id="edit-profile">Edit profile</button>' +
          '<a class="btn btn-outline" href="account.html">My storage</a>' +
        '</div>' +

        group("Personal details",
          row(P.user, "Full name", name) +
          row(P.mail, "Email", "cecilia@example.com") +
          row(P.phone, "Mobile number", mobile) +
          row(P.pin, "Billing address", "Blk 118 Bishan St 12, #04-118")) +

        group("Notifications",
          switchRow(P.card, "Invoice reminders", "3 days before each due date", "n-invoice", true) +
          switchRow(P.lock, "Access alerts", "When your unit is opened", "n-access", true) +
          switchRow(P.bell, "Promotions and offers", "At most twice a month", "n-promo", false)) +

        group("Payment",
          row(P.card, "GIRO &middot; DBS &bull;&bull;&bull;&bull; 4417", "Default payment method") +
          row(P.card, "Add a payment method", "Card or bank transfer")) +

        group("Preferences",
          row(P.globe, "Country", "Singapore") +
          row(P.globe, "Language", "English")) +

        group("Security",
          row(P.lock, "Password", "Not set &mdash; you sign in with a code") +
          switchRow(P.face, "Face ID", "On this device", "s-faceid", true) +
          row(P.device, "Signed-in devices", "2 devices")) +

        group("About",
          row(P.help, "Help centre", "FAQs and contact") +
          row(P.doc, "Terms of use") +
          row(P.doc, "Privacy policy")) +

        '<button class="btn btn-outline btn-block" type="button" id="signout" style="margin-top:22px">Sign out</button>' +
        '<p class="ver">Extra Space Asia &middot; version 1.4.2 (prototype)</p>' +
      '</div>';

    screen.querySelectorAll(".row[data-row]:not([disabled])").forEach(function (r) {
      r.addEventListener("click", function () {
        ESA.toast(r.querySelector("strong").textContent + " is not part of this prototype.");
      });
    });
    screen.querySelectorAll(".switch input").forEach(function (input) {
      input.addEventListener("change", function () {
        ESA.toast(input.checked ? "Turned on." : "Turned off.");
      });
    });
    document.getElementById("edit-profile").addEventListener("click", function () {
      ESA.toast("Editing is not wired up in this prototype.");
    });
    document.getElementById("signout").addEventListener("click", doSignOut);
  }

  function doSignOut() {
    ESA.signOut();
    ESA.toast("Signed out.");
    wall();
  }

  editBtn.addEventListener("click", function () {
    ESA.toast("Editing is not wired up in this prototype.");
  });

  if (ESA.session()) profile(); else wall();
})();
