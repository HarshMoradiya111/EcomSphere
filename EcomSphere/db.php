<?php
$host = "localhost";  // Change if using a different server
$user = "root";       // Default XAMPP username
$pass = "";           // Default XAMPP password (empty)
$dbname = "ecomsphere";  // Replace with your actual database name

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}
?>
