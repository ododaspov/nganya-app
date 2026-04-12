-- ============================================================
-- NaiRide Database Schema
-- Kenya Matatu Booking System
-- Aiven Managed PostgreSQL
--
-- HOW TO RUN:
--   1. Download your CA cert from Aiven console → save as php/ca.pem
--   2. Connect and import:
--      psql "postgres://avnadmin:<password>@<host>:<port>/defaultdb?sslmode=verify-ca&sslrootcert=php/ca.pem" \
--           -f sql/matatu_db.sql
-- ============================================================

-- ── Auto-update trigger function (replaces MySQL ON UPDATE CURRENT_TIMESTAMP) ──
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 1. USERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    phone           VARCHAR(15)   NOT NULL UNIQUE,
    id_number       VARCHAR(20)   NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL DEFAULT 'customer'
                        CHECK (role IN ('customer','admin','operator')),
    is_active       SMALLINT      NOT NULL DEFAULT 1,
    profile_photo   VARCHAR(255)  NULL,
    last_login      TIMESTAMP     NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

CREATE OR REPLACE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 2. SACCOs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saccos (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    license_number  VARCHAR(50)   NOT NULL UNIQUE,
    contact_phone   VARCHAR(15)   NULL,
    contact_email   VARCHAR(255)  NULL,
    address         VARCHAR(255)  NULL,
    is_active       SMALLINT      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. ROUTES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
    id              SERIAL PRIMARY KEY,
    route_number    VARCHAR(20)   NOT NULL,
    origin          VARCHAR(150)  NOT NULL,
    destination     VARCHAR(150)  NOT NULL,
    distance_km     NUMERIC(8,2)  NOT NULL,
    duration        VARCHAR(30)   NOT NULL,
    fare_amount     NUMERIC(10,2) NOT NULL,
    total_seats     INTEGER       NOT NULL DEFAULT 14,
    is_active       SMALLINT      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_routes_origin_dest ON routes(origin, destination);

-- ── 4. MATATUS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matatus (
    id                  SERIAL PRIMARY KEY,
    registration_number VARCHAR(20)   NOT NULL UNIQUE,
    sacco_id            INTEGER       NOT NULL,
    route_id            INTEGER       NOT NULL,
    operator_name       VARCHAR(150)  NOT NULL,
    total_seats         INTEGER       NOT NULL DEFAULT 14,
    departure_time      TIME          NOT NULL,
    arrival_time        TIME          NOT NULL,
    driver_name         VARCHAR(150)  NULL,
    driver_phone        VARCHAR(15)   NULL,
    features            VARCHAR(255)  NULL,
    is_active           SMALLINT      NOT NULL DEFAULT 1,
    created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sacco_id) REFERENCES saccos(id) ON DELETE RESTRICT,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_matatus_route_id ON matatus(route_id);

-- ── 5. BOOKINGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id               SERIAL PRIMARY KEY,
    booking_ref      VARCHAR(20)   NOT NULL UNIQUE,
    user_id          INTEGER       NULL,
    matatu_id        INTEGER       NOT NULL,
    travel_date      DATE          NOT NULL,
    passenger_name   VARCHAR(200)  NOT NULL,
    phone            VARCHAR(15)   NOT NULL,
    email            VARCHAR(255)  NOT NULL,
    id_number        VARCHAR(20)   NOT NULL,
    payment_method   VARCHAR(20)   NOT NULL DEFAULT 'mpesa'
                         CHECK (payment_method IN ('mpesa','airtel_money','card','cash')),
    total_amount     NUMERIC(10,2) NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'confirmed'
                         CHECK (status IN ('pending','confirmed','cancelled','completed')),
    cancellation_reason VARCHAR(255) NULL,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NULL,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE SET NULL,
    FOREIGN KEY (matatu_id) REFERENCES matatus(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_matatu_date ON bookings(matatu_id, travel_date);
CREATE INDEX IF NOT EXISTS idx_bookings_ref         ON bookings(booking_ref);

CREATE OR REPLACE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 6. BOOKING SEATS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_seats (
    id          SERIAL PRIMARY KEY,
    booking_id  INTEGER      NOT NULL,
    seat_number SMALLINT     NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE (booking_id, seat_number)
);

-- ── 7. PAYMENTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id              SERIAL PRIMARY KEY,
    booking_id      INTEGER       NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    method          VARCHAR(20)   NOT NULL
                        CHECK (method IN ('mpesa','airtel_money','card','cash')),
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','completed','failed','refunded')),
    transaction_ref VARCHAR(100)  NULL,
    mpesa_receipt   VARCHAR(50)   NULL,
    paid_at         TIMESTAMP     NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ── 8. ROUTE STOPS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_stops (
    id          SERIAL PRIMARY KEY,
    route_id    INTEGER      NOT NULL,
    stop_name   VARCHAR(150) NOT NULL,
    stop_order  SMALLINT     NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_route_stops ON route_stops(route_id);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO saccos (name, license_number, contact_phone, contact_email, address) VALUES
('Modern Coast Express',   'PSV/MC/001',  '+254700111222', 'info@moderncoast.co.ke',     'Mwembe Tayari, Mombasa'),
('Easy Coach Ltd',         'PSV/EC/002',  '+254700222333', 'info@easycoach.co.ke',       'Ronald Ngala St, Nairobi'),
('2NK SACCO',              'PSV/2NK/003', '+254700333444', 'info@2nksacco.co.ke',        'Nakuru Bus Station'),
('Akamba Bus Service',     'PSV/AK/004',  '+254700444555', 'info@akamba.co.ke',          'Lagos Rd, Nairobi'),
('Guardian Coach',         'PSV/GC/005',  '+254700555666', 'info@guardiancoach.co.ke',   'Eldoret Bus Park'),
('Citi Hoppa',             'PSV/CH/006',  '+254700666777', 'info@citihoppa.co.ke',       'Tom Mboya St, Nairobi'),
('Kenya Bus Service (KBS)','PSV/KBS/007', '+254700777888', 'info@kbs.co.ke',             'Kencom House, Nairobi'),
('Forward Travelers',      'PSV/FT/008',  '+254700888999', 'info@forwardtravelers.co.ke','Nakuru Town'),
('Dreamline Express',      'PSV/DL/009',  '+254700999000', 'info@dreamline.co.ke',       'Longonot Place, Nairobi'),
('Transline Classic',      'PSV/TC/010',  '+254700100200', 'info@transline.co.ke',       'Accra Rd, Nairobi'),
('Rongai Matatu SACCO',    'PSV/RM/011',  '+254700200300', 'info@rongaisacco.co.ke',     'Rongai Stage, Nairobi'),
('Stagecoach EA',          'PSV/SC/012',  '+254700300400', 'info@stagecoach.co.ke',      'Kisumu Bus Park');

INSERT INTO routes (route_number, origin, destination, distance_km, duration, fare_amount, total_seats) VALUES
('Route 101', 'Nairobi CBD', 'Mombasa',    485.00, '8 hours',   1200.00, 14),
('Route 58',  'Nairobi CBD', 'Nakuru',     156.00, '2.5 hours',  500.00, 14),
('Route 42',  'Nairobi CBD', 'Kisumu',     348.00, '6 hours',    900.00, 14),
('Route 75',  'Nairobi CBD', 'Eldoret',    310.00, '5 hours',    800.00, 14),
('Route 23',  'Nairobi CBD', 'Westlands',    8.00, '30 min',      50.00, 14),
('Route 111', 'Nairobi CBD', 'Rongai',      22.00, '45 min',      80.00, 14),
('Route 34',  'Nairobi CBD', 'Karen',       18.00, '40 min',      70.00, 14),
('Route 65',  'Nairobi CBD', 'Nyeri',      155.00, '3 hours',    450.00, 14),
('Route 89',  'Nairobi CBD', 'Meru',       245.00, '4.5 hours',  600.00, 14),
('Route 47',  'Nairobi CBD', 'Thika',       45.00, '1 hour',     150.00, 14),
('Route 102', 'Nairobi CBD', 'Ngong',       28.00, '1 hour',     100.00, 14),
('Route 201', 'Mombasa',     'Nairobi CBD', 485.00, '8 hours',  1200.00, 14);

INSERT INTO matatus (registration_number, sacco_id, route_id, operator_name, total_seats, departure_time, arrival_time, driver_name, driver_phone, features) VALUES
('KDG 234A', 1,  1, 'Modern Coast Express',  14, '06:00', '14:00', 'James Mwangi',     '0712111001', 'AC,Reclining Seats,Charging Ports,WiFi'),
('KDE 567B', 2,  1, 'Easy Coach Ltd',         14, '08:30', '16:30', 'David Otieno',     '0712111002', 'AC,Reclining Seats'),
('KDF 890C', 9,  1, 'Dreamline Express',      14, '20:00', '04:00', 'Emmanuel Waweru',  '0712111003', 'AC,Reclining Seats,Charging Ports,USB,Night Service'),
('KBZ 123D', 3,  2, '2NK SACCO',              14, '07:00', '09:30', 'Paul Kariuki',     '0712111004', 'AC'),
('KCA 456E', 8,  2, 'Forward Travelers',       14, '09:00', '11:30', 'Stephen Gacheru',  '0712111005', 'AC,Charging Ports'),
('KBM 789F', 4,  3, 'Akamba Bus Service',      14, '07:30', '13:30', 'Francis Odhiambo', '0712111006', 'AC,Reclining Seats'),
('KDH 321G', 5,  4, 'Guardian Coach',          14, '06:30', '11:30', 'Joseph Kiplangat', '0712111007', 'AC,Reclining Seats,Charging Ports'),
('KBP 654H', 6,  5, 'Citi Hoppa',              14, '07:00', '07:30', 'Charles Njomo',    '0712111008', 'AC'),
('KBQ 987I', 7,  5, 'KBS Route 23',            14, '07:30', '08:10', 'Peter Muriuki',    '0712111009', 'AC'),
('KCC 147J', 11, 6, 'Rongai Matatu SACCO',     14, '08:00', '08:45', 'Kelvin Njoroge',   '0712111010', NULL),
('KDJ 258K', 10, 8, 'Transline Classic',        14, '07:00', '10:00', 'Brian Macharia',   '0712111011', 'AC'),
('KBR 369L', 4,  3, 'Akamba Premium',           14, '13:00', '19:00', 'George Okello',    '0712111012', 'AC,Reclining Seats,Charging Ports');

INSERT INTO route_stops (route_id, stop_name, stop_order) VALUES
(1, 'Nairobi CBD',       1),
(1, 'Mlolongo',          2),
(1, 'Athi River',        3),
(1, 'Machakos Junction', 4),
(1, 'Mtito Andei',       5),
(1, 'Voi',               6),
(1, 'Mariakani',         7),
(1, 'Mombasa',           8),
(2, 'Nairobi CBD',       1),
(2, 'Limuru',            2),
(2, 'Naivasha',          3),
(2, 'Nakuru',            4);

-- Admin user (replace the password hash with a real bcrypt hash)
INSERT INTO users (first_name, last_name, email, phone, id_number, password_hash, role) VALUES
('NaiRide', 'Admin', 'admin@nairide.co.ke', '0700000001', '00000001',
 '$2y$12$YourHashedPasswordHere', 'admin');
