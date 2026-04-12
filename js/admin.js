/**
 * NaiRide – admin.js
 * Admin panel logic: routes, matatus, users, bookings, SACCOs
 */

// ── Mock data ──
const ADMIN_BOOKINGS = [
  { id:'NR001234', passenger:'John Kamau', phone:'0712345678', from:'Nairobi CBD', to:'Mombasa', matatu:'Modern Coast · KDG 234A', seats:'3,4', date:'2026-04-20', amount:2400, status:'confirmed' },
  { id:'NR001189', passenger:'Mary Wanjiku', phone:'0723456789', from:'Nairobi CBD', to:'Nakuru', matatu:'2NK SACCO · KBZ 123D', seats:'7', date:'2026-04-18', amount:500, status:'confirmed' },
  { id:'NR001178', passenger:'Peter Ochieng', phone:'0734567890', from:'Nairobi CBD', to:'Kisumu', matatu:'Akamba · KBM 789F', seats:'2', date:'2026-04-17', amount:900, status:'pending' },
  { id:'NR001150', passenger:'Grace Njoroge', phone:'0745678901', from:'Nairobi CBD', to:'Eldoret', matatu:'Guardian Coach · KDH 321G', seats:'5', date:'2026-04-15', amount:800, status:'confirmed' },
  { id:'NR001099', passenger:'Samuel Kipkoech', phone:'0756789012', from:'Nairobi CBD', to:'Mombasa', matatu:'Easy Coach · KDE 567B', seats:'1', date:'2026-04-10', amount:1100, status:'completed' },
  { id:'NR001050', passenger:'Alice Achieng', phone:'0767890123', from:'Nairobi CBD', to:'Westlands', matatu:'Citi Hoppa · KBP 654H', seats:'9', date:'2026-04-08', amount:50, status:'cancelled' }
];

const ADMIN_ROUTES = [
  { num:'Route 101', from:'Nairobi CBD', to:'Mombasa', dist:'485 km', dur:'8 hrs', fare:1200, status:'active' },
  { num:'Route 58',  from:'Nairobi CBD', to:'Nakuru',  dist:'156 km', dur:'2.5 hrs', fare:500, status:'active' },
  { num:'Route 42',  from:'Nairobi CBD', to:'Kisumu',  dist:'348 km', dur:'6 hrs', fare:900, status:'active' },
  { num:'Route 75',  from:'Nairobi CBD', to:'Eldoret', dist:'310 km', dur:'5 hrs', fare:800, status:'active' },
  { num:'Route 23',  from:'Nairobi CBD', to:'Westlands', dist:'8 km', dur:'30 min', fare:50, status:'active' },
  { num:'Route 111', from:'Nairobi CBD', to:'Rongai',  dist:'22 km', dur:'45 min', fare:80, status:'active' },
  { num:'Route 34',  from:'Nairobi CBD', to:'Karen',   dist:'18 km', dur:'40 min', fare:70, status:'active' },
  { num:'Route 65',  from:'Nairobi CBD', to:'Nyeri',   dist:'155 km', dur:'3 hrs', fare:450, status:'active' }
];

const ADMIN_MATATUS = [
  { reg:'KDG 234A', sacco:'Modern Coast', route:'Nairobi – Mombasa', seats:14, dep:'06:00', driver:'James Mwangi', status:'active' },
  { reg:'KDE 567B', sacco:'Easy Coach', route:'Nairobi – Mombasa', seats:14, dep:'08:30', driver:'David Otieno', status:'active' },
  { reg:'KBZ 123D', sacco:'2NK SACCO', route:'Nairobi – Nakuru', seats:14, dep:'07:00', driver:'Paul Kariuki', status:'active' },
  { reg:'KBM 789F', sacco:'Akamba', route:'Nairobi – Kisumu', seats:14, dep:'07:30', driver:'Francis Odhiambo', status:'active' },
  { reg:'KDH 321G', sacco:'Guardian Coach', route:'Nairobi – Eldoret', seats:14, dep:'06:30', driver:'Joseph Kiplangat', status:'active' },
  { reg:'KBP 654H', sacco:'Citi Hoppa', route:'Nairobi – Westlands', seats:14, dep:'07:00', driver:'Charles Njomo', status:'active' }
];

