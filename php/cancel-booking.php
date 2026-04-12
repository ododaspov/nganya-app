<?php
/**
 * NaiRide – Cancel Booking
 * POST JSON: { booking_id: "NRxxxxxx" }
 */

require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$bookingRef = trim($input['booking_id'] ?? '');

if (!$bookingRef) {
    jsonResponse(['success' => false, 'message' => 'Booking ID required.'], 400);
}

$db = getDB();
startSession();
$userId = $_SESSION['user_id'] ?? null;

// Fetch booking
$stmt = $db->prepare('
    SELECT b.id, b.status, b.travel_date, b.user_id
    FROM bookings b
    WHERE b.booking_ref = ?
');
$stmt->execute([$bookingRef]);
$booking = $stmt->fetch();

if (!$booking) {
    jsonResponse(['success' => false, 'message' => 'Booking not found.'], 404);
}

// Only owner or admin can cancel
if ($userId && $booking['user_id'] != $userId) {
    jsonResponse(['success' => false, 'message' => 'Unauthorized.'], 403);
}

if ($booking['status'] === 'cancelled') {
    jsonResponse(['success' => false, 'message' => 'Booking is already cancelled.'], 400);
}
if ($booking['status'] === 'completed') {
    jsonResponse(['success' => false, 'message' => 'Completed trips cannot be cancelled.'], 400);
}

// Cancellation within 2 hours of travel date – mark as non-refundable
$travelDateTime = new DateTime($booking['travel_date'] . ' 00:00:00');
$now = new DateTime();
$diff = $now->diff($travelDateTime);
$hoursUntilTravel = ($diff->days * 24) + $diff->h;
$refundable = $hoursUntilTravel >= 2;

// Update status
$db->prepare('
    UPDATE bookings SET status = \'cancelled\', updated_at = NOW() WHERE id = ?
')->execute([$booking['id']]);

// Update payment record
if ($refundable) {
    $db->prepare('UPDATE payments SET status = "refunded" WHERE booking_id = ?')->execute([$booking['id']]);
}

jsonResponse([
    'success'   => true,
    'message'   => 'Booking ' . $bookingRef . ' has been cancelled.' . ($refundable ? ' A refund will be processed within 3–5 business days.' : ' No refund applies (within 2 hours of departure).'),
    'refundable' => $refundable
]);
