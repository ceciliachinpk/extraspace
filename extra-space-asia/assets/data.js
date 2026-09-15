/* Sample facility + inventory data for the Extra Space Asia app prototype.
   Singapore market, prices in SGD. Fictional availability and rates — swap
   this for a real API response; the screens only read these fields. */
window.ESA_MARKET = { code: "sg", name: "Singapore", flag: "🇸🇬", currency: "S$" };

/* The company operates in Singapore and Malaysia only. */
window.ESA_MARKETS = [
  { code: "sg", name: "Singapore", flag: "🇸🇬", currency: "S$", cities: "7 facilities" },
  { code: "my", name: "Malaysia",  flag: "🇲🇾", currency: "RM",  cities: "Kuala Lumpur &amp; Petaling Jaya" }
];

window.ESA_FACILITIES = [
  {
    id: "ayer-rajah",
    img: "assets/img/facility/commonwealth.jpg",
    name: "Ayer Rajah",
    address: "33 Ayer Rajah Crescent",
    postal: "Singapore 139898",
    mrt: "5 min from one-north MRT",
    phone: "+65 6704 1030",
    lat: 1.2924, lng: 103.7877,
    distance: 4.6,
    rating: 4.8, reviews: 312,
    photo: "",
    promo: "First month free",
    features: ["Air-conditioned", "Wine storage", "24/7 access", "CCTV monitored", "Loading bay"],
    hours: { office: "Mon&ndash;Fri 9am&ndash;6pm &middot; Sat 9am&ndash;1pm &middot; Sun closed", access: "24 hours daily" },
    units: [
      { size: "Locker &mdash; 15 sq ft", sqft: 15,  cat: "locker", price: 59,  was: 79,  aircon: true,  floor: "Level 2", left: 3, promo: "First month free" },
      { size: "25 sq ft",  sqft: 25,  cat: "small",  price: 95,  was: 125, aircon: true,  floor: "Level 2", left: 5, promo: "First month free" },
      { size: "35 sq ft",  sqft: 35,  cat: "small",  price: 129, was: 0,   aircon: true,  floor: "Level 3", left: 2, promo: "" },
      { size: "50 sq ft",  sqft: 50,  cat: "medium", price: 179, was: 219, aircon: true,  floor: "Level 3", left: 4, promo: "50% off 2 months" },
      { size: "100 sq ft", sqft: 100, cat: "large",  price: 319, was: 0,   aircon: false, floor: "Level 1", left: 1, promo: "" },
      { size: "Wine locker &mdash; 24 bottles", bottles: 24, sqft: 6,  cat: "wine", price: 49, was: 0,  aircon: true, floor: "Wine room", left: 5, promo: "" },
      { size: "Wine locker &mdash; 48 bottles", bottles: 48, sqft: 10, cat: "wine", price: 82, was: 0,  aircon: true, floor: "Wine room", left: 2, promo: "" }
    ]
  },
  {
    id: "kallang",
    img: "assets/img/facility/kallang-way.jpg",
    name: "Kallang",
    address: "6 Kallang Sector",
    postal: "Singapore 349276",
    mrt: "8 min from Aljunied MRT",
    phone: "+65 6704 1042",
    lat: 1.3247, lng: 103.8722,
    distance: 5.2,
    rating: 4.7, reviews: 268,
    photo: "photo-navy",
    promo: "50% off first 2 months",
    features: ["Air-conditioned", "Wine storage", "24/7 access", "CCTV monitored", "Lift access"],
    hours: { office: "Mon&ndash;Fri 9am&ndash;6pm &middot; Sat 9am&ndash;1pm &middot; Sun closed", access: "24 hours daily" },
    units: [
      { size: "Locker &mdash; 15 sq ft", sqft: 15,  cat: "locker", price: 65,  was: 0,   aircon: true, floor: "Level 4", left: 6, promo: "" },
      { size: "25 sq ft",  sqft: 25,  cat: "small",  price: 105, was: 139, aircon: true, floor: "Level 4", left: 2, promo: "50% off 2 months" },
      { size: "50 sq ft",  sqft: 50,  cat: "medium", price: 189, was: 0,   aircon: true, floor: "Level 5", left: 3, promo: "" },
      { size: "75 sq ft",  sqft: 75,  cat: "medium", price: 259, was: 315, aircon: true, floor: "Level 5", left: 1, promo: "50% off 2 months" },
      { size: "Wine locker &mdash; 24 bottles",  bottles: 24,  sqft: 6,  cat: "wine", price: 45,  was: 0,   aircon: true, floor: "Wine room", left: 9, promo: "" },
      { size: "Wine locker &mdash; 48 bottles",  bottles: 48,  sqft: 10, cat: "wine", price: 79,  was: 99,  aircon: true, floor: "Wine room", left: 4, promo: "50% off 2 months" },
      { size: "Wine cabinet &mdash; 120 bottles", bottles: 120, sqft: 18, cat: "wine", price: 169, was: 0,   aircon: true, floor: "Wine room", left: 2, promo: "" }
    ]
  },
  {
    id: "tai-seng",
    img: "assets/img/facility/tai-seng.jpg",
    name: "Tai Seng",
    address: "3 Irving Road",
    postal: "Singapore 369522",
    mrt: "3 min from Tai Seng MRT",
    phone: "+65 6704 1055",
    lat: 1.3350, lng: 103.8855,
    distance: 7.1,
    rating: 4.9, reviews: 441,
    photo: "photo-slate",
    promo: "",
    features: ["Air-conditioned", "Wine storage", "Business storage", "24/7 access", "Loading bay"],
    hours: { office: "Mon&ndash;Fri 9am&ndash;6.30pm &middot; Sat 9am&ndash;1pm &middot; Sun closed", access: "24 hours daily" },
    units: [
      { size: "25 sq ft",  sqft: 25,  cat: "small",  price: 99,  was: 0,   aircon: true,  floor: "Level 6", left: 4, promo: "" },
      { size: "50 sq ft",  sqft: 50,  cat: "medium", price: 175, was: 209, aircon: true,  floor: "Level 6", left: 7, promo: "First month free" },
      { size: "100 sq ft", sqft: 100, cat: "large",  price: 309, was: 0,   aircon: true,  floor: "Level 7", left: 2, promo: "" },
      { size: "150 sq ft", sqft: 150, cat: "large",  price: 449, was: 0,   aircon: false, floor: "Level 1", left: 1, promo: "" },
      { size: "Wine locker &mdash; 48 bottles",  bottles: 48,  sqft: 10, cat: "wine", price: 85,  was: 0, aircon: true, floor: "Wine room", left: 6, promo: "" },
      { size: "Wine cabinet &mdash; 120 bottles", bottles: 120, sqft: 18, cat: "wine", price: 175, was: 0, aircon: true, floor: "Wine room", left: 3, promo: "" },
      { size: "Wine room &mdash; 240 bottles",    bottles: 240, sqft: 32, cat: "wine", price: 299, was: 0, aircon: true, floor: "Wine room", left: 1, promo: "" }
    ]
  },
  {
    id: "bukit-merah",
    img: "assets/img/facility/boon-keng.jpg",
    name: "Bukit Merah",
    address: "8 Jalan Kilang Barat",
    postal: "Singapore 159351",
    mrt: "10 min from Redhill MRT",
    phone: "+65 6704 1068",
    lat: 1.2880, lng: 103.8060,
    distance: 3.4,
    rating: 4.6, reviews: 189,
    photo: "photo-sand",
    promo: "First month free",
    features: ["Air-conditioned", "Non air-conditioned", "CCTV monitored", "Free trolleys", "Packing supplies"],
    hours: { office: "Mon&ndash;Fri 9am&ndash;6pm &middot; Sat 9am&ndash;1pm &middot; Sun closed", access: "6am&ndash;11pm daily" },
    units: [
      { size: "Locker &mdash; 15 sq ft", sqft: 15,  cat: "locker", price: 55,  was: 72, aircon: false, floor: "Level 1", left: 8, promo: "First month free" },
      { size: "35 sq ft",  sqft: 35,  cat: "small",  price: 119, was: 0,  aircon: true,  floor: "Level 2", left: 3, promo: "" },
      { size: "75 sq ft",  sqft: 75,  cat: "medium", price: 239, was: 0,  aircon: true,  floor: "Level 2", left: 2, promo: "" },
      { size: "100 sq ft", sqft: 100, cat: "large",  price: 299, was: 359, aircon: false, floor: "Level 1", left: 5, promo: "50% off 2 months" }
    ]
  },
  {
    id: "toa-payoh",
    img: "assets/img/facility/marymount.jpg",
    name: "Toa Payoh",
    address: "970 Toa Payoh North",
    postal: "Singapore 318992",
    mrt: "6 min from Braddell MRT",
    phone: "+65 6704 1071",
    lat: 1.3390, lng: 103.8500,
    distance: 6.3,
    rating: 4.8, reviews: 227,
    photo: "",
    promo: "",
    features: ["Air-conditioned", "24/7 access", "CCTV monitored", "Lift access", "Free trolleys"],
    hours: { office: "Mon&ndash;Fri 9am&ndash;6pm &middot; Sat 9am&ndash;1pm &middot; Sun closed", access: "24 hours daily" },
    units: [
      { size: "15 sq ft",  sqft: 15,  cat: "locker", price: 62,  was: 0,   aircon: true, floor: "Level 3", left: 4, promo: "" },
      { size: "25 sq ft",  sqft: 25,  cat: "small",  price: 102, was: 132, aircon: true, floor: "Level 3", left: 6, promo: "First month free" },
      { size: "50 sq ft",  sqft: 50,  cat: "medium", price: 182, was: 0,   aircon: true, floor: "Level 4", left: 2, promo: "" }
    ]
  },
  {
    id: "woodlands",
    img: "assets/img/facility/woodlands.jpg",
    name: "Woodlands",
    address: "31 Woodlands Close",
    postal: "Singapore 737855",
    mrt: "7 min from Woodlands South MRT",
    phone: "+65 6704 1084",
    lat: 1.4370, lng: 103.7930,
    distance: 16.8,
    rating: 4.5, reviews: 143,
    photo: "photo-navy",
    promo: "50% off first 2 months",
    features: ["Non air-conditioned", "Drive-up loading", "24/7 access", "CCTV monitored", "Season parking"],
    hours: { office: "Mon&ndash;Fri 9am&ndash;6pm &middot; Sat 9am&ndash;1pm &middot; Sun closed", access: "24 hours daily" },
    units: [
      { size: "35 sq ft",  sqft: 35,  cat: "small",  price: 89,  was: 115, aircon: false, floor: "Level 1", left: 7, promo: "50% off 2 months" },
      { size: "75 sq ft",  sqft: 75,  cat: "medium", price: 199, was: 0,   aircon: false, floor: "Level 1", left: 4, promo: "" },
      { size: "150 sq ft", sqft: 150, cat: "large",  price: 389, was: 0,   aircon: false, floor: "Level 1", left: 2, promo: "" }
    ]
  },
  {
    id: "changi",
    img: "assets/img/facility/eunos-link.jpg",
    name: "Changi",
    address: "2 Changi North Street 1",
    postal: "Singapore 498827",
    mrt: "Shuttle from Expo MRT",
    phone: "+65 6704 1096",
    lat: 1.3760, lng: 103.9770,
    distance: 18.2,
    rating: 4.7, reviews: 176,
    photo: "photo-slate",
    promo: "First month free",
    features: ["Business storage", "Non air-conditioned", "Drive-up loading", "Forklift on site", "24/7 access"],
    hours: { office: "Mon&ndash;Fri 9am&ndash;6pm &middot; Sat closed &middot; Sun closed", access: "24 hours daily" },
    units: [
      { size: "50 sq ft",  sqft: 50,  cat: "medium", price: 149, was: 189, aircon: false, floor: "Level 1", left: 5, promo: "First month free" },
      { size: "100 sq ft", sqft: 100, cat: "large",  price: 269, was: 0,   aircon: false, floor: "Level 1", left: 3, promo: "" },
      { size: "150 sq ft", sqft: 150, cat: "large",  price: 369, was: 0,   aircon: false, floor: "Level 2", left: 1, promo: "" }
    ]
  }
];

