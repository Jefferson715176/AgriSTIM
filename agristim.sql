-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2026 at 04:40 PM
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
-- Database: `agristim`
--

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL,
  `type` enum('temp','offline','low_stock','expiry') DEFAULT NULL,
  `ref_id` int(11) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `status` enum('open','ack','resolved') DEFAULT 'open',
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`id`, `type`, `ref_id`, `message`, `status`, `remarks`, `created_at`) VALUES
(1, 'offline', 1, 'No data from Medicine Refrigerator for 10+ minutes', 'open', NULL, '2026-10-25 19:44:55'),
(2, 'offline', 2, 'No data from Antibiotics Cabinet for 10+ minutes', 'open', NULL, '2026-10-25 19:44:55'),
(3, 'low_stock', 1, 'Low stock: Chicken Feeds', 'open', NULL, '2026-10-26 17:33:12'),
(4, 'low_stock', 2, 'Low stock: Hog Feeds', 'open', NULL, '2026-10-26 17:33:12'),
(5, 'low_stock', 3, 'Low stock: Layer Feeds', 'open', NULL, '2026-10-26 17:33:12'),
(6, 'low_stock', 4, 'Low stock: Broiler Feeds', 'open', NULL, '2026-10-26 17:33:12'),
(7, 'low_stock', 5, 'Low stock: Rice Bran', 'open', NULL, '2026-10-26 17:33:12'),
(8, 'low_stock', 6, 'Low stock: Veterinary Vitamins', 'open', NULL, '2026-10-26 17:33:12'),
(9, 'low_stock', 7, 'Low stock: Animal Antibiotics', 'resolved', 'Stock replenished', '2026-10-26 17:33:12'),
(10, 'low_stock', 8, 'Low stock: Poultry Supplements', 'open', NULL, '2026-10-26 17:33:12'),
(11, 'low_stock', 9, 'Low stock: Feeding Trough', 'open', NULL, '2026-10-26 17:33:12'),
(12, 'low_stock', 10, 'Low stock: Water Drinker', 'open', NULL, '2026-10-26 17:33:12'),
(13, 'expiry', 1, 'Animal Antibiotics expires 2026-10-01', 'open', NULL, '2026-10-26 17:35:31');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `user_id`, `action`, `created_at`) VALUES
(1, 22, 'login', '2026-10-25 19:44:55'),
(2, 23, 'login', '2026-10-25 19:46:17'),
(3, 22, 'login', '2026-10-25 19:46:44'),
(4, 23, 'login', '2026-10-25 19:47:45'),
(5, 22, 'login', '2026-10-25 19:57:29'),
(6, 22, 'login', '2026-10-25 19:58:57'),
(7, 23, 'login', '2026-10-25 19:59:33'),
(8, 22, 'login', '2026-10-25 20:00:24'),
(9, 22, 'login', '2026-10-26 17:22:38'),
(10, 22, 'stock-in product 7 batch 1 qty 20', '2026-10-26 17:35:04'),
(11, 22, 'stock-in product 4 batch 1 qty 1', '2026-10-26 17:40:07'),
(12, 22, 'stock-out Broiler Feeds batch 1 qty 1 (expired)', '2026-10-26 17:40:19'),
(13, 23, 'login', '2026-10-26 17:41:01'),
(14, 22, 'login', '2026-10-26 17:42:00'),
(15, 22, 'login', '2026-10-28 18:07:15'),
(16, 23, 'login', '2026-10-28 18:07:33'),
(17, 22, 'login', '2026-10-28 18:26:57'),
(18, 23, 'login', '2026-10-28 18:28:18'),
(19, 22, 'login', '2026-10-28 18:31:34'),
(20, 22, 'login', '2026-10-28 18:36:45'),
(21, 22, 'login', '2026-10-28 18:44:08'),
(22, 22, 'login', '2026-10-28 18:53:12'),
(23, 22, 'login', '2026-10-28 18:58:42'),
(24, 22, 'logout', '2026-10-28 19:02:22'),
(25, 23, 'login', '2026-10-28 19:02:32'),
(26, 23, 'logout', '2026-10-28 19:02:41'),
(27, 22, 'login', '2026-10-28 19:02:50'),
(28, 22, 'logout', '2026-10-28 19:03:06'),
(29, 23, 'login', '2026-10-28 19:03:16'),
(30, 22, 'login', '2026-11-11 21:11:55'),
(31, 22, 'logout', '2026-11-11 21:13:27'),
(32, 23, 'login', '2026-11-11 21:13:36'),
(33, 23, 'logout', '2026-11-11 21:22:16'),
(34, 22, 'login', '2026-11-11 21:22:35'),
(35, 22, 'logout', '2026-11-11 21:23:40'),
(36, 22, 'login', '2026-11-11 21:23:58'),
(37, 22, 'login', '2026-11-12 10:11:42'),
(38, 22, 'login', '2026-11-12 11:28:22'),
(39, 22, 'login', '2026-11-18 22:27:24'),
(40, 22, 'login', '2026-11-18 22:30:06'),
(41, 22, 'logout', '2026-11-18 23:20:42'),
(42, 23, 'login', '2026-11-18 23:20:54'),
(43, 23, 'logout', '2026-11-18 23:21:21'),
(44, 22, 'login', '2026-11-18 23:21:33'),
(45, 23, 'login', '2026-11-18 23:22:59');

-- --------------------------------------------------------

--
-- Table structure for table `batches`
--

