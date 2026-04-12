<?php
/**
 * NaiRide – Create Booking
 * POST (JSON body): matatu_id, travel_date, seats[], passenger details, payment_method
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

// Accept JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    // Try form data fallback
    $input = $_POST;
}

// Required fields
$matatuId    = (int)($input['matatu_id']      ?? 0);
$travelDate  = trim($input['travel_date']     ?? '');
$seats       = $input['seats']                ?? [];
$paxName     = trim($input['passenger_name'] ?? '');
$phone       = trim($input['phone']           ?? '');
$email       = trim($input['email']           ?? '');
$idNumber    = trim($input['id_number']       ?? '');
$payMethod   = trim($input['payment_method'] ?? 'mpesa');
$totalAmount = (float)($input['total_amount'] ?? 0);

// Validate
if (!$matatuId || !$travelDate || empty($seats) || !$paxName || !$phone || !$email) {
    jsonResponse(['success' => false, 'message' => 'Missing required booking details.'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Invalid email address.'], 400);
}
if ($travelDate < date('Y-m-d')) {
    jsonResponse(['success' => false, 'message' => 'Travel date cannot be in the past.'], 400);
}

$db = getDB();

// ── Check matatu exists and is active ──
$stmt = $db->prepare('SELECT id, total_seats FROM matatus WHERE id = ? AND is_active = 1');
$stmt->execute([$matatuId]);
$matatu = $stmt->fetch();
if (!$matatu) {
    jsonResponse(['success' => false, 'message' => 'Matatu not found or unavailable.'], 404);
}

// ── Check seats aren't already booked ──
$placeholders = implode(',', array_fill(0, count($seats), '?'));
$stmt = $db->prepare("
    SELECT bs.seat_number
    FROM booking_seats bs
    JOIN bookings b ON b.id = bs.booking_id
    WHERE b.matatu_id = ?
      AND b.travel_date = ?
      AND b.status IN ('confirmed', 'pending')
      AND bs.seat_number IN ($placeholders)
");
$stmt->execute(array_merge([$matatuId, $travelDate], $seats));
$taken = $stmt->fetchAll(PDO::FETCH_COLUMN);

if (!empty($taken)) {
    jsonResponse(['success' => false, 'message' => 'Seats ' . implode(', ', $taken) . ' are already booked. Please choose different seats.'], 409);
}

// ── Create booking inside a transaction ──
$db->beginTransaction();
try {
    // Generate unique booking ID
    $bookingRef = 'NR' . strtoupper(substr(md5(uniqid()), 0, 6));

    // Determine user_id (if logged in via session)
    startSession();
    $userId = $_SESSION['user_id'] ?? null;

    // Get fare from DB
    $stmt = $db->prepare('SELECT r.fare_amount FROM matatus mt JOIN routes r ON mt.route_id = r.id WHERE mt.id = ?');
    $stmt->execute([$matatuId]);
    $fareRow = $stmt->fetch();
    $farePerSeat = $fareRow ? (float)$fareRow['fare_amount'] : ($totalAmount / count($seats));
    $total = $farePerSeat * count($seats);

    // Insert booking
    $stmt = $db->prepare('
        INSERT INTO bookings
            (booking_ref, user_id, matatu_id, travel_date, passenger_name, phone, email,
             id_number, payment_method, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'confirmed\', NOW())
        RETURNING id
    ');
    $stmt->execute([$bookingRef, $userId, $matatuId, $travelDate, $paxName, $phone, $email, $idNumber, $payMethod, $total]);
    $bookingId = $stmt->fetchColumn();

    // Insert seat records
    $seatStmt = $db->prepare('INSERT INTO booking_seats (booking_id, seat_number) VALUES (?, ?)');
    foreach ($seats as $seatNum) {
        $seatStmt->execute([$bookingId, (int)$seatNum]);
    }

    // Record payment
    $db->prepare('
        INSERT INTO payments (booking_id, amount, method, status, transaction_ref, paid_at)
        VALUES (?, ?, ?, \'completed\', ?, NOW())
    ')->execute([$bookingId, $total, $payMethod, 'TXN' . strtoupper(substr(md5(uniqid()), 0, 10))]);

    $db->commit();

    jsonResponse([
        'success'    => true,
        'booking_id' => $bookingRef,
        'message'    => 'Booking confirmed! Your seat(s) ' . implode(', ', $seats) . ' have been reserved.',
        'details'    => [
            'booking_ref'  => $bookingRef,
            'travel_date'  => $travelDate,
            'seats'        => $seats,
            'total_amount' => $total,
            'pay_method'   => $payMethod
        ]
    ]);
} catch (Exception $e) {
    $db->rollBack();
    jsonResponse(['success' => false, 'message' => 'Booking failed. Please try again.'], 500);
}
