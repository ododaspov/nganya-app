<?php
/**
 * NaiRide – Get Available Routes / Matatus
 * GET: from, to, date
 * Returns: array of available matatu trips for the route and date
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$from = trim($_GET['from'] ?? '');
$to   = trim($_GET['to']   ?? '');
$date = trim($_GET['date'] ?? date('Y-m-d'));

if (!$from || !$to) {
    jsonResponse(['success' => false, 'message' => 'Origin and destination are required.'], 400);
}

if ($from === $to) {
    jsonResponse(['success' => false, 'message' => 'Origin and destination cannot be the same.'], 400);
}

$db = getDB();

// Get matatu trips matching the route and date
$stmt = $db->prepare('
    SELECT
        mt.id,
        mt.registration_number   AS reg,
        mt.sacco_id,
        s.name                   AS sacco,
        mt.operator_name         AS operator,
        r.route_number           AS route_number,
        r.origin                 AS origin,
        r.destination            AS destination,
        mt.departure_time        AS dep,
        mt.arrival_time          AS arr,
        r.duration,
        r.fare_amount            AS fare,
        r.total_seats,
        mt.features,
        (
            SELECT COUNT(*)
            FROM bookings b
            JOIN booking_seats bs ON b.id = bs.booking_id
            WHERE b.matatu_id = mt.id
              AND b.travel_date = :date
              AND b.status IN (\'confirmed\', \'pending\')
        ) AS booked_count,
        (
            SELECT json_agg(bs.seat_number)
            FROM bookings b
            JOIN booking_seats bs ON b.id = bs.booking_id
            WHERE b.matatu_id = mt.id
              AND b.travel_date = :date2
              AND b.status IN (\'confirmed\', \'pending\')
        ) AS booked_seats_json
    FROM matatus mt
    JOIN routes r ON mt.route_id = r.id
    JOIN saccos s ON mt.sacco_id = s.id
    WHERE LOWER(r.origin)      = LOWER(:from)
      AND LOWER(r.destination) = LOWER(:to)
      AND mt.is_active         = 1
    ORDER BY mt.departure_time ASC
');

$stmt->execute([
    ':from'  => $from,
    ':to'    => $to,
    ':date'  => $date,
    ':date2' => $date
]);

$rows = $stmt->fetchAll();

// Format results
$results = array_map(function($row) {
    $bookedSeats = json_decode($row['booked_seats_json'] ?? '[]', true) ?: [];
    return [
        'id'          => (int)$row['id'],
        'operator'    => $row['operator'],
        'reg'         => $row['reg'],
        'sacco'       => $row['sacco'],
        'route'       => $row['origin'] . ' → ' . $row['destination'],
        'from'        => $row['origin'],
        'to'          => $row['destination'],
        'dep'         => substr($row['dep'], 0, 5),
        'arr'         => substr($row['arr'], 0, 5),
        'duration'    => $row['duration'],
        'fare'        => (int)$row['fare'],
        'totalSeats'  => (int)$row['total_seats'],
        'bookedSeats' => array_map('intval', $bookedSeats),
        'features'    => $row['features'] ? explode(',', $row['features']) : []
    ];
}, $rows);

jsonResponse($results);
