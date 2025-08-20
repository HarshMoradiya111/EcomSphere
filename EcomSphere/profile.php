<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Redirect if the user is not logged in
if (!isset($_SESSION['USER_ID'])) {
    header("Location: login.php");
    exit();
}

// Get user details from session
$username = $_SESSION['USERNAME'];
$email = $_SESSION['USER_EMAIL'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Page</title>
    <link rel="stylesheet" href="style.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            text-align: center;
            padding: 0px;
        }
        .profile-container {
            background: white;
            padding: 50px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            display: inline-block;
        }
        h2 {
            color: #333;
        }
        p {
            font-size: 18px;
            color: #555;
        }
        .logout-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            color: white;
            background: red;
            text-decoration: none;
            border-radius: 15px;
        }
    </style>
</head>
<body>
<section id="header">
        <a href="#"><img src="img/logo1.png" class="logo" alt="" height="60"></a>
        <div>
            <ul id="navbar">
                <li><a href="index.php">Home</a></li>
                <li><a href="shop.html">Shop</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a class="active" href="profile.php">profile</a></li>
                <!-- <li><a href="../a/login-system/index.php">Login/Reg</a></li> -->
                <!-- In navbar section of index.html -->
                <!-- <li><a href="profile.php" id="profile-link">Profile</a></li> -->
                <!-- <li><a href="login/login.php">Login</a></li> -->

                <li id="lg-bag"><a href="cart.html"><img src="img/cart.png" class="cart" alt="" height="30"></a></li>
                <a href="#" id="close"><img src="img/close.svg" height="30" alt=""></a>
            </ul>
        </div>
        <div id="mobile">
            <a href="#"><img src="img/cart.svg" height="20" alt=""></i></a>
            <i id="bar"><img src="img/menu.svg" height="20" width="30" alt=""></i>

        </div>
    </section>
    <div class="profile-container">
        <h2>Welcome, <?php echo htmlspecialchars($username); ?>!</h2>
        <p><strong>Email:</strong> <?php echo htmlspecialchars($email); ?></p>
        <a href="logout.php" class="logout-btn">Logout</a>
        <a href="index.php" class="logout-btn">Dashboard</a>
    </div>
</body>
</html>
