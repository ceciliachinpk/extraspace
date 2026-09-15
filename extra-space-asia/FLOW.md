# Extra Space Asia — personal storage app
## Journey write-up (24 screens, splash to move-out)

*A styled, printable version of this lives in flow.html.*

### Entry
**01 Splash** — the brand holds for 800ms, then cross-fades away. It never
delays the customer; by the time they've focused on the screen, they're home.

**02 Home** — one screen, two intents. A returning customer sees their unit,
the invoice due in 5 days and a red *Pay now*. A new customer sees search,
promotions and the four quick actions: Find storage, My unit, Pay bill,
Size guide. Facilities near them sit below, with real branch photography.

### Find — how much space, then where
**03 Size estimator** — the answer to the first question a personal customer
actually has. Either pick a home size (a few boxes → 5-room flat) or add items
one by one from a 35-item catalogue. It computes volume in cubic feet, models
each unit at 8ft stacking height and 70% packing efficiency, then recommends a
size with a fill gauge, a from-price, and honest advice: comfortable fit, or
"you're near the limit, the next size up gives you room to walk in". The CTA
carries the recommendation into Locations.

**04 Locations** — a map with price pins, filter chips (size, air-conditioned,
wine, 24/7) and a results sheet. Tapping a pin or a row *dives in*: the map
flies to the branch and the thumbnail grows into the facility hero.

**05–09 Facility** — five branches, each with its own photography, rating,
promotion, access hours and unit list with live prices. Wine storage carries
its own explainer (13–15°C, 70% humidity) at the three branches that have it;
where a size isn't stocked, the screen points to the nearest branch that has
it rather than dead-ending. A sticky red *Enquire now* follows the customer
down the page, and sign-in is always one tap away in the app bar.

### Convert
**10–11 Enquire** — name, mobile, email, preferred move-in date and contact
method, shown as step 1 of 2. Confirmation gives a reference number and holds
the rate for 7 days. A guest can do all of this without an account — nothing
is gated until there's something of theirs to protect.

### Sign in
**12 My storage · login wall** — the gate, and it explains itself. A blurred
peek of the customer's own unit card sits behind a lock, the headline names the
reason they hit it (pay an invoice, see an access code), and three benefits sit
below. Guests can keep browsing.

**13–15 Sign in** — mobile number, then a 6-digit code, then a verifying state
that auto-advances. Steps 1–3 are shown throughout. No password required;
password is the fallback, not the front door. Wherever the customer signed in
from, that's where they land back.

**16 My storage** — every booking in one list: the 50 sqft unit and the wine
locker, each with its next invoice, plus billing and past bookings.

### Manage
**17 Booking detail** — the lease in plain terms: started, renews, term,
monthly rate. Then the three things customers come for.

**18 Access code** — revealed for 30 seconds with a visible countdown, then
hidden again.

**19 Extend** — 6 or 12 months, with the rate-lock explained and 5% off for
committing to a year.

**20–21 Pay** — amount, invoice number, GIRO or card, then a receipt.

**22 Move-out** — the termination path. 10 days' notice is enforced by the
date picker, a reason is asked, and the customer must acknowledge emptying the
unit by 6pm. The booking then shows "Move-out scheduled", the modify options
disappear, the final invoice is pro-rated, and it can be cancelled any time
before the date.

**23–24** A second booking (wine locker) and the profile: contact details,
notification toggles, payment methods, security.

---
**Prototype:** 24 screens, 133 connections, all transitions cross-fade.
Two flows — *1 · Personal storage journey* from the splash, *2 · Sign-in flow*
from the wall. iPhone 17 (402 × 874).
