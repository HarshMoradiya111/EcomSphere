<?php
session_start();
include "../config.php"; 

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $order_id = $_POST['order_id'];
    $status = $_POST['status'];

    $stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $order_id);
    $stmt->execute();

    header("Location: orders.php");
    exit();
}
?>