CREATE TABLE `batches` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `batch_no` varchar(40) DEFAULT NULL,
  `supplier` varchar(100) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `qty_received` int(11) DEFAULT NULL,
  `qty_remaining` int(11) DEFAULT NULL,
  `expiry` date DEFAULT NULL,
  `received_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `batches`
--

INSERT INTO `batches` (`id`, `product_id`, `batch_no`, `supplier`, `unit_id`, `qty_received`, `qty_remaining`, `expiry`, `received_at`) VALUES
(1, 7, '1', 'James', NULL, 20, 20, '2026-10-01', '2026-10-26 17:35:04'),
(2, 4, '1', 'James', NULL, 1, 0, '2026-10-04', '2026-10-26 17:40:07');

-- --------------------------------------------------------

--
-- Table structure for table `bulk_orders`
--

CREATE TABLE `bulk_orders` (
  `order_id` int(11) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `contact_number` varchar(30) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `pickup_date` date DEFAULT NULL,
  `pickup_time` time DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `order_status` enum('Pending','Confirmed','Preparing','Ready for Pickup','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `payment_status` enum('Unpaid','Partially Paid','Paid') NOT NULL DEFAULT 'Unpaid',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(3, 'Antibiotics'),
(5, 'Equipment'),
(1, 'Feeds'),
(2, 'Medicines'),
(7, 'Supplements'),
(6, 'Supplies'),
(4, 'Vitamins');

-- --------------------------------------------------------

--
-- Table structure for table `losses`
--

CREATE TABLE `losses` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `reason` enum('expired','damaged','spoiled') DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `losses`
--

INSERT INTO `losses` (`id`, `product_id`, `qty`, `reason`, `amount`, `created_at`) VALUES
(1, 4, 1, 'expired', 1100.00, '2026-10-26 17:40:19');

-- --------------------------------------------------------

--
-- Table structure for table `price_list`
--

CREATE TABLE `price_list` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `brand` varchar(50) DEFAULT NULL,
  `product_name` varchar(100) NOT NULL,
  `variant` varchar(50) DEFAULT NULL,
  `price_per_kilo` decimal(10,2) DEFAULT NULL,
  `price_per_sack` decimal(10,2) DEFAULT NULL,
  `price_half_sack` decimal(10,2) DEFAULT NULL,
  `price_per_piece` decimal(10,2) DEFAULT NULL,
  `price_tie_by_10s` decimal(10,2) DEFAULT NULL,
  `needs_review` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `price_list`
--

INSERT INTO `price_list` (`id`, `category`, `brand`, `product_name`, `variant`, `price_per_kilo`, `price_per_sack`, `price_half_sack`, `price_per_piece`, `price_tie_by_10s`, `needs_review`) VALUES
(1, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Pre-starter', 78.00, 1850.00, 950.00, NULL, NULL, 1),
(2, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Starter', 48.00, 2270.00, 1145.00, NULL, NULL, 0),
(3, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Grower', 41.00, 2075.00, 1050.00, NULL, NULL, 0),
(4, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Gestating', 41.00, 1885.00, 960.00, NULL, NULL, 0),
(5, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Lactating', 43.00, 2000.00, 1030.00, NULL, NULL, 1),
(6, 'Hog Feeds', 'BMEG', 'Super Birik', '', 95.00, NULL, NULL, NULL, NULL, 0),
(7, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Pre-starter', 44.00, 2040.00, 1050.00, NULL, NULL, 1),
(8, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Starter', 39.00, 1810.00, 940.00, NULL, NULL, 1),
(9, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Grower', 41.00, 1970.00, 990.00, NULL, NULL, 0),
(10, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Gestating', 37.00, 1695.00, 880.00, NULL, NULL, 0),
(11, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Lactating', 40.00, 1850.00, 960.00, NULL, NULL, 1),
(12, 'Hog Feeds', 'BMEG', 'Super Pink', '', 95.00, NULL, NULL, NULL, NULL, 0),
(13, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Pre-starter (Superstart)', 70.00, 1525.00, 790.00, NULL, NULL, 0),
(14, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Starter', 48.00, 2175.00, 1120.00, NULL, NULL, 0),
(15, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Grower', 46.00, 2110.00, 1085.00, NULL, NULL, 0),
(16, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Gestating', 49.00, 1975.00, 1070.00, NULL, NULL, 0),
(17, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Lactating', 46.00, 2110.00, 1085.00, NULL, NULL, 0),
(18, 'Hog Feeds', 'Pigrolac', 'Early Weaning Ration', '', 120.00, NULL, NULL, NULL, NULL, 0),
(19, 'Hog Feeds', 'Vital Feeds', 'Finisher', '', 42.00, 1920.00, 990.00, NULL, NULL, 0),
(20, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Starter', 46.00, 2075.00, 1070.00, NULL, NULL, 0),
(21, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Grower', 44.00, 1990.00, 1025.00, NULL, NULL, 0),
(22, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Gestating', 41.00, 1850.00, 955.00, NULL, NULL, 0),
(23, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Lactating', 45.00, 2055.00, 1060.00, NULL, NULL, 0),
(24, 'Hog Feeds', 'Vital Feeds', 'Layer 2', '', 40.00, 1720.00, 890.00, NULL, NULL, 0),
(25, 'Hog Feeds', 'Pilmico', 'Layer', '', NULL, 2040.00, 1060.00, NULL, NULL, 0),
(26, 'Hog Feeds', 'Pilmico', 'Premium Feeds', 'Grower', 41.00, 1980.00, 1025.00, NULL, NULL, 0),
(27, 'Hog Feeds', 'Pilmico', 'Premium Feeds', 'Gestating', 40.00, 1870.00, 965.00, NULL, NULL, 0),
(28, 'Hog Feeds', 'Pilmico', 'Premium Feeds', 'Lactating', 41.00, 1890.00, 985.00, NULL, NULL, 0),
(29, 'Gamefowl Feeds', 'Vast', 'Premium Feeds', 'Pre-starter', 38.00, 890.00, NULL, NULL, NULL, 1),
(30, 'Gamefowl Feeds', 'Vast', 'Slasher', 'Starter', 46.00, 960.00, NULL, NULL, NULL, 1),
(31, 'Gamefowl Feeds', 'Vast', 'Energize', 'Grower', 47.00, 950.00, NULL, NULL, NULL, 1),
(32, 'Gamefowl Feeds', 'Vast', 'Detoxymix', 'Gestating', 40.00, 840.00, NULL, NULL, NULL, 1),
(33, 'Gamefowl Feeds', 'Vast', 'Oracle Corn', 'Lactating', 46.00, 940.00, NULL, NULL, NULL, 1),
(34, 'Gamefowl Feeds', 'Vast', 'Fireblaze 1000', '', 46.00, 2080.00, 1100.00, NULL, NULL, 1),
(35, 'Gamefowl Feeds', 'Vast', 'Fireblaze 1200', '', 42.00, 1860.00, 970.00, NULL, NULL, 1),
(36, 'Gamefowl Feeds', 'Vast', 'CGC Crumbles', '', 40.00, NULL, NULL, NULL, NULL, 1),
(37, 'Gamefowl Feeds', 'Vast', 'Bump Up', '', 40.00, 1740.00, 990.00, NULL, NULL, 1),
(38, 'Gamefowl Feeds', 'Vast', 'BFC', '', 40.00, 1770.00, 990.00, NULL, NULL, 1),
(39, 'Gamefowl Feeds', 'Vast', 'Galimax', '', 45.00, 2050.00, 1050.00, NULL, NULL, 1),
(40, 'Gamefowl Feeds', 'Vast', 'Galimax 21', '', 46.00, 2105.00, 1080.00, NULL, NULL, 1),
(41, 'Gamefowl Feeds', 'Gamefowl', 'Booster Grower', '', 54.00, NULL, NULL, NULL, NULL, 1),
(42, 'Gamefowl Feeds', 'Gamefowl', 'Stag Yellow', '', 57.00, NULL, NULL, NULL, NULL, 1),
(43, 'Gamefowl Feeds', 'Gamefowl', 'Stag Green', '', 52.00, NULL, NULL, NULL, NULL, 1),
(44, 'Gamefowl Feeds', 'Gamefowl', 'Conditioner', '', 62.00, NULL, NULL, NULL, NULL, 1),
(45, 'Gamefowl Feeds', 'Gamefowl', 'Wealth German', '', 120.00, NULL, NULL, NULL, NULL, 1),
(46, 'Gamefowl Feeds', 'Thunderbird', 'Booster Blue', '', 56.00, 1260.00, NULL, NULL, NULL, 1),
(47, 'Gamefowl Feeds', 'Thunderbird', 'Stag 1+', '', 55.00, 1230.00, NULL, NULL, NULL, 1),
(48, 'Gamefowl Feeds', 'Thunderbird', 'Stag 4+', '', 51.00, 1130.00, NULL, NULL, NULL, 1),
(49, 'Gamefowl Feeds', 'Thunderbird', 'Energize', '', 49.00, 1085.00, NULL, NULL, NULL, 1),
(50, 'Gamefowl Feeds', 'Thunderbird', 'Platinum', '', 67.00, NULL, NULL, NULL, NULL, 1),
(51, 'Gamefowl Feeds', 'Sagupatan', 'Booster', '', 56.00, NULL, NULL, NULL, NULL, 1),
(52, 'Gamefowl Feeds', 'Sagupatan', 'Stag 1+', '', 55.00, NULL, NULL, NULL, NULL, 1),
(53, 'Gamefowl Feeds', 'Sagupatan', 'Stag 4+', '', 51.00, NULL, NULL, NULL, NULL, 1),
(54, 'Gamefowl Feeds', 'Sagupatan', 'High Action', '', 59.00, NULL, NULL, NULL, NULL, 1),
(55, 'Gamefowl Feeds', 'Sagupatan', 'Winning Line', '', 66.00, NULL, NULL, NULL, NULL, 1),
(56, 'Gamefowl Feeds', 'Sagupatan', 'Ready to Fight', '', 59.00, NULL, NULL, NULL, NULL, 1),
(57, 'Dog Food', 'Nutrichunk', 'Nutrichunk', 'Adult', 118.00, 2220.00, NULL, NULL, NULL, 1),
(58, 'Dog Food', 'Nutrichunk', 'Nutrichunk', 'Puppy', 155.00, 2840.00, NULL, NULL, NULL, 1),
(59, 'Dog Food', 'Yum Yum', 'Yum Yum', 'Adult', 100.00, 1650.00, NULL, NULL, NULL, 1),
(60, 'Dog Food', 'Yum Yum', 'Yum Yum', 'Puppy', 110.00, 1820.00, NULL, NULL, NULL, 1),
(61, 'Medicines', NULL, 'Vetracin Gold Powder', NULL, NULL, NULL, NULL, 25.00, 24.00, 1),
(62, 'Medicines', NULL, 'Vetracin Plus', NULL, NULL, NULL, NULL, 19.00, 18.00, 1),
(63, 'Medicines', NULL, 'Vetracin Classic', NULL, NULL, NULL, NULL, 14.00, 12.00, 1),
(64, 'Medicines', NULL, 'Ambroxitil', NULL, NULL, NULL, NULL, 28.00, 26.00, 1),
(65, 'Medicines', NULL, 'Bredner Xde', NULL, NULL, NULL, NULL, 18.00, 16.00, 1),
(66, 'Medicines', NULL, 'L-Spec', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(67, 'Medicines', NULL, 'Bactonero', NULL, NULL, NULL, NULL, 15.00, 14.00, 1),
(68, 'Medicines', NULL, 'Premoxyl Powder', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(69, 'Medicines', NULL, 'Sulfar Powder', NULL, NULL, NULL, NULL, 26.00, 24.00, 1),
(70, 'Medicines', NULL, 'Sulfate Capsule', NULL, NULL, NULL, NULL, 18.00, 17.00, 1),
(71, 'Medicines', NULL, 'Amoxitil Forte', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(72, 'Medicines', NULL, 'Vitamin Pro Powder', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(73, 'Medicines', NULL, 'Egg 1000 Powder', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(74, 'Medicines', NULL, 'Egg 1000 Capsule', NULL, NULL, NULL, NULL, 68.00, 60.00, 1),
(75, 'Medicines', NULL, 'Vitamin Pro Capsule', NULL, NULL, NULL, NULL, 690.00, 650.00, 1),
(76, 'Medicines', NULL, 'Progenzy', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(77, 'Medicines', NULL, 'Vitamin Ultravita', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(78, 'Medicines', NULL, 'Power Trumon', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(79, 'Medicines', NULL, 'Penictin', NULL, NULL, NULL, NULL, 15.00, 13.00, 1),
(80, 'Medicines', NULL, 'Agmicten 5 gram', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(81, 'Medicines', NULL, 'Agmicten 2 gram', NULL, NULL, NULL, NULL, 20.00, 16.00, 1),
(82, 'Medicines', NULL, 'Mide Prem', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(83, 'Medicines', NULL, 'Triple XXX', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(84, 'Medicines', NULL, 'Niukon', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(85, 'Medicines', NULL, 'Wash Out', NULL, NULL, NULL, NULL, 17.00, 15.00, 1),
(86, 'Medicines', NULL, 'Zeromite', NULL, NULL, NULL, NULL, 17.00, 15.00, 1),
(87, 'Medicines', NULL, 'Latilo SP', NULL, NULL, NULL, NULL, 12.00, 10.00, 1),
(88, 'Medicines', NULL, 'Bulatiluk SP', NULL, NULL, NULL, NULL, 12.00, 10.00, 1),
(89, 'Medicines', NULL, 'Bulatiluk Anty', NULL, NULL, NULL, NULL, 27.00, 21.00, 1),
(90, 'Medicines', NULL, 'Apralyte', NULL, NULL, NULL, NULL, 26.00, 21.00, 1),
(91, 'Medicines', NULL, 'Amoxily', NULL, NULL, NULL, NULL, 26.00, 21.00, 1),
(92, 'Medicines', NULL, 'Maxidel SE', NULL, NULL, NULL, NULL, 25.00, 23.00, 1),
(93, 'Medicines', NULL, 'Responax', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(94, 'Medicines', NULL, 'Tepox 48', NULL, NULL, NULL, NULL, 26.00, 24.00, 1),
(95, 'Medicines', NULL, 'Selectrogen', NULL, NULL, NULL, NULL, 27.00, 21.00, 1),
(96, 'Medicines', NULL, 'Digestaide', NULL, NULL, NULL, NULL, 18.00, 16.00, 1),
(97, 'Medicines', NULL, 'Electrogen DT', NULL, NULL, NULL, NULL, 23.00, 21.00, 1),
(98, 'Medicines', NULL, 'Setpro', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(99, 'Medicines', NULL, 'Amty', NULL, NULL, NULL, NULL, 17.00, 15.00, 1),
(100, 'Medicines', NULL, 'Voltplex', NULL, NULL, NULL, NULL, 14.00, 12.00, 1),
(101, 'Medicines', NULL, 'Calyex', NULL, NULL, NULL, NULL, 7.00, 6.00, 1),
(102, 'Medicines', NULL, 'B12', NULL, NULL, NULL, NULL, 7.00, 6.00, 1),
(103, 'Medicines', NULL, 'Adtil', NULL, NULL, NULL, NULL, 10.00, 8.00, 1),
(104, 'Medicines', NULL, 'B50', NULL, NULL, NULL, NULL, 9.00, 7.00, 1),
(105, 'Medicines', NULL, 'Promotor', NULL, NULL, NULL, NULL, 14.00, 12.00, 1),
(106, 'Medicines', NULL, 'Vitamin Pro 357', NULL, NULL, NULL, NULL, 8.00, 7.00, 1),
(107, 'Medicines', NULL, 'Bee Pollen', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(108, 'Medicines', NULL, 'Hamliten', NULL, NULL, NULL, NULL, 9.00, 7.00, 1),
(109, 'Medicines', NULL, 'Oxylyte', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(110, 'Medicines', NULL, 'Podgel Forty', NULL, NULL, NULL, NULL, 25.00, 22.00, 1),
(111, 'Medicines', NULL, 'Eltoro', NULL, NULL, NULL, NULL, 14.00, 13.00, 1),
(112, 'Medicines', NULL, 'Bactonero Capsule', NULL, NULL, NULL, NULL, 9.00, 8.00, 1),
(113, 'Medicines', NULL, 'Triscular', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(114, 'Medicines', NULL, 'Vetracin Capsule', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(115, 'Medicines', NULL, 'Dinimolar', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(116, 'Medicines', NULL, 'Amoxicillin', NULL, NULL, NULL, NULL, 7.00, 6.00, 1),
(117, 'Medicines', NULL, 'Ketamine', '', NULL, NULL, NULL, NULL, NULL, 1),
(118, 'Medicines', NULL, 'L-Spec Inject', '1 udd syringe', NULL, NULL, NULL, 24.00, NULL, 1),
(119, 'Medicines', NULL, 'L-Spoc', '10 ml', NULL, NULL, NULL, 220.00, NULL, 1),
(120, 'Medicines', NULL, 'Rulosar', '', NULL, NULL, NULL, 200.00, NULL, 1),
(121, 'Medicines', NULL, 'Betamox', '', NULL, NULL, NULL, 790.00, NULL, 1),
(122, 'Medicines', NULL, 'Bexan', '10 ml', NULL, NULL, NULL, 220.00, NULL, 1),
(123, 'Medicines', NULL, 'Bexan', '1 udd syringe', NULL, NULL, NULL, 28.00, NULL, 1),
(124, 'Medicines', NULL, 'Belomyl', '1 udd syringe', NULL, NULL, NULL, 28.00, NULL, 1),
(125, 'Medicines', NULL, 'Hapin', '', NULL, NULL, NULL, 16.00, NULL, 1),
(126, 'Medicines', NULL, 'Gahip', '', NULL, NULL, NULL, 10.00, NULL, 1),
(127, 'Medicines', NULL, 'Byna', '', NULL, NULL, NULL, 95.00, NULL, 1),
(128, 'Medicines', NULL, 'Iset Gamip Amet', '', NULL, NULL, NULL, 60.00, NULL, 1),
(129, 'Medicines', NULL, 'Ugayaw Tari', '6 pcs', NULL, NULL, NULL, 40.00, NULL, 1),
(130, 'Medicines', NULL, 'Ugayaw Tari', '12 pcs', NULL, NULL, NULL, 60.00, NULL, 1),
(131, 'Medicines', NULL, 'Dextrose', 'Small', NULL, NULL, NULL, 55.00, NULL, 1),
(132, 'Medicines', NULL, 'Dextrose', 'Big', NULL, NULL, NULL, 95.00, NULL, 1),
(133, 'Medicines', NULL, 'Glomel Ordinary', '', NULL, NULL, NULL, 60.00, NULL, 1),
(134, 'Medicines', NULL, 'Glomel Special', '', NULL, NULL, NULL, 100.00, NULL, 1),
(135, 'Medicines', NULL, 'Red Cell', 'Small', NULL, NULL, NULL, 110.00, NULL, 1),
(136, 'Medicines', NULL, 'Red Cell', 'Big', NULL, NULL, NULL, 195.00, NULL, 1),
(137, 'Medicines', NULL, 'Multivitamins', '', NULL, NULL, NULL, 60.00, NULL, 1),
(138, 'Medicines', NULL, 'Calcium Lactate', '', NULL, NULL, NULL, 60.00, NULL, 1),
(139, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Pre-starter', 78.00, 1850.00, 950.00, NULL, NULL, 1),
(140, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Starter', 48.00, 2270.00, 1145.00, NULL, NULL, 0),
(141, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Grower', 41.00, 2075.00, 1050.00, NULL, NULL, 0),
(142, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Gestating', 41.00, 1885.00, 960.00, NULL, NULL, 0),
(143, 'Hog Feeds', 'BMEG', 'Premium Feeds', 'Lactating', 43.00, 2000.00, 1030.00, NULL, NULL, 1),
(144, 'Hog Feeds', 'BMEG', 'Super Birik', '', 95.00, NULL, NULL, NULL, NULL, 0),
(145, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Pre-starter', 44.00, 2040.00, 1050.00, NULL, NULL, 1),
(146, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Starter', 39.00, 1810.00, 940.00, NULL, NULL, 1),
(147, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Grower', 41.00, 1970.00, 990.00, NULL, NULL, 0),
(148, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Gestating', 37.00, 1695.00, 880.00, NULL, NULL, 0),
(149, 'Hog Feeds', 'BMEG', 'Expert Feeds', 'Lactating', 40.00, 1850.00, 960.00, NULL, NULL, 1),
(150, 'Hog Feeds', 'BMEG', 'Super Pink', '', 95.00, NULL, NULL, NULL, NULL, 0),
(151, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Pre-starter (Superstart)', 70.00, 1525.00, 790.00, NULL, NULL, 0),
(152, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Starter', 48.00, 2175.00, 1120.00, NULL, NULL, 0),
(153, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Grower', 46.00, 2110.00, 1085.00, NULL, NULL, 0),
(154, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Gestating', 49.00, 1975.00, 1070.00, NULL, NULL, 0),
(155, 'Hog Feeds', 'Pigrolac', 'Premium Feeds', 'Lactating', 46.00, 2110.00, 1085.00, NULL, NULL, 0),
(156, 'Hog Feeds', 'Pigrolac', 'Early Weaning Ration', '', 120.00, NULL, NULL, NULL, NULL, 0),
(157, 'Hog Feeds', 'Vital Feeds', 'Finisher', '', 42.00, 1920.00, 990.00, NULL, NULL, 0),
(158, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Starter', 46.00, 2075.00, 1070.00, NULL, NULL, 0),
(159, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Grower', 44.00, 1990.00, 1025.00, NULL, NULL, 0),
(160, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Gestating', 41.00, 1850.00, 955.00, NULL, NULL, 0),
(161, 'Hog Feeds', 'Vital Feeds', 'Premium Feeds', 'Lactating', 45.00, 2055.00, 1060.00, NULL, NULL, 0),
(162, 'Hog Feeds', 'Vital Feeds', 'Layer 2', '', 40.00, 1720.00, 890.00, NULL, NULL, 0),
(163, 'Hog Feeds', 'Pilmico', 'Layer', '', NULL, 2040.00, 1060.00, NULL, NULL, 0),
(164, 'Hog Feeds', 'Pilmico', 'Premium Feeds', 'Grower', 41.00, 1980.00, 1025.00, NULL, NULL, 0),
(165, 'Hog Feeds', 'Pilmico', 'Premium Feeds', 'Gestating', 40.00, 1870.00, 965.00, NULL, NULL, 0),
(166, 'Hog Feeds', 'Pilmico', 'Premium Feeds', 'Lactating', 41.00, 1890.00, 985.00, NULL, NULL, 0),
(167, 'Gamefowl Feeds', 'Vast', 'Premium Feeds', 'Pre-starter', 38.00, 890.00, NULL, NULL, NULL, 1),
(168, 'Gamefowl Feeds', 'Vast', 'Slasher', 'Starter', 46.00, 960.00, NULL, NULL, NULL, 1),
(169, 'Gamefowl Feeds', 'Vast', 'Energize', 'Grower', 47.00, 950.00, NULL, NULL, NULL, 1),
(170, 'Gamefowl Feeds', 'Vast', 'Detoxymix', 'Gestating', 40.00, 840.00, NULL, NULL, NULL, 1),
(171, 'Gamefowl Feeds', 'Vast', 'Oracle Corn', 'Lactating', 46.00, 940.00, NULL, NULL, NULL, 1),
(172, 'Gamefowl Feeds', 'Vast', 'Fireblaze 1000', '', 46.00, 2080.00, 1100.00, NULL, NULL, 1),
(173, 'Gamefowl Feeds', 'Vast', 'Fireblaze 1200', '', 42.00, 1860.00, 970.00, NULL, NULL, 1),
(174, 'Gamefowl Feeds', 'Vast', 'CGC Crumbles', '', 40.00, NULL, NULL, NULL, NULL, 1),
(175, 'Gamefowl Feeds', 'Vast', 'Bump Up', '', 40.00, 1740.00, 990.00, NULL, NULL, 1),
(176, 'Gamefowl Feeds', 'Vast', 'BFC', '', 40.00, 1770.00, 990.00, NULL, NULL, 1),
(177, 'Gamefowl Feeds', 'Vast', 'Galimax', '', 45.00, 2050.00, 1050.00, NULL, NULL, 1),
(178, 'Gamefowl Feeds', 'Vast', 'Galimax 21', '', 46.00, 2105.00, 1080.00, NULL, NULL, 1),
(179, 'Gamefowl Feeds', 'Gamefowl', 'Booster Grower', '', 54.00, NULL, NULL, NULL, NULL, 1),
(180, 'Gamefowl Feeds', 'Gamefowl', 'Stag Yellow', '', 57.00, NULL, NULL, NULL, NULL, 1),
(181, 'Gamefowl Feeds', 'Gamefowl', 'Stag Green', '', 52.00, NULL, NULL, NULL, NULL, 1),
(182, 'Gamefowl Feeds', 'Gamefowl', 'Conditioner', '', 62.00, NULL, NULL, NULL, NULL, 1),
(183, 'Gamefowl Feeds', 'Gamefowl', 'Wealth German', '', 120.00, NULL, NULL, NULL, NULL, 1),
(184, 'Gamefowl Feeds', 'Thunderbird', 'Booster Blue', '', 56.00, 1260.00, NULL, NULL, NULL, 1),
(185, 'Gamefowl Feeds', 'Thunderbird', 'Stag 1+', '', 55.00, 1230.00, NULL, NULL, NULL, 1),
(186, 'Gamefowl Feeds', 'Thunderbird', 'Stag 4+', '', 51.00, 1130.00, NULL, NULL, NULL, 1),
(187, 'Gamefowl Feeds', 'Thunderbird', 'Energize', '', 49.00, 1085.00, NULL, NULL, NULL, 1),
(188, 'Gamefowl Feeds', 'Thunderbird', 'Platinum', '', 67.00, NULL, NULL, NULL, NULL, 1),
(189, 'Gamefowl Feeds', 'Sagupatan', 'Booster', '', 56.00, NULL, NULL, NULL, NULL, 1),
(190, 'Gamefowl Feeds', 'Sagupatan', 'Stag 1+', '', 55.00, NULL, NULL, NULL, NULL, 1),
(191, 'Gamefowl Feeds', 'Sagupatan', 'Stag 4+', '', 51.00, NULL, NULL, NULL, NULL, 1),
(192, 'Gamefowl Feeds', 'Sagupatan', 'High Action', '', 59.00, NULL, NULL, NULL, NULL, 1),
(193, 'Gamefowl Feeds', 'Sagupatan', 'Winning Line', '', 66.00, NULL, NULL, NULL, NULL, 1),
(194, 'Gamefowl Feeds', 'Sagupatan', 'Ready to Fight', '', 59.00, NULL, NULL, NULL, NULL, 1),
(195, 'Dog Food', 'Nutrichunk', 'Nutrichunk', 'Adult', 118.00, 2220.00, NULL, NULL, NULL, 1),
(196, 'Dog Food', 'Nutrichunk', 'Nutrichunk', 'Puppy', 155.00, 2840.00, NULL, NULL, NULL, 1),
(197, 'Dog Food', 'Yum Yum', 'Yum Yum', 'Adult', 100.00, 1650.00, NULL, NULL, NULL, 1),
(198, 'Dog Food', 'Yum Yum', 'Yum Yum', 'Puppy', 110.00, 1820.00, NULL, NULL, NULL, 1),
(199, 'Medicines', NULL, 'Vetracin Gold Powder', NULL, NULL, NULL, NULL, 25.00, 24.00, 1),
(200, 'Medicines', NULL, 'Vetracin Plus', NULL, NULL, NULL, NULL, 19.00, 18.00, 1),
(201, 'Medicines', NULL, 'Vetracin Classic', NULL, NULL, NULL, NULL, 14.00, 12.00, 1),
(202, 'Medicines', NULL, 'Ambroxitil', NULL, NULL, NULL, NULL, 28.00, 26.00, 1),
(203, 'Medicines', NULL, 'Bredner Xde', NULL, NULL, NULL, NULL, 18.00, 16.00, 1),
(204, 'Medicines', NULL, 'L-Spec', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(205, 'Medicines', NULL, 'Bactonero', NULL, NULL, NULL, NULL, 15.00, 14.00, 1),
(206, 'Medicines', NULL, 'Premoxyl Powder', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(207, 'Medicines', NULL, 'Sulfar Powder', NULL, NULL, NULL, NULL, 26.00, 24.00, 1),
(208, 'Medicines', NULL, 'Sulfate Capsule', NULL, NULL, NULL, NULL, 18.00, 17.00, 1),
(209, 'Medicines', NULL, 'Amoxitil Forte', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(210, 'Medicines', NULL, 'Vitamin Pro Powder', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(211, 'Medicines', NULL, 'Egg 1000 Powder', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(212, 'Medicines', NULL, 'Egg 1000 Capsule', NULL, NULL, NULL, NULL, 68.00, 60.00, 1),
(213, 'Medicines', NULL, 'Vitamin Pro Capsule', NULL, NULL, NULL, NULL, 690.00, 650.00, 1),
(214, 'Medicines', NULL, 'Progenzy', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(215, 'Medicines', NULL, 'Vitamin Ultravita', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(216, 'Medicines', NULL, 'Power Trumon', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(217, 'Medicines', NULL, 'Penictin', NULL, NULL, NULL, NULL, 15.00, 13.00, 1),
(218, 'Medicines', NULL, 'Agmicten 5 gram', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(219, 'Medicines', NULL, 'Agmicten 2 gram', NULL, NULL, NULL, NULL, 20.00, 16.00, 1),
(220, 'Medicines', NULL, 'Mide Prem', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(221, 'Medicines', NULL, 'Triple XXX', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(222, 'Medicines', NULL, 'Niukon', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(223, 'Medicines', NULL, 'Wash Out', NULL, NULL, NULL, NULL, 17.00, 15.00, 1),
(224, 'Medicines', NULL, 'Zeromite', NULL, NULL, NULL, NULL, 17.00, 15.00, 1),
(225, 'Medicines', NULL, 'Latilo SP', NULL, NULL, NULL, NULL, 12.00, 10.00, 1),
(226, 'Medicines', NULL, 'Bulatiluk SP', NULL, NULL, NULL, NULL, 12.00, 10.00, 1),
(227, 'Medicines', NULL, 'Bulatiluk Anty', NULL, NULL, NULL, NULL, 27.00, 21.00, 1),
(228, 'Medicines', NULL, 'Apralyte', NULL, NULL, NULL, NULL, 26.00, 21.00, 1),
(229, 'Medicines', NULL, 'Amoxily', NULL, NULL, NULL, NULL, 26.00, 21.00, 1),
(230, 'Medicines', NULL, 'Maxidel SE', NULL, NULL, NULL, NULL, 25.00, 23.00, 1),
(231, 'Medicines', NULL, 'Responax', NULL, NULL, NULL, NULL, 22.00, 20.00, 1),
(232, 'Medicines', NULL, 'Tepox 48', NULL, NULL, NULL, NULL, 26.00, 24.00, 1),
(233, 'Medicines', NULL, 'Selectrogen', NULL, NULL, NULL, NULL, 27.00, 21.00, 1),
(234, 'Medicines', NULL, 'Digestaide', NULL, NULL, NULL, NULL, 18.00, 16.00, 1),
(235, 'Medicines', NULL, 'Electrogen DT', NULL, NULL, NULL, NULL, 23.00, 21.00, 1),
(236, 'Medicines', NULL, 'Setpro', NULL, NULL, NULL, NULL, 20.00, 18.00, 1),
(237, 'Medicines', NULL, 'Amty', NULL, NULL, NULL, NULL, 17.00, 15.00, 1),
(238, 'Medicines', NULL, 'Voltplex', NULL, NULL, NULL, NULL, 14.00, 12.00, 1),
(239, 'Medicines', NULL, 'Calyex', NULL, NULL, NULL, NULL, 7.00, 6.00, 1),
(240, 'Medicines', NULL, 'B12', NULL, NULL, NULL, NULL, 7.00, 6.00, 1),
(241, 'Medicines', NULL, 'Adtil', NULL, NULL, NULL, NULL, 10.00, 8.00, 1),
(242, 'Medicines', NULL, 'B50', NULL, NULL, NULL, NULL, 9.00, 7.00, 1),
(243, 'Medicines', NULL, 'Promotor', NULL, NULL, NULL, NULL, 14.00, 12.00, 1),
(244, 'Medicines', NULL, 'Vitamin Pro 357', NULL, NULL, NULL, NULL, 8.00, 7.00, 1),
(245, 'Medicines', NULL, 'Bee Pollen', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(246, 'Medicines', NULL, 'Hamliten', NULL, NULL, NULL, NULL, 9.00, 7.00, 1),
(247, 'Medicines', NULL, 'Oxylyte', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(248, 'Medicines', NULL, 'Podgel Forty', NULL, NULL, NULL, NULL, 25.00, 22.00, 1),
(249, 'Medicines', NULL, 'Eltoro', NULL, NULL, NULL, NULL, 14.00, 13.00, 1),
(250, 'Medicines', NULL, 'Bactonero Capsule', NULL, NULL, NULL, NULL, 9.00, 8.00, 1),
(251, 'Medicines', NULL, 'Triscular', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(252, 'Medicines', NULL, 'Vetracin Capsule', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(253, 'Medicines', NULL, 'Dinimolar', NULL, NULL, NULL, NULL, 10.00, 9.00, 1),
(254, 'Medicines', NULL, 'Amoxicillin', NULL, NULL, NULL, NULL, 7.00, 6.00, 1),
(255, 'Medicines', NULL, 'Ketamine', '', NULL, NULL, NULL, NULL, NULL, 1),
(256, 'Medicines', NULL, 'L-Spec Inject', '1 udd syringe', NULL, NULL, NULL, 24.00, NULL, 1),
(257, 'Medicines', NULL, 'L-Spoc', '10 ml', NULL, NULL, NULL, 220.00, NULL, 1),
(258, 'Medicines', NULL, 'Rulosar', '', NULL, NULL, NULL, 200.00, NULL, 1),
(259, 'Medicines', NULL, 'Betamox', '', NULL, NULL, NULL, 790.00, NULL, 1),
(260, 'Medicines', NULL, 'Bexan', '10 ml', NULL, NULL, NULL, 220.00, NULL, 1),
(261, 'Medicines', NULL, 'Bexan', '1 udd syringe', NULL, NULL, NULL, 28.00, NULL, 1),
(262, 'Medicines', NULL, 'Belomyl', '1 udd syringe', NULL, NULL, NULL, 28.00, NULL, 1),
(263, 'Medicines', NULL, 'Hapin', '', NULL, NULL, NULL, 16.00, NULL, 1),
(264, 'Medicines', NULL, 'Gahip', '', NULL, NULL, NULL, 10.00, NULL, 1),
(265, 'Medicines', NULL, 'Byna', '', NULL, NULL, NULL, 95.00, NULL, 1),
(266, 'Medicines', NULL, 'Iset Gamip Amet', '', NULL, NULL, NULL, 60.00, NULL, 1),
(267, 'Medicines', NULL, 'Ugayaw Tari', '6 pcs', NULL, NULL, NULL, 40.00, NULL, 1),
(268, 'Medicines', NULL, 'Ugayaw Tari', '12 pcs', NULL, NULL, NULL, 60.00, NULL, 1),
(269, 'Medicines', NULL, 'Dextrose', 'Small', NULL, NULL, NULL, 55.00, NULL, 1),
(270, 'Medicines', NULL, 'Dextrose', 'Big', NULL, NULL, NULL, 95.00, NULL, 1),
(271, 'Medicines', NULL, 'Glomel Ordinary', '', NULL, NULL, NULL, 60.00, NULL, 1),
(272, 'Medicines', NULL, 'Glomel Special', '', NULL, NULL, NULL, 100.00, NULL, 1),
(273, 'Medicines', NULL, 'Red Cell', 'Small', NULL, NULL, NULL, 110.00, NULL, 1),
(274, 'Medicines', NULL, 'Red Cell', 'Big', NULL, NULL, NULL, 195.00, NULL, 1),
(275, 'Medicines', NULL, 'Multivitamins', '', NULL, NULL, NULL, 60.00, NULL, 1),
(276, 'Medicines', NULL, 'Calcium Lactate', '', NULL, NULL, NULL, 60.00, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `retail_price` decimal(10,2) DEFAULT NULL,
  `bulk_price` decimal(10,2) DEFAULT NULL,
  `reorder_level` int(11) DEFAULT 5,
  `unit_id` int(11) DEFAULT NULL,
  `archived` tinyint(4) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `unit`, `cost_price`, `retail_price`, `bulk_price`, `reorder_level`, `unit_id`, `archived`) VALUES
(1, 'Chicken Feeds', 'Feeds', 'sack', 1050.00, 1200.00, 1150.00, 10, NULL, 0),
(2, 'Hog Feeds', 'Feeds', 'sack', 1150.00, 1350.00, 1300.00, 10, NULL, 0),
(3, 'Layer Feeds', 'Feeds', 'sack', 1080.00, 1250.00, 1200.00, 10, NULL, 0),
(4, 'Broiler Feeds', 'Feeds', 'sack', 1100.00, 1280.00, 1230.00, 10, NULL, 0),
(5, 'Rice Bran', 'Feeds', 'kilo', 18.00, 25.00, 22.00, 20, NULL, 0),
(6, 'Veterinary Vitamins', 'Vitamins', 'bottle', 100.00, 150.00, 135.00, 5, NULL, 0),
(7, 'Animal Antibiotics', 'Medicines', 'bottle', 180.00, 250.00, 230.00, 5, NULL, 0),
(8, 'Poultry Supplements', 'Supplements', 'pack', 75.00, 110.00, 100.00, 5, NULL, 0),
(9, 'Feeding Trough', 'Equipment', 'piece', 120.00, 180.00, 160.00, 5, NULL, 0),
(10, 'Water Drinker', 'Equipment', 'piece', 90.00, 140.00, 125.00, 5, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `type` enum('retail','bulk') DEFAULT NULL,
  `customer` varchar(100) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storage_units`