const ADMIN_USERS = [
  { id:1, name:'John Kamau', email:'john.kamau@email.com', phone:'0712345678', idno:'12345678', bookings:8, joined:'Jan 2025' },
  { id:2, name:'Mary Wanjiku', email:'mary.wanjiku@email.com', phone:'0723456789', idno:'23456789', bookings:3, joined:'Feb 2025' },
  { id:3, name:'Peter Ochieng', email:'peter.ochieng@email.com', phone:'0734567890', idno:'34567890', bookings:5, joined:'Mar 2025' },
  { id:4, name:'Grace Njoroge', email:'grace.njoroge@email.com', phone:'0745678901', idno:'45678901', bookings:2, joined:'Apr 2025' },
  { id:5, name:'Samuel Kipkoech', email:'samuel.kip@email.com', phone:'0756789012', idno:'56789012', bookings:11, joined:'Dec 2024' }
];

const SACCOS_DATA = [
  { name:'Modern Coast', license:'PSV/MC/001', contact:'+254 700 111 222', routes:2, matatus:8, status:'active' },
  { name:'Easy Coach',   license:'PSV/EC/002', contact:'+254 700 222 333', routes:2, matatus:6, status:'active' },
  { name:'2NK SACCO',    license:'PSV/2NK/003',contact:'+254 700 333 444', routes:1, matatus:12, status:'active' },
  { name:'Akamba Bus',   license:'PSV/AK/004', contact:'+254 700 444 555', routes:2, matatus:10, status:'active' },
  { name:'Guardian Coach',license:'PSV/GC/005',contact:'+254 700 555 666', routes:1, matatus:7, status:'active' },
  { name:'Citi Hoppa',   license:'PSV/CH/006', contact:'+254 700 666 777', routes:3, matatus:25, status:'active' },
  { name:'KBS',          license:'PSV/KBS/007',contact:'+254 700 777 888', routes:4, matatus:30, status:'active' },
  { name:'Forward Travelers',license:'PSV/FT/008',contact:'+254 700 888 999', routes:1, matatus:5, status:'active' },
  { name:'Dreamline',    license:'PSV/DL/009', contact:'+254 700 999 000', routes:1, matatus:4, status:'active' },
  { name:'Transline Classic',license:'PSV/TC/010',contact:'+254 700 100 200', routes:2, matatus:6, status:'active' }
];

