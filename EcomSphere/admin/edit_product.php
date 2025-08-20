<?php
include 'db.php'; // Database connection
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $query = "SELECT * FROM products WHERE id = $id";
    $result = mysqli_query($conn, $query);
    $product = mysqli_fetch_assoc($result);
}

if (isset($_POST['update_product'])) {
    $name = $_POST['name'];
    $price = $_POST['price'];
    $description = $_POST['description'];

    // Handle Image Upload
    if ($_FILES['image']['name']) {
        $image_name = basename($_FILES['image']['name']);
        $target_dir = "uploads/";
        $target_file = $target_dir . $image_name;
        move_uploaded_file($_FILES["image"]["tmp_name"], $target_file);
    } else {
        $image_name = $product['image']; // Keep existing image
    }

    $updateQuery = "UPDATE products SET name='$name', price='$price', description='$description', image='$image_name' WHERE id=$id";
    mysqli_query($conn, $updateQuery);
    
    header("Location: products.php"); // Redirect to products page after update
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Product</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <style>
        body {
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            background: #fff;
            padding: 20px;
            margin-top: 50px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .form-label {
            font-weight: bold;
        }
        .btn-primary {
            background: #007bff;
            border: none;
        }
        .btn-primary:hover {
            background: #0056b3;
        }
        .preview-img {
            max-width: 100px;
            margin-top: 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>

<div class="container">
    <h2 class="text-center mb-4">Edit Product</h2>
    <form action="" method="POST" enctype="multipart/form-data">
        
        <div class="mb-3">
            <label class="form-label">Product Name</label>
            <input type="text" name="name" class="form-control" value="<?php echo htmlspecialchars($product['name']); ?>" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Price</label>
            <input type="number" name="price" class="form-control" value="<?php echo $product['price']; ?>" required>
        </div>

        <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-control" required><?php echo htmlspecialchars($product['description']); ?></textarea>
        </div>

        <div class="mb-3">
            <label class="form-label">Product Image</label>
            <input type="file" name="image" class="form-control">
            <p>Current Image:</p>
            <img src="uploads/<?php echo $product['image']; ?>" alt="Product Image" class="preview-img">
        </div>

        <button type="submit" name="update_product" class="btn btn-primary w-100">Update Product</button>
    </form>
</div>

</body>
</html>
