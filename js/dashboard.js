/**
 * NaiRide – dashboard.js
 * User dashboard: sections, bookings, trips, profile
 */

// ── Mock user bookings ──
const USER_BOOKINGS = [
  {
    id: 'NR001234', route: 'Nairobi CBD → Mombasa', from: 'Nairobi CBD', to: 'Mombasa',
    operator: 'Modern Coast Express', sacco: 'Modern Coast', reg: 'KDG 234A',
    date: '2026-04-20', dep: '06:00', seats: [3, 4], fare: 1200, total: 2400,
    status: 'confirmed', payMethod: 'M-Pesa'
  },
  {
    id: 'NR001189', route: 'Nairobi CBD → Nakuru', from: 'Nairobi CBD', to: 'Nakuru',
    operator: '2NK SACCO', sacco: '2NK SACCO', reg: 'KBZ 123D',
    date: '2026-04-18', dep: '07:00', seats: [7], fare: 500, total: 500,
    status: 'confirmed', payMethod: 'M-Pesa'
  },
  {
    id: 'NR001042', route: 'Nairobi CBD → Kisumu', from: 'Nairobi CBD', to: 'Kisumu',
    operator: 'Akamba Bus Service', sacco: 'Akamba', reg: 'KBM 789F',
    date: '2026-03-15', dep: '07:30', seats: [2], fare: 900, total: 900,
    status: 'completed', payMethod: 'Airtel Money'
  },
  {
    id: 'NR000987', route: 'Nairobi CBD → Eldoret', from: 'Nairobi CBD', to: 'Eldoret',
    operator: 'Guardian Coach', sacco: 'Guardian Coach', reg: 'KDH 321G',
    date: '2026-03-02', dep: '06:30', seats: [5], fare: 800, total: 800,
    status: 'completed', payMethod: 'M-Pesa'
  },
  {
    id: 'NR000854', route: 'Nairobi CBD → Westlands', from: 'Nairobi CBD', to: 'Westlands',
    operator: 'Citi Hoppa', sacco: 'Citi Hoppa', reg: 'KBP 654H',
    date: '2026-02-20', dep: '07:00', seats: [9], fare: 50, total: 50,
    status: 'completed', payMethod: 'M-Pesa'
  },
  {
    id: 'NR000742', route: 'Nairobi CBD → Rongai', from: 'Nairobi CBD', to: 'Rongai',
    operator: 'Rongai Matatu SACCO', sacco: 'Rongai SACCO', reg: 'KCC 147J',
    date: '2026-02-10', dep: '08:00', seats: [3], fare: 80, total: 80,
    status: 'cancelled', payMethod: 'M-Pesa'
  },
  {
    id: 'NR000601', route: 'Nairobi CBD → Nakuru', from: 'Nairobi CBD', to: 'Nakuru',
    operator: 'Forward Travelers', sacco: 'Forward Travelers', reg: 'KCA 456E',
    date: '2026-01-28', dep: '09:00', seats: [6, 7], fare: 480, total: 960,
    status: 'completed', payMethod: 'Visa'
  },
  {
    id: 'NR000498', route: 'Nairobi CBD → Nyeri', from: 'Nairobi CBD', to: 'Nyeri',
    operator: 'Transline Classic', sacco: 'Transline', reg: 'KDJ 258K',
    date: '2026-01-05', dep: '07:00', seats: [4], fare: 450, total: 450,
    status: 'completed', payMethod: 'M-Pesa'
  }
];

let cancelTarget = null;

