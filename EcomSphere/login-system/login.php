<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

include __DIR__ . '/includes/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['email']) || !isset($_POST['password'])) {
        die("Email and password required");
    }

    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE email = ?");
    if (!$stmt) {
        die("SQL Error: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $username, $hashed_password);

    if ($stmt->fetch() && password_verify($password, $hashed_password)) {
        $_SESSION['USER_ID'] = $id;
        $_SESSION['USERNAME'] = $username;
        $_SESSION['USER_EMAIL'] = $email;

        echo "Login successful!";
        header("Location: ../profile.php");
        exit();
    } else {
        die("Invalid email or password.");
    }
}
?>
