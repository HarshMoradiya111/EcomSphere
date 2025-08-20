<?php
session_start();
include 'db.php'; // Ensure this correctly connects to ecomsphere database

header("Content-Type: application/json");

// Check if the user is logged in
if (!isset($_SESSION['USER_ID'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate received data
if (!isset($data["id"], $data["price"], $data["quantity"])) {
    echo json_encode(["success" => false, "error" => "Invalid data received"]);
    exit();
}

$product_id = $data["id"];
$price = $data["price"];
$quantity = $data["quantity"];
$user_id = $_SESSION['USER_ID'];

// Debugging log
error_log("User ID: $user_id | Product ID: $product_id | Price: $price | Quantity: $quantity");

// Check if product already exists in the cart
$stmt = $conn->prepare("SELECT id, quantity FROM cart WHERE product_id = ? AND user_id = ?");
$stmt->bind_param("ii", $product_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Update quantity if product exists
    $newQuantity = $row['quantity'] + $quantity;
    $updateStmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
    $updateStmt->bind_param("ii", $newQuantity, $row['id']);
    
    if ($updateStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Cart updated"]);
    } else {
        echo json_encode(["success" => false, "error" => "Failed to update cart"]);
    }
} else {
    // Insert new product into cart
    $insertStmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    $insertStmt->bind_param("iiid", $user_id, $product_id, $quantity, $price);

    if ($insertStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Added to cart"]);
    } else {
        echo json_encode(["success" => false, "error" => "Failed to add to cart: " . $conn->error]);
    }
}
?>