// ── Section navigation ──
function showSection(name) {
  document.querySelectorAll('.dash-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

  const section = document.getElementById('section-' + name);
  if (section) section.classList.add('active');

  const titleMap = {
    overview: 'Dashboard Overview', bookings: 'My Bookings',
    upcoming: 'Upcoming Trips', history: 'Travel History', profile: 'My Profile'
  };
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = titleMap[name] || 'Dashboard';

  // Populate on first show
  if (name === 'overview')  renderOverview();
  if (name === 'bookings')  renderAllBookings();
  if (name === 'upcoming')  renderUpcomingList();
  if (name === 'history')   renderHistory();
}

// ── Overview ──
function renderOverview() {
  renderUpcomingQuick();
  renderRecentBookings();
}

function renderUpcomingQuick() {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = USER_BOOKINGS.filter(b => b.date >= today && b.status === 'confirmed').slice(0, 2);
  const container = document.getElementById('upcoming-quick-list');
  if (!container) return;
  if (upcoming.length === 0) {
    container.innerHTML = `<div class="trips-list"><p style="color:var(--text-light);padding:12px">No upcoming trips. <a href="booking.html" style="color:var(--primary)">Book one now!</a></p></div>`;
    return;
  }
  container.innerHTML = `<div class="trips-list">${upcoming.map(b => `
    <div class="trip-card">
      <div class="trip-date">${formatDate(b.date)}</div>
      <div>
        <div class="trip-route">${b.from} → ${b.to}</div>
        <div class="trip-sacco">${b.operator} · ${b.dep} · Seat(s): ${b.seats.join(', ')}</div>
      </div>
      <span class="status-badge status-confirmed">Confirmed</span>
      <div class="trip-actions">
        <button class="btn-primary" style="padding:6px 14px;font-size:0.8rem" onclick="printTicket()">
          <i class="fas fa-ticket-alt"></i> Ticket
        </button>
      </div>
    </div>`).join('')}
  </div>`;
}

function renderRecentBookings() {
  const tbody = document.getElementById('recent-bookings-body');
  if (!tbody) return;
  tbody.innerHTML = USER_BOOKINGS.slice(0, 5).map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td>${b.from} → ${b.to}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.seats.join(', ')}</td>
      <td>${formatKES(b.total)}</td>
      <td><span class="status-badge status-${b.status}">${capitalize(b.status)}</span></td>
    </tr>`).join('');
}

// ── All Bookings ──
function renderAllBookings(filter = 'all') {
  const container = document.getElementById('all-bookings-grid');
  if (!container) return;
  const bookings = filter === 'all' ? USER_BOOKINGS : USER_BOOKINGS.filter(b => b.status === filter);
  if (bookings.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-light);padding:40px">No bookings found.</p>';
    return;
  }
  container.innerHTML = bookings.map(b => `
    <div class="booking-card">
      <div class="booking-card-header">
        <span class="booking-id">${b.id}</span>
        <span class="status-badge status-${b.status}">${capitalize(b.status)}</span>
      </div>
      <div class="booking-route">🚐 ${b.from} <i class="fas fa-arrow-right"></i> ${b.to}</div>
      <div class="booking-meta">
        <span><i class="fas fa-bus"></i> ${b.operator}</span>
        <span><i class="fas fa-calendar"></i> ${formatDate(b.date)} at ${b.dep}</span>
        <span><i class="fas fa-chair"></i> Seat(s): ${b.seats.join(', ')}</span>
        <span><i class="fas fa-mobile-alt"></i> Paid via ${b.payMethod}</span>
      </div>
      <div class="booking-footer">
        <span class="booking-amount">${formatKES(b.total)}</span>
        <div style="display:flex;gap:8px">
          <button class="btn-primary" style="padding:6px 12px;font-size:0.8rem" onclick="viewTicket('${b.id}')">
            <i class="fas fa-ticket-alt"></i>
          </button>
          ${b.status === 'confirmed' ? `
            <button class="btn-danger" style="padding:6px 12px;font-size:0.8rem" onclick="openCancelModal('${b.id}')">
              <i class="fas fa-times"></i> Cancel
            </button>` : ''}
        </div>
      </div>
    </div>`).join('');
}

function filterBookings(val) { renderAllBookings(val); }
function searchBookings(q) {
  if (!q) { renderAllBookings(); return; }
  const lq = q.toLowerCase();
  const results = USER_BOOKINGS.filter(b =>
    b.id.toLowerCase().includes(lq) || b.route.toLowerCase().includes(lq) || b.operator.toLowerCase().includes(lq)
  );
  const container = document.getElementById('all-bookings-grid');
  if (container) container.innerHTML = results.length ? results.map(renderBookingCard).join('') : '<p style="grid-column:1/-1;text-align:center;color:var(--text-light);padding:40px">No results found.</p>';
}

// ── Upcoming Trips ──
function renderUpcomingList() {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = USER_BOOKINGS.filter(b => b.date >= today && b.status === 'confirmed');
  const container = document.getElementById('upcoming-trips-list');
  if (!container) return;
  if (upcoming.length === 0) {
    container.innerHTML = `<div class="section-card" style="padding:40px;text-align:center;color:var(--text-light)">
      <i class="fas fa-calendar-times" style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:0.3"></i>
      <h3>No upcoming trips</h3>
      <p>Book your next matatu journey today!</p>
      <a href="booking.html" class="btn-primary" style="display:inline-flex;margin-top:16px">Book Now</a>
    </div>`;
    return;
  }
  container.innerHTML = `<div class="trips-list">${upcoming.map(b => `
    <div class="trip-card">
      <div class="trip-date">${formatDate(b.date)}</div>
      <div style="flex:1">
        <div class="trip-route">${b.from} → ${b.to}</div>
        <div class="trip-sacco">${b.operator} · ${b.sacco} · Reg: ${b.reg}</div>
        <div class="trip-sacco">Departure: ${b.dep} · Seat(s): ${b.seats.join(', ')}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;color:var(--accent)">${formatKES(b.total)}</div>
        <span class="status-badge status-confirmed">Confirmed</span>
      </div>
      <div class="trip-actions">
        <button class="btn-primary" style="padding:8px 16px;font-size:0.8rem" onclick="printTicket()">
          <i class="fas fa-print"></i> Print Ticket
        </button>
        <button class="btn-danger" style="padding:8px 16px;font-size:0.8rem" onclick="openCancelModal('${b.id}')">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>`).join('')}
  </div>`;
}

// ── History ──
function renderHistory() {
  const tbody = document.getElementById('history-body');
  if (!tbody) return;
  const past = USER_BOOKINGS.filter(b => b.status === 'completed' || b.status === 'cancelled');
  tbody.innerHTML = past.map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td>${b.from} → ${b.to}</td>
      <td>${b.operator}</td>
      <td>${formatDate(b.date)}</td>
      <td>${b.seats.join(', ')}</td>
      <td>${formatKES(b.total)}</td>
      <td><span class="status-badge status-${b.status}">${capitalize(b.status)}</span></td>
    </tr>`).join('');
}

