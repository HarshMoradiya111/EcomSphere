<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['USER_ID'])) {
    echo json_encode(["logged_in" => true, "user_id" => $_SESSION['USER_ID']]);
} else {
    echo json_encode(["logged_in" => false]);
}
?>