// ── Section navigation ──
function showAdminSection(name) {
  document.querySelectorAll('.dash-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const section = document.getElementById('admin-section-' + name);
  if (section) section.classList.add('active');
  const titleMap = {
    overview:'Admin Dashboard', bookings:'All Bookings', routes:'Manage Routes',
    matatus:'Manage Matatus', users:'Users', saccos:'Partner SACCOs', reports:'Reports'
  };
  const t = document.getElementById('admin-page-title');
  if (t) t.textContent = titleMap[name] || 'Admin';
  if (name === 'overview')  populateAdminOverview();
  if (name === 'bookings')  populateAllBookings();
  if (name === 'routes')    populateRoutes();
  if (name === 'matatus')   populateMatatus();
  if (name === 'users')     populateUsers();
  if (name === 'saccos')    populateSaccos();
  if (name === 'reports')   populateReports();
}

function populateAdminOverview() {
  const tbody = document.getElementById('admin-recent-bookings');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_BOOKINGS.slice(0, 6).map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td>${b.passenger}</td>
      <td>${b.from} → ${b.to}</td>
      <td>${b.matatu}</td>
      <td>${b.date}</td>
      <td>${formatKES(b.amount)}</td>
      <td><span class="status-badge status-${b.status}">${capitalize(b.status)}</span></td>
      <td><button class="btn-primary" style="padding:4px 10px;font-size:0.75rem">View</button></td>
    </tr>`).join('');
}

function populateAllBookings(filter = 'all') {
  const tbody = document.getElementById('admin-all-bookings');
  if (!tbody) return;
  const data = filter === 'all' ? ADMIN_BOOKINGS : ADMIN_BOOKINGS.filter(b => b.status === filter);
  tbody.innerHTML = data.map(b => `
    <tr>
      <td><strong>${b.id}</strong></td><td>${b.passenger}</td><td>${b.phone}</td>
      <td>${b.from} → ${b.to}</td><td>${b.matatu}</td><td>${b.seats}</td>
      <td>${b.date}</td><td>${formatKES(b.amount)}</td>
      <td><span class="status-badge status-${b.status}">${capitalize(b.status)}</span></td>
      <td style="white-space:nowrap">
        <button class="btn-primary" style="padding:4px 8px;font-size:0.75rem;margin-right:4px">View</button>
        ${b.status==='confirmed'?`<button class="btn-danger" style="padding:4px 8px;font-size:0.75rem">Cancel</button>`:''}
      </td>
    </tr>`).join('');
}

function filterAdminBookings(val) { populateAllBookings(val); }

function populateRoutes() {
  const tbody = document.getElementById('routes-table-body');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_ROUTES.map(r => `
    <tr>
      <td><strong>${r.num}</strong></td><td>${r.from}</td><td>${r.to}</td>
      <td>${r.dist}</td><td>${r.dur}</td><td>${formatKES(r.fare)}</td>
      <td><span class="status-badge status-${r.status}">${capitalize(r.status)}</span></td>
      <td><button class="btn-primary" style="padding:4px 10px;font-size:0.75rem;margin-right:4px">Edit</button>
          <button class="btn-danger" style="padding:4px 10px;font-size:0.75rem">Del</button></td>
    </tr>`).join('');
}

function populateMatatus() {
  const tbody = document.getElementById('matatus-table-body');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_MATATUS.map(m => `
    <tr>
      <td><strong>${m.reg}</strong></td><td>${m.sacco}</td><td>${m.route}</td>
      <td>${m.seats}</td><td>${m.dep}</td><td>${m.driver}</td>
      <td><span class="status-badge status-${m.status}">${capitalize(m.status)}</span></td>
      <td><button class="btn-primary" style="padding:4px 10px;font-size:0.75rem;margin-right:4px">Edit</button>
          <button class="btn-danger" style="padding:4px 10px;font-size:0.75rem">Del</button></td>
    </tr>`).join('');
}

function populateUsers() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_USERS.map(u => `
    <tr>
      <td>${u.id}</td><td><strong>${u.name}</strong></td><td>${u.email}</td>
      <td>${u.phone}</td><td>${u.idno}</td>
      <td><span class="status-badge status-confirmed">${u.bookings} bookings</span></td>
      <td>${u.joined}</td>
      <td><button class="btn-primary" style="padding:4px 10px;font-size:0.75rem;margin-right:4px">View</button>
          <button class="btn-danger" style="padding:4px 10px;font-size:0.75rem">Block</button></td>
    </tr>`).join('');
}

function populateSaccos() {
  const tbody = document.getElementById('saccos-table-body');
  if (!tbody) return;
  tbody.innerHTML = SACCOS_DATA.map((s, i) => `
    <tr>
      <td>${i+1}</td><td><strong>${s.name}</strong></td><td>${s.license}</td>
      <td>${s.contact}</td><td>${s.routes}</td><td>${s.matatus}</td>
      <td><span class="status-badge status-${s.status}">${capitalize(s.status)}</span></td>
    </tr>`).join('');
}

function populateReports() {
  const chart = document.getElementById('top-routes-chart');
  if (!chart) return;
  const topRoutes = [
    { route:'Nairobi – Mombasa', count:1240, pct:100 },
    { route:'Nairobi – Nakuru',  count:980, pct:79 },
    { route:'Nairobi – Kisumu',  count:750, pct:60 },
    { route:'Nairobi – Eldoret', count:620, pct:50 },
    { route:'Nairobi – Westlands',count:550, pct:44 },
    { route:'Nairobi – Rongai',  count:410, pct:33 }
  ];
  chart.innerHTML = topRoutes.map(r => `
    <div class="bar-row">
      <div class="bar-label">${r.route}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${r.pct}%">${r.count}</div></div>
    </div>`).join('');
}

// ── Form handlers (demo) ──
function addRoute(e) {
  e.preventDefault();
  showToast('Route added successfully!');
  e.target.reset();
  populateRoutes();
}
function addMatatu(e) {
  e.preventDefault();
  showToast('Matatu registered successfully!');
  e.target.reset();
  populateMatatus();
}

// ── Helpers ──
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  showAdminSection('overview');
});
