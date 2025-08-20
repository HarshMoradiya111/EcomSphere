<?php
session_start();
include 'db.php';

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION['USER_ID']) || !isset($data['product_id'], $data['action'])) {
    echo json_encode(["success" => false, "error" => "Invalid request"]);
    exit();
}

$user_id = $_SESSION['USER_ID'];
$product_id = $data['product_id'];
$action = $data['action'];

$query = $conn->prepare("SELECT quantity FROM cart WHERE product_id = ? AND user_id = ?");
$query->bind_param("ii", $product_id, $user_id);
$query->execute();
$result = $query->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode(["success" => false, "error" => "Product not found"]);
    exit();
}

$newQuantity = $row['quantity'] + ($action === "increase" ? 1 : -1);
if ($newQuantity < 1) $newQuantity = 1; // Prevent negative quantity

$update = $conn->prepare("UPDATE cart SET quantity = ? WHERE product_id = ? AND user_id = ?");
$update->bind_param("iii", $newQuantity, $product_id, $user_id);
$update->execute();

echo json_encode(["success" => true, "new_quantity" => $newQuantity]);
?>