/* Size guide, shown on the home screen and used by the size filters. */
window.ESA_SIZES = [
  { cat:"locker", size:"15 sq ft", label:"Locker",   blurb:"A few boxes, luggage, seasonal items.",        from:55 },
  { cat:"small",  size:"25 sq ft", label:"Small",    blurb:"Contents of a studio or one HDB bedroom.",      from:89 },
  { cat:"small",  size:"35 sq ft", label:"Small +",  blurb:"A bedroom of furniture plus boxes.",            from:119 },
  { cat:"medium", size:"50 sq ft", label:"Medium",   blurb:"A 2-room flat, or a home renovation move-out.", from:149 },
  { cat:"medium", size:"75 sq ft", label:"Medium +", blurb:"A 3-room flat with appliances.",                from:199 },
  { cat:"large",  size:"100 sq ft",label:"Large",    blurb:"A 4-room flat, or business inventory.",         from:269 },
  { cat:"wine",   size:"24&ndash;240 bottles", label:"Wine", blurb:"Held at 13&ndash;15&deg;C and 70% humidity.", from:45 }
];

/* Promotions carousel on the home screen. */
window.ESA_PROMOS = [
  { title: "Year-End Lock-In", body: "Up to 50% off your first 2 months when you sign a 12-month term.", tone: "", cta: "See promotion" },
  { title: "Free van rental",  body: "Book a unit of 50 sq ft or larger and move in with a free van.",    tone: "photo-navy", cta: "Check eligibility" },
  { title: "Refer a friend",   body: "You both get S$50 off your next invoice when they sign a lease.",   tone: "photo-accent", cta: "Get my link" }
];

