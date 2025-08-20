<?php
session_start();
include("db.php"); // Ensure correct database connection

// Prevent unauthorized access
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: admin_login.php");
    exit();
}

// Ensure database connection exists
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

// Fetch products from database
$sql = "SELECT * FROM products";
$result = mysqli_query($conn, $sql);

// Check if query was successful
if (!$result) {
    die("Query failed: " . mysqli_error($conn));
}
?>



<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="admin_style.css">
</head>

<body>
    <div class="container">
        <h1>Admin Dashboard</h1>
        <a href="add_product.php" class="add-btn">➕ Add New Product</a>
        <a href="orders.php" class="add-btn">🛒 orders</a>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($row = mysqli_fetch_assoc($result)) { ?>
                    <tr>
                        <td><?= htmlspecialchars($row['id']); ?></td>
                        <td><?= htmlspecialchars($row['name']); ?></td>
                        <td>Rs. <?= (int) $row['price'] ; ?></td>
                        
                        <td>
                            <?php
                            // Fix the image path issue dynamically
                            $imagePath = (strpos($row['image'], 'uploads/') === false) ? 'uploads/' . $row['image'] : $row['image'];
                            ?>
                            <img src="<?php echo htmlspecialchars($imagePath); ?>" class="product-img" alt="Product Image"
                                style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
                        </td>


                        </td>


                        <td>
                            <a href="edit_product.php?id=<?= $row['id']; ?>" class="edit-btn">✏️ Edit</a>
                            <a href="delete_product.php?id=<?php echo $row['id']; ?>" class="btn btn-danger btn-sm"
                                onclick="return confirm('Are you sure you want to delete this product?');">
                                🗑️Delete
                            </a>

                        </td>
                    </tr>
                <?php } ?>
            </tbody>
        </table>
        <a href="logout.php" class="logout-btn">🚪 Logout</a>
        <a href="../index.php" class="logout-btn">🚪 Website</a>
    </div>
</body>

</html>