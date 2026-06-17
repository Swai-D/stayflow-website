/* Buffalo Hotel - Main JS */

// ── HEADER SCROLL ──
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── MOBILE MENU ──
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const mobileClose = document.querySelector('.mobile-nav-close');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}
if (mobileClose && mobileNav) {
  mobileClose.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
}

// ── SCROLL TO TOP ──
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── ACTIVE NAV LINK ──
const navLinks = document.querySelectorAll('nav.main-nav a, .mobile-nav a');
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ── BOOKING FORM DATE DEFAULTS ──
const checkIn = document.getElementById('check-in');
const checkOut = document.getElementById('check-out');
if (checkIn && checkOut) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);
  checkIn.value = today.toISOString().split('T')[0];
  checkIn.min = today.toISOString().split('T')[0];
  checkOut.value = dayAfter.toISOString().split('T')[0];
  checkIn.addEventListener('change', () => {
    const newMin = new Date(checkIn.value);
    newMin.setDate(newMin.getDate() + 1);
    checkOut.min = newMin.toISOString().split('T')[0];
    if (new Date(checkOut.value) <= new Date(checkIn.value)) {
      checkOut.value = newMin.toISOString().split('T')[0];
    }
  });
}

// ── CONFIG ──
const API_BASE = 'http://localhost:5000'; // ← REPLACE WITH YOUR STAYFLOW API URL

// ── CONTACT FORM SUBMIT ──
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    // Loading state
    btn.innerHTML = `<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg> Processing...`;
    btn.disabled = true;

    // Collect form data
    const payload = {
      firstName:          contactForm.querySelector('#firstName').value.trim(),
      lastName:           contactForm.querySelector('#lastName').value.trim(),
      email:              contactForm.querySelector('#email').value.trim(),
      phone:              contactForm.querySelector('#phone').value.trim(),
      checkIn:            contactForm.querySelector('#check-in').value,
      checkOut:           contactForm.querySelector('#check-out').value,
      guests:             contactForm.querySelector('#guests').value,
      roomType:           contactForm.querySelector('#roomType').value,
      additionalServices: contactForm.querySelector('#services').value,
      message:            contactForm.querySelector('#message').value.trim(),
      source:             'website'
    };

    // Basic validation
    const required = ['firstName','lastName','email','phone','checkIn','checkOut','guests','roomType'];
    const missing = required.filter(k => !payload[k]);
    if (missing.length) {
      showFormError(btn, originalHTML, 'Please fill in all required fields.');
      return;
    }

    try {
      // STEP 1: Create booking
      const bookingRes = await fetch(`${API_BASE}/api/bookings/website`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const booking = await bookingRes.json();

      if (!bookingRes.ok || !booking.success) {
        const msg = (booking.error && booking.error.message) || booking.message || 'Booking failed. Please try again.';
        throw new Error(msg);
      }

      // STEP 2: Initiate payment
      const paymentRes = await fetch(`${API_BASE}/api/payments/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId:       booking.bookingId,
          amount:          booking.totalAmount,
          currency:        booking.currency,
          customerEmail:   payload.email,
          customerPhone:   payload.phone,
          description:     `Buffalo Hotel - ${booking.roomType} (${booking.nights} night${booking.nights > 1 ? 's' : ''})`
        })
      });

      const payment = await paymentRes.json();

      if (!paymentRes.ok || !payment.success) {
        const msg = (payment.error && payment.error.message) || payment.message || 'Payment initiation failed. Please contact us directly.';
        throw new Error(msg);
      }

      // STEP 3: Show summary then redirect to payment
      showBookingSummary(booking, payment.paymentUrl);

    } catch (err) {
      showFormError(btn, originalHTML, err.message);
    }
  });
}

// ── HELPERS ──

function showFormError(btn, originalHTML, message) {
  btn.innerHTML = originalHTML;
  btn.disabled = false;

  // Remove old error if any
  const old = document.getElementById('formError');
  if (old) old.remove();

  const err = document.createElement('div');
  err.id = 'formError';
  err.style.cssText = `
    margin-top: 12px; padding: 14px 18px;
    background: #FEF2F2; border: 1.5px solid #FECACA;
    border-radius: 8px; color: #DC2626;
    font-size: 0.875rem; font-weight: 500;
  `;
  err.textContent = '⚠️ ' + message;
  btn.parentNode.insertBefore(err, btn.nextSibling);

  // Auto-remove after 6s
  setTimeout(() => err.remove(), 6000);
}

function showBookingSummary(booking, paymentUrl) {
  const form = document.getElementById('contactForm');

  form.innerHTML = `
    <div style="text-align: center; padding: 20px 0;">
      <div style="width: 64px; height: 64px; background: rgba(200,151,58,0.12); border-radius: 50%;
        display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 2rem;">
        ✅
      </div>
      <h3 style="color: var(--dark); margin-bottom: 8px;">Booking Confirmed!</h3>
      <p style="color: var(--text-light); margin-bottom: 24px;">
        Your request has been received. Complete payment to secure your room.
      </p>

      <div style="background: var(--off-white); border-radius: 8px; padding: 20px;
        text-align: left; margin-bottom: 24px; font-size: 0.875rem;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0;
          border-bottom: 1px solid var(--border);">
          <span style="color: var(--text-light);">Booking ID</span>
          <strong style="color: var(--primary);">${booking.bookingId}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;
          border-bottom: 1px solid var(--border);">
          <span style="color: var(--text-light);">Room</span>
          <strong>${booking.roomType}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;
          border-bottom: 1px solid var(--border);">
          <span style="color: var(--text-light);">Duration</span>
          <strong>${booking.nights} night${booking.nights > 1 ? 's' : ''}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span style="color: var(--text-light);">Total Amount</span>
          <strong style="font-size: 1.1rem; color: var(--primary);">
            ${booking.currency} ${booking.totalAmount.toLocaleString()}
          </strong>
        </div>
      </div>

      <a href="${paymentUrl}" 
        style="display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 16px 32px; background: var(--primary); color: white;
          border-radius: 4px; font-weight: 700; font-size: 0.95rem;
          text-decoration: none; transition: all 0.3s;"
        onmouseover="this.style.background='#A87C28'"
        onmouseout="this.style.background='var(--primary)'">
        💳 Proceed to Payment
      </a>

      <p style="margin-top: 16px; font-size: 0.8rem; color: var(--text-light);">
        Booking ID: <strong>${booking.bookingId}</strong> — 
        Save this for reference. We'll email you a confirmation after payment.
      </p>
    </div>
  `;
}

// ── ANIMATE ON SCROLL ──
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.room-card, .service-card, .testimonial-card, .faq-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
