<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

include __DIR__ . '/includes/db.php';
include __DIR__ . '/includes/functions.php';

// Check database connection
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['email']) || !isset($_POST['password'])) {
        die("Error: Email and password are required.");
    }

    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE email = ?");
    if (!$stmt) {
        die("SQL Error: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $username, $hashed_password);

    if ($stmt->fetch() && password_verify($password, $hashed_password)) {
        $_SESSION['user_id'] = $id; // FIX: Correct session key
        $_SESSION['username'] = $username;
        $_SESSION['user_email'] = $email;

        // Redirect to profile page
        header("Location: ../profile.php");
        exit;
    } else {
        die("Invalid email or password.");
    }
} else {
    die("Error: No POST request detected.");
}
?>
