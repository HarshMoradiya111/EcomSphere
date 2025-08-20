<?php
session_start();
include 'db.php';

if (!isset($_SESSION['USER_ID'])) {
    die("<h2>Please <a href='login-system/index.php'>log in</a> to place an order.</h2>");
}

$user_id = $_SESSION['USER_ID'];

$stmt = $conn->prepare("SELECT c.product_id, p.name, p.image, c.quantity, c.price 
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

if (empty($cart)) {
    die("<h2>Your cart is empty. <a href='shop.html'>Continue Shopping</a></h2>");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finalize Order - EcomSphere</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Poppins:wght@300;400;600&display=swap');

        body {
            font-family: 'Poppins', sans-serif;
            background: #121212;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .order-container {
            width: 90%;
            max-width: 850px;
            background: rgba(25, 25, 25, 0.9);
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
            animation: fadeIn 0.8s ease-in-out;
            text-align: center;
            color: #ffffff;
        }
        h2 {
            font-size: 28px;
            margin-bottom: 20px;
            font-weight: 600;
            font-family: 'Orbitron', sans-serif;
            color: #00ffff;
        }
        .order-items {
            margin: 20px 0;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .order-item {
            display: flex;
            align-items: center;
            background: rgba(50, 50, 50, 0.8);
            padding: 15px;
            border-radius: 12px;
            transition: transform 0.3s ease-in-out, box-shadow 0.3s;
            border: 2px solid #00ffff;
        }
        .order-item:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px #00ffff;
        }
        .order-item img {
            width: 90px;
            height: 90px;
            object-fit: cover;
            border-radius: 10px;
            margin-right: 20px;
            border: 3px solid #00ffff;
        }
        .item-details {
            flex-grow: 1;
            text-align: left;
        }
        .item-details h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: #00ffff;
        }
        .item-details p {
            margin: 5px 0;
            font-size: 14px;
            color: #dddddd;
        }
        .price {
            font-weight: bold;
            font-size: 18px;
            color: #ffeb3b;
        }
        .order-summary {
            margin-top: 30px;
            padding: 15px;
            background: rgba(50, 50, 50, 0.8);
            border-radius: 12px;
            border: 2px solid #ffeb3b;
        }
        .order-summary h3 {
            font-size: 24px;
            color: #ffeb3b;
        }
        .order-summary p {
            font-size: 16px;
            color: #ffffff;
        }
        .total-price {
            font-size: 26px;
            font-weight: bold;
            color: #ffeb3b;
        }
        button {
            background: linear-gradient(45deg, #00ffff, #ffeb3b);
            color: black;
            padding: 12px 28px;
            font-size: 18px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.3s ease-in-out;
            margin-top: 20px;
            text-transform: uppercase;
            font-family: 'Orbitron', sans-serif;
        }
        button:hover {
            background: linear-gradient(45deg, #ffeb3b, #00ffff);
            transform: scale(1.1);
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>

<div class="order-container">
    <h2>Finalize Your Order</h2>

    <div class="order-items">
        <?php foreach ($cart as $item): ?>
            <div class="order-item">
                <img src="admin/uploads/<?php echo htmlspecialchars($item['image'] ?? 'default.jpg'); ?>" 
                     alt="<?php echo htmlspecialchars($item['name']); ?>">
                <div class="item-details">
                    <h3><?php echo htmlspecialchars($item['name']); ?></h3>
                    <p>Quantity: <?php echo $item['quantity']; ?></p>
                    <p class="price">₹<?php echo number_format($item['price'] * $item['quantity'], 2); ?></p>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <div class="order-summary">
        <h3>Order Summary</h3>
        <p>Total Items: <strong><?php echo count($cart); ?></strong></p>
        <p class="total-price">Total Amount: ₹<?php 
            $total = array_sum(array_map(fn($item) => $item['price'] * $item['quantity'], $cart));
            echo number_format($total, 2);
        ?></p>
        <button id="placeOrderBtn">Place Order</button>
    </div>
</div>

<script>
    document.getElementById("placeOrderBtn").addEventListener("click", function() {
        this.innerHTML = "Processing...";
        this.style.background = "linear-gradient(45deg, #ffeb3b, #00ffff)";
        setTimeout(() => {
            window.location.href = "process_order.php";
        }, 2000);
    });
</script>

</body>
</html>
