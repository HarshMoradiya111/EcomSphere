<?php
include '../db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    error_log("POST Data: " . print_r($_POST, true)); // Debugging: Check received data

    if (isset($_POST['order_id']) && isset($_POST['status'])) {
        $order_id = intval($_POST['order_id']);
        $status = trim($_POST['status']);

        $allowed_status = ['Pending', 'Completed', 'Cancelled'];
        if (!in_array($status, $allowed_status)) {
            die("Invalid status: " . htmlspecialchars($status));
        }

        error_log("Updating Order ID $order_id to status: $status"); // Debug before updating

        $update_query = "UPDATE orders SET status = ? WHERE id = ?";
        $stmt = $conn->prepare($update_query);
        $stmt->bind_param("si", $status, $order_id);

        if ($stmt->execute()) {
            error_log("Order updated successfully!"); // Confirm update
            header("Location: orders.php");
            exit();
        } else {
            error_log("SQL Error: " . $stmt->error); // Log SQL errors
            die("Database error.");
        }

        $stmt->close();
        exit();
    }
}

$conn->close();

?>
