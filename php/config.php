<?php
/**
 * NaiRide – Database Configuration
 * Aiven Managed PostgreSQL connection settings
 *
 * Get these values from your Aiven console:
 *   https://console.aiven.io → your PostgreSQL service → Connection information
 */

define('DB_HOST',    'your-service-name.aivencloud.com');  // Aiven host
define('DB_PORT',    5432);                                // Aiven port (check console — often 10000+)
define('DB_NAME',    'defaultdb');                         // Aiven database name
define('DB_USER',    'avnadmin');                          // Aiven username
define('DB_PASS',    'your-aiven-password');               // Aiven password

// Path to Aiven CA certificate (download from Aiven console → CA Certificate)
// Place the file in the php/ directory or update this path
define('DB_SSL_CA',  __DIR__ . '/ca.pem');

/**
 * Get PDO database connection
 * Uses PostgreSQL PDO with SSL – required by Aiven
 */
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'pgsql:host='       . DB_HOST
             . ';port='            . DB_PORT
             . ';dbname='          . DB_NAME
             . ';sslmode=verify-ca'
             . ';sslrootcert='     . DB_SSL_CA;

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit;
        }
    }
    return $pdo;
}

/**
 * Helper: Send JSON response and exit
 */
function jsonResponse(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data);
    exit;
}

/**
 * Helper: Start session if not started
 */
function startSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

/**
 * Helper: Require authenticated user
 */
function requireAuth(): void {
    startSession();
    if (empty($_SESSION['user_id'])) {
        jsonResponse(['success' => false, 'message' => 'Not authenticated.', 'redirect' => '../login.html'], 401);
    }
}

/**
 * Helper: Require admin
 */
function requireAdmin(): void {
    startSession();
    if (empty($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        jsonResponse(['success' => false, 'message' => 'Admin access required.'], 403);
    }
}

// Set JSON headers for all API responses
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
