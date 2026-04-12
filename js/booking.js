/**
 * NaiRide – booking.js
 * Handles all booking page logic:
 *   Step 1: Search routes
 *   Step 2: Choose matatu
 *   Step 3: Select seat
 *   Step 4: Confirm & pay
 */

// ── State ──
let selectedMatatu   = null;
let selectedSeats    = [];
let requiredPassengers = 1;
let currentStep      = 1;

// ── Mock matatu data (replaced by PHP API in production) ──
// Includes the real Kenyan matatus from the fleet photos
const MATATUS_DB = [
  // ── Nairobi → Mombasa ──
  {
    id: 1, operator: 'Modern Coast Express', reg: 'KDG 234A',
    sacco: 'Modern Coast', route: 'Nairobi CBD → Mombasa',
    from: 'Nairobi CBD', to: 'Mombasa',
    dep: '06:00', arr: '14:00', duration: '8 hrs',
    fare: 1200, totalSeats: 14, bookedSeats: [2, 5, 8, 11],
    features: ['AC', 'Reclining Seats', 'Charging Ports', 'WiFi'],
    image: 'assets/images/teal-matatu.jpg', nickname: 'Cyber Wave'
  },
  {
    id: 2, operator: 'Easy Coach Ltd', reg: 'KDE 567B',
    sacco: 'Easy Coach', route: 'Nairobi CBD → Mombasa',
    from: 'Nairobi CBD', to: 'Mombasa',
    dep: '08:30', arr: '16:30', duration: '8 hrs',
    fare: 1100, totalSeats: 14, bookedSeats: [1, 3, 6, 9, 12],
    features: ['AC', 'Reclining Seats'],
    image: 'assets/images/xtreme.jpg', nickname: 'Xtreme – Shimoli 001'
  },
  {
    id: 3, operator: 'Dreamline Express', reg: 'KDF 890C',
    sacco: 'Dreamline', route: 'Nairobi CBD → Mombasa',
    from: 'Nairobi CBD', to: 'Mombasa',
    dep: '20:00', arr: '04:00', duration: '8 hrs',
    fare: 1300, totalSeats: 14, bookedSeats: [4, 7],
    features: ['AC', 'Reclining Seats', 'Charging Ports', 'Night LED Lighting'],
    image: 'assets/images/hero-green-led.jpg', nickname: 'Green Phantom'
  },

  // ── Nairobi → Nakuru ──
  {
    id: 4, operator: '2NK SACCO', reg: 'KBZ 123D',
    sacco: '2NK SACCO', route: 'Nairobi CBD → Nakuru',
    from: 'Nairobi CBD', to: 'Nakuru',
    dep: '07:00', arr: '09:30', duration: '2.5 hrs',
    fare: 500, totalSeats: 14, bookedSeats: [3, 6, 10],
    features: ['AC'],
    image: 'assets/images/pink-matatu.jpg', nickname: 'Pink Beauty'
  },
  {
    id: 5, operator: 'Forward Travelers', reg: 'KCA 456E',
    sacco: 'Forward Travelers', route: 'Nairobi CBD → Nakuru',
    from: 'Nairobi CBD', to: 'Nakuru',
    dep: '09:00', arr: '11:30', duration: '2.5 hrs',
    fare: 480, totalSeats: 14, bookedSeats: [1, 2, 7, 13],
    features: ['AC', 'Charging Ports'],
    image: 'assets/images/arafat.jpg', nickname: 'Arafat – Goodlife'
  },

  // ── Nairobi → Kisumu ──
  {
    id: 6, operator: 'Akamba Bus Service', reg: 'KBM 789F',
    sacco: 'Akamba', route: 'Nairobi CBD → Kisumu',
    from: 'Nairobi CBD', to: 'Kisumu',
    dep: '07:30', arr: '13:30', duration: '6 hrs',
    fare: 900, totalSeats: 14, bookedSeats: [5, 8, 11],
    features: ['AC', 'Reclining Seats'],
    image: 'assets/images/catalyst-side.jpg', nickname: 'Catalyst Express'
  },

  // ── Nairobi → Eldoret ──
  {
    id: 7, operator: 'Guardian Coach', reg: 'KDH 321G',
    sacco: 'Guardian Coach', route: 'Nairobi CBD → Eldoret',
    from: 'Nairobi CBD', to: 'Eldoret',
    dep: '06:30', arr: '11:30', duration: '5 hrs',
    fare: 800, totalSeats: 14, bookedSeats: [2, 5, 9],
    features: ['AC', 'Reclining Seats', 'Charging Ports'],
    image: 'assets/images/xtreme.jpg', nickname: 'Xtreme Eldoret'
  },

  // ── Nairobi → Westlands ──
  {
    id: 8, operator: 'Citi Hoppa', reg: 'KBP 654H',
    sacco: 'Citi Hoppa', route: 'Nairobi CBD → Westlands',
    from: 'Nairobi CBD', to: 'Westlands',
    dep: '07:00', arr: '07:30', duration: '30 min',
    fare: 50, totalSeats: 14, bookedSeats: [1, 3, 5, 7, 9],
    features: [],
    image: 'assets/images/teal-matatu.jpg', nickname: 'Cyber Wave'
  },
  {
    id: 9, operator: 'KBS Route 23', reg: 'KBQ 987I',
    sacco: 'KBS', route: 'Nairobi CBD → Westlands',
    from: 'Nairobi CBD', to: 'Westlands',
    dep: '07:30', arr: '08:10', duration: '40 min',
    fare: 60, totalSeats: 14, bookedSeats: [2, 4, 6, 8, 10, 12],
    features: ['AC'],
    image: 'assets/images/pink-matatu.jpg', nickname: 'Pink Beauty'
  },

  // ── Nairobi → Rongai (the Catalyst/Arafat route!) ──
  {
    id: 10, operator: 'Catalyst – Cyber-shot Isuzu', reg: 'KCF 8020',
    sacco: 'Rongai SACCO', route: 'Nairobi CBD → Rongai',
    from: 'Nairobi CBD', to: 'Rongai',
    dep: '07:00', arr: '07:45', duration: '45 min',
    fare: 80, totalSeats: 14, bookedSeats: [3, 6, 11],
    features: ['Sub-woofer', 'LED Lighting', 'TV Screen'],
    image: 'assets/images/catalyst-front.jpg', nickname: 'Catalyst ⚡'
  },
  {
    id: 11, operator: 'Arafat – Ongata Line', reg: 'KCH 473B',
    sacco: 'Rongai SACCO', route: 'Nairobi CBD → Rongai',
    from: 'Nairobi CBD', to: 'Rongai',
    dep: '08:30', arr: '09:15', duration: '45 min',
    fare: 80, totalSeats: 14, bookedSeats: [1, 4, 9],
    features: ['Sub-woofer', 'Neon Lights', 'Custom Interior'],
    image: 'assets/images/arafat.jpg', nickname: 'Arafat 🔮 Goodlife'
  },
  {
    id: 12, operator: 'Xtreme – Shimoli 001', reg: 'KDG 1012',
    sacco: 'Rongai SACCO', route: 'Nairobi CBD → Rongai',
    from: 'Nairobi CBD', to: 'Rongai',
    dep: '10:00', arr: '10:45', duration: '45 min',
    fare: 80, totalSeats: 14, bookedSeats: [2, 5, 8, 13],
    features: ['Sub-woofer', 'Graffiti Art', 'LED Strips'],
    image: 'assets/images/xtreme.jpg', nickname: 'Xtreme 🚀'
  },
  {
    id: 13, operator: 'Green Phantom – Night Rider', reg: 'KCH 857',
    sacco: 'Rongai SACCO', route: 'Nairobi CBD → Rongai',
    from: 'Nairobi CBD', to: 'Rongai',
    dep: '18:00', arr: '18:45', duration: '45 min',
    fare: 100, totalSeats: 14, bookedSeats: [7, 10],
    features: ['Full LED Kit', 'Neon Lights', 'Premium Sound', 'Night Special'],
    image: 'assets/images/hero-green-led.jpg', nickname: 'Green Phantom 💚'
  },

  // ── Nairobi → Nyeri ──
  {
    id: 14, operator: 'Transline Classic', reg: 'KDJ 258K',
    sacco: 'Transline', route: 'Nairobi CBD → Nyeri',
    from: 'Nairobi CBD', to: 'Nyeri',
    dep: '07:00', arr: '10:00', duration: '3 hrs',
    fare: 450, totalSeats: 14, bookedSeats: [4, 7, 12],
    features: ['AC'],
    image: 'assets/images/catalyst-side.jpg', nickname: 'Classic Ride'
  }
];

