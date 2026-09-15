/* Login screen: one-time-code first, password as a fallback.
   Nothing is transmitted — the handlers only demonstrate the states, and the
   "session" is a localStorage flag so the rest of the app can show a signed-in
   state (see ESA.session in app.js). */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var next = params.get("next") || "home.html";
  /* only allow in-app destinations back from ?next= */
  if (!/^[a-z0-9._-]+\.html(\?[^#]*)?$/i.test(next)) next = "home.html";

  var LAST = "esa_last_identity";

  /* When a wall sent the customer here, say which one. */
  var WHY = {
    pay:     "Sign in to view and pay your invoice.",
    gate:    "Sign in to see your unit access code.",
    profile: "Sign in to update your account details.",
    unit:    "Sign in to manage your unit."
  };
  var why = WHY[new URLSearchParams(window.location.search).get("reason")];

  var COPY = {
    identity: { title: "Welcome back",
                sub: why || "No password needed &mdash; we&rsquo;ll text you a one-time code." },
    otp:      { title: "Check your phone", sub: "Enter the 6-digit code to finish signing in." },
    password: { title: "Sign in", sub: "Use the email and password on your account." },
    register: { title: "Create your account", sub: "Two fields and a code. That&rsquo;s it." }
  };

  var steps = ["identity", "otp", "password", "register"];
  var current = "identity";
  var pendingMobile = "";
  var pendingName = "";
  var registering = false;

  function el(id) { return document.getElementById(id); }

  function show(step) {
    current = step;
    steps.forEach(function (s) { el("step-" + s).hidden = s !== step; });
    el("top-title").textContent = COPY[step].title;
    el("top-sub").innerHTML = COPY[step].sub;
    /* the segmented control only makes sense on the two entry steps */
    el("seg").hidden = step === "otp" || step === "password";
    el("tab-signin").setAttribute("aria-selected", step !== "register");
    el("tab-create").setAttribute("aria-selected", step === "register");
    /* progress through number -> code -> signed in */
    var STEP = { identity: 1, otp: 2, password: 0, register: 0 };
    var panel2 = el("step-" + step);
    var old = panel2.querySelector(".steps");
    if (old) old.remove();
    if (STEP[step]) panel2.insertAdjacentHTML("afterbegin", ESA.steps(STEP[step], 3));
    el("main").scrollTop = 0;
    /* replay the entry animation so each step reads as forward motion */
    var panel = el("step-" + step);
    panel.classList.remove("step-in");
    void panel.offsetWidth;
    panel.classList.add("step-in");
    if (step === "otp") el("otp-1").focus({ preventScroll: true });
  }

  /* ---------------- remembered identity ------------------------------- */
  var remembered = null;
  remembered = window.ESA_STORE.local.json(LAST);

  if (remembered && remembered.mobile) {
    var masked = "+65 " + remembered.mobile.slice(0, 4) + " " +
                 remembered.mobile.slice(4).replace(/\d/g, "•");
    el("known-user").hidden = false;
    el("known-name").textContent = remembered.name
      ? "Continue as " + remembered.name
      : "Continue with this number";
    el("known-mobile").textContent = masked;
    el("known-initials").textContent = remembered.name
      ? remembered.name.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase()
      : "65";
    el("faceid").hidden = false;      /* biometrics only after a first sign-in */
    el("known-user").addEventListener("click", function () {
      pendingMobile = remembered.mobile;
      pendingName = remembered.name;
      startOtp();
    });
  }

  /* ---------------- step 1: request a code ---------------------------- */
  el("otp-request-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = el("mobile");
    var digits = input.value.replace(/\D/g, "");
    var ok = digits.length === 8;
    input.closest(".field").classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok) { input.focus(); return; }
    pendingMobile = digits;
    registering = false;
    startOtp();
  });

  el("use-password").addEventListener("click", function () { show("password"); });
  el("otp-to-password").addEventListener("click", function () { show("password"); });
  el("back-to-otp").addEventListener("click", function () { show("identity"); });
  el("change-number").addEventListener("click", function () { show("identity"); });
  el("forgot").addEventListener("click", function (e) {
    e.preventDefault();
    show("identity");
    ESA.toast("No password to reset — just use a one-time code.");
  });

  el("tab-signin").addEventListener("click", function () { show("identity"); });
  el("tab-create").addEventListener("click", function () { show("register"); });
  el("go-signin").addEventListener("click", function (e) { e.preventDefault(); show("identity"); });
  if (window.location.hash === "#create") show("register");

  /* ---------------- step 2: the code ---------------------------------- */
  var boxes = Array.prototype.slice.call(document.querySelectorAll("#otp-inputs input"));
  var resendTimer;

  function startOtp() {
    el("otp-target").textContent = "+65 " + pendingMobile.slice(0, 4) + " " + pendingMobile.slice(4);
    el("otp-alert").classList.remove("show");
    el("otp-inputs").classList.remove("bad");
    boxes.forEach(function (b) { b.value = ""; });
    show("otp");
    countdown(30);
  }

  function countdown(secs) {
    var btn = el("resend-btn");
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

  el("resend-btn").addEventListener("click", function () {
    ESA.toast("New code sent to +65 " + pendingMobile.slice(0, 4) + " " + pendingMobile.slice(4) + ".");
    countdown(30);
    boxes[0].focus();
  });

  boxes.forEach(function (box, i) {
    box.addEventListener("input", function () {
      /* accept a pasted or autofilled full code in any single box */
      var digits = box.value.replace(/\D/g, "");
      if (digits.length > 1) {
        digits.split("").slice(0, boxes.length - i).forEach(function (d, k) { boxes[i + k].value = d; });
        var last = Math.min(i + digits.length, boxes.length) - 1;
        boxes[last].focus();
      } else {
        box.value = digits;
        if (digits && i < boxes.length - 1) boxes[i + 1].focus();
      }
      el("otp-inputs").classList.remove("bad");
      if (boxes.every(function (b) { return b.value; })) el("otp-form").requestSubmit();
    });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && !box.value && i > 0) {
        boxes[i - 1].focus();
        boxes[i - 1].value = "";
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" && i > 0) boxes[i - 1].focus();
      if (e.key === "ArrowRight" && i < boxes.length - 1) boxes[i + 1].focus();
    });
  });

  el("otp-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var code = boxes.map(function (b) { return b.value; }).join("");
    if (code.length < 6) {
      el("otp-inputs").classList.add("bad");
      el("otp-alert-text").textContent = "Enter all 6 digits from the SMS.";
      el("otp-alert").classList.add("show");
      boxes[code.length] && boxes[code.length].focus();
      return;
    }
    var btn = el("otp-form").querySelector("button[type=submit]");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Verifying…';
    window.setTimeout(function () {
      finish(pendingName || guessName(), pendingMobile, registering ? "Account created" : "Signed in");
    }, 500);
  });

  el("faceid").addEventListener("click", function () {
    ESA.toast("Verifying with Face ID…");
    window.setTimeout(function () {
      finish(remembered.name, remembered.mobile, "Signed in with Face ID");
    }, 700);
  });

  /* ---------------- step 3: password fallback ------------------------- */
  var signin = el("signin-form");
  signin.addEventListener("submit", function (e) {
    e.preventDefault();
    el("signin-alert").classList.remove("show");
    if (!ESA.validate(signin)) return;

    var btn = signin.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Signing in…';

    /* stand-in for the real auth call: 8+ characters "succeeds", so both
       states can be reviewed */
    window.setTimeout(function () {
      btn.disabled = false;
      if (el("password").value.length < 8) {
        btn.textContent = "Sign in";
        el("signin-alert-text").textContent = "We couldn’t find an account with those details.";
        el("signin-alert").classList.add("show");
        el("main").scrollTop = 0;
      } else {
        var email = el("email").value.trim();
        finish(email.split("@")[0].replace(/[._]/g, " "), remembered ? remembered.mobile : "", "Signed in");
      }
    }, 550);
  });

  /* ---------------- register ------------------------------------------ */
  var create = el("create-form");
  create.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = ESA.validate(create);

    var mob = el("c-mobile");
    var digits = mob.value.replace(/\D/g, "");
    if (digits.length !== 8) {
      mob.closest(".field").classList.add("has-error");
      mob.setAttribute("aria-invalid", "true");
      if (ok) mob.focus();
      ok = false;
    }

    var terms = create.querySelector("input[name=terms]");
    el("terms-error").style.display = terms.checked ? "none" : "block";
    if (!terms.checked) { ok = false; terms.focus(); }
    if (!ok) return;

    pendingMobile = digits;
    pendingName = el("c-name").value.trim();
    registering = true;
    startOtp();
  });

  /* ---------------- finish -------------------------------------------- */
  /* An OTP sign-in doesn't reveal a name; greet plainly rather than
     inventing one. */
  function guessName() {
    return remembered && remembered.name ? remembered.name : "";
  }

  function finish(name, mobile, message) {
    var user = { name: (name || "").trim(), mobile: mobile || "" };
    ESA.signIn(user);
    window.ESA_STORE.local.set(LAST, JSON.stringify(user));
    ESA.toast(message + ". Taking you " + (next === "home.html" ? "home" : "back") + "…");
    window.setTimeout(function () { window.location.href = next; }, 800);
  }

  /* back button returns through the flow rather than leaving the app */
  el("back-btn").addEventListener("click", function () {
    if (current === "otp" || current === "password") show("identity");
    else window.location.href = next;
  });

  show("identity");
})();
