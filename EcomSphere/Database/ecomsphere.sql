-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2025 at 08:28 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecomsphere`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password`) VALUES
(1, 'admin', 'admin@gmail.com', '$2y$10$rdYC6U8fpFwz3nGAB.tqxOWi.Ht.SbLj3OgiN3jVzm.XTK4tDiVDW');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(6, 0, 18, 1, 969.00, '2025-03-26 18:55:30'),
(7, 0, 14, 1, 5000.00, '2025-03-26 18:55:54');

-- --------------------------------------------------------

--
-- Table structure for table `checkout`
--

CREATE TABLE `checkout` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `checkout`
--

INSERT INTO `checkout` (`id`, `user_id`, `name`, `address`, `phone`, `created_at`) VALUES
(1, 1, 'Moradiya Harsh Bipibhai', 'Chitra gidc bhavnagar', '8160730726', '2025-04-06 05:29:13'),
(2, 1, 'harshpatel', 'shree swaminarayan vidhyalay gidc chitra, bhavnagar', '8347832249', '2025-04-06 05:33:31'),
(3, 1, 'harshpatel', 'shree swaminarayan vidhyalay gidc chitra, bhavnagar', '7878787878', '2025-04-06 05:34:03'),
(4, 1, 'harmit', 'ssccs', '8778877887', '2025-04-06 05:36:30'),
(5, 1, 'harsh', 'shree swaminarayan vidhyalay gidc chitra, bhavnagar', '8347832249', '2025-04-06 05:37:46'),
(6, 1, 'd', 'shree swaminarayan vidhyalay gidc chitra, bhavnagar', '8162454545', '2025-04-06 05:46:41'),
(7, 1, 'd', 'shree swaminarayan vidhyalay gidc chitra, bhavnagar', '8162454545', '2025-04-06 05:48:51'),
(8, 1, 'Moradiya Harsh B', 'Mansarovar Society ', '8160730726', '2025-04-06 05:49:31'),
(9, 1, 'jemeet', 'shree swaminarayan vidhyalay gidc chitra, bhavnagar', '81607322222', '2025-04-06 05:50:32'),
(10, 1, 'Harmit', 'GIDC', '8160752485', '2025-04-06 05:52:31');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` varchar(50) NOT NULL DEFAULT 'general'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `image`, `created_at`, `category`) VALUES
(26, 'Casual Denim Shirt', 'Casual Shirt', 5000.00, 'f5.jpg', '2025-03-30 19:42:02', 'Men Clothing'),
(27, 'Casual Denim Jacket', 'Multi Color Jacket', 4500.00, 'f6.jpg', '2025-03-30 19:42:51', 'Men Clothing'),
(28, 'Plain Cotton Shirt', 'Plain Black Shirt', 5500.00, 'n8.jpg', '2025-03-30 19:44:04', 'Men Clothing'),
(29, 'Floral Printed T-Shirt', 'Printed White Shirt', 4000.00, 'f4.jpg', '2025-03-30 19:45:04', 'Men Clothing'),
(30, 'Lightweight Windbreaker Shirt', 'Printed Lightweight Shirt', 3800.00, 'f1.jpg', '2025-03-30 19:45:45', 'Men Clothing'),
(31, 'Printed Cream Shirt', 'Cream shirt', 3500.00, 'f2.jpg', '2025-03-30 19:54:28', 'Men Clothing'),
(32, 'Printed Brown Shirt', 'Brown Shirt', 4000.00, 'f3.jpg', '2025-03-30 19:55:29', 'Men Clothing'),
(33, 'Simple Pocket Shirt', 'Light Brown Shirt', 2500.00, 'n7.jpg', '2025-03-30 19:57:03', 'Men Clothing'),
(34, 'Full Sleev Shirt', 'Cotton Shirt', 1500.00, 'n5.jpg', '2025-03-30 19:59:54', 'Men Clothing'),
(35, 'Fancy Pattern Shirt', 'Lightweight Shirt', 2700.00, 'n4.jpg', '2025-03-30 20:00:40', 'Men Clothing'),
(36, 'White Fullsleev Shirt', 'Soft Material Shirt', 2700.00, 'n3.jpg', '2025-03-30 20:01:58', 'Men Clothing'),
(37, 'Fullsleev Shirt', 'Soft Material Shirt', 2700.00, 'n2.jpg', '2025-03-30 20:03:03', 'Men Clothing'),
(38, 'V-Neck Top', 'Cat Printed V-neck', 1500.00, 'f8.jpg', '2025-03-31 07:01:15', 'Women Clothing'),
(39, 'Goggles', 'Sun Glass', 1500.00, 'g1.jpg', '2025-03-31 07:05:04', 'Glasses'),
(40, 'Nike', 'Sports', 2500.00, 's6.jpg', '2025-04-05 05:52:22', 'Footwear');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `reset_token`, `token_expiry`) VALUES
(1, 'moradiya', 'harshmoradiya@gmail.com', '$2y$10$LWgvTyD51tAjRDYg5JW/EucjLkWJEAcwM5UBjsVQVO0pXq9n2ci9e', '2025-03-15 15:48:24', 'febdac99e3ec51b40c535b9fb2ad314b7f3271f63904d854c9bb442d29dceb00db12c0c9fd08de2698740454860cdef1d2ed', NULL),
(5, 'harshmoradiya', 'harshmoradiya84@gmail.com', '$2y$10$gfZ49D8tjqaoNUiSsU8jnuhaSfHccD7q6srC/EtLD8KUxzirjGwN6', '2025-03-15 15:58:02', 'f5ee1bde09d85ad7ab8a5eb61603c69ac9d46148ba210c56e609fc1d17529343c2af402939ba7e1a3404da57534fffabede1', NULL),
(6, 'patel', 'patel@gmail.com', '$2y$10$j8Atyk47Grrfn0oViFXYa.JIM90px3K63auPcK2lJ0PWlVkvO2OYG', '2025-03-15 16:09:17', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `checkout`
--
ALTER TABLE `checkout`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `checkout`
--
ALTER TABLE `checkout`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
