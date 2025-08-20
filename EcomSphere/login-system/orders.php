<?php
session_start();
include '../db.php'; // Ensure correct DB connection

// Fetch orders
$sql = "SELECT orders.id, users.username, products.name AS product_name, orders.quantity, orders.total_price, orders.status 
        FROM orders 
        JOIN users ON orders.user_id = users.id 
        JOIN products ON orders.product_id = products.id 
        ORDER BY orders.id DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Orders</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border: 1px solid black; text-align: left; }
        th { background-color: #333; color: white; }
    </style>
</head>
<body>
    <h2>Orders Management</h2>
    <table>
        <tr>
            <th>Order ID</th>
            <th>Username</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Status</th>
        </tr>
        <?php while ($row = $result->fetch_assoc()) { ?>
        <tr>
            <td><?= $row['id'] ?></td>
            <td><?= $row['username'] ?></td>
            <td><?= $row['product_name'] ?></td>
            <td><?= $row['quantity'] ?></td>
            <td>$<?= number_format($row['total_price'], 2) ?></td>
            <td><?= $row['status'] ?></td>
        </tr>
        <?php } ?>
    </table>
</body>
</html>

<?php $conn->close(); ?>