/* ---------------------------------------------------------------------------
   Bookings — what a signed-in customer actually rents. Drives My storage,
   the booking detail screen and the modify / end-booking flows.
   --------------------------------------------------------------------------- */
window.ESA_BOOKINGS = [
  {
    id: "bk-04118",
    unit: "04-118",
    size: "50 sq ft",
    cat: "medium",
    facilityId: "kallang",
    type: "Air-conditioned",
    floor: "Level 5",
    status: "active",            /* active | ending | ended */
    started: "14 Mar 2026",
    renews: "1 Oct 2026",
    term: "12 months",
    rate: 189,
    gateCode: "4 7 2 9",
    nextInvoice: { amount: 189, due: "1 Oct 2026", inDays: 5 },
    invoices: [
      { no: "INV-2026-0912", date: "1 Sep 2026", amount: 189, status: "Paid" },
      { no: "INV-2026-0812", date: "1 Aug 2026", amount: 189, status: "Paid" },
      { no: "INV-2026-0712", date: "1 Jul 2026", amount: 189, status: "Paid" },
      { no: "INV-2026-0612", date: "1 Jun 2026", amount: 175, status: "Paid" },
      { no: "INV-2026-0512", date: "1 May 2026", amount: 175, status: "Paid" },
      { no: "INV-2026-0312", date: "14 Mar 2026", amount: 218, status: "Paid" }
    ]
  },
  {
    id: "bk-w021",
    unit: "W-021",
    size: "Wine locker &mdash; 48 bottles",
    cat: "wine",
    facilityId: "kallang",
    type: "Wine storage &middot; 13&ndash;15&deg;C",
    floor: "Wine room",
    status: "active",
    started: "2 Jun 2026",
    renews: "1 Oct 2026",
    term: "Month to month",
    rate: 79,
    gateCode: "4 7 2 9",
    nextInvoice: { amount: 79, due: "1 Oct 2026", inDays: 5 },
    invoices: [
      { no: "INV-2026-0913", date: "1 Sep 2026", amount: 79, status: "Paid" },
      { no: "INV-2026-0813", date: "1 Aug 2026", amount: 79, status: "Paid" },
      { no: "INV-2026-0613", date: "2 Jun 2026", amount: 108, status: "Paid" }
    ]
  },
  {
    id: "bk-02040",
    unit: "02-040",
    size: "25 sq ft",
    cat: "small",
    facilityId: "tai-seng",
    type: "Air-conditioned",
    floor: "Level 6",
    status: "ended",
    started: "5 Aug 2025",
    ended: "12 Jan 2026",
    term: "Month to month",
    rate: 99,
    invoices: [
      { no: "INV-2026-0104", date: "5 Jan 2026", amount: 99, status: "Paid" },
      { no: "INV-2025-1204", date: "5 Dec 2025", amount: 99, status: "Paid" }
    ]
  }
];