--

CREATE TABLE `storage_units` (
  `id` int(11) NOT NULL,
  `name` varchar(80) DEFAULT NULL,
  `device_id` varchar(40) DEFAULT NULL,
  `min_c` decimal(5,2) DEFAULT NULL,
  `max_c` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `storage_units`
--

INSERT INTO `storage_units` (`id`, `name`, `device_id`, `min_c`, `max_c`) VALUES
(1, 'Medicine Refrigerator', 'ESP32-FRIDGE', 2.00, 8.00),
(2, 'Antibiotics Cabinet', 'ESP32-CABINET', 15.00, 25.00);

-- --------------------------------------------------------

--
-- Table structure for table `temp_logs`
--

CREATE TABLE `temp_logs` (
  `id` bigint(20) NOT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `temp_c` decimal(5,2) DEFAULT NULL,
  `humidity` decimal(5,2) DEFAULT NULL,
  `logged_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('owner','staff') DEFAULT NULL,
  `active` tinyint(4) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `full_name`, `password_hash`, `role`, `active`) VALUES
(22, 'owner', 'Store Owner', '$2y$10$rZA6nxPHiNKHAbho/ZuR7OoK6URoXIhU39.UyPpMBAShIm8Noew6y', 'owner', 1),
(23, 'staff', 'Store Staff', '$2y$10$aB2D528kgTj.5HETmdBxEuJFXWAW48/trOZx4LpJ28du9xJ3IIHn2', 'staff', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `batches`
--
ALTER TABLE `batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bulk_orders`
--
ALTER TABLE `bulk_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD UNIQUE KEY `order_number` (`order_number`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `losses`
--
ALTER TABLE `losses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `price_list`
--
ALTER TABLE `price_list`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `storage_units`
--
ALTER TABLE `storage_units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_id` (`device_id`);

--
-- Indexes for table `temp_logs`
--
ALTER TABLE `temp_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_id` (`unit_id`,`logged_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `batches`
--
ALTER TABLE `batches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bulk_orders`
--
ALTER TABLE `bulk_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `losses`
--
ALTER TABLE `losses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `price_list`
--
ALTER TABLE `price_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=277;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `storage_units`
--
ALTER TABLE `storage_units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `temp_logs`
--
ALTER TABLE `temp_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
