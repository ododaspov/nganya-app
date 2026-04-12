<?php
/**
 * NaiRide – User Login
 * POST: email, password
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$email    = trim(strtolower($_POST['email']    ?? ''));
$password = $_POST['password'] ?? '';

if (!$email || !$password) {
    jsonResponse(['success' => false, 'message' => 'Email and password are required.'], 400);
}

$db = getDB();

// Fetch user by email
$stmt = $db->prepare('
    SELECT id, first_name, last_name, email, password_hash, role, is_active
    FROM users WHERE email = ?
');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    // Generic message to prevent user enumeration
    jsonResponse(['success' => false, 'message' => 'Invalid email or password.'], 401);
}

if (!$user['is_active']) {
    jsonResponse(['success' => false, 'message' => 'Your account has been deactivated. Contact support.'], 403);
}

// Update last login time
$db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

// Start session
startSession();
$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
$_SESSION['email']     = $user['email'];
$_SESSION['role']      = $user['role'];

$redirect = ($user['role'] === 'admin') ? '../admin/index.html' : '../dashboard.html';

jsonResponse([
    'success'  => true,
    'message'  => 'Login successful. Welcome back, ' . $user['first_name'] . '!',
    'redirect' => $redirect,
    'user'     => [
        'id'   => $user['id'],
        'name' => $user['first_name'] . ' ' . $user['last_name'],
        'role' => $user['role']
    ]
]);