/* Reasons offered when ending a booking — a real move-out form asks. */
window.ESA_MOVEOUT_REASONS = [
  "Moved to a new home",
  "No longer need the space",
  "Renovation finished",
  "Transferring to another facility",
  "Cost",
  "Other"
];

/* ---------------------------------------------------------------------------
   In-app notifications
   --------------------------------------------------------------------------- */
window.ESA_NOTIFICATIONS = [
  {
    id: "n1", kind: "payment", unread: true, when: "2 hours ago",
    title: "Invoice due in 5 days",
    body: "S$189 for unit 04-118 at Kallang is due on 1 Oct.",
    cta: "Pay now", href: "account.html?reason=pay"
  },
  {
    id: "n2", kind: "access", unread: true, when: "Yesterday",
    title: "Your access code was refreshed",
    body: "Tap to see the new code for Kallang.",
    cta: "View code", href: "account.html?reason=gate"
  },
  {
    id: "n3", kind: "promo", unread: false, when: "3 days ago",
    title: "Year-End Lock-In is live",
    body: "Up to 50% off your first 2 months on a 12-month term.",
    cta: "See promotion", href: "map.html"
  }
];

/* ---------------------------------------------------------------------------
   Size estimator — capacities and item volumes in cubic feet.
   Units are modelled at 8 ft stacking height and 70% packing efficiency,
   which is what makes the recommendation defensible rather than decorative.
   --------------------------------------------------------------------------- */
