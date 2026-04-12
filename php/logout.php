<?php
/**
 * NaiRide – Logout
 */
require_once 'config.php';
startSession();
session_destroy();
header('Location: ../login.html');
exit;
