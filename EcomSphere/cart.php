<?php
session_start();
header("Content-Type: application/json");
include 'db.php';

// Ensure user is logged in
if (!isset($_SESSION['USER_ID'])) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit;
}

$user_id = $_SESSION['USER_ID'];

// Fetch cart items for this user
$stmt = $conn->prepare("SELECT c.id, p.name, p.image, c.quantity, c.price 
                        FROM cart c 
                        JOIN products p ON c.product_id = p.id 
                        WHERE c.user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$cart = [];
while ($row = $result->fetch_assoc()) {
    $cart[] = $row;
}

echo json_encode($cart);
?>
