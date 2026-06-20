# Buffalo Hotel — Website

> **Static marketing & booking website** for Buffalo Hotel, Moshi, Kilimanjaro, Tanzania.
> Built as a standalone frontend — designed to connect to **StayFlow RMS** (the hotel's management system) via REST API.

---

## Overview

This is a **pure static website** — no framework, no build tool, no CMS, no dependencies. Just HTML, CSS, and vanilla JavaScript. It was built from scratch (not generated from WordPress or any template engine) and is ready to be hosted on any static host (Netlify, Vercel, GitHub Pages, cPanel, etc).

The site currently works as a **brochure + booking request form**. The booking form submits a mock response today — it is **ready and waiting** to be wired to the StayFlow RMS backend API.

---

## File Structure

```
buffalo-hotel/
├── index.html                  ← Homepage
├── rooms.html                  ← Room listings with filter
├── services.html               ← Services + FAQ accordion
├── about.html                  ← About, values, testimonials
├── contact.html                ← Contact info + Booking form (MAIN integration point)
├── README.md                   ← This file
│
└── assets/
    ├── css/
    │   └── style.css           ← All styles (1051 lines, single file)
    └── js/
    │   └── main.js             ← All interactivity (121 lines, single file)
    └── images/
        ├── hotel-reservation-logo.svg
        ├── hotel-reservation-hero-2-1.jpg
        ├── hotel-reservation-about-1.jpg
        ├── hotel-reservation-about-2.jpg
        ├── hotel-reservation-cta-1.jpg
        ├── hotel-reservation-cta-2.jpg
        ├── hotel-reservation-why-safar-2.png
        ├── hotel-reservation-why-safar-3.png
        ├── hotel-reservation-testimonial-1.png
        ├── hotel-reservation-testimonial-2.png
        ├── hotel-reservation-testimonial-3.png
        ├── hote-reservation-bars-2-1.jpg
        ├── accommodation-post-1-768x555.jpg  ← Room cards (6 rooms)
        ├── accommodation-post-2-768x555.jpg
        ├── accommodation-post-3-768x555.jpg
        ├── accommodation-post-4-768x555.jpg
        ├── accommodation-post-5-768x555.jpg
        └── accommodation-post-6-768x555.jpg
```

**No `node_modules`, no `package.json`, no build step.** Open `index.html` directly in a browser or serve with any static server.

---

## Pages

| Page | File | Key Sections |
|------|------|-------------|
| Homepage | `index.html` | Hero + quick booking bar + about preview + 3 featured rooms + why us + testimonials + CTA |
| Rooms | `rooms.html` | 6 room cards with JS filter (All / Standard / Suite / Executive) |
| Services | `services.html` | 9 service cards + FAQ accordion (6 questions) |
| About | `about.html` | Story + stats strip + values (3) + why us + testimonials |
| Contact | `contact.html` | Contact info panel + **full booking form** + Google Maps embed + CTA |

---

## Design System

All design tokens are CSS custom properties defined at the top of `style.css`:

```css
:root {
  --primary:       #C8973A;   /* gold — main brand accent */
  --primary-dark:  #A87C28;
  --primary-light: #E8B85A;
  --dark:          #1A1A1A;
  --dark-2:        #2D2D2D;   /* footer background */
  --text:          #4A4A4A;
  --text-light:    #7A7A7A;
  --white:         #FFFFFF;
  --off-white:     #F8F6F1;   /* section alternating background */
  --border:        #E8E0D0;
  --font-heading:  'Playfair Display', Georgia, serif;
  --font-body:     'Inter', sans-serif;
  --shadow:        0 4px 24px rgba(0,0,0,0.08);
  --shadow-lg:     0 12px 48px rgba(0,0,0,0.15);
  --radius:        8px;
  --transition:    all 0.3s ease;
}
```

To change brand colour site-wide — change `--primary` only.

---

## JavaScript — `assets/js/main.js`

Single file, no libraries, no imports. Sections (in order):

| Section | What it does |
|---------|-------------|
| **Header scroll** | Adds `.scrolled` class to `#header` after 60px scroll — hides top bar |
| **Mobile menu** | `.menu-toggle` opens `.mobile-nav` overlay; `.mobile-nav-close` closes it |
| **Scroll to top** | `#scrollTop` button appears after 400px scroll |
| **FAQ accordion** | Toggles `.open` class on `.faq-item` — one open at a time |
| **Active nav link** | Matches `window.location.pathname` to nav `href` attributes, adds `.active` class |
| **Date defaults** | Sets `#check-in` to today, `#check-out` to day after tomorrow; enforces min dates |
| **Contact form submit** | `#contactForm` — currently **MOCK ONLY** — see integration section below |
| **Animate on scroll** | `IntersectionObserver` fades in `.room-card`, `.service-card`, `.testimonial-card`, `.faq-item` |

---

## Booking Form — Integration Point

**File:** `contact.html`
**Form ID:** `contactForm`
**Section anchor:** `#booking`

### Form Fields

| Field ID | Type | Required | Notes |
|----------|------|----------|-------|
| `firstName` | text | ✅ | |
| `lastName` | text | ✅ | |
| `email` | email | ✅ | |
| `phone` | tel | ✅ | WhatsApp-friendly |
| `check-in` | date | ✅ | Pre-filled via JS |
| `check-out` | date | ✅ | Pre-filled via JS |
| `adults` | select | ✅ | 1–4 adults |
| `children` | select | ❌ | 0–3 children |
| `nationality` | text | ❌ | e.g. Tanzanian |
| `idType` | select | ❌ | `national_id` / `passport` / `drivers_license` / `voter_id` |
| `idNumber` | text | ❌ | ID document number |
| `roomType` | select | ✅ | Loaded dynamically from `/api/rooms/availability` |
| `services` | select | ❌ | Airport transfer / Safari / Conference / etc |
| `message` | textarea | ❌ | Special requests |

### Current Behavior (Mock)

In `main.js`, the submit handler currently does this:

```javascript
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✓ Message Sent!';
    btn.style.background = '#22c55e';
    contactForm.reset();
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1200);
});
```

**This entire block must be replaced** when connecting to StayFlow RMS. See integration spec below.

---

## StayFlow RMS Integration — What Needs to Be Built

### Required API Endpoints (Backend — StayFlow RMS)

#### 1. Create Booking
```
POST /api/bookings/website
Content-Type: application/json
```

Request body:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "nationality": "string",
  "idType": "national_id",
  "idNumber": "string",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "adults": 2,
  "children": 0,
  "roomType": "string",
  "additionalServices": "string",
  "message": "string",
  "source": "website"
}
```

Expected response:
```json
{
  "success": true,
  "bookingId": "BUF-2026-0042",
  "roomType": "Kilimanjaro View Suite",
  "totalAmount": 260000,
  "currency": "TZS",
  "nights": 2
}
```

Notes:
- Set `source = "website"` on every record — differentiates from walk-in/phone bookings in RMS
- Booking ID format: `BUF-YYYY-XXXX`
- Initial status: `PENDING`

#### 2. Initiate Payment
```
POST /api/payments/initiate
Content-Type: application/json
```

Request body:
```json
{
  "bookingId": "BUF-2026-0042",
  "amount": 260.00,
  "currency": "USD",
  "customerEmail": "string",
  "customerPhone": "string",
  "description": "Buffalo Hotel - Kilimanjaro View Suite (2 nights)"
}
```

Expected response:
```json
{
  "success": true,
  "paymentUrl": "https://gateway.com/pay/xxxx",
  "reference": "PAY-XXXX"
}
```

If payment gateway is not yet integrated, return a mock `paymentUrl` pointing to `/payment-success.html?bookingId=BUF-2026-0042`.

#### 3. Payment Callback (Webhook)
```
POST /api/payments/callback
```
- Receives confirmation from payment gateway
- Updates booking status → `CONFIRMED`
- Triggers confirmation email to guest

#### 4. Room Availability (Optional but recommended)
```
GET /api/rooms/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
```

Response:
```json
{
  "available": true,
  "rooms": [
    { "type": "Standard Comfort Room", "price": 150, "available": true },
    { "type": "Kilimanjaro View Suite", "price": 130, "available": true },
    { "type": "Buffalo Executive Room", "price": 280, "available": false }
  ]
}
```

If implemented, this can be used to disable unavailable room options in the `roomType` select field dynamically.

### CORS

Website makes API calls from browser. Backend must allow:

```javascript
cors({
  origin: [
    'https://buffalohotel.co.tz',  // production domain (update when known)
    'http://localhost:3000',
    'http://127.0.0.1:5500',       // VS Code Live Server
    'null'                          // local file:// access during dev
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Booking Status Flow

```
PENDING → AWAITING_PAYMENT → CONFIRMED → CHECKED_IN → CHECKED_OUT
```

### Frontend Changes Required (main.js)

Replace the mock `contactForm` submit block entirely with:
1. Collect all form field values into a payload object
2. `POST /api/bookings/website` → receive `bookingId` + `totalAmount`
3. `POST /api/payments/initiate` → receive `paymentUrl`
4. Replace form HTML with a booking summary (ID, room, nights, amount)
5. Show "Proceed to Payment" button linking to `paymentUrl`

Also create `payment-success.html` — the page user lands on after successful payment (reads `?bookingId=` from URL and shows confirmation).

---

## Placeholders — Update Before Go-Live

These are intentionally left as placeholders — client to provide:

| Item | Current Value | Where |
|------|--------------|-------|
| Phone number | `+255 XXX XXX XXX` | All pages (header, footer, contact) |
| Email | `info@buffalohotel.co.tz` | All pages |
| WhatsApp link | `https://wa.me/255000000000` | index, contact, footer |
| Google Maps embed | Generic Moshi town coordinates | `contact.html` — `<iframe>` src |
| Domain / API URL | Not set | Will be set in `main.js` as `API_BASE` constant |

---

## Rooms Listed

| Room | Price/night | Image file |
|------|------------|------------|
| Kilimanjaro View Suite | $130 | `accommodation-post-1-768x555.jpg` |
| Buffalo Executive Room | $280 | `accommodation-post-2-768x555.jpg` |
| Standard Comfort Room | $150 | `accommodation-post-3-768x555.jpg` |
| Twin Sharing Room | $110 | `accommodation-post-4-768x555.jpg` |
| Family Safari Suite | $195 | `accommodation-post-5-768x555.jpg` |
| Budget Single Room | $70 | `accommodation-post-6-768x555.jpg` |

Room type options and prices are loaded dynamically from `/api/rooms/availability` based on the selected check-in/check-out dates.

---

## Running Locally

No build step needed:

```bash
# Option 1 — VS Code Live Server (recommended)
# Install Live Server extension → right-click index.html → Open with Live Server

# Option 2 — Python
python3 -m http.server 8080
# then open http://localhost:8080

# Option 3 — Node
npx serve .
```

Do **not** open `index.html` directly as `file://` — the Google Fonts and Maps iframe may be blocked by the browser. Use a local server.

---

## Deployment

Static files only — deploy to any host:

```bash
# Netlify (drag & drop the buffalo-hotel/ folder)
# GitHub Pages (push to repo, enable Pages from root or /docs)
# cPanel (upload contents of buffalo-hotel/ to public_html/)
# Vercel (vercel deploy)
```

No environment variables needed on the frontend until API integration is done — at that point, set `API_BASE` in `main.js` to the StayFlow RMS backend URL.

---

## What This Site Does NOT Do

- No server-side rendering
- No database connection of its own
- No authentication
- No real-time availability checking (yet)
- No payment processing of its own — delegates entirely to StayFlow RMS + payment gateway

All business logic lives in **StayFlow RMS**. This site is purely the customer-facing interface.