window.ESA_CAPACITY = [
  { size: "15 sq ft",  sqft: 15,  cat: "locker", cuft: 84,  from: 55 },
  { size: "25 sq ft",  sqft: 25,  cat: "small",  cuft: 140, from: 89 },
  { size: "35 sq ft",  sqft: 35,  cat: "small",  cuft: 196, from: 119 },
  { size: "50 sq ft",  sqft: 50,  cat: "medium", cuft: 280, from: 149 },
  { size: "75 sq ft",  sqft: 75,  cat: "medium", cuft: 420, from: 199 },
  { size: "100 sq ft", sqft: 100, cat: "large",  cuft: 560, from: 269 },
  { size: "150 sq ft", sqft: 150, cat: "large",  cuft: 840, from: 369 }
];

window.ESA_PRESETS = [
  { id: "boxes",  label: "Just a few boxes", note: "Seasonal things, luggage", cuft: 40 },
  { id: "room",   label: "One room",         note: "A bedroom of furniture",   cuft: 130 },
  { id: "2room",  label: "2-room flat",      note: "Studio or 2-room HDB",     cuft: 250 },
  { id: "3room",  label: "3-room flat",      note: "3-room HDB or condo",      cuft: 400 },
  { id: "4room",  label: "4-room flat",      note: "4-room HDB, whole home",   cuft: 545 },
  { id: "5room",  label: "5-room or landed", note: "Large home, full move",    cuft: 800 },
  { id: "biz",    label: "Business stock",   note: "Inventory, files, equipment", cuft: 400 }
];

