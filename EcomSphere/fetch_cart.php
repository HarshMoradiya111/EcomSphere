<?php
session_start();
include 'db.php'; // Ensure correct database connection

header("Content-Type: application/json");

// Check if user is logged in
if (!isset($_SESSION['USER_ID'])) {
    echo json_encode(["success" => false, "error" => "User not logged in"]);
    exit();
}

$user_id = $_SESSION['USER_ID'];

// Fetch cart items
$stmt = $conn->prepare("SELECT cart.id, cart.product_id, cart.quantity, cart.price, products.name, products.image 
                        FROM cart 
                        JOIN products ON cart.product_id = products.id 
                        WHERE cart.user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$total = 0;
$cart_items = [];

while ($row = $result->fetch_assoc()) {
    $row['subtotal'] = $row['price'] * $row['quantity'];
    $total += $row['subtotal'];
    $cart_items[] = $row;
}

echo json_encode(["success" => true, "cart" => $cart_items, "total" => $total]);
?>
