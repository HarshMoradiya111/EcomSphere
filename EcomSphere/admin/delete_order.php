<?php
session_start();
include 'db.php'; // Ensure correct DB connection

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = intval($_POST['order_id']);

    // Delete related order items first
    $delete_order_items_query = "DELETE FROM order_items WHERE order_id = ?";
    $stmt_items = $conn->prepare($delete_order_items_query);
    $stmt_items->bind_param("i", $order_id);
    $stmt_items->execute();

    // Delete the order from the database
    $delete_order_query = "DELETE FROM orders WHERE id = ?";
    $stmt_order = $conn->prepare($delete_order_query);
    $stmt_order->bind_param("i", $order_id);

    if ($stmt_order->execute()) {
        // Redirect back to orders page after deletion
        header("Location: orders.php");
        exit;
    } else {
        echo "<h2 style='text-align:center; color:red;'>Error deleting order.</h2>";
    }
}

$conn->close();
?>