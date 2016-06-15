-- phpMyAdmin SQL Dump
-- version 4.4.13.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 15, 2016 at 04:30 PM
-- Server version: 5.6.30-0ubuntu0.15.10.1
-- PHP Version: 5.6.11-1ubuntu3.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `redis_demo`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE IF NOT EXISTS `chat` (
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `room` int(11) NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `chat`
--

INSERT INTO `chat` (`user_id`, `message`, `room`, `created_date`) VALUES
(8, 'test chat', 0, '2016-06-14 15:03:30'),
(7, '1w', 0, '2016-06-14 15:05:21'),
(7, '2ewq', 0, '2016-06-14 15:08:20'),
(7, '2ewq', 0, '2016-06-14 15:10:20'),
(8, 'test', 0, '2016-06-14 15:26:08'),
(8, 'aaa', 0, '2016-06-14 15:27:20'),
(8, 'aaa', 0, '2016-06-14 15:29:20'),
(8, 'test', 0, '2016-06-14 15:33:11'),
(8, 'qw', 0, '2016-06-14 15:34:26'),
(8, 'qw', 0, '2016-06-14 15:36:26'),
(8, 'shahriar', 0, '2016-06-14 15:38:45'),
(8, 'dadsa', 0, '2016-06-14 15:38:51'),
(8, 'tessss', 0, '2016-06-14 16:45:04'),
(8, 'aaaa', 0, '2016-06-14 16:47:03'),
(8, 'aaaa', 0, '2016-06-14 16:49:03'),
(8, 'ttt', 0, '2016-06-14 16:52:58'),
(8, 'ghhhhhhg', 0, '2016-06-14 16:53:03'),
(8, 'ttt', 0, '2016-06-14 16:54:58'),
(7, 'weqww', 0, '2016-06-15 08:54:13'),
(7, 'wqw32212', 0, '2016-06-15 08:54:18'),
(7, '11111', 0, '2016-06-15 08:54:21'),
(8, 'chetroi shahriar?', 0, '2016-06-15 08:54:53'),
(8, 'qtqghj', 0, '2016-06-15 08:56:08'),
(7, 'weqww', 0, '2016-06-15 08:56:13'),
(7, 'wqw32212', 0, '2016-06-15 08:56:18'),
(7, '111', 0, '2016-06-15 08:56:21'),
(8, 'chetroi shahriar?', 0, '2016-06-15 08:56:53'),
(8, 'i2', 0, '2016-06-15 08:56:58'),
(7, 'eee', 0, '2016-06-15 08:57:03'),
(7, 'www', 0, '2016-06-15 08:57:15'),
(8, 'qtqghj', 0, '2016-06-15 08:58:08'),
(7, 'www', 0, '2016-06-15 08:59:15'),
(7, 'www', 0, '2016-06-15 09:33:47'),
(7, '1111', 0, '2016-06-15 09:33:50'),
(8, '111szaaxa', 0, '2016-06-15 09:34:52'),
(8, 'eee', 0, '2016-06-15 09:36:19'),
(8, '11', 0, '2016-06-15 09:39:33'),
(7, '11', 0, '2016-06-15 09:39:39'),
(7, '4554', 0, '2016-06-15 09:40:41'),
(7, '4554', 0, '2016-06-15 09:42:41'),
(8, '333', 0, '2016-06-15 09:49:52'),
(8, '333', 0, '2016-06-15 09:51:52'),
(7, '32', 0, '2016-06-15 10:06:18'),
(7, '2222', 0, '2016-06-15 10:06:22'),
(7, '222', 0, '2016-06-15 10:07:41'),
(8, '111', 0, '2016-06-15 10:08:02'),
(8, 'qqw', 0, '2016-06-15 10:22:10'),
(8, 'qqw', 0, '2016-06-15 10:24:10'),
(7, 'hi', 0, '2016-06-15 10:30:06'),
(8, 'test', 0, '2016-06-15 10:30:21'),
(8, 'www', 0, '2016-06-15 10:30:37'),
(7, '111', 0, '2016-06-15 10:30:47'),
(7, 'hi', 0, '2016-06-15 10:32:06'),
(7, 'qqq', 0, '2016-06-15 10:32:23'),
(7, '1111sa', 0, '2016-06-15 10:32:31'),
(7, '1121', 0, '2016-06-15 10:55:29'),
(7, 'l;l,;', 0, '2016-06-15 10:56:28'),
(7, 'jk', 0, '2016-06-15 10:56:55'),
(7, 'jk', 0, '2016-06-15 10:58:55'),
(7, 'qqq', 0, '2016-06-15 11:00:41'),
(8, 'wqwq', 0, '2016-06-15 11:01:18'),
(7, '111', 0, '2016-06-15 11:01:54'),
(7, 'qqq', 0, '2016-06-15 11:02:41'),
(8, 'wqwq', 0, '2016-06-15 11:03:18'),
(7, '111', 0, '2016-06-15 11:03:54'),
(8, 'aminaaa', 0, '2016-06-15 11:06:01'),
(8, 'hi', 0, '2016-06-15 11:07:03'),
(7, 'qwwwqjq', 0, '2016-06-15 11:07:31'),
(8, '1111', 0, '2016-06-15 11:07:44'),
(8, 'hi', 0, '2016-06-15 11:09:03'),
(7, 'qwwwqjq', 0, '2016-06-15 11:09:31'),
(8, '1111', 0, '2016-06-15 11:09:44'),
(8, 'qqq', 0, '2016-06-15 11:14:27'),
(8, 'hh', 0, '2016-06-15 11:17:12'),
(8, 'hh', 0, '2016-06-15 11:19:12'),
(8, 'test]', 0, '2016-06-15 11:19:20'),
(8, 'test', 0, '2016-06-15 11:19:27'),
(8, '654644', 0, '2016-06-15 11:19:42'),
(8, 'www', 0, '2016-06-15 14:38:24'),
(8, 'www', 0, '2016-06-15 14:40:24'),
(8, 'aaa', 0, '2016-06-15 14:44:49'),
(8, 'aaa', 0, '2016-06-15 14:46:49'),
(7, 'kk', 0, '2016-06-15 15:26:48'),
(7, '9pio', 0, '2016-06-15 15:28:13'),
(7, '9pio', 0, '2016-06-15 15:30:12'),
(7, 'bvcb', 0, '2016-06-15 16:18:37'),
(7, 'bvcb', 0, '2016-06-15 16:20:37');

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE IF NOT EXISTS `room` (
  `id` int(11) NOT NULL,
  `room_name` varchar(100) NOT NULL,
  `permission` int(11) DEFAULT NULL,
  `create_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`id`, `room_name`, `permission`, `create_date`) VALUES
(6, 'testroom', NULL, '2016-06-15 13:37:03');

-- --------------------------------------------------------

--
-- Table structure for table `user_login`
--

CREATE TABLE IF NOT EXISTS `user_login` (
  `user_id` int(11) NOT NULL,
  `user_email` varchar(50) NOT NULL,
  `user_password` varchar(50) NOT NULL,
  `user_name` varchar(50) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_login`
--

INSERT INTO `user_login` (`user_id`, `user_email`, `user_password`, `user_name`) VALUES
(7, 'apachish@gmail.com', '123456', 'shahriar'),
(8, 'amin@gmail.com', '123456', 'amin');

-- --------------------------------------------------------

--
-- Table structure for table `user_status`
--

CREATE TABLE IF NOT EXISTS `user_status` (
  `user_id` int(11) NOT NULL,
  `user_status` text NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_status`
--

INSERT INTO `user_status` (`user_id`, `user_status`, `created_date`) VALUES
(7, 'test description', '2016-06-14 11:37:40'),
(7, 'tets', '2016-06-14 12:00:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_login`
--
ALTER TABLE `user_login`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_email` (`user_email`);

--
-- Indexes for table `user_status`
--
ALTER TABLE `user_status`
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `user_login`
--
ALTER TABLE `user_login`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat`
--
ALTER TABLE `chat`
  ADD CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_login` (`user_id`);

--
-- Constraints for table `user_status`
--
ALTER TABLE `user_status`
  ADD CONSTRAINT `user_status_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_login` (`user_id`);
