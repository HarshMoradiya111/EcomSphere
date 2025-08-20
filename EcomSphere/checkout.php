<?php
session_start();
include 'db.php'; // Database connection

// Get user ID from session
$user_id = $_SESSION['USER_ID'] ?? 0;
$cart = []; // Ensure $cart is initialized

if ($user_id) {
    // Fetch cart items from the database
    $query = "SELECT c.*, p.name FROM cart c 
              JOIN products p ON c.product_id = p.id
              WHERE c.user_id = $user_id";
    $result = mysqli_query($conn, $query);

    if ($result) { // Ensure the query was successful
        while ($row = mysqli_fetch_assoc($result)) {
            $cart[] = [
                'product_id' => $row['product_id'],
                'name' => $row['name'] ?? 'Unknown Product',
                'quantity' => $row['quantity'],
                'price' => $row['price']
            ];
        }
        $_SESSION['cart'] = $cart; // Update session with cart data
    } else {
        echo "<h2 style='text-align:center; color:red;'>Error fetching cart data.</h2>";
    }
}

// If the cart is empty, show a message
if (empty($cart)) {
    echo "<h2 class='empty-cart'>Your cart is empty.</h2>";
    exit;
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $address = mysqli_real_escape_string($conn, $_POST['address']);
    $phone = mysqli_real_escape_string($conn, $_POST['phone']);
    
    $checkout_query = "INSERT INTO checkout (user_id, name, address, phone) VALUES ('$user_id', '$name', '$address', '$phone')";
    
    if (mysqli_query($conn, $checkout_query)) {
        header("Location: process_order.php");
        exit;
    } else {
        echo "<h2 style='text-align:center; color:red;'>Error placing order.</h2>";
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - EcomSphere</title>
    <style>
        /* === Global Styles === */
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }

        /* === Checkout Container === */
        #checkout-container {
            max-width: 900px;
            margin: 50px auto;
            padding: 25px;
            background: #fff;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            text-align: center;
        }

        #checkout-container h2 {
            font-size: 28px;
            color: #333;
            margin-bottom: 20px;
        }

        /* === Checkout Table === */
        #checkout-summary {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        #checkout-summary th, 
        #checkout-summary td {
            border: 1px solid #ddd;
            padding: 14px;
            text-align: center;
        }

        #checkout-summary th {
            background-color: #007bff;
            color: white;
            font-size: 18px;
        }

        #checkout-summary tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        /* === Total Price === */
        .checkout-total {
            font-size: 24px;
            font-weight: bold;
            color: #ff4d00;
            margin: 20px 0;
        }

        /* === Checkout Form === */
        .checkout-form input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 16px;
        }

        .checkout-form button {
            background-color: #ff4d00;
            color: white;
            font-size: 18px;
            font-weight: bold;
            padding: 14px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s, transform 0.2s;
            width: 100%;
            display: block;
        }

        .checkout-form button:hover {
            background-color: #e63e00;
            transform: scale(1.05);
        }

        /* === Empty Cart Message === */
        .empty-cart {
            text-align: center;
            font-size: 24px;
            color: #ff4d00;
            margin-top: 50px;
        }

        /* === Responsive Design === */
        @media screen and (max-width: 768px) {
            #checkout-container {
                width: 90%;
            }
            #checkout-summary th, #checkout-summary td {
                font-size: 14px;
                padding: 10px;
            }
        }
    </style>
</head>
<body>

<div id="checkout-container">
    <h2>Checkout</h2>

    <table id="checkout-summary">
        <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
        </tr>
        <?php 
        $total = 0;
        foreach ($cart as $item) { // Ensure $cart is available
            echo "<tr>
                    <td>{$item['name']}</td>
                    <td>{$item['quantity']}</td>
                    <td>Rs. {$item['price']}</td>
                  </tr>";
            $total += $item['price'] * $item['quantity'];
        }
        ?>
    </table>

    <h3 class="checkout-total">Total: Rs. <?php echo number_format($total, 2); ?></h3>

    <form class="checkout-form" action="" method="POST">
        <input type="text" name="name" placeholder="Full Name" required>
        <input type="text" name="address" placeholder="Shipping Address" required>
        <input type="text" name="phone" placeholder="Phone Number" required>
        <button type="submit">Place Order</button>
    </form>
</div>

</body>
</html>