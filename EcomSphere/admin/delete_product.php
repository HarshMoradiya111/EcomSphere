<?php
session_start();
include("db.php");

if (isset($_GET['id'])) {
    $id = intval($_GET['id']); // Sanitize input

    // Get the image name before deleting
    $query = "SELECT image FROM products WHERE id = $id";
    $result = mysqli_query($conn, $query);
    $row = mysqli_fetch_assoc($result);

    if ($row) {
        $image_path = "uploads/" . $row['image'];

        // Delete related records in order_items
        $delete_order_items_sql = "DELETE FROM order_items WHERE product_id = $id";
        mysqli_query($conn, $delete_order_items_sql);

        // Delete the product from database
        $delete_sql = "DELETE FROM products WHERE id = $id";
        if (mysqli_query($conn, $delete_sql)) {
            // Delete the image file if it exists
            if (file_exists($image_path) && !empty($row['image'])) {
                unlink($image_path);
            }

            header("Location: admin_dashboard.php");
            exit();
        } else {
            echo "Error deleting product: " . mysqli_error($conn);
        }
    } else {
        echo "Product not found!";
    }
} else {
    echo "Invalid product ID!";
}
?>