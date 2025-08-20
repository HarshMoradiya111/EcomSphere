<?php
session_start();
unset($_SESSION['cart']); // Clear cart when user logs out

session_destroy();
header("Location: login-system/index.php");
exit();
?>
