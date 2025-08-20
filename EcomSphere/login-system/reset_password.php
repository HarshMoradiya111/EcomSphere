<?php
require 'db.php'; // Database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $token = $_POST["token"];
    $new_password = password_hash($_POST["password"], PASSWORD_DEFAULT);

    // Update the user's password
    $stmt = $conn->prepare("UPDATE users SET password=?, reset_token=NULL WHERE reset_token=?");
    $stmt->execute([$new_password, $token]);

    echo "Password updated! You can now <a href='login.php'>login</a>.";
}

// Get token from URL
$token = $_GET["token"] ?? '';
?>

<form method="POST">
    <input type="hidden" name="token" value="<?php echo $token; ?>">
    <input type="password" name="password" placeholder="Enter new password" required>
    <button type="submit">Update Password</button>
</form>
