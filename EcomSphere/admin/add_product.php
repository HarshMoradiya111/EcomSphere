<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Capture form inputs safely
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $category = mysqli_real_escape_string($conn, $_POST['category']);
    $description = mysqli_real_escape_string($conn, $_POST['description']);
    $price = mysqli_real_escape_string($conn, $_POST['price']);

    // Handle Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $imageName = basename($_FILES['image']['name']);
        $imageTmpName = $_FILES['image']['tmp_name'];
        $uploadDir = "uploads/" . $imageName;

        if (move_uploaded_file($imageTmpName, $uploadDir)) {
            // Image uploaded successfully
        } else {
            echo "<script>alert('Error uploading image.');</script>";
            exit();
        }
    } else {
        echo "<script>alert('No image selected.');</script>";
        exit();
    }

    // Validate that all required fields are filled
    if (!empty($name) && !empty($category) && !empty($description) && !empty($price) && !empty($imageName)) {
        // Correct SQL Query
        $sql = "INSERT INTO products (name, category, description, price, image) 
                VALUES ('$name', '$category', '$description', '$price', '$imageName')";

        if (mysqli_query($conn, $sql)) {
            echo "<script>alert('Product added successfully!');</script>";
        } else {
            echo "<script>alert('Database error:" . mysqli_error($conn) . "');</script>";
        }
    } else {
        echo "<script>alert('Please fill in all fields.');</script>";
    }
}
?>




<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add New Product</title>
    <link rel="stylesheet" href="admin_style.css">
    <style>
        /* Additional styling for the category dropdown */
        select[name="category"] {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #ccc;
        }
         /* Styling for description textarea */
         textarea[name="description"] {
            width: 100%;
            height: 100px;
            padding: 8px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #ccc;
            resize: vertical;
        }

        /* Styling for image input */
        input[type="file"] {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #ccc;
        }
    </style>
</head>

<body>
<div class="form-container">
        <h2>Add New Product</h2>
        <form action="add_product.php" method="POST" enctype="multipart/form-data">

            <label>Product Name:</label>
            <input type="text" name="name" required>

            <label>Price:</label>
            <input type="number" name="price" required>

            <label>Category:</label>
            <select name="category" required>
                <option value="Men Clothing">Men Clothing</option>
                <option value="Women Clothing">Women Clothing</option>
                <option value="Footwear">Footwear</option>
                <option value="Glasses">Glasses</option>
                <option value="Cosmetics">Cosmetics</option>
            </select>

            <label>Description:</label>
            <textarea name="description" required></textarea>

            <label>Image:</label>
            <input type="file" name="image" required>

            <button type="submit" name="submit">Add Product</button>
        </form>

        <a href="admin_dashboard.php" class="back-btn">🔙 Back to Dashboard</a>
    </div>
</body>

</html>