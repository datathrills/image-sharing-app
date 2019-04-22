-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 22, 2019 at 11:09 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `imageboard`
--

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `thread_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `thread_id`, `user_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(4, 5, 1),
(5, 3, 1),
(6, 2, 2),
(7, 5, 2),
(8, 4, 2),
(9, 6, 2),
(10, 3, 2),
(11, 2, 4),
(12, 3, 4),
(13, 6, 4),
(14, 4, 4),
(15, 5, 4),
(16, 7, 4),
(17, 8, 4),
(18, 5, 6),
(19, 7, 6),
(20, 2, 6),
(21, 10, 6),
(22, 8, 1),
(23, 10, 1),
(24, 4, 1),
(25, 10, 7);

-- --------------------------------------------------------

--
-- Table structure for table `replies`
--

CREATE TABLE `replies` (
  `id` int(11) NOT NULL,
  `thread_id` int(11) NOT NULL,
  `reply_user_id` int(11) NOT NULL,
  `reply_text` text NOT NULL,
  `reply_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `replies`
--

INSERT INTO `replies` (`id`, `thread_id`, `reply_user_id`, `reply_text`, `reply_timestamp`) VALUES
(1, 1, 1, 'btw, here is the link: https://www.scss.tcd.ie/~bralicm/visual_computing_game/', '2019-04-16 12:26:12'),
(2, 1, 2, 'I am not able to survive, the game is too hard.', '2019-04-16 12:26:12'),
(3, 4, 2, 'Maybe Joseph for the white male?', '2019-04-20 02:14:45'),
(5, 1, 4, 'dsdsds', '2019-04-21 07:00:49'),
(6, 2, 4, 'rw', '2019-04-21 07:18:59'),
(7, 1, 4, 'sd', '2019-04-21 07:20:03'),
(8, 1, 4, 'Test', '2019-04-21 07:28:03'),
(9, 1, 4, 'last childe', '2019-04-21 07:30:15'),
(10, 1, 4, 'now', '2019-04-21 07:31:29'),
(11, 1, 4, 'oo', '2019-04-21 07:35:38'),
(12, 1, 4, 'oo', '2019-04-21 07:35:47'),
(13, 1, 4, 'need fix', '2019-04-21 07:36:29'),
(14, 1, 4, 'undefined', '2019-04-21 07:43:20'),
(15, 1, 4, 'ewe', '2019-04-21 07:43:57'),
(16, 1, 4, 'sa', '2019-04-21 08:07:55'),
(17, 1, 4, 'sassaasa', '2019-04-21 08:07:59'),
(18, 1, 4, '?1', '2019-04-21 08:08:04'),
(19, 1, 4, '!?!??!?!', '2019-04-21 08:08:13'),
(20, 5, 6, 'I did. Totally awesome', '2019-04-21 12:10:34'),
(21, 4, 1, 'I ended up naming them: Ham the prophet, Hannah the wife and Jonah the protagonist. Opinions?', '2019-04-22 14:48:49'),
(22, 10, 7, 'Pretty girl', '2019-04-22 17:28:20');

-- --------------------------------------------------------

--
-- Table structure for table `threads`
--

CREATE TABLE `threads` (
  `id` int(11) NOT NULL,
  `thread_opid` int(11) NOT NULL,
  `thread_name` varchar(200) DEFAULT NULL,
  `thread_text` text,
  `thread_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `thread_image_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `threads`
--

INSERT INTO `threads` (`id`, `thread_opid`, `thread_name`, `thread_text`, `thread_timestamp`, `thread_image_id`) VALUES
(1, 1, 'Defender of the Motherland', 'Has anyone played this game?', '2019-04-03 18:46:18', '12950008074_17f18039ba_b.png'),
(2, 2, 'IDM course', 'How is the course going?', '2019-04-03 18:47:23', '49206052_10156394363892600_3.jpg'),
(3, 2, 'Dataviz topic', 'Anyone here into data vizualization? Can this infographics be designed better?', '2019-04-15 18:44:39', '10154924363892605302_032.jpg'),
(4, 1, 'Amateur Game Development', 'Hi, I need help with naming the game characters for our CS7027 game design project? Anagrams preferred. ', '2019-04-15 18:51:23', '534213638924924_6002dsa32.png'),
(5, 1, 'Play with fire', 'Anyone installed this game?', '2019-04-15 18:56:35', '4434233243638434233_d32432.jpg'),
(6, 1, 'Movie projects for Tom\'s class', 'What\'s will you movies be about?', '2019-04-15 19:01:14', '3242342342300300203020002_2a.jpg'),
(7, 2, 'News in IR', 'What\'s your go-to online news source?', '2019-04-15 19:09:07', '303939320_9da_Sa212.png'),
(8, 1, '', '', '2019-04-20 22:22:07', 'f416mizywqitzgt4c9ghup.png'),
(9, 1, 'Scary judge', 'Rate this judge?', '2019-04-20 23:51:08', 'iuqkkxzv16iegr9bi3d44w.png'),
(10, 6, '', '', '2019-04-21 12:16:25', '21mwr8oe3t4hjn1bphxdvb.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  `ip_address` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `ip_address`) VALUES
(1, 'admin', '12345678', NULL),
(2, 'bestUser', 'monkey69', NULL),
(3, 'IDMstudent', '87654321', NULL),
(4, 'testingBro', '12345678', '134.226.214.244'),
(5, 'stupidUser', '1234567890', '134.226.214.244'),
(6, 'julijajuki', 'randomABCDE', '134.226.214.244'),
(7, 'firefoxUser', 'firefoxUser01', '::ffff:127.0.0.1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `replies`
--
ALTER TABLE `replies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `threads`
--
ALTER TABLE `threads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `replies`
--
ALTER TABLE `replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `threads`
--
ALTER TABLE `threads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
