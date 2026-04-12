# 🚐 NaiRide – Kenya Matatu Booking System

A full-stack three-tier web application for booking matatu (minibus) seats across Kenya.
Built with **HTML/CSS/JavaScript** (frontend), **PHP** (backend), and **MySQL** (database).

---

## 📁 Project Structure

```
matatu-booking/
├── index.html          ← Landing page (Hero, Routes, Features, SACCOs)
├── booking.html        ← 4-step booking wizard
├── login.html          ← User login
├── register.html       ← User registration
├── dashboard.html      ← User dashboard (My Bookings, Trips, Profile)
│
├── admin/
│   └── index.html      ← Admin panel (Bookings, Routes, Matatus, Users, SACCOs, Reports)
│
├── css/
│   ├── style.css       ← Global styles (navbar, hero, forms, auth)
│   ├── booking.css     ← Booking wizard, seat layout, payment
│   └── dashboard.css   ← Sidebar, stats cards, data tables
│
├── js/
│   ├── main.js         ← Shared utilities (counters, toast, helpers)
│   ├── booking.js      ← Booking logic, seat selection, payment flow
│   ├── dashboard.js    ← User dashboard data & interactions
│   └── admin.js        ← Admin panel data & management
│
├── php/
│   ├── config.php      ← Database connection (PDO), helper functions
│   ├── register.php    ← POST: Create new user account
│   ├── login.php       ← POST: Authenticate user
│   ├── logout.php      ← Destroy session and redirect
│   ├── get-routes.php  ← GET: Search available matatus by route & date
│   ├── book.php        ← POST: Create booking with seat reservation
│   ├── get-bookings.php← GET: Retrieve user's booking history
│   └── cancel-booking.php ← POST: Cancel a booking
│
└── sql/
    └── matatu_db.sql   ← Full database schema + Kenyan seed data
```

---

## 🇰🇪 Featured Kenyan Content

**Routes:**
- Nairobi CBD → Mombasa (Route 101) – Modern Coast, Easy Coach, Dreamline
- Nairobi CBD → Nakuru (Route 58) – 2NK SACCO, Forward Travelers
- Nairobi CBD → Kisumu (Route 42) – Akamba Bus, Stagecoach
- Nairobi CBD → Eldoret (Route 75) – Guardian Coach
- Nairobi CBD → Westlands (Route 23) – Citi Hoppa, KBS
- Nairobi CBD → Rongai (Route 111) – Rongai Matatu SACCO
- Nairobi CBD → Nyeri (Route 65) – Transline Classic
- And more...

**SACCOs:** Citi Hoppa, KBS, Modern Coast, Easy Coach, Forward Travelers, Guardian Coach, 2NK SACCO, Akamba Bus, Dreamline, Transline Classic, Rongai SACCO, Stagecoach EA

---

## ⚙️ Setup Instructions

### Prerequisites
- PHP 7.4+ or PHP 8.x
- MySQL 5.7+ or MariaDB 10.3+
- A web server: Apache (XAMPP/WAMP) or Nginx
- phpMyAdmin (optional, for DB management)

### Step 1 – Database Setup
1. Open **phpMyAdmin** or your MySQL client.
2. Run the SQL file:
   ```sql
   SOURCE /path/to/matatu-booking/sql/matatu_db.sql;
   ```
   Or import via phpMyAdmin: `Import` → select `sql/matatu_db.sql` → Go.

### Step 2 – Configure Database Connection
Open `php/config.php` and update:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'nairide_db');
define('DB_USER', 'root');       // ← your MySQL username
define('DB_PASS', '');           // ← your MySQL password
```

### Step 3 – Place Files on Web Server
**XAMPP (Windows):**
```
C:\xampp\htdocs\matatu-booking\
```
**WAMP:**
```
C:\wamp64\www\matatu-booking\
```
**Linux/Mac (Apache):**
```
/var/www/html/matatu-booking/
```

### Step 4 – Open in Browser
```
http://localhost/matatu-booking/
```

---

## 👤 Default Credentials

| Role  | Email                  | Password       |
|-------|------------------------|----------------|
| Admin | admin@nairide.co.ke    | admin123       |
| Demo  | Click "Demo Login"     | (no server needed) |

> **Note:** The admin password hash in `matatu_db.sql` must be regenerated.
> Run this PHP snippet to generate a bcrypt hash:
> ```php
> echo password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 12]);
> ```
> Then update the `INSERT INTO users` line in the SQL file.

---

## 🔧 Three-Tier Architecture

| Tier       | Technology            | Role                                      |
|------------|-----------------------|-------------------------------------------|
| Frontend   | HTML5, CSS3, JS (ES6) | UI rendering, form validation, seat picker|
| Backend    | PHP 8 (PDO)           | Auth, booking logic, API endpoints        |
| Database   | MySQL                 | Users, routes, matatus, bookings, payments|

---

## 📱 Features

- **Landing Page:** Hero search, popular Kenyan routes, partner SACCOs
- **4-Step Booking:** Search → Choose Matatu → Pick Seat → Pay
- **Seat Map:** Visual matatu interior with live availability
- **Payment Options:** M-Pesa, Airtel Money, Visa/Mastercard
- **E-Ticket:** Printable booking confirmation
- **User Dashboard:** Upcoming trips, history, cancel bookings
- **Admin Panel:** Manage routes, matatus, users, SACCOs, reports

---

## 📚 Technologies Used (Coursework Reference)

- **HTML:** Semantic structure, forms, tables, navigation
- **CSS:** Custom properties, Flexbox, CSS Grid, responsive media queries
- **JavaScript:** DOM manipulation, Fetch API, ES6+ modules, event handling
- **PHP:** PDO prepared statements, sessions, JSON APIs, bcrypt password hashing
- **MySQL:** Relational schema, foreign keys, indexes, transactions, JOINs

---

*NaiRide – Connecting Kenya, One Matatu at a Time 🇰🇪*
