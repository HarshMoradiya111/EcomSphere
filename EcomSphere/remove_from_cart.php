<?php
session_start();
include 'db.php';

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['USER_ID']) || !isset($data['cart_id'])) {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
    exit();
}

$cart_id = $data['cart_id'];

$delete = $conn->prepare("DELETE FROM cart WHERE id = ?");
$delete->bind_param("i", $cart_id);
$delete->execute();

echo json_encode(["success" => true]);
?>
