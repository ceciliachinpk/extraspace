/* Booking detail: what the customer rents, what they've been invoiced, and
   the two things they actually come here to do — extend it or end it.
   Status changes persist in localStorage so the move-out state survives
   navigation, the way a real booking would. */
(function () {
  "use strict";

  var STATE_KEY = "esa_booking_state";
  var params = new URLSearchParams(window.location.search);
  var screen = document.getElementById("screen");
  var ctaBar = document.getElementById("cta-bar");
  var gateTimer;

  if (!ESA.session()) {
    window.location.replace("account.html?reason=unit");
    return;
  }

  var booking = window.ESA_BOOKINGS.filter(function (b) { return b.id === params.get("id"); })[0]
             || window.ESA_BOOKINGS[0];
  var facility = window.ESA_FACILITIES.filter(function (f) { return f.id === booking.facilityId; })[0];

  /* local overrides (move-out scheduled, extended term) */
  function state() {
    return window.ESA_STORE.local.json(STATE_KEY) || {};
  }
  function setState(patch) {
    var all = state();
    all[booking.id] = Object.assign({}, all[booking.id], patch);
    window.ESA_STORE.local.set(STATE_KEY, JSON.stringify(all));
  }
  function view() {
    return Object.assign({}, booking, state()[booking.id] || {});
  }

  var icon = function (path, size) {
    return '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' + path + '</svg>';
  };
  var P = {
    lock:  '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    cal:   '<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>',
    swap:  '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
    exit:  '<path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4"/><path d="m14 8 4 4-4 4M18 12H9"/>',
    doc:   '<path d="M6 3.5h9L19 8v12.5H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>',
    help:  '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.4a2.4 2.4 0 1 1 3.2 2.2c-.6.2-.9.8-.9 1.4v.4M12 16.6h.01"/>',
    dl:    '<path d="M12 4v10m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/>'
  };
  var CHEV = '<span class="chev">' + icon('<path d="m9 5 7 7-7 7"/>', 17) + '</span>';

  /* ---------------- dates ---------------------------------------------- */
  var NOTICE_DAYS = 10;
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function pretty(d) {
    return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] +
           " " + d.getFullYear();
  }
  var earliest = addDays(new Date(), NOTICE_DAYS);

  /* ---------------- render --------------------------------------------- */
  function statusChip(b) {
    if (b.status === "ended")  return '<span class="status status-ended">Ended ' + b.ended + '</span>';
    if (b.status === "ending") return '<span class="status status-ending">Ending ' + b.moveOut + '</span>';
    return '<span class="status status-active">Active</span>';
  }

  function fact(label, value) {
    return '<div class="fact">' + label + '<strong>' + value + '</strong></div>';
  }

  function rowBtn(id, path, title, sub, danger) {
    return '<button class="acct-row' + (danger ? " danger" : "") + '" type="button" data-act="' + id + '">' +
      '<span class="ic">' + icon(path, 19) + '</span>' +
      '<span><strong>' + title + '</strong><span>' + sub + '</span></span>' + CHEV + '</button>';
  }

  function render() {
    var b = view();
    document.getElementById("bar-title").innerHTML = "Unit " + b.unit;

    var invoices = b.invoices.map(function (i) {
      return '<div class="inv"><div class="txt"><strong>' + i.no + '</strong>' +
        '<span>' + i.date + '</span></div>' +
        '<div class="amt">' + ESA.money(i.amount) + '<span class="paid">' + i.status + '</span></div>' +
        '<button class="dl" type="button" data-inv="' + i.no + '" aria-label="Download ' + i.no + '">' +
          icon(P.dl, 18) + '</button></div>';
    }).join("");

    screen.innerHTML =
      '<div class="bk">' +
        (b.status === "ending"
          ? '<div class="alert-bar"><span class="ic">' + icon(P.cal, 19) + '</span>' +
            '<div><strong>Move-out scheduled for ' + b.moveOut + '</strong>' +
            'Empty the unit and remove your lock by 6pm. Your final invoice will be pro-rated.' +
            '<br><button type="button" id="cancel-moveout">Cancel move-out</button></div></div>'
          : "") +

        '<section class="bk-head">' +
          '<div class="top"><div><h2>Unit ' + b.unit + ' &middot; ' + b.size + '</h2>' +
            '<p>' + facility.name + ' &middot; ' + b.type + ' &middot; ' + b.floor + '</p></div>' +
            statusChip(b) + '</div>' +
          '<div class="facts">' +
            fact("Started", b.started) +
            fact(b.status === "ended" ? "Ended" : "Renews", b.status === "ended" ? b.ended : b.renews) +
            fact("Term", b.term) +
            fact("Monthly rate", ESA.money(b.rate)) +
          '</div>' +
        '</section>' +

        (b.status === "ended" ? "" :
          '<div class="acct-rows">' +
            rowBtn("gate", P.lock, "Access code", "Tap to show, hides after 30 seconds") +
          '</div><div id="gate-slot"></div>') +

        (b.status === "active"
          ? '<p class="acct-head">Modify booking</p>' +
            '<div class="acct-rows">' +
              rowBtn("extend", P.cal, "Extend booking", "Lock in a longer term and a better rate") +
              rowBtn("transfer", P.swap, "Transfer to another unit", "Move up or down a size") +
              rowBtn("end", P.exit, "End booking", NOTICE_DAYS + " days&rsquo; notice required", true) +
            '</div>'
          : "") +

        '<p class="acct-head" id="invoices">Invoices</p>' +
        '<div class="acct-rows">' + invoices + '</div>' +

        '<p class="acct-head">Documents &amp; help</p>' +
        '<div class="acct-rows">' +
          rowBtn("lease", P.doc, "Lease agreement", "Signed " + b.started) +
          rowBtn("help", P.help, "Get help with this booking", facility.phone) +
        '</div>' +
      '</div>';

    /* CTA bar only matters while money is still owed */
    if (b.status === "ended") {
      ctaBar.hidden = true;
    } else {
      ctaBar.hidden = false;
      document.getElementById("cta-price").innerHTML = ESA.money(b.nextInvoice.amount);
      document.getElementById("cta-note").innerHTML =
        (b.status === "ending" ? "Final invoice &middot; " : "Due ") + b.nextInvoice.due;
    }

    screen.querySelectorAll("[data-act]").forEach(function (el) {
      el.addEventListener("click", function () { act(el.dataset.act); });
    });
    screen.querySelectorAll("[data-inv]").forEach(function (el) {
      el.addEventListener("click", function () {
        ESA.toast("Invoice " + el.dataset.inv + " would download here.");
      });
    });
    var cancel = document.getElementById("cancel-moveout");
    if (cancel) cancel.addEventListener("click", cancelMoveOut);
  }

  function act(what) {
    if (what === "gate") return revealGate();
    if (what === "extend") return openExtend();
    if (what === "end") return openEnd();
    if (what === "transfer") return ESA.toast("Unit transfer is not part of this prototype.");
    if (what === "lease") return ESA.toast("The lease PDF would open here.");
    if (what === "help") return ESA.toast("Calling " + facility.phone + " is not wired up here.");
  }

  /* ---------------- access code ---------------------------------------- */
  function revealGate() {
    var slot = document.getElementById("gate-slot");
    var left = 30;
    window.clearInterval(gateTimer);
    slot.innerHTML = '<div class="gate-out" role="status">' +
      '<span class="gate">' + booking.gateCode + '</span>' +
      '<span class="hint" id="gate-count" style="margin:0">Hidden again in ' + left + 's</span></div>';
    gateTimer = window.setInterval(function () {
      left -= 1;
      var c = document.getElementById("gate-count");
      if (left <= 0 || !c) { window.clearInterval(gateTimer); if (slot) slot.innerHTML = ""; }
      else c.textContent = "Hidden again in " + left + "s";
    }, 1000);
  }

  /* ---------------- extend --------------------------------------------- */
  var extendSheet = ESA.sheet("extend-sheet");
  function openExtend() {
    var b = view();
    document.getElementById("extend-sub").innerHTML =
      "Unit " + b.unit + " &middot; currently " + b.term.toLowerCase();
    var opts = [
      { id: "6",  label: "6 more months",  note: "Same rate, locked until Apr 2027", rate: b.rate },
      { id: "12", label: "12 more months", note: "5% off for committing to a year",  rate: Math.round(b.rate * 0.95) }
    ];
    document.getElementById("extend-body").innerHTML =
      ESA.steps(1, 2) +
      '<p class="notice"><strong>Your rate is held while you extend.</strong>' +
      'Extending now keeps this unit at today&rsquo;s price instead of the prevailing rate at renewal.</p>' +
      opts.map(function (o, i) {
        return '<label class="opt' + (i === 1 ? " sel" : "") + '" data-opt="' + o.id + '">' +
          '<input type="radio" name="term" value="' + o.id + '"' + (i === 1 ? " checked" : "") + '>' +
          '<span class="mark" aria-hidden="true"></span>' +
          '<span><strong>' + o.label + '</strong><span>' + o.note + '</span></span>' +
          '<span class="price">' + ESA.money(o.rate) + '<small>/mo</small></span></label>';
      }).join("") +
      '<button class="btn btn-primary btn-block btn-lg" type="button" id="extend-confirm" style="margin-top:8px">' +
        'Confirm extension</button>' +
      '<p class="hint" style="text-align:center;margin-top:12px">Nothing is charged today &mdash; ' +
        'the new rate starts at your next invoice.</p>';

    document.getElementById("extend-body").querySelectorAll(".opt").forEach(function (el) {
      el.addEventListener("click", function () {
        document.getElementById("extend-body").querySelectorAll(".opt").forEach(function (o) { o.classList.remove("sel"); });
        el.classList.add("sel");
      });
    });
    document.getElementById("extend-confirm").addEventListener("click", function () {
      var sel = document.getElementById("extend-body").querySelector(".opt.sel");
      var months = sel ? sel.dataset.opt : "12";
      var until = addDays(new Date(), Number(months) * 30);
      setState({ term: months + " months", renews: pretty(until) });
      extendSheet.close();
      render();
      ESA.toast("Booking extended to " + pretty(until) + ".");
    });
    extendSheet.open();
  }

  /* ---------------- end booking (the termination flow) ------------------ */
  var endSheet = ESA.sheet("end-sheet");
  function openEnd() {
    var b = view();
    document.getElementById("end-sub").innerHTML = "Unit " + b.unit + " at " + facility.name;
    document.getElementById("end-body").innerHTML =
      ESA.steps(1, 2) +
      '<p class="notice"><strong>' + NOTICE_DAYS + ' days&rsquo; notice is required.</strong>' +
      'The earliest date you can move out is <strong style="color:var(--ink)">' + pretty(earliest) + '</strong>. ' +
      'Your final invoice is pro-rated to the move-out date.</p>' +
      '<div class="field"><label for="mo-date">Move-out date</label>' +
        '<input class="input" id="mo-date" type="date" min="' + iso(earliest) + '" value="' + iso(earliest) + '" required>' +
        '<p class="error-msg">Choose a date at least ' + NOTICE_DAYS + ' days from today.</p></div>' +
      '<div class="field"><label for="mo-reason">Reason for leaving</label>' +
        '<select class="select" id="mo-reason" required><option value="">Select a reason</option>' +
        window.ESA_MOVEOUT_REASONS.map(function (r) { return '<option>' + r + '</option>'; }).join("") +
        '</select><p class="error-msg">Let us know why you&rsquo;re leaving.</p></div>' +
      '<label class="check" style="margin:4px 0 18px"><input type="checkbox" id="mo-ack">' +
        '<span class="mark" aria-hidden="true"></span>' +
        '<span>I&rsquo;ll empty the unit and remove my lock by 6pm on that date.</span></label>' +
      '<p class="error-msg" id="mo-ack-error">Please confirm this before scheduling.</p>' +
      '<button class="btn btn-accent btn-block btn-lg" type="button" id="end-confirm">Schedule move-out</button>' +
      '<button class="textlink" type="button" data-sheet-close>Keep my booking</button>';

    document.getElementById("end-confirm").addEventListener("click", function () {
      var date = document.getElementById("mo-date");
      var reason = document.getElementById("mo-reason");
      var ack = document.getElementById("mo-ack");
      var ok = true;
      [date, reason].forEach(function (f) {
        var good = f.value && (f.id !== "mo-date" || new Date(f.value) >= new Date(iso(earliest)));
        f.closest(".field").classList.toggle("has-error", !good);
        f.setAttribute("aria-invalid", good ? "false" : "true");
        if (!good && ok) { f.focus(); ok = false; }
      });
      document.getElementById("mo-ack-error").style.display = ack.checked ? "none" : "block";
      if (!ack.checked) ok = false;
      if (!ok) return;

      var when = pretty(new Date(date.value));
      setState({ status: "ending", moveOut: when, moveOutReason: reason.value });
      document.getElementById("end-body").innerHTML =
        ESA.steps(2, 2) +
        '<div class="confirm"><div class="tick" aria-hidden="true">' +
          icon('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 28) + '</div>' +
        '<h3 style="font-size:18px;margin:0 0 6px">Move-out scheduled</h3>' +
        '<p style="margin:0 0 4px">Unit ' + b.unit + ' at ' + facility.name + ' closes on ' + when + '.</p>' +
        '<p class="hint" style="margin:0 0 20px">We&rsquo;ve emailed the details. Your final invoice will be ' +
          'pro-rated, and you can cancel any time before that date.</p>' +
        '<button class="btn btn-primary btn-block" type="button" data-sheet-close>Done</button></div>';
      document.getElementById("end-body").querySelector("[data-sheet-close]")
        .addEventListener("click", function () { endSheet.close(); render(); });
      document.getElementById("end-title").textContent = "Move-out scheduled";
    });
    endSheet.open();
  }

  function cancelMoveOut() {
    setState({ status: "active", moveOut: null });
    render();
    ESA.toast("Move-out cancelled — your booking continues.");
  }

  document.getElementById("pay-btn").addEventListener("click", function () {
    ESA.toast("Payment is not wired up in this prototype.");
  });

  render();

  /* deep links from the wall / notifications */
  if (params.get("action") === "gate") revealGate();
  if (params.get("action") === "pay") document.getElementById("pay-btn").focus({ preventScroll: true });
  if (window.location.hash === "#invoices") {
    var inv = document.getElementById("invoices");
    if (inv) inv.scrollIntoView({ block: "start" });
  }
})();
