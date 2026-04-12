/**
 * NaiRide – main.js
 * Global utilities, animations, and shared functions
 */

// ── Set minimum date for all date inputs to today ──
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(el => {
    if (!el.min) el.min = today;
    if (!el.value) el.value = today;
  });

  // Animate stat counters on the landing page
  animateCounters();

  // Restore URL params on booking page
  if (window.location.pathname.includes('booking')) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from')) {
      const fromEl = document.getElementById('qs-from') || document.getElementById('origin');
      if (fromEl) fromEl.value = params.get('from');
    }
    if (params.get('to')) {
      const toEl = document.getElementById('qs-to') || document.getElementById('destination');
      if (toEl) toEl.value = params.get('to');
    }
  }
});

// ── Counter Animation ──
function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const step = Math.ceil(target / 60);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 30);
  });
}

// ── Toggle mobile nav ──
function toggleNav() {
  const links = document.querySelector('.nav-links');
  if (links) links.classList.toggle('open');
}
const hamburger = document.getElementById('hamburger');
if (hamburger) hamburger.addEventListener('click', toggleNav);

// ── Swap locations (hero) ──
function swapLocations() {
  const from = document.getElementById('qs-from');
  const to   = document.getElementById('qs-to');
  if (!from || !to) return;
  [from.value, to.value] = [to.value, from.value];
}

// ── Navigate from hero to booking page ──
function goToBooking() {
  const from = document.getElementById('qs-from')?.value || '';
  const to   = document.getElementById('qs-to')?.value || '';
  const date = document.getElementById('qs-date')?.value || '';
  window.location.href = `booking.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`;
}

// ── Password toggle ──
function togglePassword(inputId, iconEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    iconEl.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    iconEl.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

// ── Sidebar toggle (dashboard) ──
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}

// ── Format currency ──
function formatKES(amount) {
  return 'KES ' + parseInt(amount).toLocaleString('en-KE');
}

// ── Format date ──
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Toast notification ──
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${type==='success'?'#006600':'#cc0000'}; color:#fff;
    padding:14px 24px; border-radius:8px; font-weight:600;
    box-shadow:0 8px 30px rgba(0,0,0,0.2); animation:slideIn 0.3s ease;
    max-width:320px; font-size:0.9rem;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Print ticket ──
function printTicket() {
  window.print();
}