window.ESA_ITEMS = [
  { group: "Boxes & bags", items: [
    { id: "medium-box", label: "Medium box", cuft: 3, icon: "medium-box.webp" },
    { id: "suitcase", label: "Suitcase", cuft: 4, icon: "suitcase.webp" }
  ]},
  { group: "Living room", items: [
    { id: "sofa2", label: "2-seat sofa", cuft: 25, icon: "two-seat-sofa-shorter.webp" },
    { id: "sofa3", label: "3-seat sofa", cuft: 35, icon: "three-seat-sofa-shorter.webp" },
    { id: "armchair", label: "Armchair", cuft: 12, icon: "armchair.webp" },
    { id: "footstool", label: "Footstool", cuft: 4, icon: "footstall.webp" },
    { id: "coffee-table", label: "Coffee table", cuft: 8, icon: "coffee-table.webp" },
    { id: "tv", label: "TV", cuft: 4, icon: "tv.webp" },
    { id: "tv-unit", label: "TV unit", cuft: 12, icon: "tv-unit.webp" },
    { id: "bookcase", label: "Bookcase", cuft: 12, icon: "bookcase.webp" },
    { id: "bookshelf", label: "Large bookshelf", cuft: 18, icon: "bookshelf-large.webp" },
    { id: "rug", label: "Rug, rolled", cuft: 4, icon: "rug.webp" },
    { id: "painting", label: "Framed art", cuft: 2, icon: "painting.webp" },
    { id: "mirror", label: "Mirror", cuft: 3, icon: "mirror.webp" }
  ]},
  { group: "Bedroom", items: [
    { id: "single-bed", label: "Single bed", cuft: 22, icon: "single-bed.webp" },
    { id: "double-bed", label: "Double bed", cuft: 32, icon: "double-bed.webp" },
    { id: "bedside", label: "Bedside table", cuft: 5, icon: "bedside-table.webp" },
    { id: "dresser", label: "Chest of drawers", cuft: 15, icon: "triple-dresser.webp" }
  ]},
  { group: "Kitchen & dining", items: [
    { id: "fridge", label: "Fridge", cuft: 25, icon: "fridge.webp" },
    { id: "washer", label: "Washing machine", cuft: 12, icon: "washing-machine.webp" },
    { id: "dishwasher", label: "Dishwasher", cuft: 12, icon: "dishwasher.webp" },
    { id: "microwave", label: "Microwave", cuft: 3, icon: "microwave.webp" },
    { id: "table-s", label: "Small dining table", cuft: 14, icon: "small-dining-table.webp" },
    { id: "table-l", label: "Large dining table", cuft: 22, icon: "large-dining-table.webp" },
    { id: "chair", label: "Dining chair", cuft: 4, icon: "chair.webp" },
    { id: "sideboard", label: "Sideboard", cuft: 18, icon: "buffett.webp" },
    { id: "hall-table", label: "Hallway table", cuft: 8, icon: "hallway-table.webp" },
    { id: "side-table", label: "Side table", cuft: 5, icon: "small-table.webp" },
    { id: "nest", label: "Nest of tables", cuft: 6, icon: "nest-of-tables.webp" }
  ]},
  { group: "Office & bulky", items: [
    { id: "desk", label: "Desk", cuft: 15, icon: "desk.webp" },
    { id: "office-chair", label: "Office chair", cuft: 8, icon: "office-chair.webp" },
    { id: "filing", label: "Filing cabinet", cuft: 10, icon: "filing-cabinet.png" },
    { id: "bike", label: "Bicycle", cuft: 10, icon: "bike.webp" },
    { id: "golf", label: "Golf bag", cuft: 5, icon: "golf-bag.webp" },
    { id: "pallet", label: "Pallet of stock", cuft: 40, icon: "pallet.webp" }
  ]}
];

/* Interior shots reused across facilities, captioned per unit type. */
window.ESA_INTERIORS = [
  { src: "assets/img/facility/aircon.jpg",    caption: "Air-conditioned units" },
  { src: "assets/img/facility/corridor.jpg",  caption: "Corridor" },
  { src: "assets/img/facility/nonaircon.jpg", caption: "Non air-conditioned units" },
  { src: "assets/img/facility/wine.jpg",      caption: "Wine room" }
];