// ── Modal ──
function openCancelModal(bookingId) {
  cancelTarget = bookingId;
  document.getElementById('cancel-booking-id').textContent = bookingId;
  document.getElementById('cancel-modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('cancel-modal').classList.add('hidden'); cancelTarget = null; }
function confirmCancel() {
  if (!cancelTarget) return;
  // POST to PHP backend
  fetch('php/cancel-booking.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: cancelTarget })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      const booking = USER_BOOKINGS.find(b => b.id === cancelTarget);
      if (booking) booking.status = 'cancelled';
      showToast('Booking ' + cancelTarget + ' cancelled successfully.');
    } else {
      showToast(data.message || 'Could not cancel booking.', 'error');
    }
  })
  .catch(() => {
    const booking = USER_BOOKINGS.find(b => b.id === cancelTarget);
    if (booking) booking.status = 'cancelled';
    showToast('Booking ' + cancelTarget + ' cancelled (demo mode).');
  });
  closeModal();
  renderAllBookings();
}

function viewTicket(bookingId) {
  showToast('Ticket for ' + bookingId + ' ready for printing.');
  setTimeout(printTicket, 500);
}

function updateProfile(e) {
  e.preventDefault();
  showToast('Profile updated successfully!');
}

// ── Helpers ──
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  showSection('overview');
});
