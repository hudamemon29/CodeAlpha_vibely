-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 28, 2026 at 05:49 PM
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
-- Database: `vibely`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `text`, `created_at`) VALUES
(1, 1, 2, 'That completion jump is huge!', '2026-09-24 14:01:02'),
(2, 1, 3, 'Fewer steps = fewer excuses to quit.', '2026-09-24 14:01:02'),
(3, 3, 1, 'The light in this is unreal.', '2026-09-24 14:01:02'),
(4, 4, 2, 'Keep going, you got this!', '2026-09-24 14:01:02'),
(5, 1, 1, 'Testing MySQL comment', '2026-09-24 16:50:12'),
(6, 3, 1, 'hello', '2026-09-25 09:53:22'),
(7, 3, 1, 'hi', '2026-09-25 09:53:30'),
(8, 8, 6, 'hi Ayesha', '2026-09-25 10:04:32'),
(9, 13, 1, '🤞', '2026-09-28 06:40:09'),
(10, 14, 1, 'right', '2026-09-28 07:54:17');

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`follower_id`, `following_id`) VALUES
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(4, 2),
(1, 3),
(5, 3),
(2, 3),
(1, 2),
(1, 4),
(1, 5),
(6, 1),
(6, 3),
(1, 6),
(3, 2),
(3, 5),
(7, 1),
(7, 3),
(7, 2),
(7, 4);

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`user_id`, `post_id`) VALUES
(2, 1),
(3, 1),
(5, 1),
(4, 2),
(2, 3),
(5, 3),
(4, 3),
(2, 4),
(2, 6),
(3, 6),
(1, 3),
(1, 2),
(6, 8),
(6, 6),
(1, 13),
(1, 14);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `text`, `image_url`, `created_at`) VALUES
(1, 1, 'Shipped the new onboarding flow today. Three screens instead of seven, and completion went up 31%.', NULL, '2026-09-24 13:57:25'),
(2, 2, 'Hot take: most side projects die at the auth screen. Get login working on day one. #buildinpublic', NULL, '2026-09-24 13:57:25'),
(3, 3, 'Worth the 5am alarm.', 'https://picsum.photos/id/1015/1000/600', '2026-09-24 13:57:25'),
(4, 4, 'Day 12 of learning to code: finally understanding how functions work. #100DaysOfCode', NULL, '2026-09-24 13:57:25'),
(5, 5, 'Reading slowly is underrated. One chapter, no phone.', NULL, '2026-09-24 13:57:25'),
(6, 1, 'Design tip: if you need a tooltip to explain a button, rename the button.', NULL, '2026-09-24 13:57:25'),
(8, 1, 'hello world', NULL, '2026-09-25 09:52:58'),
(9, 6, 'life is beautiful  🤞', NULL, '2026-09-25 10:04:01'),
(10, 4, 'https://picsum.photos/id/1015/1000/600', NULL, '2026-09-25 10:27:17'),
(11, 1, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', NULL, '2026-09-25 10:36:36'),
(12, 1, '', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80', '2026-09-25 10:36:43'),
(13, 3, '', 'https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?ixid=2yJhcHBfaWQiOjEyMDd9&w=1000&q=80', '2026-09-25 10:38:00'),
(14, 3, 'don\'t make fun of other', NULL, '2026-09-25 10:38:52'),
(15, 1, 'life is pretty', NULL, '2026-09-28 07:54:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `color` int(11) DEFAULT 250,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `name`, `password_hash`, `bio`, `color`, `created_at`) VALUES
(1, 'ayesha', 'ayesha@example.com', 'Ayesha Khan', 'password123', 'Product designer. Coffee first, pixels second.', 290, '2026-09-24 13:55:01'),
(2, 'omar', 'omar@example.com', 'Omar Farooq', 'password123', 'Full-stack dev building small tools people actually use.', 200, '2026-09-24 13:55:01'),
(3, 'sara', 'sara@example.com', 'Sara Malik', 'password123', 'Photographer | Lahore | chasing golden hour.', 25, '2026-09-24 13:55:01'),
(4, 'bilal', 'bilal@example.com', 'Bilal Ahmed', 'password123', 'Learning in public. Currently: HTML, CSS and JS.', 150, '2026-09-24 13:55:01'),
(5, 'hina', 'hina@example.com', 'Hina Raza', 'password123', 'Writer. Reader. Occasional runner.', 330, '2026-09-24 13:55:01'),
(6, 'Hania_memon', 'Hania@gmail.com', 'Hania', 'hania#123', 'Doctor 🧕', 51, '2026-09-25 10:01:29'),
(7, 'amna', 'Aamna_Rana@gmail.com', 'Aamna', 'helloworld', '', 242, '2026-09-28 07:55:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
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
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
