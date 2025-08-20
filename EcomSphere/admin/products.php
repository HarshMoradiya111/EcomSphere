<?php
session_start();
include "../config.php"; 

if (!isset($_SESSION['admin_id'])) {
    header("Location: admin_login.php");
    exit();
}

// Fetch products
$result = $conn->query("SELECT * FROM products");

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Manage Products</title>
</head>
<body>
    <h1>Product Management</h1>
    <a href="add_product.php">Add Product</a>
    <table border="1">
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Image</th>
            <th>Actions</th>
        </tr>
        <?php while ($row = $result->fetch_assoc()): ?>
        <tr>
            <td><?= $row['id'] ?></td>
            <td><?= $row['name'] ?></td>
            <td>Rs.<?= $row['price'] ?></td>
            <td><img src="../img/<?= $row['image'] ?>" width="50"></td>
            <td>
                <a href="edit_product.php?id=<?= $row['id'] ?>">Edit</a> |
                <a href="delete_product.php?id=<?= $row['id'] ?>" onclick="return confirm('Are you sure?')">Delete</a>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>
</body>
</html>
