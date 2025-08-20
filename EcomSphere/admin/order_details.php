<?php
session_start();
include '../db.php'; // Ensure correct DB connection

// Fetch order details with product images and checkout details
$order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;
$sql = "SELECT orders.id, users.username, orders.status, orders.created_at, 
               products.name AS product_name, products.image AS product_image, 
               order_items.quantity, order_items.price AS total_price,
               checkout.name, checkout.address, checkout.phone
        FROM orders
        JOIN users ON orders.user_id = users.id
        JOIN order_items ON orders.id = order_items.order_id
        JOIN products ON order_items.product_id = products.id
        JOIN checkout ON orders.user_id = checkout.user_id
        WHERE orders.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$result = $stmt->get_result();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Details</title>
    <style>
        /* Premium Neon Theme */
        body {
            font-family: 'Arial', sans-serif;
            background-color: #0a0f1a;
            color: #d1e8ff;
            text-align: center;
        }
        h2 {
            font-size: 2em;
            color: #88ccff;
            text-shadow: 0px 0px 12px #88ccff;
        }
        table {
            width: 90%;
            margin: auto;
            border-collapse: collapse;
            background: #12192b;
            border: 1px solid #88ccff;
            box-shadow: 0px 0px 15px rgba(136, 204, 255, 0.5);
            border-radius: 8px;
        }
        th, td {
            padding: 12px;
            border: 1px solid rgba(136, 204, 255, 0.5);
            text-align: center;
        }
        th {
            background-color: #1c2a47;
            color: #88ccff;
            text-shadow: 0px 0px 5px rgba(136, 204, 255, 0.8);
        }
        tr:nth-child(even) {
            background-color: #1a263d;
        }
        tr:hover {
            background-color: #223459;
            transition: 0.3s;
        }
        img {
            width: 80px;
            border-radius: 10px;
            box-shadow: 0px 0px 8px rgba(136, 204, 255, 0.5);
        }
        .button {
            background-color: #1c3a63;
            color: #d1e8ff;
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            font-size: 1em;
            cursor: pointer;
            text-shadow: 0px 0px 8px rgba(136, 204, 255, 0.8);
            transition: 0.3s;
        }
        .button:hover {
            background-color: #275280;
            box-shadow: 0px 0px 12px rgba(136, 204, 255, 0.8);
        }
        .container {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h2>Order Details</h2>
    <div class="container">
        <table>
            <tr>
                <th>Order ID</th>
                <th>Username</th>
                <th>Product</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
            </tr>
            <?php while ($row = $result->fetch_assoc()) { ?>
            <tr>
                <td><?= $row['id'] ?></td>
                <td><?= $row['username'] ?></td>
                <td><?= $row['product_name'] ?></td>
                <td><img src="../img/products/<?= $row['product_image'] ?>" alt="<?= $row['product_name'] ?>"></td>
                <td><?= $row['quantity'] ?></td>
                <td>Rs. <?= number_format($row['total_price'], 2) ?></td>
                <td><?= $row['status'] ?></td>
                <td><?= $row['created_at'] ?></td>
                <td><?= htmlspecialchars($row['name']) ?></td>
                <td><?= htmlspecialchars($row['address']) ?></td>
                <td><?= htmlspecialchars($row['phone']) ?></td>
            </tr>
            <?php } ?>
        </table>
        <br>
        <a href="orders.php"><button class="button">Back to Orders</button></a>
    </div>
</body>
</html>

<?php $conn->close(); ?>