// ── Step Navigation ──
function goToStep(step) {
  document.querySelectorAll('.booking-step').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.remove('active', 'completed');
    if (i + 1 < step) el.classList.add('completed');
    if (i + 1 === step) el.classList.add('active');
  });
  const target = document.getElementById('step-' + step);
  if (target) { target.classList.remove('hidden'); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  currentStep = step;

  if (step === 3) renderSeats();
  if (step === 4) renderPaymentSummary();
}

// ── Step 1: Search Routes ──
function searchRoutes() {
  const origin = document.getElementById('origin').value;
  const dest   = document.getElementById('destination').value;
  const date   = document.getElementById('travel-date').value;
  requiredPassengers = parseInt(document.getElementById('passengers').value) || 1;

  if (!origin) { showToast('Please select an origin.', 'error'); return; }
  if (!dest)   { showToast('Please select a destination.', 'error'); return; }
  if (origin === dest) { showToast('Origin and destination cannot be the same!', 'error'); return; }

  // Fetch from PHP or use mock data
  fetch(`php/get-routes.php?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(dest)}&date=${date}`)
    .then(r => r.json())
    .then(data => renderMatatuList(data, origin, dest, date))
    .catch(() => {
      // Fallback to mock data
      const results = MATATUS_DB.filter(m =>
        m.from.toLowerCase() === origin.toLowerCase() &&
        m.to.toLowerCase()   === dest.toLowerCase()
      );
      renderMatatuList(results, origin, dest, date);
    });
}

