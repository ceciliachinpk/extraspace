/* Shared sign-in sheet, so hitting the login wall never costs you your place.
   Any screen can call ESA.authSheet({ reason, onDone }) — the sheet is built
   on first use and reuses the one-time-code flow from the login screen.
   The wall itself is enforced by each gated screen; this is only the way
   through it. */
(function () {
  "use strict";

  var LAST = "esa_last_identity";
  var sheet, boxes, resendTimer, pendingMobile = "", pendingName = "", onDone;

  function el(id) { return document.getElementById(id); }

  var TEMPLATE =
    '<div class="sheet-backdrop" id="auth-sheet-backdrop"></div>' +
    '<section class="sheet" id="auth-sheet" role="dialog" aria-modal="true" ' +
             'aria-labelledby="auth-sheet-title" aria-hidden="true">' +
      '<div class="sheet-handle" aria-hidden="true"></div>' +
      '<div class="sheet-head">' +
        '<div><h2 id="auth-sheet-title">Sign in</h2>' +
        '<p class="hint" id="auth-reason" style="margin:2px 0 0"></p></div>' +
        '<button class="icon-btn" type="button" data-sheet-close aria-label="Close">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="m6 6 12 12M18 6 6 18"/></svg></button>' +
      '</div>' +
      '<div class="sheet-body">' +

        /* --- known device: one tap --- */
        '<button class="known" type="button" id="auth-known" hidden>' +
          '<span class="av" id="auth-known-initials" aria-hidden="true">65</span>' +
          '<span><strong id="auth-known-name">Continue</strong>' +
          '<span id="auth-known-mobile"></span></span>' +
          '<span class="go" aria-hidden="true">Continue</span>' +
        '</button>' +

        /* --- step 1: number --- */
        '<form id="auth-mobile-form" novalidate>' +
          '<div class="field">' +
            '<label for="auth-mobile">Mobile number</label>' +
            '<div class="phone-field">' +
              '<span class="phone-prefix" aria-hidden="true">🇸🇬 +65</span>' +
              '<input class="input" id="auth-mobile" type="tel" inputmode="numeric" ' +
                     'autocomplete="tel-national" placeholder="9123 4567" maxlength="9" required>' +
            '</div>' +
            '<p class="error-msg">Enter the 8-digit mobile number on your account.</p>' +
            '<p class="hint">We&rsquo;ll send a 6-digit code by SMS or WhatsApp.</p>' +
          '</div>' +
          '<button class="btn btn-primary btn-block btn-lg" type="submit">Send me a code</button>' +
        '</form>' +

        /* --- step 2: code --- */
        '<form id="auth-otp-form" novalidate hidden>' +
          '<p style="font-size:13.5px;margin:0 0 14px">Sent to ' +
            '<strong id="auth-otp-target" style="color:var(--ink)"></strong>. ' +
            '<button class="textlink inline" type="button" id="auth-change">Change</button></p>' +
          '<div class="alert" id="auth-alert" role="alert">' +
            '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                 'stroke-width="2.2" style="flex-shrink:0;margin-top:1px" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="9"></circle><path d="M12 8v4.5M12 16h.01"></path></svg>' +
            '<span id="auth-alert-text">Enter all 6 digits from the SMS.</span></div>' +
          '<label class="label" for="auth-otp-1">6-digit code</label>' +
          '<div class="otp" id="auth-otp">' +
            '<input id="auth-otp-1" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="1" aria-label="Digit 1">' +
            '<input id="auth-otp-2" type="text" inputmode="numeric" maxlength="1" aria-label="Digit 2">' +
            '<input id="auth-otp-3" type="text" inputmode="numeric" maxlength="1" aria-label="Digit 3">' +
            '<input id="auth-otp-4" type="text" inputmode="numeric" maxlength="1" aria-label="Digit 4">' +
            '<input id="auth-otp-5" type="text" inputmode="numeric" maxlength="1" aria-label="Digit 5">' +
            '<input id="auth-otp-6" type="text" inputmode="numeric" maxlength="1" aria-label="Digit 6">' +
          '</div>' +
          '<div class="resend"><span>Didn&rsquo;t get it?</span>' +
            '<button type="button" id="auth-resend" disabled>Resend in 30s</button></div>' +
          '<p class="demo-code">Prototype: any 6 digits sign you in. Fewer than 6 shows the error state.</p>' +
          '<button class="btn btn-primary btn-block btn-lg" type="submit" style="margin-top:16px">Verify and continue</button>' +
        '</form>' +

        '<button class="textlink" type="button" id="auth-password">Use email and password instead</button>' +
        '<p class="legal" style="margin-top:10px">Sample interface &mdash; nothing is sent anywhere.</p>' +
      '</div>' +
    '</section>';

  function build() {
    var host = document.querySelector(".app") || document.body;
    var wrap = document.createElement("div");
    wrap.innerHTML = TEMPLATE;
    while (wrap.firstChild) host.appendChild(wrap.firstChild);

    sheet = ESA.sheet("auth-sheet");
    boxes = Array.prototype.slice.call(document.querySelectorAll("#auth-otp input"));

    /* remembered identity → one tap */
    var remembered = null;
    remembered = window.ESA_STORE.local.json(LAST);
    if (remembered && remembered.mobile) {
      el("auth-known").hidden = false;
      el("auth-known-name").textContent = remembered.name
        ? "Continue as " + remembered.name
        : "Continue with this number";
      el("auth-known-mobile").textContent = "+65 " + remembered.mobile.slice(0, 4) + " " +
        remembered.mobile.slice(4).replace(/\d/g, "•");
      el("auth-known-initials").textContent = remembered.name
        ? remembered.name.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase()
        : "65";
      el("auth-known").addEventListener("click", function () {
        pendingMobile = remembered.mobile;
        pendingName = remembered.name;
        toOtp();
      });
    }

    el("auth-mobile-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = el("auth-mobile");
      var digits = input.value.replace(/\D/g, "");
      var ok = digits.length === 8;
      input.closest(".field").classList.toggle("has-error", !ok);
      input.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) { input.focus(); return; }
      pendingMobile = digits;
      toOtp();
    });

    el("auth-change").addEventListener("click", function () {
      el("auth-otp-form").hidden = true;
      el("auth-mobile-form").hidden = false;
      el("auth-known").hidden = !(remembered && remembered.mobile);
      el("auth-sheet-title").textContent = "Sign in";
      el("auth-mobile").focus();
    });

    el("auth-resend").addEventListener("click", function () {
      ESA.toast("New code sent to +65 " + pendingMobile.slice(0, 4) + " " + pendingMobile.slice(4) + ".");
      countdown(30);
      boxes[0].focus();
    });

    boxes.forEach(function (box, i) {
      box.addEventListener("input", function () {
        var digits = box.value.replace(/\D/g, "");
        if (digits.length > 1) {
          digits.split("").slice(0, boxes.length - i).forEach(function (d, k) { boxes[i + k].value = d; });
          boxes[Math.min(i + digits.length, boxes.length) - 1].focus();
        } else {
          box.value = digits;
          if (digits && i < boxes.length - 1) boxes[i + 1].focus();
        }
        el("auth-otp").classList.remove("bad");
        if (boxes.every(function (b) { return b.value; })) el("auth-otp-form").requestSubmit();
      });
      box.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !box.value && i > 0) {
          boxes[i - 1].focus(); boxes[i - 1].value = ""; e.preventDefault();
        }
        if (e.key === "ArrowLeft" && i > 0) boxes[i - 1].focus();
        if (e.key === "ArrowRight" && i < boxes.length - 1) boxes[i + 1].focus();
      });
    });

    el("auth-otp-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var code = boxes.map(function (b) { return b.value; }).join("");
      if (code.length < 6) {
        el("auth-otp").classList.add("bad");
        el("auth-alert").classList.add("show");
        if (boxes[code.length]) boxes[code.length].focus();
        return;
      }
      var btn = el("auth-otp-form").querySelector("button[type=submit]");
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Verifying…';
      window.setTimeout(function () {
        var user = { name: (pendingName || "").trim(), mobile: pendingMobile };
        ESA.signIn(user);
        window.ESA_STORE.local.set(LAST, JSON.stringify(user));
        btn.textContent = "Signed in ✓";
        window.setTimeout(function () {
          sheet.close();
          if (typeof onDone === "function") onDone(user);
        }, 450);
      }, 500);
    });

    /* the full page is still there for anyone who prefers a password */
    el("auth-password").addEventListener("click", function () {
      window.location.href = ESA.loginUrl();
    });
  }

  function countdown(secs) {
    var btn = el("auth-resend");
    window.clearInterval(resendTimer);
    btn.disabled = true;
    btn.textContent = "Resend in " + secs + "s";
    resendTimer = window.setInterval(function () {
      secs -= 1;
      if (secs <= 0) {
        window.clearInterval(resendTimer);
        btn.disabled = false;
        btn.textContent = "Resend code";
      } else {
        btn.textContent = "Resend in " + secs + "s";
      }
    }, 1000);
  }

  function toOtp() {
    el("auth-known").hidden = true;
    el("auth-mobile-form").hidden = true;
    el("auth-otp-form").hidden = false;
    el("auth-otp-form").classList.remove("step-in");
    void el("auth-otp-form").offsetWidth;
    el("auth-otp-form").classList.add("step-in");
    el("auth-sheet-title").textContent = "Enter your code";
    var body = el("auth-otp-form");
    var oldSteps = body.querySelector(".steps");
    if (oldSteps) oldSteps.remove();
    body.insertAdjacentHTML("afterbegin", ESA.steps(2, 3));
    el("auth-otp-target").textContent = "+65 " + pendingMobile.slice(0, 4) + " " + pendingMobile.slice(4);
    el("auth-alert").classList.remove("show");
    el("auth-otp").classList.remove("bad");
    boxes.forEach(function (b) { b.value = ""; });
    boxes[0].focus();
    countdown(30);
  }

  ESA.authSheet = function (opts) {
    opts = opts || {};
    onDone = opts.onDone;
    if (!sheet) build();
    el("auth-reason").textContent = opts.reason || "";
    var mf = el("auth-mobile-form");
    if (mf && !mf.querySelector(".steps")) mf.insertAdjacentHTML("afterbegin", ESA.steps(1, 3));
    sheet.open();
  };
})();
