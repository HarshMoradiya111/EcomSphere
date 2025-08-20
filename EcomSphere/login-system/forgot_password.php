<?php
require '../vendor/autoload.php';
require '../db.php'; // Make sure this file contains $conn (MySQLi connection)

// Use Dotenv to load environment variables (optional, requires vlucas/phpdotenv)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = filter_var(trim($_POST["email"]), FILTER_VALIDATE_EMAIL);

    if (!$email) {
        echo "Invalid email address!";
        exit;
    }

    // Check if user with this email exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        // Generate token
        $token = bin2hex(random_bytes(50));
        $stmt->close();

        // Store the token in DB
        $stmt = $conn->prepare("UPDATE users SET reset_token = ? WHERE email = ?");
        $stmt->bind_param("ss", $token, $email);
        $stmt->execute();
        $stmt->close();

        // Prepare reset link
        $reset_link = "http://localhost/EcomSphere/reset_password.php?token=$token";

        // Send Email
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp-relay.brevo.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'forsmpuse@gmail.com'; // Your verified sender
            $mail->Password = 'xsmtpsib-84bca299b41249c6b7a8771ac52d65255c7f39a9c6b088a2c8b7741c24753a59-GP6V9cq5OyjKIA21';   // Store securely in production
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('forsmpuse@gmail.com', 'EcomSphere');
            $mail->addAddress($email);
            $mail->Subject = 'Reset Your Password - EcomSphere';
            $mail->Body = "Hi, click the following link to reset your password:\n\n$reset_link\n\nThis link will expire soon.";

            $mail->send();
            echo "Reset link sent successfully! Please check your email.";
        } catch (Exception $e) {
            echo "Failed to send email. Error: " . $mail->ErrorInfo;
        }
    } else {
        echo "Email not found!";
    }

    $conn->close();
}
?>

<!-- HTML form -->
<form method="POST" action="">
    <input type="email" name="email" placeholder="Enter your email" required>
    <button type="submit">Reset Password</button>
</form>
