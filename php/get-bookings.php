<?php
/**
 * NaiRide – Get User Bookings
 * GET: (uses session user_id)
 * Returns: user's bookings with full details
 */

require_once 'config.php';
requireAuth();

$userId = $_SESSION['user_id'];
$db = getDB();

$stmt = $db->prepare('
    SELECT
        b.id,
        b.booking_ref,
        b.travel_date,
        b.passenger_name,
        b.phone,
        b.email,
        b.payment_method,
        b.total_amount,
        b.status,
        b.created_at,
        mt.registration_number AS reg,
        mt.operator_name AS operator,
        mt.departure_time AS dep,
        mt.arrival_time AS arr,
        s.name AS sacco,
        r.origin AS origin,
        r.destination AS destination,
        r.route_number,
        r.duration,
        string_agg(bs.seat_number::text, ',' ORDER BY bs.seat_number) AS seats
    FROM bookings b
    JOIN matatus mt ON b.matatu_id = mt.id
    JOIN routes r   ON mt.route_id = r.id
    JOIN saccos s   ON mt.sacco_id = s.id
    LEFT JOIN booking_seats bs ON bs.booking_id = b.id
    WHERE b.user_id = ?
    GROUP BY b.id
    ORDER BY b.travel_date DESC, b.created_at DESC
');

$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

$bookings = array_map(function($row) {
    return [
        'id'          => (int)$row['id'],
        'booking_ref' => $row['booking_ref'],
        'route'       => $row['origin'] . ' → ' . $row['destination'],
        'from'        => $row['origin'],
        'to'          => $row['destination'],
        'route_number'=> $row['route_number'],
        'operator'    => $row['operator'],
        'sacco'       => $row['sacco'],
        'reg'         => $row['reg'],
        'travel_date' => $row['travel_date'],
        'dep'         => substr($row['dep'] ?? '', 0, 5),
        'arr'         => substr($row['arr'] ?? '', 0, 5),
        'duration'    => $row['duration'],
        'seats'       => $row['seats'] ? array_map('intval', explode(',', $row['seats'])) : [],
        'total_amount'=> (float)$row['total_amount'],
        'pay_method'  => $row['payment_method'],
        'status'      => $row['status'],
        'created_at'  => $row['created_at']
    ];
}, $rows);

jsonResponse(['success' => true, 'bookings' => $bookings]);
