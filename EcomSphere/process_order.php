<?php
// ✅ Ensure session is started properly
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ✅ Check if user is logged in
if (!isset($_SESSION['USER_ID'])) {
    die("<h2>Please <a href='login-system/index.php'>log in</a> to place an order.</h2>");
}

$user_id = $_SESSION['USER_ID']; // Correct session variable

include 'db.php'; // Ensure connection to ecomsphere database

// ✅ Fetch cart data
$stmt = $conn->prepare("SELECT c.product_id, p.id AS valid_product, c.price, c.quantity 
                        FROM cart c 
                        LEFT JOIN products p ON c.product_id = p.id 
                        WHERE c.user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

// ✅ Check if cart is empty
if ($result->num_rows === 0) {
    die("<h2>Your cart is empty. <a href='shop.html'>Continue Shopping</a></h2>");
}

// ✅ Validate products before proceeding
$cart_items = [];
$total_price = 0;
$total_quantity = 0;

while ($row = $result->fetch_assoc()) {
    if ($row['valid_product'] === null) {
        die("Invalid product detected in cart. Please remove unavailable items.");
    }
    $cart_items[] = $row;
    $total_price += $row['price'] * $row['quantity'];
    $total_quantity += $row['quantity'];
}
$stmt->close();

// ✅ Insert order into `orders` table
$order_stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, total_price, quantity, status, created_at) 
                              VALUES (?, ?, ?, ?, 'Pending', NOW())");
$order_stmt->bind_param("idii", $user_id, $total_price, $total_price, $total_quantity);
$order_stmt->execute();
$order_id = $order_stmt->insert_id;
$order_stmt->close();

// ✅ Insert each product into `order_items`
$item_stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
foreach ($cart_items as $item) {
    $item_stmt->bind_param("iiid", $order_id, $item['product_id'], $item['quantity'], $item['price']);
    $item_stmt->execute();
}
$item_stmt->close();

// ✅ Clear user's cart after order is placed
$clear_cart_stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
$clear_cart_stmt->bind_param("i", $user_id);
$clear_cart_stmt->execute();
$clear_cart_stmt->close();

$conn->close();

// ✅ Redirect to confirmation page
header("Location: order_success.php?order_id=" . $order_id);
exit;
?>
