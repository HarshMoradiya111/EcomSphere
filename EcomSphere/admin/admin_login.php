<?php
session_start();

// Redirect to dashboard if already logged in
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header("Location: admin_dashboard.php");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Hardcoded Admin Credentials
    $admin_username = "admin";
    $admin_password = "admin123";

    if ($username === $admin_username && $password === $admin_password) {
        // Login successful - Set session
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;

        // Prevent form resubmission issue
        header("Location: admin_dashboard.php");
        exit();
    } else {
        $error = "Invalid Username or Password!";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <style>
        body { background-color: #f4f4f4; }
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .btn-primary { background: #007bff; border: none; }
        .btn-primary:hover { background: #0056b3; }
    </style>
</head>
<body>

<div class="login-container">
    <h3 class="text-center">Admin Login</h3>

    <?php if (isset($error)): ?>
        <div class="alert alert-danger"><?php echo $error; ?></div>
    <?php endif; ?>

    <form action="" method="POST">
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input type="text" name="username" class="form-control" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" name="password" class="form-control" required>
        </div>

        <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>
</div>

</body>
</html>