function renderMatatuList(matatus, origin, dest, date) {
  // Summary bar
  document.getElementById('route-summary').innerHTML = `
    <strong>${origin}</strong>
    <i class="fas fa-arrow-right" style="color:#666"></i>
    <strong>${dest}</strong>
    <span class="sep">|</span>
    <i class="fas fa-calendar"></i> ${formatDate(date)}
    <span class="sep">|</span>
    <i class="fas fa-users"></i> ${requiredPassengers} Passenger(s)
  `;

  const list = document.getElementById('matatu-list');

  if (!matatus || matatus.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:48px;color:var(--text-light);">
        <i class="fas fa-bus-alt" style="font-size:3rem;margin-bottom:16px;display:block;opacity:0.3"></i>
        <h3>No matatus found for this route</h3>
        <p>Try a different date or check back later.</p>
      </div>`;
    goToStep(2);
    return;
  }

  list.innerHTML = matatus.map(m => {
    const available = m.totalSeats - (m.bookedSeats ? m.bookedSeats.length : 0);
    const lowSeats  = available <= 3;
    const seatsColor = lowSeats ? 'color:var(--accent)' : 'color:var(--primary)';
    const img = m.image || 'assets/images/hero-green-led.jpg';
    const nickname = m.nickname || m.operator;
    return `
    <div class="matatu-card-photo" id="matatu-${m.id}" onclick="selectMatatu(${m.id})">
      <!-- Photo strip -->
      <div class="mcard-photo">
        <img src="${img}" alt="${nickname}" onerror="this.parentElement.style.background='linear-gradient(135deg,#001a00,#002800)'"/>
        <div class="mcard-photo-overlay">
          <span class="mcard-nickname">${nickname}</span>
          <span class="mcard-reg">${m.reg}</span>
        </div>
        ${lowSeats ? '<div class="mcard-low-badge">🔥 Only ' + available + ' left!</div>' : ''}
      </div>

      <!-- Info strip -->
      <div class="mcard-info">
        <div class="mcard-top">
          <div>
            <div class="matatu-operator">${m.operator}</div>
            <div class="matatu-reg">${m.sacco} · Reg: ${m.reg}</div>
          </div>
          <div class="mcard-fare">
            <div class="fare-amount">${formatKES(m.fare)}</div>
            <div class="fare-label">per seat</div>
          </div>
        </div>

        <div class="mcard-timing">
          <div class="mcard-time-col">
            <span class="time-big">${m.dep}</span>
            <span class="time-label">Departure</span>
          </div>
          <div class="mcard-arrow">
            <i class="fas fa-long-arrow-alt-right"></i>
            <span>${m.duration}</span>
          </div>
          <div class="mcard-time-col">
            <span class="time-big" style="color:var(--primary)">${m.arr}</span>
            <span class="time-label">Arrival</span>
          </div>
          <div class="mcard-seats" style="${seatsColor}">
            <span class="seats-big">${available}</span>
            <span class="seats-lbl">seats</span>
          </div>
        </div>

        <div class="mcard-bottom">
          <div class="matatu-features">
            ${(m.features||[]).map(f => `<span class="feature-tag"><i class="fas fa-check"></i> ${f}</span>`).join('')}
          </div>
          <button class="select-matatu-btn" onclick="event.stopPropagation(); selectMatatu(${m.id})">
            Select Seat <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  goToStep(2);
}

function selectMatatu(id) {
  selectedMatatu = MATATUS_DB.find(m => m.id === id);
  document.querySelectorAll('.matatu-card, .matatu-card-photo').forEach(el => el.classList.remove('selected'));
  document.getElementById('matatu-' + id)?.classList.add('selected');
  setTimeout(() => goToStep(3), 350);
}

// ── Step 2: Swap search ──
function swapSearch() {
  const o = document.getElementById('origin');
  const d = document.getElementById('destination');
  if (o && d) [o.value, d.value] = [d.value, o.value];
}

// ── Step 3: Seat Selection ──
function renderSeats() {
  if (!selectedMatatu) return;
  selectedSeats = [];

  const infoBar = document.getElementById('seat-info-bar');
  infoBar.innerHTML = `
    <strong>${selectedMatatu.operator}</strong> &nbsp;·&nbsp;
    ${selectedMatatu.dep} → ${selectedMatatu.arr} &nbsp;·&nbsp;
    ${selectedMatatu.sacco} &nbsp;·&nbsp; Reg: ${selectedMatatu.reg}
    &nbsp;·&nbsp; <em>Select ${requiredPassengers} seat(s)</em>
  `;

  const grid = document.getElementById('seat-grid');
  grid.innerHTML = '';

  for (let i = 1; i <= selectedMatatu.totalSeats; i++) {
    const seat = document.createElement('div');
    seat.className = 'seat' + (selectedMatatu.bookedSeats.includes(i) ? ' booked' : '');
    seat.textContent = i;
    seat.dataset.seat = i;
    if (!selectedMatatu.bookedSeats.includes(i)) {
      seat.onclick = () => toggleSeat(i, seat);
    }
    grid.appendChild(seat);
  }

  updateSeatSummary();
  document.getElementById('proceed-to-payment').disabled = true;
}

function toggleSeat(seatNum, el) {
  if (selectedSeats.includes(seatNum)) {
    selectedSeats = selectedSeats.filter(s => s !== seatNum);
    el.classList.remove('selected');
  } else {
    if (selectedSeats.length >= requiredPassengers) {
      showToast(`You can only select ${requiredPassengers} seat(s).`, 'error');
      return;
    }
    selectedSeats.push(seatNum);
    el.classList.add('selected');
  }
  updateSeatSummary();
}

function updateSeatSummary() {
  const summary = document.getElementById('selected-seats-summary');
  const btn = document.getElementById('proceed-to-payment');
  if (selectedSeats.length === 0) {
    summary.innerHTML = '<span style="color:var(--text-light)">No seats selected yet. Click on a seat above.</span>';
    btn.disabled = true;
  } else {
    const total = selectedSeats.length * selectedMatatu.fare;
    summary.innerHTML = `
      <strong>Selected Seats:</strong> ${selectedSeats.sort((a,b)=>a-b).join(', ')}
      &nbsp;·&nbsp; <strong>Total:</strong> ${formatKES(total)}
      ${selectedSeats.length < requiredPassengers ? `<span style="color:var(--accent);margin-left:12px">Select ${requiredPassengers - selectedSeats.length} more seat(s)</span>` : ''}
    `;
    btn.disabled = selectedSeats.length < requiredPassengers;
  }
}

// ── Step 4: Payment Summary ──
function renderPaymentSummary() {
  if (!selectedMatatu) return;
  const total = selectedSeats.length * selectedMatatu.fare;
  const date  = document.getElementById('travel-date').value;

  document.getElementById('booking-summary-details').innerHTML = `
    <div class="summary-row"><span>Route</span><span><strong>${selectedMatatu.from} → ${selectedMatatu.to}</strong></span></div>
    <div class="summary-row"><span>Operator</span><span>${selectedMatatu.operator}</span></div>
    <div class="summary-row"><span>SACCO</span><span>${selectedMatatu.sacco}</span></div>
    <div class="summary-row"><span>Reg. Number</span><span>${selectedMatatu.reg}</span></div>
    <div class="summary-row"><span>Travel Date</span><span>${formatDate(date)}</span></div>
    <div class="summary-row"><span>Departure</span><span>${selectedMatatu.dep}</span></div>
    <div class="summary-row"><span>Arrival</span><span>${selectedMatatu.arr}</span></div>
    <div class="summary-row"><span>Seat(s)</span><span>${selectedSeats.sort((a,b)=>a-b).join(', ')}</span></div>
    <div class="summary-row"><span>Fare per Seat</span><span>${formatKES(selectedMatatu.fare)}</span></div>
    <div class="summary-row"><span>Passengers</span><span>${selectedSeats.length}</span></div>
    <div class="summary-row"><span><strong>Total Amount</strong></span><span><strong style="color:var(--accent);font-size:1.2rem">${formatKES(total)}</strong></span></div>
  `;
  document.getElementById('total-display').innerHTML = `
    💳 &nbsp; Amount to Pay: <strong>${formatKES(total)}</strong>
  `;
}

// ── Step 4: Submit Booking ──
function submitBooking(e) {
  e.preventDefault();
  const name  = document.getElementById('pax-name').value;
  const phone = document.getElementById('pax-phone').value;
  const email = document.getElementById('pax-email').value;
  const idNum = document.getElementById('pax-id').value;
  const payMethod = document.querySelector('input[name="payment"]:checked')?.value;
  const date  = document.getElementById('travel-date').value;

  if (!name || !phone || !email || !idNum) {
    showToast('Please fill in all passenger details.', 'error');
    return;
  }

  const payload = {
    matatu_id:    selectedMatatu.id,
    operator:     selectedMatatu.operator,
    sacco:        selectedMatatu.sacco,
    reg_number:   selectedMatatu.reg,
    from:         selectedMatatu.from,
    to:           selectedMatatu.to,
    travel_date:  date,
    departure:    selectedMatatu.dep,
    seats:        selectedSeats,
    fare_per_seat: selectedMatatu.fare,
    total_amount: selectedSeats.length * selectedMatatu.fare,
    passenger_name: name,
    phone, email,
    id_number: idNum,
    payment_method: payMethod
  };

  // POST to PHP backend
  fetch('php/book.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) showSuccessScreen(data.booking_id, payload);
    else showToast(data.message || 'Booking failed. Try again.', 'error');
  })
  .catch(() => {
    // Demo mode: show success screen anyway
    const bookingId = 'NR' + Date.now().toString().slice(-6);
    showSuccessScreen(bookingId, payload);
  });
}

