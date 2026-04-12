<?php
/**
 * NaiRide – User Registration
 * POST: first_name, last_name, email, phone, id_number, password
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

// Collect and sanitize input
$firstName = trim($_POST['first_name'] ?? '');
$lastName  = trim($_POST['last_name']  ?? '');
$email     = trim(strtolower($_POST['email'] ?? ''));
$phone     = trim($_POST['phone']      ?? '');
$idNumber  = trim($_POST['id_number']  ?? '');
$password  = $_POST['password']        ?? '';

// Validate required fields
if (!$firstName || !$lastName || !$email || !$phone || !$idNumber || !$password) {
    jsonResponse(['success' => false, 'message' => 'All fields are required.'], 400);
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Invalid email address.'], 400);
}

// Validate Kenyan phone number (07xx or 01xx, 10 digits)
$cleanPhone = preg_replace('/\s+/', '', $phone);
if (!preg_match('/^(07|01)\d{8}$/', $cleanPhone)) {
    jsonResponse(['success' => false, 'message' => 'Invalid Kenyan phone number (e.g. 0712345678).'], 400);
}

// Validate password length
if (strlen($password) < 8) {
    jsonResponse(['success' => false, 'message' => 'Password must be at least 8 characters.'], 400);
}

$db = getDB();

// Check if email already exists
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'message' => 'An account with this email already exists.'], 409);
}

// Check if phone already exists
$stmt = $db->prepare('SELECT id FROM users WHERE phone = ?');
$stmt->execute([$cleanPhone]);
if ($stmt->fetch()) {
    jsonResponse(['success' => false, 'message' => 'An account with this phone number already exists.'], 409);
}

// Hash password using bcrypt
$passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Insert new user
$stmt = $db->prepare('
    INSERT INTO users (first_name, last_name, email, phone, id_number, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, \'customer\', NOW())
    RETURNING id
');
$stmt->execute([$firstName, $lastName, $email, $cleanPhone, $idNumber, $passwordHash]);
$userId = $stmt->fetchColumn();

// Start session and log user in
startSession();
$_SESSION['user_id']   = $userId;
$_SESSION['user_name'] = $firstName . ' ' . $lastName;
$_SESSION['email']     = $email;
$_SESSION['role']      = 'customer';

jsonResponse([
    'success' => true,
    'message' => 'Account created successfully! Welcome to NaiRide.',
    'user'    => [
        'id'    => $userId,
        'name'  => $firstName . ' ' . $lastName,
        'email' => $email
    ]
]);
