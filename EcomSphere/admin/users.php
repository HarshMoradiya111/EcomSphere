<?php
session_start();
include "../config.php"; 

if (!isset($_SESSION['admin_id'])) {
    header("Location: login.php");
    exit();
}

// Fetch all users
$result = $conn->query("SELECT * FROM users");

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Manage Users</title>
</head>
<body>
    <h1>User Management</h1>
    <table border="1">
        <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Actions</th>
        </tr>
        <?php while ($row = $result->fetch_assoc()): ?>
        <tr>
            <td><?= $row['id'] ?></td>
            <td><?= $row['username'] ?></td>
            <td><?= $row['email'] ?></td>
            <td><?= $row['created_at'] ?></td>
            <td>
                <a href="delete_user.php?id=<?= $row['id'] ?>" onclick="return confirm('Are you sure?')">Delete</a>
            </td>
        </tr>
        <?php endwhile; ?>
    </table>
</body>
</html>
