<?php
session_start();
include "../config.php"; 

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit();
}

$id = $_GET['id'];
$conn->query("DELETE FROM users WHERE id=$id");
header("Location: users.php");
exit();
?>