function showSuccessScreen(bookingId, details) {
  document.querySelectorAll('.booking-step').forEach(el => el.classList.add('hidden'));
  const success = document.getElementById('step-success');
  success.classList.remove('hidden');

  document.getElementById('ticket-card').innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
      <span style="font-size:0.75rem;color:#666">BOOKING ID</span>
      <strong style="color:var(--primary);font-size:1.1rem">${bookingId}</strong>
    </div>
    <div style="font-size:1.1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
      🚐 ${details.from} → ${details.to}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.875rem;">
      <div><span style="color:#666">Operator:</span><br><strong>${details.operator}</strong></div>
      <div><span style="color:#666">SACCO:</span><br><strong>${details.sacco}</strong></div>
      <div><span style="color:#666">Reg No.:</span><br><strong>${details.reg_number}</strong></div>
      <div><span style="color:#666">Date:</span><br><strong>${formatDate(details.travel_date)}</strong></div>
      <div><span style="color:#666">Departure:</span><br><strong>${details.departure}</strong></div>
      <div><span style="color:#666">Seat(s):</span><br><strong>${details.seats.join(', ')}</strong></div>
      <div><span style="color:#666">Passenger:</span><br><strong>${details.passenger_name}</strong></div>
      <div><span style="color:#666">Amount Paid:</span><br><strong style="color:var(--accent)">${formatKES(details.total_amount)}</strong></div>
    </div>
    <div style="margin-top:16px;padding-top:12px;border-top:2px dashed #ddd;text-align:center;font-size:0.75rem;color:#666">
      Show this ticket at boarding. Valid for one journey only. &nbsp; 🇰🇪 NaiRide
    </div>
  `;
  success.scrollIntoView({ behavior: 'smooth' });
}

// Payment method highlight
document.addEventListener('change', e => {
  if (e.target.name === 'payment') {
    document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('active'));
    e.target.closest('.payment-option')?.classList.add('active');
  }
});
