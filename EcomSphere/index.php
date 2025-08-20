<?php
session_start();

if (!isset($_SESSION['USER_ID'])) {
    header("Location: login-system/index.php");
    exit();
}

include 'db.php';

// Define categories
$categories = ['Men Clothing', 'Women Clothing', 'Footwear', 'Glasses', 'Cosmetics'];
$productsByCategory = [];

// Fetch products by category
foreach ($categories as $category) {
    $query = "SELECT * FROM products WHERE category='$category' ORDER BY id DESC";
    $result = mysqli_query($conn, $query);
    if ($result) {
        $productsByCategory[$category] = mysqli_fetch_all($result, MYSQLI_ASSOC);
    }
}
// Fetch all products
$productQuery = "SELECT * FROM products ORDER BY id DESC";
$productResult = mysqli_query($conn, $productQuery);

if (!$productResult) {
    die("Query failed: " . mysqli_error($conn));
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcomSphere</title>
    <script src="https://kit.fontawesome.com/db75cd62a8.js" crossorigin="anonymous"></script>

    <!-- <link rel="stylesheet" href="style.css">
      -->
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
<style>
     
</style>
</head>

<body>
    <!-- <?php if (isset($_SESSION['USER_ID'])): ?>
    <p>Welcome, <?php echo $_SESSION['USERNAME']; ?>!</p>
<?php else: ?>
    <p>User is NOT logged in!</p>
<?php endif; ?> -->
    <section id="header">
        <a href="#"><img src="img/logo1.png" class="logo" alt="" height="60"></a>
        <div>
            <ul id="navbar">    
                <li><a class="active" href="index.html">Home</a></li>
                <li><a href="shop.html">Shop</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="profile.php">profile</a></li>
                <li><a href="admin/admin_login.php">admin</a></li>
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

    <section id="hero">
        <h4>Trade-in-offer</h4>
        <h2>Super value deals</h2>
        <h1>On all products</h1>
        <p>Save more with coupon & up to 70% off!</p>
        <a href="shop.html"><button>Shop now</button></a>
    </section>

    <section id="feature" class="section-p1">
        <div class="fe-box">
            <img src="img/features/f1.png" alt="">
            <h6>Free Shipping</h6>
        </div>
        <div class="fe-box">
            <img src="img/features/f2.png" alt="">
            <h6>Online Order</h6>
        </div>
        <div class="fe-box">
            <img src="img/features/f3.png" alt="">
            <h6>Save Money</h6>
        </div>
        <div class="fe-box">
            <img src="img/features/f4.png" alt="">
            <h6>Promotion</h6>
        </div>
        <div class="fe-box">
            <img src="img/features/f5.png" alt="">
            <h6>Happy Sell</h6>
        </div>
        <div class="fe-box">
            <img src="img/features/f6.png" alt="">
            <h6>Support</h6>
        </div>

    </section>
    <section id="product1" class="section-p1">
        <h2>All Products</h2>
        <p>Explore our wide range of products</p>
        <div class="pro-container">
          
    <!-- Display products by category -->
    <?php foreach ($productsByCategory as $category => $products): ?>
    <section id="<?php echo strtolower(str_replace(' ', '-', $category)); ?>" class="section-p1">
        <h2><?php echo $category; ?></h2>
        <div class="pro-container">
            <?php foreach ($products as $product): ?>
                <?php
                $imagePath = "admin/uploads/" . htmlspecialchars($product['image']);
                $productName = htmlspecialchars($product['name']);
                $productDescription = htmlspecialchars($product['description']);
                $productPrice = floatval($product['price']);
                ?>
                <div class='pro'>
                    <img src='<?php echo $imagePath; ?>' alt=''>
                    <div class='des'>
                        <span>Adidas</span>
                        <h5><?php echo $productName; ?></h5>
                        <p><?php echo $productDescription; ?></p>
                        <h4>₹<?php echo $productPrice; ?></h4>
                    </div>
                    <a href='#' class='add-to-cart' data-id='<?php echo $product['id']; ?>' data-name='<?php echo $productName; ?>' data-price='<?php echo $productPrice; ?>' data-image='<?php echo $imagePath; ?>'>
                        <i class='fa-solid fa-cart-shopping'></i>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endforeach; ?>
        </div>
    </section>
    <!-- admin page -->
    <?php
    include 'db.php';

    // Fetch Featured Products (latest 3)
    $featuredQuery = "SELECT * FROM products WHERE category='featured' ORDER BY id DESC";
    $featuredResult = mysqli_query($conn, $featuredQuery);

    // Fetch New Arrivals (latest 3)
    $newArrivalsQuery = "SELECT * FROM products WHERE category='new' ORDER BY id DESC";
    $newArrivalsResult = mysqli_query($conn, $newArrivalsQuery);
    ?>

    <!-- Featured Products Section -->


    <!-- New Arrivals Section -->
    <section id="product1" class="section-p2">
        <h2>New Arrivals</h2>
        <div class="pro-container">
            <?php
            while ($row = mysqli_fetch_assoc($newArrivalsResult)) {
                $imagePath = "admin/uploads/" . htmlspecialchars($row['image']);
                $productName = htmlspecialchars($row['name']);
                $productDescription = htmlspecialchars($row['description']); // Fetch description
                $productPrice = (int) $row['price'];

                echo "
            <div class='pro'>
                <img src='$imagePath' alt='' >
                <div class='des'>
                    <p>$productName</p>
                    <h5>$productDescription</h5>
                    <h4>₹$productPrice</h4>
                    <a href='#' class='add-to-cart' data-id='{$row['id']}' data-name='$productName' data-description='$productDescription' data-price='$productPrice'
                        data-image='$imagePath'>
                        <i class='fa-solid fa-cart-shopping'></i>
                    </a>
                </div>
            </div>";
            }
            ?>
        </div>
    </section>






    </section>

    <section id="banner" class="section-m1">
        <h4>Repair service</h4>
        <h2>Up to <span>70% off</span> - All T-Shirts & Accessories</h2>
        <button class="normal">Explore More</button>
    </section>
    <!-- 
    <section id="product1" class="section-p1">
        <h2>New Arrivals</h2>
        <p>Summer Collection New Modern Design</p>
        <div class="pro-container">
            <div class="pro">
                <img src="img/products/n1.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="n1" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/n1.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
            <div class="pro">
                <img src="img/products/n2.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="n2" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/n2.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
            <div class="pro">
                <img src="img/products/n3.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="n3" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/n3.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
            <div class="pro">
                <img src="img/products/n4.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="n4" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/n4.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
            <div class="pro">
                <img src="img/products/n5.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="n5" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/n5.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
            <div class="pro">
                <img src="img/products/n6.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="n6" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/n6.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
            <div class="pro">
                <img src="img/products/n7.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="n7" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/n7.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
            <div class="pro">
                <img src="img/products/f8.jpg" alt="">
                <div class="des">
                    <span>Adidas</span>
                    <h5>Cartoon Astronaut T-Shirts</h5>
                    <div class="star">

                    </div>
                    <h4>Rs.4000</h4>
                </div>
                <a href="#" class="add-to-cart" data-id="f8" data-name="Cartoon Astronaut T-Shirts" data-price="4000"
                    data-image="img/products/f8.jpg">
                    <i class="fa-solid fa-cart-shopping"></i>
                </a>

            </div>
        </div>

    </section> -->

    <section id="sm-banner" class="section-p1">
        <div class="banner-box">
            <h4>Crazy deals</h4>
            <h2>Buy 1 get 1 free</h2>
            <span>The best classic dress is on sale at EcomSphere</span>
            <button class="white">Learn More</button>
        </div>
        <div class="banner-box banner-box2">
            <h4>Spring/Summer</h4>
            <h2>Upcomming Season</h2>
            <span>The best classic dress is on sale at EcomSphere</span>
            <button class="white">Collection</button>
        </div>
    </section>

    <section id="banner3">
        <div class="banner-box">
            <h2>SEASONAL SALE</h2>
            <h3>Winter Collection -50% OFF</h3>
        </div>
        <div class="banner-box banner-box2">
            <h2>NEW FOOTWARE COLLECTION</h2>
            <h3>Spring / summer 2025</h3>
        </div>
        <div class="banner-box banner-box3">
            <h2>T-SHIRTS</h2>
            <h3>New Trendy Prints</h3>
        </div>
    </section>

    <section id="newsletter" class="section-p1 section-m1">
        <div class="newstext">
            <h4>Sign Up For Newsletter</h4>
            <p>Get E-mail updates about our latest shop and <span>special offer.</span></p>
        </div>
        <div class="form">
            <input type="text" placeholder="Your E-mail address">
            <button class="normal">Sign Up</button>
        </div>
    </section>

    <footer class="section-p1">
        <div class="col">
            <img class="logo" src="img/logo1.png" height="50" alt="">
            <h4>Contact</h4>
            <p><strong>Address:</strong>SSCCS</p>
            <p><strong>Phone:</strong>+91 8160730726,+91 6359401196</p>
            <p><strong>Hours:</strong>10:00 - 18:00,Mon - Sat</p>
            <div class="follow">
                <h4>Follow Us</h4>
                <div class="icon">
                    <!-- //icon for facebook,instagram -->
                    <i id="insta"><a href="#"><img src="img/facebook.svg" class="ins" height="20" alt=""></a></i>
                    <i id="insta"><a href="#"><img src="img/insta.svg" class="ins" height="20" alt=""></a></i>


                </div>
            </div>
        </div>
        <div class="col">
            <h4>About</h4>
            <a href="#">About us</a>
            <a href="#">Delivery Information</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
            <a href="#">Contact Us</a>
        </div>
        <div class="col">
            <h4>My Account</h4>
            <a href="#">Sign In</a>
            <a href="#">View Cart</a>
            <a href="#">My Wishlist</a>
            <a href="#">Track My Order</a>
            <a href="#">Help</a>
        </div>
        <div class="col install">
            <h4>Install App</h4>
            <p>From App Store or Google Play</p>
            <div class="row">
                <img src="img/pay/app.jpg" alt="">
                <img src="img/pay/play.jpg" alt="">
            </div>
            <p>Secure Payment Gateway</p>
            <img src="img/pay/pay.png" alt="">
        </div>
        <div class="copyright">
            <p>2025, EcomSphere</p>
        </div>
    </footer>

    <script src="script.js"></script>
    <!-- <script src="cart.js"></script> -->
</body>

</html>