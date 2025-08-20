<?php
session_start();
include '../db.php'; // Ensure correct DB connection

// Fetch orders WITHOUT product_id
$sql = "SELECT orders.id, users.username, orders.quantity, orders.total_price, orders.total_amount, orders.status, orders.created_at 
        FROM orders 
        JOIN users ON orders.user_id = users.id 
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
        /* Neo Premium Theme */
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #1E1E2F;
            color: #fff;
            text-align: center;
            padding: 20px;
        }

        h2 {
            color: #FFD700;
            font-size: 28px;
            margin-bottom: 20px;
        }

        table {
            width: 90%;
            margin: auto;
            border-collapse: collapse;
            background: #2A2A3C;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.2);
        }

        th,
        td {
            padding: 15px;
            text-align: center;
            border-bottom: 1px solid #444;
        }

        th {
            background-color: #282846;
            color: #FFD700;
            font-size: 16px;
        }

        td {
            font-size: 14px;
        }

        tr:nth-child(even) {
            background-color: #24243E;
        }

        tr:hover {
            background-color: #39395A;
            transition: 0.3s;
        }

        .btn {
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            color: BLUE;
            background: CYAN;
            font-size: 14px;
            cursor: pointer;
            transition: 0.3s;
        }

        .btn-pending {
            background-color: #FF9800;
        }

        .btn-completed {
            background-color: #4CAF50;
        }

        .btn-cancelled {
            background-color: #E53935;
        }

        .btn-update {
            background-color:rgb(72, 80, 88);
            padding: 6px 10px;
            font-size: 12px;
            margin-top: 5px;
        }

        .btn-update:hover {
            background-color: #0056b3;
        }

        @media (max-width: 768px) {
            table {
                width: 100%;
            }

            th,
            td {
                padding: 10px;
                font-size: 12px;
            }
        }
    </style>
</head>

<body>

    <h2>Orders Management</h2>

    <!-- Back to Dashboard Button -->
    <a href="admin_dashboard.php" style="text-decoration: none;">
        <button style="margin-bottom: 20px; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Back to Dashboard
        </button>
    </a>

    <table>
        <tr>
            <th>Order ID</th>
            <th>Username</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
        </tr>
        <?php while ($row = $result->fetch_assoc()) { ?>
            <tr>
                <td><?= $row['id'] ?></td>
                <td><?= $row['username'] ?></td>
                <td><?= $row['quantity'] ?></td>
                <td>$<?= number_format($row['total_price'], 2) ?></td>
                <td>$<?= number_format($row['total_amount'], 2) ?></td>
                <td>
                    <?php
                    $status = strtolower(trim($row['status'])); // Ensure proper formatting
                    if ($status == 'pending') { ?>
                        <span class="btn btn-warning">Pending</span>
                    <?php } elseif ($status == 'completed') { ?>
                        <span class="btn btn-success">Completed</span>
                    <?php } elseif ($status == 'cancelled') { ?>
                        <span class="btn btn-danger">Cancelled</span>
                    <?php } else { ?>
                        <span class="btn btn-secondary">Unknown</span> <!-- Handles invalid values -->
                    <?php } ?>
                </td>
                <td><?= $row['created_at'] ?></td>
                <td>
                    <?php if ($row['status'] == 'Pending') { ?>
                        <form action="update_status.php" method="POST">
                            <input type="hidden" name="order_id" value="<?= $row['id'] ?>">

                            <!-- Button for "Mark as Completed" -->
                            <button type="submit" name="status" value="Completed" class="btn btn-success">Mark as
                                Completed</button>

                            <!-- Button for "Cancel Order" -->
                            <button type="submit" name="status" value="Cancelled" class="btn btn-danger">Cancel Order</button>
                        </form>
                    <?php } ?>
                    <!-- Delete Order Button -->
                    <form action="delete_order.php" method="POST" style="margin-top: 5px;">
                        <input type="hidden" name="order_id" value="<?= $row['id'] ?>">
                        <button type="submit" class="btn btn-danger">Delete Order</button>
                    </form>
                </td>
                <td>
                    <a href="order_details.php?order_id=<?= $row['id'] ?>" style="text-decoration: none;">
                        <button
                            style="padding: 5px 10px; background-color: blue; color: white; border: none; cursor: pointer;">View
                            Details</button>
                    </a>
                </td>
            </tr>
        <?php } ?>
    </table>

</body>

</html>

<?php $conn->close(); ?>