<?php
if (!isset($_GET['order_id'])) {
    die("<h2>Order ID missing. <a href='index.php'>Go back</a></h2>");
}

$order_id = $_GET['order_id'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Success - EcomSphere</title>
    <style>
        /* Neo Premium Theme */
        body {
            font-family: 'Arial', sans-serif;
            background: #121212;
            color: #fff;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            text-align: center;
            background: #1e1e1e;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 255, 255, 0.2);
            max-width: 500px;
            width: 90%;
        }
        h2 {
            font-size: 28px;
            margin-bottom: 10px;
            color: #0ff; /* Cyan */
        }
        p {
            font-size: 18px;
            margin-bottom: 20px;
            color: #bbb;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #0ff;
            color: #121212;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 8px;
            transition: 0.3s;
        }
        .button:hover {
            background: #00cccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>🎉 Order Placed Successfully!</h2>
        <p>Your order <strong>#<?php echo $order_id; ?></strong> has been placed.</p>
        <a href="index.php" class="button">Continue Shopping</a>
    </div>
</body>
</html>
