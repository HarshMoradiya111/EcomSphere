<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit();
}
?>
<?php
include 'includes/db.php';
include 'includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = sanitize($_POST['username']);
    $email = sanitize($_POST['email']);
    $password = password_hash(sanitize($_POST['password']), PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $password);

    if ($stmt->execute()) {
        redirect('index.php');
    } else {
        echo "Registration failed.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="wrapper active">
        <span class="rotate-bg"></span>
        <span class="rotate-bg2"></span>

        <div class="form-box register">
            <h2 class="title animation" style="--i:17; --j:0">Sign Up</h2>
            <form action="register.php" method="POST">
                <div class="input-box animation" style="--i:18; --j:1">
                    <input type="text" name="username" required>
                    <label for="">Username</label>
                    <i class='bx bxs-user'></i>
                </div>

                <div class="input-box animation" style="--i:19; --j:2">
                    <input type="email" name="email" required>
                    <label for="">Email</label>
                    <i class='bx bxs-envelope'></i>
                </div>

                <div class="input-box animation" style="--i:20; --j:3">
                    <input type="password" name="password" required>
                    <label for="">Password</label>
                    <i class='bx bxs-lock-alt'></i>
                </div>

                <button type="submit" class="btn animation" style="--i:21;--j:4">Sign Up</button>

                <div class="linkTxt animation" style="--i:22; --j:5">
                    <p>Already have an account? <a href="index.php" class="login-link">Login</a></p>
                </div>
            </form>
        </div>
    </div>
    <script src="assets/js/script.js"></script>
</body>
</html>