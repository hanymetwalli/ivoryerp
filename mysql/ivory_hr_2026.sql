-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 25, 2026 at 09:37 PM
-- Server version: 8.0.30
-- PHP Version: 8.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ivory_hr_2026`
--

-- --------------------------------------------------------

--
-- Table structure for table `allowances`
--

CREATE TABLE `allowances` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` enum('SAR','EGP','USD') COLLATE utf8mb4_unicode_ci DEFAULT 'SAR',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT '1',
  `status` enum('active','inactive','expired') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `approved_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `allowance_types`
--

CREATE TABLE `allowance_types` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_taxable` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `allowance_types`
--

INSERT INTO `allowance_types` (`id`, `name`, `code`, `description`, `is_taxable`, `created_at`, `status`) VALUES
('05bc57ef-02a3-11f1-a178-d481d76a1bbe', 'بدل تميز', 'EXC', 'بدل تميز', 0, '2026-02-05 14:57:42', 'active'),
('05bc5a9d-02a3-11f1-a178-d481d76a1bbe', 'بدل سكن إضافي', 'HOU', 'بدل سكن إضافي', 0, '2026-02-05 14:57:42', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `approval_requests`
--

CREATE TABLE `approval_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `model_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','returned') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `approval_requests`
--

INSERT INTO `approval_requests` (`id`, `model_type`, `model_id`, `status`, `created_at`, `updated_at`) VALUES
('00d521d7-8eae-4d89-b82b-e7232aa600c4', 'EmployeeViolation', 'b8b25af5-b4ad-4b3d-8eff-62e3703f0c72', 'pending', '2026-02-25 21:31:47', '2026-02-25 21:31:47'),
('06e118f3-1c7d-4339-afed-f4beab881011', 'permission_requests', '13d60709-4f6b-40f8-bc7c-0bae3281e355', 'approved', '2026-02-22 14:33:14', '2026-02-22 15:05:41'),
('08687b08-b276-4dde-92c8-5dfabbcf9929', 'contracts', '716b6b57-fb07-41cd-a581-410704d73298', 'approved', '2026-02-22 22:32:30', '2026-02-23 11:42:48'),
('08d22563-72e7-422e-8936-a19e7db59909', 'overtime', '91e633ba-b7ee-49c7-a08e-2792f95fecaa', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:02:18'),
('0a8729ef-e5ab-426d-911a-5b0c8d8a743e', 'performance_evaluations', '0ef0af5f-745b-4cd0-bc01-8eee006d9d84', 'approved', '2026-02-23 11:31:07', '2026-02-23 11:42:50'),
('0c7c5fc8-472f-4817-964a-18878942af34', 'bonuses', 'fd77d065-3684-4cd8-89d9-197153a96528', 'approved', '2026-02-22 19:48:24', '2026-02-22 21:45:43'),
('0dda34b4-eb8b-48a0-9515-c5559a8430f6', 'payroll_batches', '7a00b27e-a7ba-402d-b298-b11585b076c6', 'approved', '2026-02-24 23:51:01', '2026-02-24 23:51:20'),
('11078d23-dbf4-4d32-8360-94fda53679fc', 'payroll_batches', '8c6afd7b-3322-4662-abae-2d606b8df2e5', 'pending', '2026-02-24 23:37:44', '2026-02-24 23:37:44'),
('118c45df-1aee-41aa-8b97-a507c7f3fc46', 'payroll_batches', '1f644008-91c5-470d-a264-8d860d947eb8', 'rejected', '2026-02-24 22:57:08', '2026-02-24 23:01:12'),
('13043b3a-c70f-4e05-a713-6e0c888ff7df', 'permission_requests', 'e6990ec5-201d-4a11-a43f-31c7a94529b1', 'rejected', '2026-02-22 14:42:24', '2026-02-22 15:05:04'),
('1359007f-7e90-4f20-b246-755d886d9ef4', 'bonuses', '57c1a3c8-5ed5-4542-8374-faf868681482', 'pending', '2026-02-24 13:20:40', '2026-02-24 13:20:40'),
('141ad61f-88bd-4008-b36b-2a45310cbb7c', 'leave_requests', 'cb312d32-68a9-4908-aba2-10a3b6b4ee4f', 'pending', '2026-02-21 19:33:10', '2026-02-21 19:33:10'),
('157bac6d-7abf-4030-bd91-e70826c8f00d', 'overtime', 'd534f23d-8f15-4c7a-ab40-ec1f2ed583f1', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:53:40'),
('183c47ea-1d1f-45b2-95c2-4dcc97001e27', 'overtime', '2bc64ed0-e1ea-43a0-b7ac-d31a31e86cde', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:02:27'),
('1baeb022-ad20-40ec-a9e3-185cd06aa8e0', 'EmployeeViolation', '9198524b-adfa-4afa-af48-041b1d105260', 'pending', '2026-02-25 21:34:05', '2026-02-25 21:34:05'),
('1e51adce-4cf7-4493-9c4c-fd43d228b12d', 'performance_evaluations', '659ccd4b-c2b9-40f9-bf34-9568cbabab18', 'approved', '2026-02-24 13:54:48', '2026-02-24 14:13:56'),
('1ef233a9-412e-4973-9416-2ad07bb49eab', 'contracts', '9568b96d-6775-4097-925b-db80d09a0795', 'approved', '2026-02-24 08:27:09', '2026-02-24 08:29:02'),
('23399a20-4f5b-4df7-81d5-a2ed58cc6c45', 'leave_requests', '8067fdc7-042e-489f-a685-2056bac6e55a', 'approved', '2026-02-22 13:50:04', '2026-02-22 19:53:48'),
('25c6598e-dbf2-4857-87bd-9861ba7e5a9f', 'contracts', 'c629705b-3f6b-4fcf-9c62-a6d01531c7ae', 'approved', '2026-02-23 12:17:43', '2026-02-23 12:20:58'),
('296c26b3-5f89-47f4-92d0-69e4ba642f41', 'bonuses', '38caab93-53ad-42f0-80f0-0f1d00025913', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:53:50'),
('29d39f32-4243-490c-a8c2-647ba4faf74f', 'permission_requests', 'aba967d8-ec52-4969-a500-1074ef1f901c', 'approved', '2026-02-21 16:28:56', '2026-02-22 15:04:14'),
('31e778c4-66fc-4d08-a954-4cd2e43a1b0e', 'EmployeeViolation', '2e35d39c-d850-449b-aa66-038c1ff844bf', 'pending', '2026-02-25 21:33:53', '2026-02-25 21:33:53'),
('3253063f-9ed2-4802-b95f-3b95d690eaed', 'employee_trainings', '2664a452-fd45-4e6c-8b5d-e9685c8df376', 'approved', '2026-02-22 21:39:57', '2026-02-22 21:46:10'),
('32754ef1-e268-4b96-ae8c-e1bf4387fea8', 'employee_trainings', 'dc61360f-8271-48a7-a647-c4a5b21a3099', 'approved', '2026-02-22 21:10:26', '2026-02-22 21:45:11'),
('34ab222d-e42e-4240-a905-b9df99e18a0b', 'employee_trainings', '12e4b5bb-26f6-4ce3-b7e7-9a59271366b3', 'approved', '2026-02-22 21:40:18', '2026-02-22 21:46:12'),
('370685a1-9fd7-49e7-80da-ddc8cdcb57ba', 'bonuses', '23231b74-4ece-48ff-8094-0496e08c880d', 'approved', '2026-02-22 19:48:24', '2026-02-22 21:46:13'),
('385722a0-f326-40bf-a64f-44b9eb43b9d9', 'contracts', '63a1675a-f6f2-4859-9dc8-753811fc149e', 'approved', '2026-02-24 08:00:57', '2026-02-24 08:06:08'),
('3a5c0b0e-d655-4e88-b663-53f678c4da3c', 'leave_requests', 'd888cc7f-abc6-4c00-9d58-29042bdad76d', 'approved', '2026-02-21 20:09:49', '2026-02-22 15:05:53'),
('3bcb7d22-b1f5-4f21-bd80-a6e3e78fd577', 'employee_trainings', 'a1bc4853-cda3-4bbc-a507-d747ec0895b8', 'approved', '2026-02-22 21:42:22', '2026-02-22 21:46:15'),
('3ea78a54-e2e8-4b59-9fbe-1be534bd9d18', 'bonuses', '2e2f9937-fb91-4f9d-a924-7f1799dc32a2', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:53:56'),
('3fc100db-b114-460b-ad24-4216e2b69c49', 'permission_requests', '5dc971f0-95e9-4823-bd58-3b1f862099b3', 'returned', '2026-02-22 14:41:24', '2026-02-22 15:04:22'),
('40f092e4-460d-42fe-bde4-007877c79bd5', 'bonuses', '1cdba9e2-cdc3-4a24-a6ef-be8ae38d5034', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:54:00'),
('45510874-a21c-463d-a943-1c503fa3b419', 'payroll_batches', '1b0bd6f0-3850-4554-a2f6-ddcc559c15ef', 'pending', '2026-02-24 22:51:05', '2026-02-24 22:51:05'),
('45864d6b-83bf-48f5-9703-28faa8b5f42f', 'contracts', '085984b0-abef-44a4-8efb-245cac221811', 'approved', '2026-02-24 09:01:24', '2026-02-24 13:16:26'),
('462a2ab4-2aa1-4766-86ea-de262ceaea55', 'leave_requests', '38207527-5b92-419c-a16f-ecf84882900f', 'approved', '2026-02-24 09:06:33', '2026-02-24 13:20:05'),
('509b0d3b-f99b-4cdd-963d-15a3586b46b6', 'bonuses', '0a763b5d-fe3c-4ac2-b205-14c2aa3287e3', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:54:04'),
('53bc39ce-2f29-4176-8c32-aa4f51a1bbd1', 'payroll_batches', '2dc683d6-23b7-47a2-a9b2-fa7db2d8014e', 'pending', '2026-02-24 23:42:21', '2026-02-24 23:42:21'),
('53cd9cc5-ab77-4d63-bea8-be2db9ca4731', 'overtime', 'f6317727-7e52-413c-ba78-9541e495746c', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:02:32'),
('576d9c1a-2e16-4e76-b739-0dda60059bda', 'leave_requests', 'd8450e6a-d697-465e-94c6-bb55f4211928', 'pending', '2026-02-21 19:26:44', '2026-02-21 19:26:44'),
('58383a0e-1d1e-4863-b404-b29a5fdbf246', 'overtime', '5d6a9ffd-9740-420a-93c2-98af1f3e9bbf', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:02:35'),
('5e83aca4-137f-4aec-981b-fa2d0296f5f9', 'leave_requests', 'acc14764-9891-44fc-a91c-95a470baca15', 'approved', '2026-02-21 19:34:19', '2026-02-21 19:34:19'),
('6203f730-c9bf-4413-a88c-be7e728f9734', 'bonuses', '1569c2b5-8cf7-4332-b76f-b7e84d390f84', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:55:22'),
('62187e38-e60e-4c04-9f02-e5fd14bd597d', 'overtime', '30c7351d-16a9-48eb-a31c-b40104e8eda7', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:02:51'),
('6465c278-0446-4cd6-8fb4-30369ba807db', 'bonuses', 'ff502d8f-9eef-4bef-b83b-663bef6e1578', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:54:07'),
('65df2c6e-ff5d-42d2-ba35-af2dcd2fc642', 'bonuses', '55b62445-f30c-4dea-aa9e-4ffc3cc37318', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:55:19'),
('679ef2a9-1ccc-471a-ad63-8cf06b22a108', 'permission_requests', '65f0f1f6-d32d-4833-bccc-615155a56fc9', 'approved', '2026-02-22 14:41:51', '2026-02-22 19:01:57'),
('68dd74db-6f50-48f0-ae4d-febcf192bd44', 'leave_requests', 'fc438e59-59bd-4b4d-8dd2-b1f133cb5afe', 'approved', '2026-02-22 07:38:22', '2026-02-22 19:55:17'),
('6a2542be-2f5b-4529-bbfc-21e3b7d638be', 'leave_requests', '1a9a121a-8c36-4576-8ba3-4a4c0a5e0716', 'approved', '2026-02-24 15:35:31', '2026-02-24 15:35:37'),
('6b244139-d197-4e99-88c2-2bb91ca42bb8', 'permission_requests', '3e82a375-b8cb-4e64-bc9f-9aadb19f54a9', 'pending', '2026-02-21 17:40:01', '2026-02-21 17:40:01'),
('70402a1a-0731-4a92-b51f-64f47cbbff0a', 'permission_requests', '2ca3de36-ae44-41de-96aa-82105d17cfd3', 'approved', '2026-02-22 12:48:07', '2026-02-22 12:51:40'),
('7aaeaa70-e94c-4049-9131-2a3a14fbc0ec', 'bonuses', '750696de-b6fc-4d42-811c-650d5ea4fb54', 'approved', '2026-02-24 09:07:18', '2026-02-24 13:53:26'),
('7d3cc7ab-92a0-4fa6-8fbe-cf32a8ed8e18', 'permission_requests', '0d11b925-0bd2-4b29-8d69-bc194318105b', 'approved', '2026-02-22 14:33:45', '2026-02-24 13:19:15'),
('843e8ac8-bdcc-46a3-8651-355316de4c18', 'permission_requests', 'a6ce2ae6-89c5-4242-b8ab-e348b12d4e86', 'rejected', '2026-02-22 14:40:46', '2026-02-22 15:03:11'),
('87fe22dd-2f19-4ee6-952a-1ee8662484d8', 'leave_requests', '86dc24cc-9d23-4d35-b4ac-91614503d6c6', 'returned', '2026-02-22 08:59:51', '2026-02-22 09:09:05'),
('88842d05-3b99-4f83-85c5-0af1614df993', 'leave_requests', 'f4387a74-643f-4f17-881f-ca4fcfdd72f0', 'approved', '2026-02-21 20:48:16', '2026-02-22 19:55:11'),
('89d87b05-436b-4ad5-9c7c-d0d2465cf78b', 'payroll_batches', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'approved', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('8c3147a7-c281-4ce5-bbff-1901b70ea40c', 'leave_requests', 'b4c18412-b2fa-4740-8281-3f08235733c8', 'rejected', '2026-02-22 13:50:34', '2026-02-22 15:04:27'),
('8f399308-63cc-4637-93fc-a4aeb63ea204', 'employee_trainings', 'da90ef74-d6a8-4738-a395-67ccb9b192ca', 'pending', '2026-02-24 14:03:14', '2026-02-24 14:03:14'),
('949ea38b-8148-4759-b77f-e8b2d698009c', 'leave_requests', 'e7c9b685-67a0-48df-8834-5fa61f60f5d4', 'approved', '2026-02-21 19:45:54', '2026-02-22 19:55:13'),
('96707c0c-0505-468a-8c4f-7c3845a0c066', 'permission_requests', '8b153218-6851-4cb2-8f36-1d578de0f0a0', 'returned', '2026-02-22 13:18:12', '2026-02-22 15:05:16'),
('9a0964ff-988f-4c63-a9bb-d3509dc113c3', 'employee_trainings', '481d4583-59fe-4a37-8aa5-837126c882d8', 'pending', '2026-02-24 09:04:57', '2026-02-24 09:04:57'),
('a17ca85d-f8e6-47ac-9ef6-4618d94fbf62', 'bonuses', '37fc1b91-9bc6-4bf5-9ac0-40a7af65b617', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:55:14'),
('a4661d16-0053-4129-9466-7922460e454c', 'leave_requests', '51ca5dae-83b3-46f2-aaa4-10c245e7578b', 'approved', '2026-02-21 21:14:42', '2026-02-22 19:55:09'),
('a58bc426-f470-4c93-8b8a-15d135417740', 'resignations', '595440c4-18fa-4276-b0d0-531c9e2095fd', 'approved', '2026-02-24 13:52:54', '2026-02-24 13:52:58'),
('a5a4f4a5-3ad8-4165-aeaa-a5d81bf9de58', 'leave_requests', '6bf3db9a-d3a7-4242-b6eb-7ec688515276', 'approved', '2026-02-22 09:44:16', '2026-02-22 09:48:40'),
('ac7e0be9-f2b3-46fc-8198-6069a5eb0ed3', 'resignations', '3f881870-f48b-4ed5-9662-6c50986a6e30', 'approved', '2026-02-23 09:45:00', '2026-02-23 11:42:51'),
('b35d4e86-2893-4c38-9918-b67265ba2873', 'overtime', '41d19cb1-7ca9-49b4-8b30-38fbf0cd7074', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:55:05'),
('b7434892-f435-4b1e-8b44-d04aa0ded4ba', 'overtime', '9173bfa6-84d6-4e73-9226-cb200520caae', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:55:01'),
('b989a472-24ae-4574-a023-e34736d634c4', 'permission_requests', '963ef7ce-dc81-4227-86e6-8bfb99a39071', 'approved', '2026-02-22 14:17:38', '2026-02-22 19:54:44'),
('bb2b43f1-353e-4a2a-8ea4-2cd099967867', 'overtime', 'e07423f5-fe22-4c9e-9f1e-b9fc8f1750f4', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:02:46'),
('c0ec8ae0-3e68-4a4b-8802-d0081679001a', 'contracts', '95f5f92a-88c2-43b6-8ea8-2a6220e696cf', 'approved', '2026-02-23 07:22:45', '2026-02-23 11:42:53'),
('c389bd68-d0d3-49be-92fc-9993aecea16f', 'resignations', '6d640f85-9424-4775-885a-57ad07139ad9', 'approved', '2026-02-24 08:07:36', '2026-02-24 08:09:15'),
('c719a4ad-f098-4c90-a1e2-2dab8afa2ffe', 'EmployeeViolation', '066e5d09-ed7c-4d25-8ce9-c347a1df0581', 'pending', '2026-02-25 21:31:23', '2026-02-25 21:31:23'),
('c8af914e-3d4d-4875-a166-4db9fb48eb63', 'overtime', 'b82b8cfb-4950-4c5b-9144-7e2e7d47f179', 'approved', '2026-02-24 09:07:38', '2026-02-24 13:53:43'),
('cc0de676-7802-45b5-baa2-b44447f26e54', 'leave_requests', 'e7f6c430-df2a-44da-9820-7d10e49acbe7', 'approved', '2026-02-21 21:26:02', '2026-02-22 19:54:47'),
('cc5c11fe-3b97-4a0f-8519-2d0af50b280b', 'overtime', '0d169634-f517-4fbf-89ce-f20b2b1204c8', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:53:02'),
('d572a5d5-9622-49f3-98ed-b3667319ecd0', 'permission_requests', 'b2a2574a-6111-4901-89f9-026253c40ad3', 'approved', '2026-02-22 14:40:02', '2026-02-22 19:54:49'),
('d87a0969-c6c7-49e1-ae24-5bcb57488b0c', 'overtime', 'b17865b2-6585-4433-9f1a-96773e696dc2', 'approved', '2026-02-22 15:33:22', '2026-02-22 19:02:39'),
('d9d4c2b0-a550-4987-a8f5-fcb4c6d152ca', 'permission_requests', '5479e798-0add-428e-b216-0bfc8029b5ac', 'approved', '2026-02-22 14:32:42', '2026-02-22 15:05:44'),
('dad29bef-63c5-4120-b37f-3874c4e4c31d', 'employee_trainings', 'd873643d-da65-4309-a7be-edc2a8ce56fb', 'approved', '2026-02-24 14:36:52', '2026-02-24 14:52:40'),
('dcc2424e-6632-42a8-a20c-58524c723b98', 'EmployeeViolation', '883ed68b-ecff-4c3d-8b9b-1de331fa6f86', 'pending', '2026-02-25 21:31:47', '2026-02-25 21:31:47'),
('dfd56a86-1763-4095-9237-c8a27b654fa9', 'leave_requests', 'e4b7dc25-1ce8-4c19-9e35-7b7a21b1badc', 'approved', '2026-02-22 07:27:19', '2026-02-22 19:54:50'),
('e1736fee-70ad-4896-9c52-fd9facbaa344', 'payroll_batches', '4a607dd5-dbdf-4020-aa47-28d5fa750550', 'pending', '2026-02-24 23:38:47', '2026-02-24 23:38:47'),
('e40e90fe-a273-408d-b30c-e3c980b3c925', 'leave_requests', 'bd666bdc-b7e6-4231-8e2c-ba70fb63ef1a', 'approved', '2026-02-22 07:10:59', '2026-02-22 19:54:51'),
('e8372df1-dc94-4bb3-8cd2-f56dc59c28be', 'payroll_batches', '9acb09cf-3711-488f-951d-bd2d0d55623a', 'approved', '2026-02-24 23:43:33', '2026-02-24 23:48:20'),
('e96c7bf6-29ce-494a-bc3f-0fdf4e354f20', 'bonuses', 'c7831d6d-67cc-450f-be4a-be655da50141', 'approved', '2026-02-22 19:48:24', '2026-02-22 19:54:53'),
('ec53e9e6-665e-46a1-b0ec-d41b70c4bc1f', 'employee_trainings', 'decf30d4-c426-4f51-9d83-fd2d5541a3c2', 'approved', '2026-02-22 21:09:28', '2026-02-22 21:45:20'),
('f2291993-b214-40aa-a08d-bd4921eaf0ff', 'leave_requests', 'eb62b4eb-db0e-4cef-81e9-c3870bb7c0eb', 'approved', '2026-02-21 23:44:36', '2026-02-22 19:54:59'),
('f5ac6a0b-a4d9-4547-aead-bec0670486b8', 'employee_trainings', '31e11da9-2bb2-43ed-92d0-71c623b1a318', 'pending', '2026-02-24 13:17:20', '2026-02-24 13:17:20'),
('fc29fc8d-1537-4c3a-abad-b2a81cb423f8', 'contracts', 'e5e7e030-2883-443f-ae3a-995f024b3a93', 'approved', '2026-02-24 07:51:00', '2026-02-24 07:53:08'),
('fd3c336d-3af0-46c4-b228-eaf13b72ad90', 'employee_trainings', 'b1e324be-fac3-4914-bd2c-1bca0bd9d6cb', 'approved', '2026-02-22 21:42:07', '2026-02-22 21:46:17'),
('ff395e1d-a574-4f02-b52b-6a0eb0c7225e', 'payroll_batches', '161148b5-b6f5-4308-8c36-a38e6d3d8ebe', 'approved', '2026-02-25 07:18:48', '2026-02-25 07:20:24');

-- --------------------------------------------------------

--
-- Table structure for table `approval_steps`
--

CREATE TABLE `approval_steps` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `approval_request_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `step_order` int NOT NULL,
  `status` enum('pending','approved','rejected','returned') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `comments` text COLLATE utf8mb4_unicode_ci,
  `is_name_visible` tinyint(1) DEFAULT '1',
  `action_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `approval_steps`
--

INSERT INTO `approval_steps` (`id`, `approval_request_id`, `approver_user_id`, `role_id`, `step_order`, `status`, `comments`, `is_name_visible`, `action_date`, `created_at`, `updated_at`) VALUES
('015cf27d-08c2-48d6-96fd-2a6637397d5e', 'a17ca85d-f8e6-47ac-9ef6-4618d94fbf62', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:35', '2026-02-22 19:48:24', '2026-02-22 19:49:35'),
('02549c97-bb28-47f7-ba81-55f66e801fdf', 'a4661d16-0053-4129-9466-7922460e454c', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:38', '2026-02-21 21:14:42', '2026-02-22 19:49:38'),
('0374de05-f34d-4e1c-93ed-05d791928ef9', '58383a0e-1d1e-4863-b404-b29a5fdbf246', 'u-emp-03', NULL, 1, 'approved', '', 1, '2026-02-22 19:00:34', '2026-02-22 15:33:22', '2026-02-22 19:00:34'),
('03dabc6e-1369-4d18-86f0-ef06d7e4557e', '34ab222d-e42e-4240-a905-b9df99e18a0b', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 21:46:12', '2026-02-22 21:40:18', '2026-02-22 21:46:12'),
('03e9f2e7-bf0b-41e1-a7b5-941249646582', '23399a20-4f5b-4df7-81d5-a2ed58cc6c45', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:53:48', '2026-02-22 13:50:04', '2026-02-22 19:53:48'),
('03eb400e-66c9-4229-910a-f39868e743f8', '08687b08-b276-4dde-92c8-5dfabbcf9929', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-23 11:39:48', '2026-02-22 22:32:30', '2026-02-23 11:39:48'),
('03f9a16f-3948-4251-a22a-74d54e657766', 'c8af914e-3d4d-4875-a166-4db9fb48eb63', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:43', '2026-02-24 09:07:38', '2026-02-24 13:53:43'),
('047dbaa5-8ab9-416a-9896-15393bf214fe', '7aaeaa70-e94c-4049-9131-2a3a14fbc0ec', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:26', '2026-02-24 09:07:18', '2026-02-24 13:53:26'),
('06728d35-5bee-4802-8e1d-457da99805b3', '3fc100db-b114-460b-ad24-4216e2b69c49', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 2, 'pending', NULL, 1, NULL, '2026-02-22 14:41:24', '2026-02-22 14:41:24'),
('06f8d493-7994-4416-8ce8-25629d3dd8f3', 'bb2b43f1-353e-4a2a-8ea4-2cd099967867', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:01:58', '2026-02-22 15:33:22', '2026-02-22 19:01:58'),
('07eac12f-0793-4300-b20e-4658a146ca81', '89d87b05-436b-4ad5-9c7c-d0d2465cf78b', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 1, 'approved', '', 0, '2026-02-25 07:22:00', '2026-02-25 07:21:27', '2026-02-25 07:22:00'),
('08595a6c-f9ca-439e-a5a3-4bb9e10877ee', '183c47ea-1d1f-45b2-95c2-4dcc97001e27', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:01:49', '2026-02-22 15:33:22', '2026-02-22 19:01:49'),
('08df3123-68e6-462d-a14b-6ddaa1ce1114', '6a2542be-2f5b-4529-bbfc-21e3b7d638be', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 15:35:37', '2026-02-24 15:35:31', '2026-02-24 15:35:37'),
('0a5c44f2-5895-4c45-a7d4-b4ae376e42a4', '96707c0c-0505-468a-8c4f-7c3845a0c066', 'u-emp-01', NULL, 2, 'returned', 'sdsdsdsd', 1, '2026-02-22 15:05:16', '2026-02-22 13:18:12', '2026-02-22 15:05:16'),
('0a98cd4d-5e3c-4828-ad90-9a443c3cfcf4', 'e96c7bf6-29ce-494a-bc3f-0fdf4e354f20', 'u-emp-04', NULL, 1, 'approved', '', 1, '2026-02-22 19:51:38', '2026-02-22 19:48:24', '2026-02-22 19:51:38'),
('0b2aa342-de98-436d-b4b1-540df6287a94', '06e118f3-1c7d-4339-afed-f4beab881011', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 15:05:41', '2026-02-22 14:33:14', '2026-02-22 15:05:41'),
('0b6b0e93-a146-4c1f-89ad-580d20db028c', '3ea78a54-e2e8-4b59-9fbe-1be534bd9d18', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 19:49:40', '2026-02-22 19:48:24', '2026-02-22 19:49:40'),
('0c3d7161-183d-4def-9cba-dd89ac6c0339', '08d22563-72e7-422e-8936-a19e7db59909', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:01:46', '2026-02-22 15:33:22', '2026-02-22 19:01:46'),
('0d0323ff-a380-4b5a-93f6-2b8076fa680e', '949ea38b-8148-4759-b77f-e8b2d698009c', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:21', '2026-02-21 19:45:54', '2026-02-22 19:51:21'),
('0d130658-b6de-407f-9119-c6aaa43f501a', 'dad29bef-63c5-4120-b37f-3874c4e4c31d', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:52:40', '2026-02-24 14:36:52', '2026-02-24 14:52:40'),
('0d1badef-979a-4346-8909-0603fdb8d7ce', '68dd74db-6f50-48f0-ae4d-febcf192bd44', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:18', '2026-02-22 07:38:22', '2026-02-22 19:51:18'),
('0d33e607-fded-4c58-84a8-6203a692bf57', '25c6598e-dbf2-4857-87bd-9861ba7e5a9f', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-23 12:20:45', '2026-02-23 12:17:43', '2026-02-23 12:20:45'),
('0ee5ee7f-6d99-4605-a147-df0a5583468e', 'e96c7bf6-29ce-494a-bc3f-0fdf4e354f20', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 2, 'approved', '', 1, '2026-02-22 19:53:11', '2026-02-22 19:48:24', '2026-02-22 19:53:11'),
('0f091b87-5d7d-4f99-a1ad-22235d08cf40', 'a4661d16-0053-4129-9466-7922460e454c', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 19:49:42', '2026-02-21 21:14:42', '2026-02-22 19:49:42'),
('0f2f08a8-86ae-458f-8cd2-a6b488c1932a', 'fd3c336d-3af0-46c4-b228-eaf13b72ad90', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 21:45:21', '2026-02-22 21:42:07', '2026-02-22 21:45:21'),
('0f7ccc75-1cb1-4db8-bc0a-a3f53df596d3', 'b7434892-f435-4b1e-8b44-d04aa0ded4ba', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-22 19:55:01', '2026-02-22 15:33:22', '2026-02-22 19:55:01'),
('1029f1e6-41fb-4ed2-b614-1de6564da790', 'a5a4f4a5-3ad8-4165-aeaa-a5d81bf9de58', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 09:48:40', '2026-02-22 09:44:16', '2026-02-22 09:48:40'),
('11666759-1356-4f60-b256-2d15e7ad28e1', '8c3147a7-c281-4ce5-bbff-1901b70ea40c', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'pending', NULL, 1, NULL, '2026-02-22 13:50:34', '2026-02-22 13:50:34'),
('11ed2d35-12e6-4f07-bf75-0b504e24b6aa', 'dfd56a86-1763-4095-9237-c8a27b654fa9', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:54:50', '2026-02-22 07:27:19', '2026-02-22 19:54:50'),
('12cb2be5-fcf2-4191-a8db-1dba9e910898', '3fc100db-b114-460b-ad24-4216e2b69c49', 'u-emp-04', NULL, 1, 'returned', 'ssdsdsdsd', 1, '2026-02-22 15:04:22', '2026-02-22 14:41:24', '2026-02-22 15:04:22'),
('131f4a20-b601-4891-8fd7-f3f0d3704b96', 'b7434892-f435-4b1e-8b44-d04aa0ded4ba', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-22 19:50:29', '2026-02-22 15:33:22', '2026-02-22 19:50:29'),
('1385e694-97eb-47a7-a838-3a873540ff80', '8f399308-63cc-4637-93fc-a4aeb63ea204', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'pending', NULL, 0, NULL, '2026-02-24 14:03:14', '2026-02-24 14:03:14'),
('1424c834-a625-46a5-bf6b-a6e298c96e49', '3bcb7d22-b1f5-4f21-bd80-a6e3e78fd577', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-22 21:46:15', '2026-02-22 21:42:22', '2026-02-22 21:46:15'),
('148b0042-1940-4630-8401-85d44846381c', '1e51adce-4cf7-4493-9c4c-fd43d228b12d', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:13:56', '2026-02-24 13:54:48', '2026-02-24 14:13:56'),
('156d50f6-494e-4faf-bbe2-82e158f58d7d', 'cc5c11fe-3b97-4a0f-8519-2d0af50b280b', 'u-emp-05', NULL, 1, 'approved', '', 1, '2026-02-22 19:02:42', '2026-02-22 15:33:22', '2026-02-22 19:02:42'),
('15ecfb7b-59a8-4b5f-96cf-1e903630efd3', '1ef233a9-412e-4973-9416-2ad07bb49eab', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-24 08:29:02', '2026-02-24 08:27:09', '2026-02-24 08:29:02'),
('16d7428c-8dd0-4be5-ac6a-de88b6739322', 'c389bd68-d0d3-49be-92fc-9993aecea16f', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-24 08:08:38', '2026-02-24 08:07:36', '2026-02-24 08:08:38'),
('1884235d-9634-419b-91fc-bcd7c883fa0c', '34ab222d-e42e-4240-a905-b9df99e18a0b', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 21:45:47', '2026-02-22 21:40:18', '2026-02-22 21:45:47'),
('1aa92aa3-9d47-431d-aeed-54d15277f6b4', '3ea78a54-e2e8-4b59-9fbe-1be534bd9d18', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:13', '2026-02-22 19:48:24', '2026-02-22 19:49:13'),
('1bb7ba31-f6d8-402e-8709-c3b073b81813', '87fe22dd-2f19-4ee6-952a-1ee8662484d8', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 09:07:45', '2026-02-22 08:59:51', '2026-02-22 09:07:45'),
('1c78a2a7-8dfe-4a51-bb36-426d4139a423', '08687b08-b276-4dde-92c8-5dfabbcf9929', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-23 11:38:59', '2026-02-22 22:32:30', '2026-02-23 11:38:59'),
('1de6ebd6-1c2f-4503-a6db-4fb5ae4edab6', 'a58bc426-f470-4c93-8b8a-15d135417740', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 13:52:58', '2026-02-24 13:52:54', '2026-02-24 13:52:58'),
('1e04df9f-f661-4f34-ac22-8b0de262a282', '45864d6b-83bf-48f5-9703-28faa8b5f42f', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 13:16:26', '2026-02-24 09:01:24', '2026-02-24 13:16:26'),
('1e36712c-7b10-4b37-a28f-5e8bcef8e7ba', '06e118f3-1c7d-4339-afed-f4beab881011', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 15:04:57', '2026-02-22 14:33:14', '2026-02-22 15:04:57'),
('1f348bd6-bafc-4796-ae9b-0ad66424e19b', 'f2291993-b214-40aa-a08d-bd4921eaf0ff', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:54:59', '2026-02-21 23:44:36', '2026-02-22 19:54:59'),
('1f9486e1-c524-450f-9223-0e2de90b5cf4', '385722a0-f326-40bf-a64f-44b9eb43b9d9', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-24 08:05:50', '2026-02-24 08:00:57', '2026-02-24 08:05:50'),
('1fd9c9ef-6ef3-452d-bb69-a1116c792049', '183c47ea-1d1f-45b2-95c2-4dcc97001e27', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:00:37', '2026-02-22 15:33:22', '2026-02-22 19:00:37'),
('215978d7-1962-4b1e-80cb-c81adb38d2b0', '1ef233a9-412e-4973-9416-2ad07bb49eab', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-24 08:27:46', '2026-02-24 08:27:09', '2026-02-24 08:27:46'),
('23526387-d246-43e0-b445-293a40fafe39', '70402a1a-0731-4a92-b51f-64f47cbbff0a', 'u-emp-03', NULL, 1, 'approved', 'تجربة ارجاع الطلب', 1, '2026-02-22 12:49:43', '2026-02-22 12:48:07', '2026-02-22 12:49:43'),
('23d61f6b-b628-4ef0-8010-c2f27410f91f', '25c6598e-dbf2-4857-87bd-9861ba7e5a9f', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-23 12:18:35', '2026-02-23 12:17:43', '2026-02-23 12:18:35'),
('2422640d-ce67-4fef-a740-fd854ef45905', 'f2291993-b214-40aa-a08d-bd4921eaf0ff', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:53:13', '2026-02-21 23:44:36', '2026-02-22 19:53:13'),
('244615c6-e5bd-4d39-8707-65687f6d88a0', 'd9d4c2b0-a550-4987-a8f5-fcb4c6d152ca', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 15:02:56', '2026-02-22 14:32:42', '2026-02-22 15:02:56'),
('250494ea-abd2-4711-a274-035b39fec1d7', '68dd74db-6f50-48f0-ae4d-febcf192bd44', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:52:46', '2026-02-22 07:38:22', '2026-02-22 19:52:46'),
('2603c0b3-1b0c-44c8-97d1-1d7d605fc9c5', '25c6598e-dbf2-4857-87bd-9861ba7e5a9f', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-23 12:18:49', '2026-02-23 12:17:43', '2026-02-23 12:18:49'),
('26ad9213-83fd-4290-a138-b74a02fd13e7', '3bcb7d22-b1f5-4f21-bd80-a6e3e78fd577', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-22 21:44:38', '2026-02-22 21:42:22', '2026-02-22 21:44:38'),
('26df4813-f11e-4b26-8be6-6cac0ef8e47e', '1ef233a9-412e-4973-9416-2ad07bb49eab', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-24 08:28:08', '2026-02-24 08:27:09', '2026-02-24 08:28:08'),
('27be306f-3185-4c1f-b563-b341ef4cc3cb', '40f092e4-460d-42fe-bde4-007877c79bd5', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:32', '2026-02-22 19:48:24', '2026-02-22 19:50:32'),
('27c7c3fe-1994-483d-b5e3-d57f8495bb1a', '296c26b3-5f89-47f4-92d0-69e4ba642f41', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-22 19:50:33', '2026-02-22 19:48:24', '2026-02-22 19:50:33'),
('29aec52d-dad3-4688-93b0-a45c1165273a', '6465c278-0446-4cd6-8fb4-30369ba807db', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:52:42', '2026-02-22 19:48:24', '2026-02-22 19:52:42'),
('29d0efe0-3d6d-43fd-b4c8-9ba57084e9f1', '40f092e4-460d-42fe-bde4-007877c79bd5', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:09', '2026-02-22 19:48:24', '2026-02-22 19:51:09'),
('29e77a1d-f241-4163-ae32-a2f5e4d503b6', '157bac6d-7abf-4030-bd91-e70826c8f00d', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 1, '2026-02-22 19:53:40', '2026-02-22 15:33:22', '2026-02-22 19:53:40'),
('2bcad90d-2567-4660-a92a-82dc4ebe2d3e', 'a58bc426-f470-4c93-8b8a-15d135417740', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:52:58', '2026-02-24 13:52:54', '2026-02-24 13:52:58'),
('2c0f916d-9667-4b35-80d2-fdcf02ec50ea', '96707c0c-0505-468a-8c4f-7c3845a0c066', 'u-emp-03', NULL, 1, 'approved', '', 1, '2026-02-22 13:18:38', '2026-02-22 13:18:12', '2026-02-22 13:18:38'),
('2c32a1c5-18f1-4081-85fa-cc2518545905', '0a8729ef-e5ab-426d-911a-5b0c8d8a743e', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-23 11:42:20', '2026-02-23 11:31:07', '2026-02-23 11:42:20'),
('2c3da64d-66ad-4cc4-aabb-23440c7903c6', 'fc29fc8d-1537-4c3a-abad-b2a81cb423f8', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-24 07:52:08', '2026-02-24 07:51:00', '2026-02-24 07:52:08'),
('2c4bca92-6e29-4cd8-8874-dfce941be954', '53cd9cc5-ab77-4d63-bea8-be2db9ca4731', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:00:39', '2026-02-22 15:33:22', '2026-02-22 19:00:39'),
('2d4fb4b3-fb91-4cd5-9377-c910814bb31b', 'c0ec8ae0-3e68-4a4b-8802-d0081679001a', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-23 11:39:02', '2026-02-23 07:22:45', '2026-02-23 11:39:02'),
('2d940e65-3a6e-42fc-aeb6-6243af06dff6', '0c7c5fc8-472f-4817-964a-18878942af34', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 21:45:07', '2026-02-22 19:48:24', '2026-02-22 21:45:07'),
('2dc96508-a1d3-4eae-a3f2-89aa1c79634a', '296c26b3-5f89-47f4-92d0-69e4ba642f41', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-22 19:52:31', '2026-02-22 19:48:24', '2026-02-22 19:52:31'),
('2ed44444-5676-424c-a4b7-410607da5a29', '1359007f-7e90-4f20-b246-755d886d9ef4', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'pending', NULL, 1, NULL, '2026-02-24 13:20:40', '2026-02-24 13:20:40'),
('2ee0972e-b83d-4795-915f-ed455f5f1a70', '6a2542be-2f5b-4529-bbfc-21e3b7d638be', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 15:35:37', '2026-02-24 15:35:31', '2026-02-24 15:35:37'),
('2f9397e7-0bbc-4993-9bc3-87d526392e22', 'd572a5d5-9622-49f3-98ed-b3667319ecd0', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:44', '2026-02-22 14:40:02', '2026-02-22 19:49:44'),
('2fad49d9-ed09-42ea-ab69-e1417ab1f064', 'a5a4f4a5-3ad8-4165-aeaa-a5d81bf9de58', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 09:47:41', '2026-02-22 09:44:16', '2026-02-22 09:47:41'),
('30309d1f-36b1-484b-89b3-f8ed00389b3f', 'a17ca85d-f8e6-47ac-9ef6-4618d94fbf62', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:22', '2026-02-22 19:48:24', '2026-02-22 19:51:22'),
('30cc3c2e-cc55-4615-85f2-9c80834eccca', 'fc29fc8d-1537-4c3a-abad-b2a81cb423f8', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-24 07:52:54', '2026-02-24 07:51:00', '2026-02-24 07:52:54'),
('31573e94-7ec3-480e-8e26-14957dce3436', '0dda34b4-eb8b-48a0-9515-c5559a8430f6', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-24 23:51:20', '2026-02-24 23:51:01', '2026-02-24 23:51:20'),
('318f2202-1c89-4489-9e0e-466c77347c16', 'cc0de676-7802-45b5-baa2-b44447f26e54', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:53:00', '2026-02-21 21:26:02', '2026-02-22 19:53:00'),
('31bf0436-45ce-4cef-9e06-e3bae12f3f0b', 'c8af914e-3d4d-4875-a166-4db9fb48eb63', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:43', '2026-02-24 09:07:38', '2026-02-24 13:53:43'),
('322001f9-96f8-4c93-8c2a-d367b90f48c5', '7aaeaa70-e94c-4049-9131-2a3a14fbc0ec', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:26', '2026-02-24 09:07:18', '2026-02-24 13:53:26'),
('32376433-7426-4cbe-b621-c6ad897ced46', '65df2c6e-ff5d-42d2-ba35-af2dcd2fc642', 'u-emp-03', NULL, 1, 'approved', '', 1, '2026-02-22 19:50:35', '2026-02-22 19:48:24', '2026-02-22 19:50:35'),
('328df4a0-6b18-45de-8536-8a287900c035', '89d87b05-436b-4ad5-9c7c-d0d2465cf78b', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-25 07:23:29', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('329001a1-c186-4758-bd03-e49215de30a1', 'b7434892-f435-4b1e-8b44-d04aa0ded4ba', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-22 15:34:41', '2026-02-22 15:33:22', '2026-02-22 15:34:41'),
('32a2a406-5719-4884-b6f9-cef87ac7dd9f', '08d22563-72e7-422e-8936-a19e7db59909', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:02:18', '2026-02-22 15:33:22', '2026-02-22 19:02:18'),
('33ec5443-0375-41fa-822b-b29ef3c77f67', '8f399308-63cc-4637-93fc-a4aeb63ea204', 'u-emp-03', NULL, 3, 'pending', NULL, 1, NULL, '2026-02-24 14:03:14', '2026-02-24 14:03:14'),
('350523e6-967a-4288-8b95-0771196299e2', '29d39f32-4243-490c-a8c2-647ba4faf74f', 'u-emp-04', NULL, 1, 'approved', '', 1, '2026-02-22 15:04:11', '2026-02-21 16:28:56', '2026-02-22 15:04:11'),
('36acbde6-7339-4d48-8caa-cf9aaf8a80bc', '385722a0-f326-40bf-a64f-44b9eb43b9d9', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-24 08:05:00', '2026-02-24 08:00:57', '2026-02-24 08:05:00'),
('3a9d3582-42ff-4317-90a1-5c59aeea416a', '89d87b05-436b-4ad5-9c7c-d0d2465cf78b', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 1, '2026-02-25 07:23:02', '2026-02-25 07:21:27', '2026-02-25 07:23:02'),
('3c493a40-e55e-47e4-a184-555dd8ab9305', '13043b3a-c70f-4e05-a713-6e0c888ff7df', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'pending', NULL, 1, NULL, '2026-02-22 14:42:24', '2026-02-22 14:42:24'),
('3cd08ab8-631e-431f-b3ef-caee9e23c5bb', 'f5ac6a0b-a4d9-4547-aead-bec0670486b8', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'pending', NULL, 1, NULL, '2026-02-24 13:17:20', '2026-02-24 13:17:20'),
('3d1c2839-01e9-46ee-8c83-bbce64d8c5bf', 'fc29fc8d-1537-4c3a-abad-b2a81cb423f8', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-24 07:52:25', '2026-02-24 07:51:00', '2026-02-24 07:52:25'),
('3dc88681-e14c-42e5-93ac-c6fa17bc8fa2', '08687b08-b276-4dde-92c8-5dfabbcf9929', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-23 11:39:30', '2026-02-22 22:32:30', '2026-02-23 11:39:30'),
('3ef3ee87-9726-4887-b070-04852b8f19e9', 'dad29bef-63c5-4120-b37f-3874c4e4c31d', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:52:40', '2026-02-24 14:36:52', '2026-02-24 14:52:40'),
('404f39bf-1380-4aa5-93b8-a11c86cb3898', 'd9d4c2b0-a550-4987-a8f5-fcb4c6d152ca', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 15:05:11', '2026-02-22 14:32:42', '2026-02-22 15:05:11'),
('40bd7e3e-9f15-489c-a31b-9752a270e73d', '70402a1a-0731-4a92-b51f-64f47cbbff0a', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'test', 0, '2026-02-22 12:51:25', '2026-02-22 12:48:07', '2026-02-22 12:51:25'),
('41ce6d06-adc6-45d4-9976-5a7f80fbed7f', '141ad61f-88bd-4008-b36b-2a45310cbb7c', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-21 19:33:10', '2026-02-21 19:33:10'),
('41d1ad02-00d2-49f6-9589-39e6ace908f1', '65df2c6e-ff5d-42d2-ba35-af2dcd2fc642', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:52:44', '2026-02-22 19:48:24', '2026-02-22 19:52:44'),
('43ad649d-5354-4ae4-b36c-35defc06a4d9', '34ab222d-e42e-4240-a905-b9df99e18a0b', 'u-emp-06', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 1, 'approved', '', 1, '2026-02-22 21:44:08', '2026-02-22 21:40:18', '2026-02-22 21:44:08'),
('43e3fcb5-c200-4ab4-902b-bd5fed2ea78b', 'c8af914e-3d4d-4875-a166-4db9fb48eb63', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 13:53:43', '2026-02-24 09:07:38', '2026-02-24 13:53:43'),
('448b08ef-0e2f-4e9c-89f9-660f53782568', 'd87a0969-c6c7-49e1-ae24-5bcb57488b0c', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 2, 'approved', '', 1, '2026-02-22 19:02:00', '2026-02-22 15:33:22', '2026-02-22 19:02:00'),
('458979ce-efb5-4e39-a764-abc9729b7fbb', '00d521d7-8eae-4d89-b82b-e7232aa600c4', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-25 21:31:47', '2026-02-25 21:31:47'),
('45a9bb20-aa2c-4d0e-87ba-fe37a6c20c07', '576d9c1a-2e16-4e76-b739-0dda60059bda', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-21 19:26:44', '2026-02-21 19:26:44'),
('464aa655-2150-4234-af71-c72c88114a94', 'dcc2424e-6632-42a8-a20c-58524c723b98', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'pending', NULL, 1, NULL, '2026-02-25 21:31:47', '2026-02-25 21:31:47'),
('473e8938-03bd-47be-914f-85bd2ad58c75', '3a5c0b0e-d655-4e88-b663-53f678c4da3c', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 15:05:07', '2026-02-21 20:09:49', '2026-02-22 15:05:07'),
('487c5117-8bc3-430c-99fd-b76a78f34cf0', '0a8729ef-e5ab-426d-911a-5b0c8d8a743e', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-23 11:39:32', '2026-02-23 11:31:07', '2026-02-23 11:39:32'),
('492d7a0c-144b-49db-a8b1-4d2fc07e5a7a', '183c47ea-1d1f-45b2-95c2-4dcc97001e27', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:02:27', '2026-02-22 15:33:22', '2026-02-22 19:02:27'),
('4a6272e3-87b5-445c-b3e5-c37fa30c2544', '8f399308-63cc-4637-93fc-a4aeb63ea204', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'pending', NULL, 1, NULL, '2026-02-24 14:03:14', '2026-02-24 14:03:14'),
('4b1e3158-0e47-47da-80bf-6bfe073f3a66', 'f2291993-b214-40aa-a08d-bd4921eaf0ff', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:46', '2026-02-21 23:44:36', '2026-02-22 19:49:46'),
('4b443c60-e500-4efa-9f3b-15ec42c66aca', '68dd74db-6f50-48f0-ae4d-febcf192bd44', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:36', '2026-02-22 07:38:22', '2026-02-22 19:50:36'),
('4b516d2f-725c-4d92-9161-dc5311d13caa', 'bb2b43f1-353e-4a2a-8ea4-2cd099967867', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:02:46', '2026-02-22 15:33:22', '2026-02-22 19:02:46'),
('4b6f4bfd-3c95-4052-9076-a21168876bca', '3bcb7d22-b1f5-4f21-bd80-a6e3e78fd577', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-22 21:45:18', '2026-02-22 21:42:22', '2026-02-22 21:45:18'),
('4b988110-ced5-4525-839b-441917d3422d', '34ab222d-e42e-4240-a905-b9df99e18a0b', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 21:45:14', '2026-02-22 21:40:18', '2026-02-22 21:45:14'),
('4bf6c7df-4e6e-4b4e-8e1d-bc34563acdf3', '23399a20-4f5b-4df7-81d5-a2ed58cc6c45', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:47', '2026-02-22 13:50:04', '2026-02-22 19:49:47'),
('4c65e80b-0bf6-4a22-9b33-6e6270e64c4d', '13043b3a-c70f-4e05-a713-6e0c888ff7df', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'pending', NULL, 0, NULL, '2026-02-22 14:42:24', '2026-02-22 14:42:24'),
('4e65a989-f6dc-48c1-a274-f21023608a87', '1e51adce-4cf7-4493-9c4c-fd43d228b12d', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:13:56', '2026-02-24 13:54:48', '2026-02-24 14:13:56'),
('4ebedb59-c967-43cc-88e0-5318e4fde3d7', '58383a0e-1d1e-4863-b404-b29a5fdbf246', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:01:07', '2026-02-22 15:33:22', '2026-02-22 19:01:07'),
('500621a5-31b9-4f31-baa9-6937a048a96c', '00d521d7-8eae-4d89-b82b-e7232aa600c4', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'pending', NULL, 1, NULL, '2026-02-25 21:31:47', '2026-02-25 21:31:47'),
('505b91ac-191f-419f-8e96-fd720fa5e472', 'c0ec8ae0-3e68-4a4b-8802-d0081679001a', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-23 11:42:53', '2026-02-23 07:22:45', '2026-02-23 11:42:53'),
('507a2600-419d-45b6-890c-51ae1c52d236', '385722a0-f326-40bf-a64f-44b9eb43b9d9', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-24 08:06:08', '2026-02-24 08:00:57', '2026-02-24 08:06:08'),
('53209b70-7e28-4ef8-a609-4c055e5d2dec', 'dad29bef-63c5-4120-b37f-3874c4e4c31d', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:52:40', '2026-02-24 14:36:52', '2026-02-24 14:52:40'),
('54fbb7eb-f8c3-48c2-b40e-a58b3b4c510b', '88842d05-3b99-4f83-85c5-0af1614df993', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:49', '2026-02-21 20:48:16', '2026-02-22 19:49:49'),
('556a7399-d11c-4a90-814b-3f6e87af9168', '8c3147a7-c281-4ce5-bbff-1901b70ea40c', 'u-emp-03', NULL, 1, 'approved', '', 1, '2026-02-22 15:03:03', '2026-02-22 13:50:34', '2026-02-22 15:03:03'),
('5584446b-88a2-45f0-b63d-06d6b2b9e352', '370685a1-9fd7-49e7-80da-ddc8cdcb57ba', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 21:45:16', '2026-02-22 19:48:24', '2026-02-22 21:45:16'),
('57a69b61-36cb-4876-a126-02cc400c0660', '0a8729ef-e5ab-426d-911a-5b0c8d8a743e', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-23 11:39:05', '2026-02-23 11:31:07', '2026-02-23 11:39:05'),
('57c1d5f8-6117-4e01-9aa4-5f2be5c71e83', '7aaeaa70-e94c-4049-9131-2a3a14fbc0ec', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:26', '2026-02-24 09:07:18', '2026-02-24 13:53:26'),
('58c7fa96-1442-49a9-b6c3-c8c4728cecac', 'f5ac6a0b-a4d9-4547-aead-bec0670486b8', 'u-emp-03', NULL, 2, 'pending', NULL, 1, NULL, '2026-02-24 13:17:20', '2026-02-24 13:17:20'),
('596058f3-c8aa-435e-870b-400d313c81c3', 'a4661d16-0053-4129-9466-7922460e454c', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:55:09', '2026-02-21 21:14:42', '2026-02-22 19:55:09'),
('5a486829-2553-430a-a9ca-71225601d69e', '843e8ac8-bdcc-46a3-8651-355316de4c18', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'pending', NULL, 0, NULL, '2026-02-22 14:40:46', '2026-02-22 14:40:46'),
('5aad6144-e445-4127-a644-ef46cdfd76e3', 'fd3c336d-3af0-46c4-b228-eaf13b72ad90', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 21:46:17', '2026-02-22 21:42:07', '2026-02-22 21:46:17'),
('5b4f2aef-7e36-41f7-933d-2b3fc18427de', '1baeb022-ad20-40ec-a9e3-185cd06aa8e0', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'pending', NULL, 1, NULL, '2026-02-25 21:34:05', '2026-02-25 21:34:05'),
('5ba7c557-5899-4d1d-a04c-35aefe112efe', 'c8af914e-3d4d-4875-a166-4db9fb48eb63', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:43', '2026-02-24 09:07:38', '2026-02-24 13:53:43'),
('5bec2de9-6c84-4e66-8ce0-711b51914d96', '11078d23-dbf4-4d32-8360-94fda53679fc', NULL, '978f139b-e1bf-43b9-a924-2eb12537c2aa', 1, 'pending', NULL, 1, NULL, '2026-02-24 23:37:44', '2026-02-24 23:37:44'),
('5c5a5353-82d8-4045-9d27-fe95132ecadd', '3253063f-9ed2-4802-b95f-3b95d690eaed', 'u-emp-03', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 1, 'approved', '', 1, '2026-02-22 21:44:40', '2026-02-22 21:39:57', '2026-02-22 21:44:40'),
('5c5da88a-9782-4f7b-80af-fed47035b794', '6203f730-c9bf-4413-a88c-be7e728f9734', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 1, '2026-02-22 19:55:22', '2026-02-22 19:48:24', '2026-02-22 19:55:22'),
('5c92f831-9251-43aa-a269-55db7071869a', 'd572a5d5-9622-49f3-98ed-b3667319ecd0', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:38', '2026-02-22 14:40:02', '2026-02-22 19:50:38'),
('5cbefaf4-f2af-449d-82bd-eb40422c05e5', '296c26b3-5f89-47f4-92d0-69e4ba642f41', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-22 19:53:50', '2026-02-22 19:48:24', '2026-02-22 19:53:50'),
('5ea60079-7a68-4175-9d80-a6428759bed1', '1ef233a9-412e-4973-9416-2ad07bb49eab', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-24 08:28:28', '2026-02-24 08:27:09', '2026-02-24 08:28:28'),
('5ee1a155-bf99-4a16-91ea-6825dd27d78d', '9a0964ff-988f-4c63-a9bb-d3509dc113c3', 'u-emp-03', NULL, 2, 'pending', NULL, 1, NULL, '2026-02-24 09:04:57', '2026-02-24 09:04:57'),
('6029b6ee-7b5a-4297-b015-31d8d207ca5f', '509b0d3b-f99b-4cdd-963d-15a3586b46b6', 'u-emp-03', NULL, 1, 'approved', '', 1, '2026-02-22 19:50:40', '2026-02-22 19:48:24', '2026-02-22 19:50:40'),
('603c24d3-2a35-4470-a6a2-010b152bbd74', 'e1736fee-70ad-4896-9c52-fd9facbaa344', NULL, '978f139b-e1bf-43b9-a924-2eb12537c2aa', 1, 'pending', NULL, 1, NULL, '2026-02-24 23:38:47', '2026-02-24 23:38:47'),
('609d4586-79e5-4f02-8059-1a6dc98d8b08', '23399a20-4f5b-4df7-81d5-a2ed58cc6c45', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:03', '2026-02-22 13:50:04', '2026-02-22 19:51:03'),
('6102e00b-d593-4773-86ef-b90bcc37f16d', '7d3cc7ab-92a0-4fa6-8fbe-cf32a8ed8e18', 'u-admin-01', NULL, 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:19:15', '2026-02-22 14:33:45', '2026-02-24 13:19:15'),
('61139d1f-071e-4d69-8193-8c4ad0443a1a', '3ea78a54-e2e8-4b59-9fbe-1be534bd9d18', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-22 19:50:42', '2026-02-22 19:48:24', '2026-02-22 19:50:42'),
('64ca337f-2da2-4697-b529-ab2496243bfb', 'a5a4f4a5-3ad8-4165-aeaa-a5d81bf9de58', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 09:47:26', '2026-02-22 09:44:16', '2026-02-22 09:47:26'),
('650b072e-8f8d-494f-b9ce-ec2d2d7f1e8f', '1baeb022-ad20-40ec-a9e3-185cd06aa8e0', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-25 21:34:05', '2026-02-25 21:34:05'),
('661df3e1-e7b2-4ab7-a6c4-9549aeff3220', '29d39f32-4243-490c-a8c2-647ba4faf74f', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 15:04:14', '2026-02-21 16:28:56', '2026-02-22 15:04:14'),
('66507e79-3434-4781-8e0a-d97b4aa99d6a', '0a8729ef-e5ab-426d-911a-5b0c8d8a743e', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-23 11:39:50', '2026-02-23 11:31:07', '2026-02-23 11:39:50'),
('66fdd123-12d0-4187-9e98-6fb890b0d594', '31e778c4-66fc-4d08-a954-4cd2e43a1b0e', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-25 21:33:53', '2026-02-25 21:33:53'),
('6713de64-a812-4fa6-b98b-efffb7e3a1e0', '6b244139-d197-4e99-88c2-2bb91ca42bb8', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-21 17:40:01', '2026-02-21 17:40:01'),
('6830c8d5-0516-41ed-ab5d-ef53b483d7d6', '0a8729ef-e5ab-426d-911a-5b0c8d8a743e', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-23 11:42:50', '2026-02-23 11:31:07', '2026-02-23 11:42:50'),
('6969a120-9307-4ed6-ad1b-acabdd3e81fd', 'cc5c11fe-3b97-4a0f-8519-2d0af50b280b', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:53:02', '2026-02-22 15:33:22', '2026-02-22 19:53:02'),
('69962fc9-f996-48e6-b208-76f84999d49c', '6465c278-0446-4cd6-8fb4-30369ba807db', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:43', '2026-02-22 19:48:24', '2026-02-22 19:50:43'),
('6bcad4ec-ca70-4898-b255-ce70c751c8b1', 'f5ac6a0b-a4d9-4547-aead-bec0670486b8', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'pending', NULL, 0, NULL, '2026-02-24 13:17:20', '2026-02-24 13:17:20'),
('6c9a8b2c-0c38-4229-9999-478b6eab17c5', '34ab222d-e42e-4240-a905-b9df99e18a0b', 'u-emp-03', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 2, 'approved', '', 1, '2026-02-22 21:44:42', '2026-02-22 21:40:18', '2026-02-22 21:44:42'),
('6cdaa60a-5a7e-47a5-a78c-dcd664032e7e', 'e96c7bf6-29ce-494a-bc3f-0fdf4e354f20', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 1, '2026-02-22 19:54:53', '2026-02-22 19:48:24', '2026-02-22 19:54:53'),
('6d12b1de-ac5d-42d3-b25d-c1be377e409a', '6a2542be-2f5b-4529-bbfc-21e3b7d638be', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 15:35:37', '2026-02-24 15:35:31', '2026-02-24 15:35:37'),
('6d426af7-5ecc-42f4-995c-8ccff893c4fe', 'c0ec8ae0-3e68-4a4b-8802-d0081679001a', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-23 11:39:52', '2026-02-23 07:22:45', '2026-02-23 11:39:52'),
('6d525108-03d3-4200-b27a-42dec45f220f', '6203f730-c9bf-4413-a88c-be7e728f9734', 'u-emp-04', NULL, 1, 'approved', '', 1, '2026-02-22 19:51:13', '2026-02-22 19:48:24', '2026-02-22 19:51:13'),
('6d98ef13-f9bf-4754-bad0-ae48506d73d7', '8f399308-63cc-4637-93fc-a4aeb63ea204', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'pending', NULL, 1, NULL, '2026-02-24 14:03:14', '2026-02-24 14:03:14'),
('6e3096f8-763d-4052-8bcf-02823e5fbd91', 'ac7e0be9-f2b3-46fc-8198-6069a5eb0ed3', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-23 11:39:34', '2026-02-23 09:45:00', '2026-02-23 11:39:34'),
('6eebde9b-fe35-41d4-a9ee-2af453d53954', '32754ef1-e268-4b96-ae8c-e1bf4387fea8', 'u-emp-06', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 1, 'approved', '', 1, '2026-02-22 21:44:10', '2026-02-22 21:10:26', '2026-02-22 21:44:10'),
('6f4fb009-c96a-41cf-be59-5ef6376b2ab8', 'cc0de676-7802-45b5-baa2-b44447f26e54', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:54:47', '2026-02-21 21:26:02', '2026-02-22 19:54:47'),
('6f5da299-db7d-4aa0-ba1b-8d9b6f3dab63', '25c6598e-dbf2-4857-87bd-9861ba7e5a9f', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-23 12:20:58', '2026-02-23 12:17:43', '2026-02-23 12:20:58'),
('7032a9f7-789c-4af6-a1d3-4f5cbcd9c4cd', 'a5a4f4a5-3ad8-4165-aeaa-a5d81bf9de58', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 09:46:20', '2026-02-22 09:44:16', '2026-02-22 09:46:20'),
('72004e42-383d-4fdb-bbe0-693f27527d11', '58383a0e-1d1e-4863-b404-b29a5fdbf246', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:02:35', '2026-02-22 15:33:22', '2026-02-22 19:02:35'),
('741d1ece-5259-47cd-95d4-38342881d252', '3fc100db-b114-460b-ad24-4216e2b69c49', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'pending', NULL, 1, NULL, '2026-02-22 14:41:24', '2026-02-22 14:41:24'),
('75ead550-3004-4c27-a9db-173673269b37', 'a4661d16-0053-4129-9466-7922460e454c', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:24', '2026-02-21 21:14:42', '2026-02-22 19:51:24'),
('7621b084-96b4-42ab-8f0d-1e7eded25880', '509b0d3b-f99b-4cdd-963d-15a3586b46b6', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:11', '2026-02-22 19:48:24', '2026-02-22 19:51:11'),
('77273f67-67f5-4691-a55f-0c8496c6833e', '949ea38b-8148-4759-b77f-e8b2d698009c', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:52:49', '2026-02-21 19:45:54', '2026-02-22 19:52:49'),
('796cfbc0-ca9d-4beb-b222-66dd7393ae63', '462a2ab4-2aa1-4766-86ea-de262ceaea55', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 13:20:05', '2026-02-24 09:06:33', '2026-02-24 13:20:05'),
('7bcf807e-4661-450d-9fc9-1e70a72ef5eb', '88842d05-3b99-4f83-85c5-0af1614df993', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:52:48', '2026-02-21 20:48:16', '2026-02-22 19:52:48'),
('7d744f33-4345-49ab-a37a-f7c82f7e489e', '08d22563-72e7-422e-8936-a19e7db59909', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:00:41', '2026-02-22 15:33:22', '2026-02-22 19:00:41'),
('7db9604d-2392-4920-b380-f5467a5f2cc0', '06e118f3-1c7d-4339-afed-f4beab881011', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 15:04:06', '2026-02-22 14:33:14', '2026-02-22 15:04:06'),
('7e21229c-5a19-4659-94a3-5788318f1221', '08d22563-72e7-422e-8936-a19e7db59909', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 15:44:36', '2026-02-22 15:33:22', '2026-02-22 15:44:36'),
('7ebac2fb-e079-47e9-a862-6de181067105', 'f5ac6a0b-a4d9-4547-aead-bec0670486b8', 'u-emp-06', NULL, 1, 'pending', NULL, 1, NULL, '2026-02-24 13:17:20', '2026-02-24 13:17:20'),
('7f09ece3-ffcf-49eb-88aa-d8937c473999', '96707c0c-0505-468a-8c4f-7c3845a0c066', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'pending', NULL, 0, NULL, '2026-02-22 13:18:12', '2026-02-22 13:18:12'),
('7f5b917f-e1b5-473a-8f8c-501b3ba5aba0', '6a2542be-2f5b-4529-bbfc-21e3b7d638be', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 15:35:37', '2026-02-24 15:35:31', '2026-02-24 15:35:37'),
('7fa7f134-8245-4a94-bbd9-67c26416ebd9', '183c47ea-1d1f-45b2-95c2-4dcc97001e27', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:01:02', '2026-02-22 15:33:22', '2026-02-22 19:01:02'),
('7ff1eb32-86e2-4733-b593-86cdfdfee666', 'dad29bef-63c5-4120-b37f-3874c4e4c31d', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 14:52:40', '2026-02-24 14:36:52', '2026-02-24 14:52:40'),
('802987b3-7f85-4597-a2f7-54a18affc105', '370685a1-9fd7-49e7-80da-ddc8cdcb57ba', 'u-emp-01', NULL, 1, 'approved', '', 1, '2026-02-22 19:52:33', '2026-02-22 19:48:24', '2026-02-22 19:52:33'),
('80dc8aed-700d-4396-ac48-d995fde8fb63', 'b989a472-24ae-4574-a023-e34736d634c4', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:52', '2026-02-22 14:17:38', '2026-02-22 19:49:52'),
('827d852d-fcaf-4b08-81da-931d3a7a9978', 'fc29fc8d-1537-4c3a-abad-b2a81cb423f8', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-24 07:53:08', '2026-02-24 07:51:00', '2026-02-24 07:53:08'),
('838350b1-a2e9-408c-959a-f4927fa15d99', '6465c278-0446-4cd6-8fb4-30369ba807db', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:54:07', '2026-02-22 19:48:24', '2026-02-22 19:54:07'),
('84cb6cb9-a8cb-41a8-9c23-7d1388906045', '949ea38b-8148-4759-b77f-e8b2d698009c', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:53', '2026-02-21 19:45:54', '2026-02-22 19:49:53'),
('87e685fd-ac2b-4b32-8a53-6a945b2a0cd2', '08687b08-b276-4dde-92c8-5dfabbcf9929', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-23 11:40:13', '2026-02-22 22:32:30', '2026-02-23 11:40:13'),
('88b7507a-eda5-4c6d-aefe-aab337911aec', 'ff395e1d-a574-4f02-b52b-6a0eb0c7225e', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 1, 'approved', '', 0, '2026-02-25 07:20:20', '2026-02-25 07:18:48', '2026-02-25 07:20:20'),
('89b950fc-964f-4df1-be24-39523174da5c', '3ea78a54-e2e8-4b59-9fbe-1be534bd9d18', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-22 19:51:07', '2026-02-22 19:48:24', '2026-02-22 19:51:07'),
('89e44b3a-28c4-4034-b6ad-4cdd802b5a7f', 'c8af914e-3d4d-4875-a166-4db9fb48eb63', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:43', '2026-02-24 09:07:38', '2026-02-24 13:53:43'),
('8b251cb4-d82f-4f65-bdf4-fb79e926d604', '3bcb7d22-b1f5-4f21-bd80-a6e3e78fd577', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-22 21:45:49', '2026-02-22 21:42:22', '2026-02-22 21:45:49'),
('8b68cc56-d59c-4e99-a51a-933d527233ae', 'a17ca85d-f8e6-47ac-9ef6-4618d94fbf62', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:44', '2026-02-22 19:48:24', '2026-02-22 19:50:44'),
('8bcbcff4-c44f-496c-bd75-65a8cdd95665', '1e51adce-4cf7-4493-9c4c-fd43d228b12d', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 14:13:56', '2026-02-24 13:54:48', '2026-02-24 14:13:56'),
('8bf0c91c-1086-4731-877d-a49907a97498', '53bc39ce-2f29-4176-8c32-aa4f51a1bbd1', NULL, '978f139b-e1bf-43b9-a924-2eb12537c2aa', 1, 'pending', NULL, 1, NULL, '2026-02-24 23:42:21', '2026-02-24 23:42:21'),
('8cec8518-3eca-47f3-a9d1-fadeab3e83c0', 'd87a0969-c6c7-49e1-ae24-5bcb57488b0c', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 1, '2026-02-22 19:02:39', '2026-02-22 15:33:22', '2026-02-22 19:02:39'),
('8e4d1829-5474-4ab2-8f85-e583c4176884', 'ac7e0be9-f2b3-46fc-8198-6069a5eb0ed3', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-23 11:39:07', '2026-02-23 09:45:00', '2026-02-23 11:39:07'),
('8e9d036a-7c95-4c0a-8698-61e6f8af5a4d', '40f092e4-460d-42fe-bde4-007877c79bd5', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:55', '2026-02-22 19:48:24', '2026-02-22 19:49:55'),
('8f271cb6-402a-4852-bbe1-fc1d0867f1c7', '62187e38-e60e-4c04-9f02-e5fd14bd597d', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 1, '2026-02-22 19:02:51', '2026-02-22 15:33:22', '2026-02-22 19:02:51'),
('8f405eca-f17d-47c1-abe8-5353e6b29c9f', 'b989a472-24ae-4574-a023-e34736d634c4', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:29', '2026-02-22 14:17:38', '2026-02-22 19:51:29'),
('8f4f3a21-cf00-4418-b0ff-8741a77d2b24', '6465c278-0446-4cd6-8fb4-30369ba807db', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:15', '2026-02-22 19:48:24', '2026-02-22 19:51:15'),
('8fd4fad7-a15a-4d38-8782-05a906faf55f', '7d3cc7ab-92a0-4fa6-8fbe-cf32a8ed8e18', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:19:15', '2026-02-22 14:33:45', '2026-02-24 13:19:15'),
('90e9b9c9-3059-4c9c-90c0-96747d88a7d8', 'ff395e1d-a574-4f02-b52b-6a0eb0c7225e', 'u-emp-04', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 1, '2026-02-25 07:20:22', '2026-02-25 07:18:48', '2026-02-25 07:20:22'),
('912e5f6b-b07b-4883-b3b3-37ae0957d816', '370685a1-9fd7-49e7-80da-ddc8cdcb57ba', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 1, '2026-02-22 21:46:13', '2026-02-22 19:48:24', '2026-02-22 21:46:13'),
('9144041b-3061-4cda-a61c-f1bf85ed4f4f', 'ec53e9e6-665e-46a1-b0ec-d41b70c4bc1f', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 1, '2026-02-22 21:45:20', '2026-02-22 21:09:28', '2026-02-22 21:45:20'),
('93674bc4-ba73-483a-88d0-e897f0faac36', 'e8372df1-dc94-4bb3-8cd2-f56dc59c28be', 'u-admin-01', '978f139b-e1bf-43b9-a924-2eb12537c2aa', 1, 'approved', '', 1, '2026-02-24 23:48:20', '2026-02-24 23:43:33', '2026-02-24 23:48:20'),
('93780eae-f765-4d48-a455-c31be77fee06', '25c6598e-dbf2-4857-87bd-9861ba7e5a9f', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-23 12:19:22', '2026-02-23 12:17:43', '2026-02-23 12:19:22'),
('93b280d6-a070-45dd-89a6-ca48dd215bc4', 'b35d4e86-2893-4c38-9918-b67265ba2873', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-22 15:34:44', '2026-02-22 15:33:22', '2026-02-22 15:34:44'),
('945db0b6-f8c8-4934-809b-a84207ac4d21', '7d3cc7ab-92a0-4fa6-8fbe-cf32a8ed8e18', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:19:15', '2026-02-22 14:33:45', '2026-02-24 13:19:15'),
('95796216-99a4-41ff-816d-8845c6bc7b76', '3a5c0b0e-d655-4e88-b663-53f678c4da3c', 'u-admin-01', NULL, 1, 'approved', '', 1, '2026-02-21 20:10:23', '2026-02-21 20:09:49', '2026-02-21 20:10:23'),
('9579a29a-a098-4d56-8ef0-387b399a5e2c', '0dda34b4-eb8b-48a0-9515-c5559a8430f6', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 1, '2026-02-24 23:51:18', '2026-02-24 23:51:01', '2026-02-24 23:51:18'),
('960bcf99-6458-4048-9ae6-a573dbc78cc1', '5e83aca4-137f-4aec-981b-fa2d0296f5f9', NULL, NULL, 1, 'approved', 'Approved by test script', 1, '2026-02-21 19:34:19', '2026-02-21 19:34:19', '2026-02-21 19:34:19'),
('96e06354-4666-48f7-b5e4-bca76d97915d', '96707c0c-0505-468a-8c4f-7c3845a0c066', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'pending', NULL, 1, NULL, '2026-02-22 13:18:12', '2026-02-22 13:18:12'),
('9be848e8-adcc-4416-865b-b1e1865d0a2e', 'd572a5d5-9622-49f3-98ed-b3667319ecd0', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:53:08', '2026-02-22 14:40:02', '2026-02-22 19:53:08'),
('9c878bbb-a1a0-4996-9119-04d80369819f', 'c719a4ad-f098-4c90-a1e2-2dab8afa2ffe', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'pending', NULL, 1, NULL, '2026-02-25 21:31:23', '2026-02-25 21:31:23'),
('9cbc4b55-43eb-44e8-ae02-88f4aee5b413', '1359007f-7e90-4f20-b246-755d886d9ef4', 'u-emp-03', NULL, 2, 'pending', NULL, 1, NULL, '2026-02-24 13:20:40', '2026-02-24 13:20:40'),
('9cdef5bc-8ced-458b-a885-23ccbc8e9594', '1359007f-7e90-4f20-b246-755d886d9ef4', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'pending', NULL, 1, NULL, '2026-02-24 13:20:40', '2026-02-24 13:20:40'),
('9d6e5338-0ef8-4ed1-a747-22c4bd417499', '13043b3a-c70f-4e05-a713-6e0c888ff7df', 'u-emp-01', NULL, 1, 'rejected', 'sdsdsds', 1, '2026-02-22 15:05:04', '2026-02-22 14:42:24', '2026-02-22 15:05:04'),
('9e1419be-af00-4dd3-905c-965b307094a8', '87fe22dd-2f19-4ee6-952a-1ee8662484d8', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 09:05:21', '2026-02-22 08:59:51', '2026-02-22 09:05:21'),
('9e188711-f972-41a9-9cdc-c97fa24ffa26', 'd572a5d5-9622-49f3-98ed-b3667319ecd0', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:54:49', '2026-02-22 14:40:02', '2026-02-22 19:54:49'),
('9e256989-0060-4e3d-9911-4d860932db3f', '3253063f-9ed2-4802-b95f-3b95d690eaed', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 21:46:10', '2026-02-22 21:39:57', '2026-02-22 21:46:10'),
('9e5439ca-723c-42cf-aa59-ad1e5183fb17', '509b0d3b-f99b-4cdd-963d-15a3586b46b6', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:54:04', '2026-02-22 19:48:24', '2026-02-22 19:54:04'),
('a0b00c99-65b2-4d3a-b40c-316b55acc2c0', '6465c278-0446-4cd6-8fb4-30369ba807db', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:56', '2026-02-22 19:48:24', '2026-02-22 19:49:56'),
('a103fb50-3c1d-44da-9984-a56ade4e5f23', 'ac7e0be9-f2b3-46fc-8198-6069a5eb0ed3', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-23 11:42:21', '2026-02-23 09:45:00', '2026-02-23 11:42:21'),
('a23b8587-4f62-489e-9569-c2bf3c8b49da', '70402a1a-0731-4a92-b51f-64f47cbbff0a', 'u-emp-01', NULL, 2, 'approved', 'test', 1, '2026-02-22 12:51:00', '2026-02-22 12:48:07', '2026-02-22 12:51:00'),
('a254764e-3d2d-4ce5-a563-494fc69bf0c0', 'c0ec8ae0-3e68-4a4b-8802-d0081679001a', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-23 11:42:23', '2026-02-23 07:22:45', '2026-02-23 11:42:23'),
('a2b0c2d1-c834-4a01-afc7-883b165efc22', '87fe22dd-2f19-4ee6-952a-1ee8662484d8', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'returned', 'تجربة الارجاع للمراجعة', 1, '2026-02-22 09:09:05', '2026-02-22 08:59:51', '2026-02-22 09:09:05'),
('a3206b8a-0c90-44f3-8f58-34200cfb4f0f', '8f399308-63cc-4637-93fc-a4aeb63ea204', 'u-emp-06', NULL, 2, 'pending', NULL, 1, NULL, '2026-02-24 14:03:14', '2026-02-24 14:03:14'),
('a341cb16-a8de-40c2-ad92-8116125e5a43', '0a8729ef-e5ab-426d-911a-5b0c8d8a743e', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-23 11:40:14', '2026-02-23 11:31:07', '2026-02-23 11:40:14'),
('a35b6636-dc01-438a-99ab-82841e9b1b16', 'c0ec8ae0-3e68-4a4b-8802-d0081679001a', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-23 11:40:18', '2026-02-23 07:22:45', '2026-02-23 11:40:18'),
('a3b38ddc-4d22-403a-89a5-13fee40dc56f', 'fd3c336d-3af0-46c4-b228-eaf13b72ad90', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 21:45:50', '2026-02-22 21:42:07', '2026-02-22 21:45:50'),
('a458f351-33bd-4a99-b313-f57c7e905445', '25c6598e-dbf2-4857-87bd-9861ba7e5a9f', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-23 12:19:03', '2026-02-23 12:17:43', '2026-02-23 12:19:03'),
('a4c2141f-6f2f-4cd1-ac2c-037259d1bc5a', '949ea38b-8148-4759-b77f-e8b2d698009c', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 19:49:58', '2026-02-21 19:45:54', '2026-02-22 19:49:58'),
('a52309cb-ceb0-4596-b5ee-96597a3482d3', 'fc29fc8d-1537-4c3a-abad-b2a81cb423f8', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-24 07:51:52', '2026-02-24 07:51:00', '2026-02-24 07:51:52'),
('a56cf4be-a5fe-4a5a-b492-646a8b33551c', 'b35d4e86-2893-4c38-9918-b67265ba2873', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-22 19:52:55', '2026-02-22 15:33:22', '2026-02-22 19:52:55'),
('a5c2c815-b952-4a6a-bbb6-a7430f633415', '87fe22dd-2f19-4ee6-952a-1ee8662484d8', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 09:06:46', '2026-02-22 08:59:51', '2026-02-22 09:06:46'),
('a5dd95a4-3bd1-430b-bf1a-d39ada99aac0', '385722a0-f326-40bf-a64f-44b9eb43b9d9', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-24 08:05:31', '2026-02-24 08:00:57', '2026-02-24 08:05:31');
INSERT INTO `approval_steps` (`id`, `approval_request_id`, `approver_user_id`, `role_id`, `step_order`, `status`, `comments`, `is_name_visible`, `action_date`, `created_at`, `updated_at`) VALUES
('a7c67505-3fab-4868-932f-e02e3d876e2e', '45864d6b-83bf-48f5-9703-28faa8b5f42f', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:16:26', '2026-02-24 09:01:24', '2026-02-24 13:16:26'),
('a8d15bfb-a9b5-4539-8678-919c57fe246b', '3bcb7d22-b1f5-4f21-bd80-a6e3e78fd577', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-22 21:43:44', '2026-02-22 21:42:22', '2026-02-22 21:43:44'),
('a904af8b-1996-47ae-b84c-8ff308743111', '3a5c0b0e-d655-4e88-b663-53f678c4da3c', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 15:05:53', '2026-02-21 20:09:49', '2026-02-22 15:05:53'),
('a98c7c19-3ac5-47a1-aea5-7c32fca9cfcd', 'e40e90fe-a273-408d-b30c-e3c980b3c925', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:53:10', '2026-02-22 07:10:59', '2026-02-22 19:53:10'),
('aaa8754b-5c85-46d5-8b41-168b7f22aaec', 'e40e90fe-a273-408d-b30c-e3c980b3c925', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:54:51', '2026-02-22 07:10:59', '2026-02-22 19:54:51'),
('ab01ed7f-4ef4-4eee-9e17-a86edacf778a', '53cd9cc5-ab77-4d63-bea8-be2db9ca4731', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:02:32', '2026-02-22 15:33:22', '2026-02-22 19:02:32'),
('ab995217-b3b7-4265-ba31-8c9d08740393', 'b7434892-f435-4b1e-8b44-d04aa0ded4ba', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-22 19:51:27', '2026-02-22 15:33:22', '2026-02-22 19:51:27'),
('ac18639b-e897-4075-9ad7-3c8aad5f26de', '7d3cc7ab-92a0-4fa6-8fbe-cf32a8ed8e18', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:19:15', '2026-02-22 14:33:45', '2026-02-24 13:19:15'),
('accf4bd3-0b7a-4bdb-9e08-b3529f71388c', '0c7c5fc8-472f-4817-964a-18878942af34', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 21:45:43', '2026-02-22 19:48:24', '2026-02-22 21:45:43'),
('ad3cc142-1957-4d8a-a4b1-790c51f16176', 'f2291993-b214-40aa-a08d-bd4921eaf0ff', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:40', '2026-02-21 23:44:36', '2026-02-22 19:51:40'),
('aea9aa3f-2bdf-4651-9fab-584c00a2fdb2', 'ff395e1d-a574-4f02-b52b-6a0eb0c7225e', 'u-emp-04', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-25 07:20:24', '2026-02-25 07:18:48', '2026-02-25 07:20:24'),
('af2c2e7c-7979-4709-9245-f1efefc11186', '8c3147a7-c281-4ce5-bbff-1901b70ea40c', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'rejected', 'sdsdsds', 0, '2026-02-22 15:04:27', '2026-02-22 13:50:34', '2026-02-22 15:04:27'),
('b1931c29-daac-418f-98e5-4e131050b538', '70402a1a-0731-4a92-b51f-64f47cbbff0a', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 12:51:40', '2026-02-22 12:48:07', '2026-02-22 12:51:40'),
('b1b22c65-e548-43ef-9149-cf76cc053f72', '68dd74db-6f50-48f0-ae4d-febcf192bd44', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:50:00', '2026-02-22 07:38:22', '2026-02-22 19:50:00'),
('b1f48c66-8cfe-4ceb-8078-a22e087e317d', 'ec53e9e6-665e-46a1-b0ec-d41b70c4bc1f', 'u-emp-03', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 1, 'approved', '', 1, '2026-02-22 21:44:44', '2026-02-22 21:09:28', '2026-02-22 21:44:44'),
('b1f7016c-dad6-4cca-9bb3-5d581ff3decf', 'a4661d16-0053-4129-9466-7922460e454c', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:52:53', '2026-02-21 21:14:42', '2026-02-22 19:52:53'),
('b28e412e-7e83-4ae1-80d2-d164a158d449', '88842d05-3b99-4f83-85c5-0af1614df993', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:19', '2026-02-21 20:48:16', '2026-02-22 19:51:19'),
('b2b62c95-f3df-4102-9d64-c13d66c6912f', '183c47ea-1d1f-45b2-95c2-4dcc97001e27', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 18:59:46', '2026-02-22 15:33:22', '2026-02-22 18:59:46'),
('b33060df-0904-4866-82f4-0de5b9086fac', 'e40e90fe-a273-408d-b30c-e3c980b3c925', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:50:02', '2026-02-22 07:10:59', '2026-02-22 19:50:02'),
('b33448f0-1242-460c-97a8-b4d31a8988c7', 'a17ca85d-f8e6-47ac-9ef6-4618d94fbf62', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:52:51', '2026-02-22 19:48:24', '2026-02-22 19:52:51'),
('b381307b-4168-4cc3-968f-6c11876f5dcc', '462a2ab4-2aa1-4766-86ea-de262ceaea55', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:20:05', '2026-02-24 09:06:33', '2026-02-24 13:20:05'),
('b3f9925f-34b5-47be-a6e8-6833ed3b4dd1', '157bac6d-7abf-4030-bd91-e70826c8f00d', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:01', '2026-02-22 15:33:22', '2026-02-22 19:51:01'),
('b46a4a2f-6112-4dd0-afb4-44e9f0adc61b', '8c3147a7-c281-4ce5-bbff-1901b70ea40c', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'pending', NULL, 1, NULL, '2026-02-22 13:50:34', '2026-02-22 13:50:34'),
('b5bf9b98-34cf-4423-8e73-cc557e29105d', 'c389bd68-d0d3-49be-92fc-9993aecea16f', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-24 08:09:15', '2026-02-24 08:07:36', '2026-02-24 08:09:15'),
('b5ca1022-c256-4bab-ba93-36b11a120dff', '296c26b3-5f89-47f4-92d0-69e4ba642f41', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-22 19:51:05', '2026-02-22 19:48:24', '2026-02-22 19:51:05'),
('b790e935-8684-4e6b-8ec5-5f2ca830ad0f', '53cd9cc5-ab77-4d63-bea8-be2db9ca4731', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 18:59:39', '2026-02-22 15:33:22', '2026-02-22 18:59:39'),
('b7d1ace9-507a-4407-be0f-bfeacca2afe2', 'c389bd68-d0d3-49be-92fc-9993aecea16f', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-24 08:08:26', '2026-02-24 08:07:36', '2026-02-24 08:08:26'),
('b9f285d3-e34b-4539-8d81-f040157dd74e', '843e8ac8-bdcc-46a3-8651-355316de4c18', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'pending', NULL, 1, NULL, '2026-02-22 14:40:46', '2026-02-22 14:40:46'),
('bb3a5e09-0e59-48c4-bf95-e4b7c5839bd5', '08d22563-72e7-422e-8936-a19e7db59909', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:01:00', '2026-02-22 15:33:22', '2026-02-22 19:01:00'),
('bbe1748b-2816-49ad-be73-6c5a9b8bdd00', 'ac7e0be9-f2b3-46fc-8198-6069a5eb0ed3', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-23 11:40:16', '2026-02-23 09:45:00', '2026-02-23 11:40:16'),
('bd00d644-55c6-42dd-982b-5745fed8c1b9', '7aaeaa70-e94c-4049-9131-2a3a14fbc0ec', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 13:53:26', '2026-02-24 09:07:18', '2026-02-24 13:53:26'),
('bdc39aa6-cf5c-46f0-88bd-c8db9feb2157', '32754ef1-e268-4b96-ae8c-e1bf4387fea8', 'u-emp-03', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 2, 'approved', '', 1, '2026-02-22 21:44:46', '2026-02-22 21:10:26', '2026-02-22 21:44:46'),
('bf0e498c-7224-4e83-bb6c-b98f13b16ec2', '62187e38-e60e-4c04-9f02-e5fd14bd597d', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 2, 'approved', '', 1, '2026-02-22 19:01:55', '2026-02-22 15:33:22', '2026-02-22 19:01:55'),
('c08e143f-633e-49ab-ba00-d7d203715769', '1e51adce-4cf7-4493-9c4c-fd43d228b12d', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:13:56', '2026-02-24 13:54:48', '2026-02-24 14:13:56'),
('c0d98d66-c6fe-4fdc-9a53-77b0b45ddef6', '68dd74db-6f50-48f0-ae4d-febcf192bd44', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:55:17', '2026-02-22 07:38:22', '2026-02-22 19:55:17'),
('c12606a1-854f-43fb-ae2f-7f5cd2b57f78', 'cc0de676-7802-45b5-baa2-b44447f26e54', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:30', '2026-02-21 21:26:02', '2026-02-22 19:51:30'),
('c12b5d28-665a-410c-b9e8-2cdb17922dda', '1ef233a9-412e-4973-9416-2ad07bb49eab', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-24 08:27:32', '2026-02-24 08:27:09', '2026-02-24 08:27:32'),
('c13a7903-c894-4a18-96f5-3d3f8a1bbeca', '1359007f-7e90-4f20-b246-755d886d9ef4', 'u-emp-06', NULL, 1, 'pending', NULL, 1, NULL, '2026-02-24 13:20:40', '2026-02-24 13:20:40'),
('c48d45d1-031d-4566-be9f-d7e76ab0a825', 'b7434892-f435-4b1e-8b44-d04aa0ded4ba', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:03', '2026-02-22 15:33:22', '2026-02-22 19:50:03'),
('c4dac929-8b8e-4b17-a357-faf2adfdd957', '3bcb7d22-b1f5-4f21-bd80-a6e3e78fd577', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 21:44:12', '2026-02-22 21:42:22', '2026-02-22 21:44:12'),
('c7ff4a56-b923-4341-974c-4c936e96dc82', 'c389bd68-d0d3-49be-92fc-9993aecea16f', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-24 08:08:56', '2026-02-24 08:07:36', '2026-02-24 08:08:56'),
('c8529aac-cd7b-4254-92b9-4a1aed228431', 'a58bc426-f470-4c93-8b8a-15d135417740', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:52:58', '2026-02-24 13:52:54', '2026-02-24 13:52:58'),
('c874dfcb-fa2e-4fe3-8166-244b837e55c3', '462a2ab4-2aa1-4766-86ea-de262ceaea55', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:20:05', '2026-02-24 09:06:33', '2026-02-24 13:20:05'),
('cbef24f7-2bbb-47ae-9848-030952cdc12f', '6203f730-c9bf-4413-a88c-be7e728f9734', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 2, 'approved', '', 1, '2026-02-22 19:52:41', '2026-02-22 19:48:24', '2026-02-22 19:52:41'),
('cc020a5a-4cef-46c8-873f-d3c8593266de', '462a2ab4-2aa1-4766-86ea-de262ceaea55', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:20:05', '2026-02-24 09:06:33', '2026-02-24 13:20:05'),
('cd011255-b2df-418d-8004-5bab2a9456e1', 'fc29fc8d-1537-4c3a-abad-b2a81cb423f8', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-24 07:52:38', '2026-02-24 07:51:00', '2026-02-24 07:52:38'),
('cd0ac4e1-d5c4-4c0e-941f-7af146cacf16', '1e51adce-4cf7-4493-9c4c-fd43d228b12d', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:13:56', '2026-02-24 13:54:48', '2026-02-24 14:13:56'),
('ce707f71-acc5-4567-ab50-8412a45c26ec', '3a5c0b0e-d655-4e88-b663-53f678c4da3c', 'u-admin-01', NULL, 2, 'approved', '', 1, '2026-02-21 20:10:31', '2026-02-21 20:09:49', '2026-02-21 20:10:31'),
('cf23922b-8b55-4379-a6d4-1fe81a1ec046', '58383a0e-1d1e-4863-b404-b29a5fdbf246', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:01:53', '2026-02-22 15:33:22', '2026-02-22 19:01:53'),
('cf88ef44-c027-49cf-9c05-4d57ac738a7d', '385722a0-f326-40bf-a64f-44b9eb43b9d9', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-24 08:05:15', '2026-02-24 08:00:57', '2026-02-24 08:05:15'),
('cf9dbf04-c058-4863-adf1-6974459e5f5c', '296c26b3-5f89-47f4-92d0-69e4ba642f41', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:05', '2026-02-22 19:48:24', '2026-02-22 19:50:05'),
('cfe91183-1f48-4f93-914c-6b1ab579d053', '31e778c4-66fc-4d08-a954-4cd2e43a1b0e', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'pending', NULL, 1, NULL, '2026-02-25 21:33:53', '2026-02-25 21:33:53'),
('cff282ac-d887-4567-b324-c8cf44e482e0', '157bac6d-7abf-4030-bd91-e70826c8f00d', 'u-emp-01', NULL, 1, 'approved', '', 1, '2026-02-22 19:01:48', '2026-02-22 15:33:22', '2026-02-22 19:01:48'),
('cff7aad0-336f-425b-99de-2db1200cbcf1', '3ea78a54-e2e8-4b59-9fbe-1be534bd9d18', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-22 19:52:35', '2026-02-22 19:48:24', '2026-02-22 19:52:35'),
('d01db833-506d-40cf-ab8a-fdf20f2c9a8e', '118c45df-1aee-41aa-8b97-a507c7f3fc46', 'u-admin-01', '978f139b-e1bf-43b9-a924-2eb12537c2aa', 1, 'rejected', '', 1, '2026-02-24 23:01:12', '2026-02-24 22:57:08', '2026-02-24 23:01:12'),
('d06337e2-93a6-4470-9f4f-3a3b62b25dc5', '0dda34b4-eb8b-48a0-9515-c5559a8430f6', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 1, 'approved', '', 0, '2026-02-24 23:51:16', '2026-02-24 23:51:01', '2026-02-24 23:51:16'),
('d0717281-4c1a-44c1-9734-c4e402c41c56', 'c0ec8ae0-3e68-4a4b-8802-d0081679001a', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-23 11:39:35', '2026-02-23 07:22:45', '2026-02-23 11:39:35'),
('d0a60d71-3764-4108-98cb-50a36cb7952a', '88842d05-3b99-4f83-85c5-0af1614df993', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:07', '2026-02-21 20:48:16', '2026-02-22 19:50:07'),
('d17715c1-af98-4738-a6ad-30edfebd60b8', 'f5ac6a0b-a4d9-4547-aead-bec0670486b8', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'pending', NULL, 1, NULL, '2026-02-24 13:17:20', '2026-02-24 13:17:20'),
('d18e4779-a67a-471a-8571-06c4075b29ef', '509b0d3b-f99b-4cdd-963d-15a3586b46b6', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:52:39', '2026-02-22 19:48:24', '2026-02-22 19:52:39'),
('d24d0bef-4a1b-46b1-a5d8-9a9a438b6bc2', 'ac7e0be9-f2b3-46fc-8198-6069a5eb0ed3', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-23 11:39:53', '2026-02-23 09:45:00', '2026-02-23 11:39:53'),
('d2f52b78-902b-446a-8962-c98d5b5a919f', 'b35d4e86-2893-4c38-9918-b67265ba2873', 'u-emp-06', NULL, 2, 'approved', '', 1, '2026-02-22 19:50:08', '2026-02-22 15:33:22', '2026-02-22 19:50:08'),
('d3645b9f-7e4e-4064-b168-426dde64fb56', 'e40e90fe-a273-408d-b30c-e3c980b3c925', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:36', '2026-02-22 07:10:59', '2026-02-22 19:51:36'),
('d411f496-cbfc-4208-b24e-decd1309a12c', '08687b08-b276-4dde-92c8-5dfabbcf9929', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-23 11:42:18', '2026-02-22 22:32:30', '2026-02-23 11:42:18'),
('d420dd39-6e81-4407-bb2c-169828711d66', '9a0964ff-988f-4c63-a9bb-d3509dc113c3', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'pending', NULL, 0, NULL, '2026-02-24 09:04:57', '2026-02-24 09:04:57'),
('d55e49ca-3175-4be7-a2d3-f7b54f611ef0', 'bb2b43f1-353e-4a2a-8ea4-2cd099967867', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:01:12', '2026-02-22 15:33:22', '2026-02-22 19:01:12'),
('d58f79fb-7d6a-41d7-8a6c-02aa62dda00f', '87fe22dd-2f19-4ee6-952a-1ee8662484d8', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 09:01:15', '2026-02-22 08:59:51', '2026-02-22 09:01:15'),
('d6686374-ed3b-426f-8950-8a0ba7354703', '3a5c0b0e-d655-4e88-b663-53f678c4da3c', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 15:04:17', '2026-02-21 20:09:49', '2026-02-22 15:04:17'),
('d7c01403-2290-4e44-8a40-1966598278ef', 'fd3c336d-3af0-46c4-b228-eaf13b72ad90', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 21:44:13', '2026-02-22 21:42:07', '2026-02-22 21:44:13'),
('d7e59913-dd29-4eca-980c-aa4c94a25a19', '65df2c6e-ff5d-42d2-ba35-af2dcd2fc642', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:55:19', '2026-02-22 19:48:24', '2026-02-22 19:55:19'),
('d819f33a-f4e7-4d82-8156-592c573ccd7b', '23399a20-4f5b-4df7-81d5-a2ed58cc6c45', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:52:29', '2026-02-22 13:50:04', '2026-02-22 19:52:29'),
('d97000a3-1b2f-430b-9cdb-27813267bc7d', '62187e38-e60e-4c04-9f02-e5fd14bd597d', 'u-emp-04', NULL, 1, 'approved', '', 1, '2026-02-22 19:01:09', '2026-02-22 15:33:22', '2026-02-22 19:01:09'),
('d999c582-c96d-4c6e-b980-20471cdcf56a', '679ef2a9-1ccc-471a-ad63-8cf06b22a108', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:01:57', '2026-02-22 14:41:51', '2026-02-22 19:01:57'),
('d9add60b-8def-4efb-940b-84b603a11e40', '06e118f3-1c7d-4339-afed-f4beab881011', 'u-emp-03', NULL, 1, 'approved', '', 1, '2026-02-22 15:03:00', '2026-02-22 14:33:14', '2026-02-22 15:03:00'),
('da7597ac-8fa2-412e-a37c-bca83231e5c0', '949ea38b-8148-4759-b77f-e8b2d698009c', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:55:13', '2026-02-21 19:45:54', '2026-02-22 19:55:13'),
('dafaefe9-a8e8-4b08-9e13-5ce64470b35f', '9a0964ff-988f-4c63-a9bb-d3509dc113c3', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'pending', NULL, 1, NULL, '2026-02-24 09:04:57', '2026-02-24 09:04:57'),
('db704120-39e7-44cd-84a7-671b74b85d2c', '843e8ac8-bdcc-46a3-8651-355316de4c18', 'u-emp-03', NULL, 1, 'rejected', 'ssdsdsd', 1, '2026-02-22 15:03:11', '2026-02-22 14:40:46', '2026-02-22 15:03:11'),
('dbd82a89-0129-4598-8e45-f447f046ccf5', '40f092e4-460d-42fe-bde4-007877c79bd5', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:54:00', '2026-02-22 19:48:24', '2026-02-22 19:54:00'),
('dc413d5e-e384-438a-9388-53d9cc9e81d8', '7d3cc7ab-92a0-4fa6-8fbe-cf32a8ed8e18', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:19:15', '2026-02-22 14:33:45', '2026-02-24 13:19:15'),
('dca6a41f-5e90-4565-885b-4635c0380a54', 'b989a472-24ae-4574-a023-e34736d634c4', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 1, '2026-02-22 19:54:44', '2026-02-22 14:17:38', '2026-02-22 19:54:44'),
('de52262d-2e13-46b3-9a57-a27765ced88f', '53cd9cc5-ab77-4d63-bea8-be2db9ca4731', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:01:04', '2026-02-22 15:33:22', '2026-02-22 19:01:04'),
('de853368-0a39-48d3-a120-1da31b32769d', 'd9d4c2b0-a550-4987-a8f5-fcb4c6d152ca', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 14:49:49', '2026-02-22 14:32:42', '2026-02-22 14:49:49'),
('df2f85c4-9a79-4200-ab74-2bba2d2d6ddd', 'b7434892-f435-4b1e-8b44-d04aa0ded4ba', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-22 19:52:56', '2026-02-22 15:33:22', '2026-02-22 19:52:56'),
('dfe83f01-f329-4298-98e6-b17532601ec0', '45864d6b-83bf-48f5-9703-28faa8b5f42f', 'u-admin-01', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:16:26', '2026-02-24 09:01:24', '2026-02-24 13:16:26'),
('e079a805-6d51-4746-aadc-a5985cf635aa', 'a17ca85d-f8e6-47ac-9ef6-4618d94fbf62', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:55:14', '2026-02-22 19:48:24', '2026-02-22 19:55:14'),
('e0955bfa-3ded-4e60-9d22-a3c4ca7c0721', 'b989a472-24ae-4574-a023-e34736d634c4', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:52:59', '2026-02-22 14:17:38', '2026-02-22 19:52:59'),
('e1e147a4-b419-4b96-ad92-bf47dd611c77', '1359007f-7e90-4f20-b246-755d886d9ef4', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'pending', NULL, 0, NULL, '2026-02-24 13:20:40', '2026-02-24 13:20:40'),
('e2a27ec7-bbdb-45c0-9229-03ee532e6642', 'c719a4ad-f098-4c90-a1e2-2dab8afa2ffe', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-25 21:31:23', '2026-02-25 21:31:23'),
('e2f1e4f5-30ac-4d66-a0cc-a68d004cccdf', 'dfd56a86-1763-4095-9237-c8a27b654fa9', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:35', '2026-02-22 07:27:19', '2026-02-22 19:51:35'),
('e333b066-71f6-455c-8455-5812df035352', '0c7c5fc8-472f-4817-964a-18878942af34', 'u-emp-05', NULL, 1, 'approved', '', 1, '2026-02-22 19:53:39', '2026-02-22 19:48:24', '2026-02-22 19:53:39'),
('e42c6b68-2152-4693-9860-2252a1fb8efb', 'cc0de676-7802-45b5-baa2-b44447f26e54', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:50:10', '2026-02-21 21:26:02', '2026-02-22 19:50:10'),
('e4e95c0d-eacd-4d99-bb5d-595d97edffe2', 'dcc2424e-6632-42a8-a20c-58524c723b98', NULL, NULL, 1, 'pending', NULL, 1, NULL, '2026-02-25 21:31:47', '2026-02-25 21:31:47'),
('e4f54e66-053b-41ae-bead-c78d5ea7d540', 'cc5c11fe-3b97-4a0f-8519-2d0af50b280b', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:32', '2026-02-22 15:33:22', '2026-02-22 19:51:32'),
('e5367361-cad4-4a9c-bf62-5668f661672a', '32754ef1-e268-4b96-ae8c-e1bf4387fea8', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 1, '2026-02-22 21:45:11', '2026-02-22 21:10:26', '2026-02-22 21:45:11'),
('e58c28ed-dd21-42a1-bedd-01262703020a', '9a0964ff-988f-4c63-a9bb-d3509dc113c3', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'pending', NULL, 1, NULL, '2026-02-24 09:04:57', '2026-02-24 09:04:57'),
('e5fa94d7-f4ce-4848-a01e-ce335af9bdc4', 'a58bc426-f470-4c93-8b8a-15d135417740', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:52:58', '2026-02-24 13:52:54', '2026-02-24 13:52:58'),
('e6056d5a-ab70-49f8-9321-a788bda5eb7a', '6a2542be-2f5b-4529-bbfc-21e3b7d638be', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 15:35:37', '2026-02-24 15:35:31', '2026-02-24 15:35:37'),
('e78f31f1-072f-4a0d-99de-ba9afdc2f199', '3253063f-9ed2-4802-b95f-3b95d690eaed', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 21:45:45', '2026-02-22 21:39:57', '2026-02-22 21:45:45'),
('e91645a5-78ad-4884-b837-0cfed16b08ae', 'dfd56a86-1763-4095-9237-c8a27b654fa9', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 3, 'approved', '', 1, '2026-02-22 19:53:17', '2026-02-22 07:27:19', '2026-02-22 19:53:17'),
('e935af92-6e74-483c-8c57-63da2e3e5c2f', '1ef233a9-412e-4973-9416-2ad07bb49eab', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'approved', '', 1, '2026-02-24 08:28:46', '2026-02-24 08:27:09', '2026-02-24 08:28:46'),
('ea9d9226-fce8-4eef-bf78-3974918663f1', 'a58bc426-f470-4c93-8b8a-15d135417740', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:52:58', '2026-02-24 13:52:54', '2026-02-24 13:52:58'),
('eaabc854-1b0d-4191-8c30-6021511412a6', 'd9d4c2b0-a550-4987-a8f5-fcb4c6d152ca', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 15:04:30', '2026-02-22 14:32:42', '2026-02-22 15:04:30'),
('eaabe4b3-acfd-4043-b45d-261ff78df9ef', '08687b08-b276-4dde-92c8-5dfabbcf9929', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-23 11:42:48', '2026-02-22 22:32:30', '2026-02-23 11:42:48'),
('ebf7c68e-67bd-4f0d-a4ea-f49f40c60f79', '9a0964ff-988f-4c63-a9bb-d3509dc113c3', 'u-emp-06', NULL, 1, 'pending', NULL, 1, NULL, '2026-02-24 09:04:57', '2026-02-24 09:04:57'),
('ec69a38f-2123-4bdb-8f12-c425de2762d0', 'dfd56a86-1763-4095-9237-c8a27b654fa9', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-22 19:50:11', '2026-02-22 07:27:19', '2026-02-22 19:50:11'),
('ecaa77ba-4c74-4768-bb04-caaff6363c72', 'a5a4f4a5-3ad8-4165-aeaa-a5d81bf9de58', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 09:46:37', '2026-02-22 09:44:16', '2026-02-22 09:46:37'),
('ed743165-16fc-493c-9ace-4269e94184a5', 'c389bd68-d0d3-49be-92fc-9993aecea16f', 'u-emp-06', NULL, 1, 'approved', '', 1, '2026-02-24 08:08:03', '2026-02-24 08:07:36', '2026-02-24 08:08:03'),
('eddce7c4-a66b-4cc0-be3c-d6f062f5312e', '3ea78a54-e2e8-4b59-9fbe-1be534bd9d18', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-22 19:53:56', '2026-02-22 19:48:24', '2026-02-22 19:53:56'),
('ee2b9c8c-289b-4c18-8b53-6d62f2598fa5', 'd9d4c2b0-a550-4987-a8f5-fcb4c6d152ca', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 15:05:44', '2026-02-22 14:32:42', '2026-02-22 15:05:44'),
('efadc367-9885-4cd4-aad2-18153fdef952', 'bb2b43f1-353e-4a2a-8ea4-2cd099967867', 'u-emp-03', NULL, 1, 'approved', '', 1, '2026-02-22 19:00:43', '2026-02-22 15:33:22', '2026-02-22 19:00:43'),
('f0777d86-321e-4aa5-8c0d-bb8bd647df6c', '3253063f-9ed2-4802-b95f-3b95d690eaed', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 21:45:09', '2026-02-22 21:39:57', '2026-02-22 21:45:09'),
('f098db5e-db43-4562-9a04-4dbb771c7001', '88842d05-3b99-4f83-85c5-0af1614df993', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 5, 'approved', '', 1, '2026-02-22 19:55:11', '2026-02-21 20:48:16', '2026-02-22 19:55:11'),
('f0ca43cd-db5f-4219-a63b-b18e5ec08c44', 'ac7e0be9-f2b3-46fc-8198-6069a5eb0ed3', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-23 11:42:51', '2026-02-23 09:45:00', '2026-02-23 11:42:51'),
('f12ef6d0-0b5d-42f5-b78b-cabc5398afdb', '296c26b3-5f89-47f4-92d0-69e4ba642f41', '9ef8d021-8440-4c46-af92-53f65a47d1d0', NULL, 1, 'approved', '', 1, '2026-02-22 19:49:17', '2026-02-22 19:48:24', '2026-02-22 19:49:17'),
('f161cd0a-8729-4466-838e-e903e0a78edc', '7d3cc7ab-92a0-4fa6-8fbe-cf32a8ed8e18', 'u-admin-01', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 0, '2026-02-24 13:19:15', '2026-02-22 14:33:45', '2026-02-24 13:19:15'),
('f1a123c0-12af-4152-b40d-87622ca3b672', 'b35d4e86-2893-4c38-9918-b67265ba2873', 'u-emp-03', NULL, 3, 'approved', '', 1, '2026-02-22 19:50:46', '2026-02-22 15:33:22', '2026-02-22 19:50:46'),
('f1cbbb9f-eb88-4709-a0bb-8ed4c625aae2', '45510874-a21c-463d-a943-1c503fa3b419', NULL, '978f139b-e1bf-43b9-a924-2eb12537c2aa', 1, 'pending', NULL, 1, NULL, '2026-02-24 22:51:05', '2026-02-24 22:51:05'),
('f2b47f3d-2141-4bb2-8f58-70726076742c', 'b35d4e86-2893-4c38-9918-b67265ba2873', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 6, 'approved', '', 1, '2026-02-22 19:55:05', '2026-02-22 15:33:22', '2026-02-22 19:55:05'),
('f53f4d0c-9ead-41a8-94e5-be99883366f7', '843e8ac8-bdcc-46a3-8651-355316de4c18', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 4, 'pending', NULL, 1, NULL, '2026-02-22 14:40:46', '2026-02-22 14:40:46'),
('f5e1e50c-cb2b-46d2-9ca9-ece8630d08bb', '8f399308-63cc-4637-93fc-a4aeb63ea204', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 5, 'pending', NULL, 1, NULL, '2026-02-24 14:03:14', '2026-02-24 14:03:14'),
('f837505e-70bd-4acb-a525-0344a2a70598', '45864d6b-83bf-48f5-9703-28faa8b5f42f', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:16:26', '2026-02-24 09:01:24', '2026-02-24 13:16:26'),
('f8d0aaca-b92b-4628-873f-80294f8e70fe', '65df2c6e-ff5d-42d2-ba35-af2dcd2fc642', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:51:16', '2026-02-22 19:48:24', '2026-02-22 19:51:16'),
('f8e574b5-eba0-4a31-941e-14eb8c933d9c', '679ef2a9-1ccc-471a-ad63-8cf06b22a108', 'u-emp-05', NULL, 1, 'approved', '', 1, '2026-02-22 15:05:50', '2026-02-22 14:41:51', '2026-02-22 15:05:50'),
('fae92cca-f721-4bf8-93d3-df299a34e80d', '40f092e4-460d-42fe-bde4-007877c79bd5', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:52:37', '2026-02-22 19:48:24', '2026-02-22 19:52:37'),
('fb02b200-0527-4c4a-94cf-3b6c69d37f68', 'd87a0969-c6c7-49e1-ae24-5bcb57488b0c', 'u-emp-04', NULL, 1, 'approved', '', 1, '2026-02-22 19:01:14', '2026-02-22 15:33:22', '2026-02-22 19:01:14'),
('fb03726d-1b4e-42f5-81e7-0de9c1f06dfa', 'b35d4e86-2893-4c38-9918-b67265ba2873', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 4, 'approved', '', 0, '2026-02-22 19:51:25', '2026-02-22 15:33:22', '2026-02-22 19:51:25'),
('fbbe5842-2866-43b7-8631-f572549b4609', '7aaeaa70-e94c-4049-9131-2a3a14fbc0ec', 'u-admin-01', NULL, 1, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:53:26', '2026-02-24 09:07:18', '2026-02-24 13:53:26'),
('fd17b637-fdd3-49ad-9d10-13e630548f80', '53cd9cc5-ab77-4d63-bea8-be2db9ca4731', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', '', 1, '2026-02-22 19:01:51', '2026-02-22 15:33:22', '2026-02-22 19:01:51'),
('fd73e662-012d-434b-9ec4-0f555934e76f', '462a2ab4-2aa1-4766-86ea-de262ceaea55', 'u-admin-01', NULL, 2, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 13:20:05', '2026-02-24 09:06:33', '2026-02-24 13:20:05'),
('fdc2b09c-875e-4165-bcee-44d2314eef77', 'fd3c336d-3af0-46c4-b228-eaf13b72ad90', 'u-emp-03', NULL, 2, 'approved', '', 1, '2026-02-22 21:44:47', '2026-02-22 21:42:07', '2026-02-22 21:44:47'),
('fdec1430-e60a-452e-a6ba-a9a78e9a994d', '679ef2a9-1ccc-471a-ad63-8cf06b22a108', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 2, 'approved', '', 0, '2026-02-22 19:01:11', '2026-02-22 14:41:51', '2026-02-22 19:01:11'),
('fe154ddf-3f78-4de1-ad6c-b55fb8447247', 'dad29bef-63c5-4120-b37f-3874c4e4c31d', 'u-admin-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 4, 'approved', 'اعتماد نهائي استثنائي (تأسيس النظام)', 1, '2026-02-24 14:52:40', '2026-02-24 14:36:52', '2026-02-24 14:52:40'),
('ffeba332-f47d-47e6-ab80-17e8fb1bbbc8', 'd572a5d5-9622-49f3-98ed-b3667319ecd0', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 3, 'approved', '', 0, '2026-02-22 19:51:33', '2026-02-22 14:40:02', '2026-02-22 19:51:33');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_in_location` json DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `check_out_location` json DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_late` tinyint(1) DEFAULT '0',
  `late_minutes` int DEFAULT '0',
  `working_hours` decimal(5,2) DEFAULT '0.00',
  `overtime_hours` decimal(5,2) DEFAULT '0.00',
  `source` enum('manual','fingerprint_device','mobile_app') COLLATE utf8mb4_unicode_ci DEFAULT 'manual',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in_time`, `check_in_location`, `check_out_time`, `check_out_location`, `status`, `notes`, `is_late`, `late_minutes`, `working_hours`, `overtime_hours`, `source`, `created_at`, `updated_at`) VALUES
('19b43fa5-0686-11f1-af8c-d481d76a1bbe', 'e-003', '2026-02-10', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'manual', '2026-02-10 13:40:45', '2026-02-10 13:40:45'),
('1b9ca1c3-b187-44ec-b25c-b40d7f2b7025', 'e-001', '2026-02-17', '12:30:32', '{\"latitude\": 30.0434, \"longitude\": 31.2352}', '12:30:35', '{\"latitude\": 30.0434, \"longitude\": 31.2352}', 'present', NULL, 1, 210, '0.00', '0.00', 'mobile_app', '2026-02-17 12:30:32', '2026-02-17 12:30:35'),
('1d9fd7e5-0686-11f1-af8c-d481d76a1bbe', 'e-001', '2026-02-10', '10:40:51', NULL, '21:41:00', NULL, 'present', '', 1, 100, '11.00', '3.00', 'manual', '2026-02-10 13:40:51', '2026-02-10 13:41:46'),
('47c4ac79-0686-11f1-af8c-d481d76a1bbe', 'e-001', '2026-02-01', '08:00:00', NULL, '16:00:00', NULL, 'present', NULL, 0, 0, '8.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c4e87b-0686-11f1-af8c-d481d76a1bbe', 'e-001', '2026-02-02', '08:00:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c51247-0686-11f1-af8c-d481d76a1bbe', 'e-001', '2026-02-03', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c53b20-0686-11f1-af8c-d481d76a1bbe', 'e-001', '2026-02-04', '08:00:00', NULL, '16:00:00', NULL, 'present', NULL, 0, 0, '8.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c56522-0686-11f1-af8c-d481d76a1bbe', 'e-001', '2026-02-05', '08:00:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c58d0d-0686-11f1-af8c-d481d76a1bbe', 'e-001', '2026-02-06', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c5d137-0686-11f1-af8c-d481d76a1bbe', 'e-002', '2026-02-01', '09:00:00', NULL, '17:00:00', NULL, 'present', NULL, 0, 0, '8.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c63289-0686-11f1-af8c-d481d76a1bbe', 'e-002', '2026-02-02', '09:00:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c66abe-0686-11f1-af8c-d481d76a1bbe', 'e-002', '2026-02-03', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c6ad4a-0686-11f1-af8c-d481d76a1bbe', 'e-002', '2026-02-04', '09:00:00', NULL, '17:00:00', NULL, 'present', NULL, 0, 0, '8.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c6df09-0686-11f1-af8c-d481d76a1bbe', 'e-002', '2026-02-05', '09:00:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c70ae3-0686-11f1-af8c-d481d76a1bbe', 'e-002', '2026-02-06', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c72eba-0686-11f1-af8c-d481d76a1bbe', 'e-003', '2026-02-01', '08:55:00', NULL, '16:15:00', NULL, 'present', NULL, 0, 0, '7.33', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c75112-0686-11f1-af8c-d481d76a1bbe', 'e-003', '2026-02-02', '08:55:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c772a3-0686-11f1-af8c-d481d76a1bbe', 'e-003', '2026-02-03', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c79445-0686-11f1-af8c-d481d76a1bbe', 'e-003', '2026-02-04', '08:55:00', NULL, '16:15:00', NULL, 'present', NULL, 0, 0, '7.33', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c7bbef-0686-11f1-af8c-d481d76a1bbe', 'e-003', '2026-02-05', '08:55:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c7e43e-0686-11f1-af8c-d481d76a1bbe', 'e-003', '2026-02-06', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c80b6f-0686-11f1-af8c-d481d76a1bbe', 'e-004', '2026-02-01', '09:10:00', NULL, '17:05:00', NULL, 'present', NULL, 0, 0, '7.92', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c84355-0686-11f1-af8c-d481d76a1bbe', 'e-004', '2026-02-02', '09:10:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c87918-0686-11f1-af8c-d481d76a1bbe', 'e-004', '2026-02-03', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c8af6d-0686-11f1-af8c-d481d76a1bbe', 'e-004', '2026-02-04', '09:10:00', NULL, '17:05:00', NULL, 'present', NULL, 0, 0, '7.92', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c8e37a-0686-11f1-af8c-d481d76a1bbe', 'e-004', '2026-02-05', '09:10:00', NULL, NULL, NULL, 'present', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c91908-0686-11f1-af8c-d481d76a1bbe', 'e-004', '2026-02-06', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c975f0-0686-11f1-af8c-d481d76a1bbe', 'e-005', '2026-02-01', '08:45:00', NULL, '16:30:00', NULL, 'present', NULL, 0, 0, '7.75', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c9c10a-0686-11f1-af8c-d481d76a1bbe', 'e-005', '2026-02-02', '09:45:00', NULL, NULL, NULL, 'present', NULL, 1, 45, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47c9e7da-0686-11f1-af8c-d481d76a1bbe', 'e-005', '2026-02-03', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47ca0ffa-0686-11f1-af8c-d481d76a1bbe', 'e-005', '2026-02-04', '09:45:00', NULL, NULL, NULL, 'present', NULL, 1, 45, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47ca3438-0686-11f1-af8c-d481d76a1bbe', 'e-005', '2026-02-05', NULL, NULL, NULL, NULL, 'absent', NULL, 0, 0, '0.00', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('47ca5ad0-0686-11f1-af8c-d481d76a1bbe', 'e-005', '2026-02-06', '08:45:00', NULL, '16:30:00', NULL, 'present', NULL, 0, 0, '7.75', '0.00', 'fingerprint_device', '2026-02-10 13:42:02', '2026-02-10 13:42:02'),
('6affdd59-0fec-11f1-8a36-d481d76a1bbe', 'e-003', '2026-02-22', '11:55:00', NULL, '14:45:00', NULL, 'present', NULL, 1, 175, '2.83', '0.00', 'manual', '2026-02-22 12:45:50', '2026-02-22 12:45:50'),
('b4ef44ea-0854-11f1-9a95-d481d76a1bbe', 'e-001', '2026-02-12', '20:52:13', '{\"latitude\": 30.681340746800203, \"longitude\": 31.777889400568306}', '20:53:11', '{\"latitude\": 30.68138708613295, \"longitude\": 31.777899437457982}', 'present', NULL, 1, 712, '0.02', '0.00', 'mobile_app', '2026-02-12 20:52:13', '2026-02-12 20:53:11'),
('c680bef0-11c9-11f1-adee-d481d76a1bbe', 'e-001', '2026-02-24', '21:42:54', '{\"latitude\": 30.681362408599963, \"longitude\": 31.77791342469941}', NULL, NULL, 'present', NULL, 1, 583, '0.00', '0.00', 'mobile_app', '2026-02-24 21:42:54', '2026-02-24 21:42:54');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_statuses`
--

CREATE TABLE `attendance_statuses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_statuses`
--

INSERT INTO `attendance_statuses` (`id`, `name`, `code`, `color`, `created_at`, `status`) VALUES
('6c16dce2-02a0-11f1-a178-d481d76a1bbe', 'حاضر', 'present', 'green', '2026-02-05 14:39:05', 'active'),
('6c16df69-02a0-11f1-a178-d481d76a1bbe', 'غائب', 'absent', 'red', '2026-02-05 14:39:05', 'active'),
('6c16e014-02a0-11f1-a178-d481d76a1bbe', 'إجازة', 'leave', 'blue', '2026-02-05 14:39:05', 'active'),
('6c16e07e-02a0-11f1-a178-d481d76a1bbe', 'متأخر', 'late', 'orange', '2026-02-05 14:39:05', 'active'),
('6c16e0df-02a0-11f1-a178-d481d76a1bbe', 'مهمة خارجية', 'business_trip', 'purple', '2026-02-05 14:39:05', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
('0d477a0d-87fd-4bef-8e04-658e90cd4023', 'u-admin-01', 'update', 'roles', '978f139b-e1bf-43b9-a924-2eb12537c2aa', '{\"id\": \"978f139b-e1bf-43b9-a924-2eb12537c2aa\", \"code\": \"admin\", \"name\": \"admin\", \"status\": \"active\", \"created_at\": \"2026-02-09 00:19:33\", \"updated_at\": \"2026-02-25 17:51:26\", \"data_scopes\": {\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\", \"edit_permission_requests\": \"all\", \"view_permission_requests\": \"all\", \"delete_permission_requests\": \"all\"}, \"description\": \"admin\", \"permissions\": [\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\", \"view_permission_requests\", \"add_permission_requests\", \"edit_permission_requests\", \"delete_permission_requests\", \"approve_permission_requests_manager\", \"approve_permission_requests_upper_managers\", \"approve_permission_requests_gm\", \"approve_permission_requests_hr\", \"approve_permission_requests_finance\", \"approve_training_manager\", \"approve_bonus_department_manager\", \"force_approve\", \"manage_penalty_settings\", \"view_violations\", \"view_department_violations\", \"view_all_violations\", \"create_violation\", \"update_violation\", \"delete_violation\"], \"approval_level\": 0}', '{\"id\": \"978f139b-e1bf-43b9-a924-2eb12537c2aa\", \"code\": \"admin\", \"name\": \"admin\", \"status\": \"active\", \"created_at\": \"2026-02-09 00:19:33\", \"updated_at\": \"2026-02-25 22:34:36\", \"data_scopes\": {\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"view_violations\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"delete_violation\": \"all\", \"edit_resignation\": \"all\", \"update_violation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"view_all_violations\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\", \"edit_permission_requests\": \"all\", \"view_permission_requests\": \"all\", \"delete_permission_requests\": \"all\", \"view_department_violations\": \"all\"}, \"description\": \"admin\", \"permissions\": [\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\", \"view_permission_requests\", \"add_permission_requests\", \"edit_permission_requests\", \"delete_permission_requests\", \"approve_permission_requests_manager\", \"approve_permission_requests_upper_managers\", \"approve_permission_requests_gm\", \"approve_permission_requests_hr\", \"approve_permission_requests_finance\", \"approve_training_manager\", \"approve_bonus_department_manager\", \"force_approve\", \"manage_penalty_settings\", \"view_violations\", \"view_department_violations\", \"view_all_violations\", \"create_violation\", \"update_violation\", \"delete_violation\"], \"approval_level\": 0}', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '2026-02-25 20:34:36'),
('3c9a24dc-fe1a-4416-9050-e667d4ec9cd1', 'u-admin-01', 'create', 'employee_violations', '9198524b-adfa-4afa-af48-041b1d105260', NULL, '{\"id\": \"9198524b-adfa-4afa-af48-041b1d105260\", \"notes\": \"\", \"status\": \"pending\", \"created_at\": \"2026-02-25 23:34:05\", \"updated_at\": \"2026-02-25 23:34:05\", \"employee_id\": \"e-006\", \"workflow_id\": null, \"applied_value\": 0, \"incident_date\": \"2026-02-25\", \"applied_action\": \"warning\", \"letter_content\": \"السيد محمود مراد،\\n\\nتم تسجيل غياب يوم 2026-02-25 بدون عذر مسبق.\\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: إنذار كتابي.\\n\\nإدارة الموارد البشرية\", \"occurrence_number\": 1, \"violation_type_id\": \"v-type-absence\"}', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '2026-02-25 21:34:05'),
('6faacc41-678e-466c-9c1a-3b05edd1d930', 'u-admin-01', 'update', 'company_profile', 'comp-001', '{\"id\": \"comp-001\", \"email\": \"info@ivorytraining.com\", \"phones\": [\"+966 533 993 220\"], \"address\": \"الرياض ، المرسلات طريق ابو بكر الصديق\", \"website\": \"https://ivorytraining.com/\", \"logo_path\": \"/images/ivory.png\", \"created_at\": \"2026-02-25 11:33:53\", \"manager_id\": \"e-002\", \"updated_at\": \"2026-02-25 11:33:53\", \"company_name\": \"ايفوري للتدريب والاستشارات\"}', '{\"id\": \"comp-001\", \"email\": \"info@ivorytraining.com\", \"phones\": [\"+966 533 993 220\"], \"address\": \"الرياض ، المرسلات طريق ابو بكر الصديقسيسيسي\", \"website\": \"https://ivorytraining.com/\", \"logo_path\": \"/images/ivory.png\", \"created_at\": \"2026-02-25 11:33:53\", \"manager_id\": \"e-002\", \"updated_at\": \"2026-02-25 12:15:04\", \"company_name\": \"ايفوري للتدريب والاستشارات\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-25 10:15:04'),
('99383047-0b8d-4bda-80a7-f79d9e254cde', NULL, 'create', 'employee_violations', '066e5d09-ed7c-4d25-8ce9-c347a1df0581', NULL, '{\"id\": \"066e5d09-ed7c-4d25-8ce9-c347a1df0581\", \"notes\": \"تأخير تجريبي 2\", \"status\": \"pending\", \"created_at\": \"2026-02-25 23:31:23\", \"updated_at\": \"2026-02-25 23:31:23\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"workflow_id\": null, \"applied_value\": 0, \"incident_date\": \"2026-02-25\", \"applied_action\": \"warning\", \"letter_content\": \"السيد نعمة عوض،\\n\\nتم تسجيل تأخير صباحي بتاريخ 2026-02-25.\\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: إنذار كتابي.\\n\\nإدارة الموارد البشرية\", \"occurrence_number\": 1, \"violation_type_id\": \"v-type-delay\"}', NULL, NULL, '2026-02-25 21:31:23'),
('a6892908-06d7-4a35-8df4-8b770d752dae', NULL, 'create', 'employee_violations', '883ed68b-ecff-4c3d-8b9b-1de331fa6f86', NULL, '{\"id\": \"883ed68b-ecff-4c3d-8b9b-1de331fa6f86\", \"notes\": \"تأخير تجريبي 1\", \"status\": \"pending\", \"created_at\": \"2026-02-25 23:31:47\", \"updated_at\": \"2026-02-25 23:31:47\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"workflow_id\": null, \"applied_value\": 0, \"incident_date\": \"2026-02-24\", \"applied_action\": \"warning\", \"letter_content\": \"السيد نعمة عوض،\\n\\nتم تسجيل تأخير صباحي بتاريخ 2026-02-24.\\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: إنذار كتابي.\\n\\nإدارة الموارد البشرية\", \"occurrence_number\": 1, \"violation_type_id\": \"v-type-delay\"}', NULL, NULL, '2026-02-25 21:31:47'),
('c820a297-e428-47be-9f4c-24f5419a9c3e', 'u-admin-01', 'create', 'employee_violations', '2e35d39c-d850-449b-aa66-038c1ff844bf', NULL, '{\"id\": \"2e35d39c-d850-449b-aa66-038c1ff844bf\", \"notes\": \"\", \"status\": \"pending\", \"created_at\": \"2026-02-25 23:33:53\", \"updated_at\": \"2026-02-25 23:33:53\", \"employee_id\": \"e-007\", \"workflow_id\": null, \"applied_value\": 0, \"incident_date\": \"2026-02-25\", \"applied_action\": \"warning\", \"letter_content\": \"السيد ابراهيم عبدالوهاب،\\n\\nتم تسجيل تأخير صباحي بتاريخ 2026-02-25.\\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: إنذار كتابي.\\n\\nإدارة الموارد البشرية\", \"occurrence_number\": 1, \"violation_type_id\": \"v-type-delay\"}', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36', '2026-02-25 21:33:53'),
('c939b2c7-00cc-43df-a68a-bb65fcc34d57', NULL, 'create', 'employee_violations', 'b8b25af5-b4ad-4b3d-8eff-62e3703f0c72', NULL, '{\"id\": \"b8b25af5-b4ad-4b3d-8eff-62e3703f0c72\", \"notes\": \"تأخير تجريبي 2\", \"status\": \"pending\", \"created_at\": \"2026-02-25 23:31:47\", \"updated_at\": \"2026-02-25 23:31:47\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"workflow_id\": null, \"applied_value\": 0.25, \"incident_date\": \"2026-02-25\", \"applied_action\": \"deduction_days\", \"letter_content\": \"السيد نعمة عوض،\\n\\nتم تسجيل تأخير صباحي بتاريخ 2026-02-25.\\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: خصم 0.25 يوم من الراتب.\\n\\nإدارة الموارد البشرية\", \"occurrence_number\": 2, \"violation_type_id\": \"v-type-delay\"}', NULL, NULL, '2026-02-25 21:31:47'),
('fae070bf-cea9-4174-8ef7-7a864ba15307', 'u-admin-01', 'update', 'company_profile', 'comp-001', '{\"id\": \"comp-001\", \"email\": \"info@ivorytraining.com\", \"phones\": [\"+966 533 993 220\"], \"address\": \"الرياض ، المرسلات طريق ابو بكر الصديقسيسيسي\", \"website\": \"https://ivorytraining.com/\", \"logo_path\": \"/images/ivory.png\", \"created_at\": \"2026-02-25 11:33:53\", \"manager_id\": \"e-002\", \"updated_at\": \"2026-02-25 12:15:04\", \"company_name\": \"ايفوري للتدريب والاستشارات\"}', '{\"id\": \"comp-001\", \"email\": \"info@ivorytraining.com\", \"phones\": [\"+966 533 993 220\"], \"address\": \"الرياض ، المرسلات طريق ابو بكر الصديق\", \"website\": \"https://ivorytraining.com/\", \"logo_path\": \"/images/ivory.png\", \"created_at\": \"2026-02-25 11:33:53\", \"manager_id\": \"e-002\", \"updated_at\": \"2026-02-25 12:15:12\", \"company_name\": \"ايفوري للتدريب والاستشارات\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-25 10:15:12');

-- --------------------------------------------------------

--
-- Table structure for table `bank_names`
--

CREATE TABLE `bank_names` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `swift_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_names`
--

INSERT INTO `bank_names` (`id`, `name`, `code`, `swift_code`, `created_at`, `status`) VALUES
('42c444ff-3e4d-4b86-812c-3fb8e0800fd3', 'بنك تركيا', 'tr-bank', NULL, '2026-02-05 22:15:59', 'active'),
('9f96bd4e-7130-415d-bd74-7ce4fe211797', 'بنك المغرب', 'moroco-bank', NULL, '2026-02-05 22:16:54', 'active'),
('a0be2676-a5ba-4253-a516-4250d118d31e', 'بنك الاردن', 'jordan-bank', NULL, '2026-02-05 22:16:36', 'active'),
('e2f06768-02d4-11f1-95cc-d481d76a1bbe', 'بنك مصر', 'misr-bank', 'xx10', '2026-02-05 20:54:38', 'active'),
('f45b0aa4-02d4-11f1-95cc-d481d76a1bbe', 'بنك الرياض', 'riadh-bank', 'rxxr22', '2026-02-05 20:55:08', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `bonuses`
--

CREATE TABLE `bonuses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` enum('SAR','EGP','USD') COLLATE utf8mb4_unicode_ci DEFAULT 'SAR',
  `date` date DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `current_stage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'direct_manager',
  `approval_log` json DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `current_approval_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_history` json DEFAULT NULL,
  `requires_finance_approval` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bonuses`
--

INSERT INTO `bonuses` (`id`, `request_number`, `employee_id`, `title`, `amount`, `currency`, `date`, `month`, `year`, `reason`, `status`, `current_stage`, `approval_log`, `rejection_reason`, `current_approval_level`, `approval_history`, `requires_finance_approval`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`) VALUES
('0a763b5d-fe3c-4ac2-b205-14c2aa3287e3', 'BON-2026-00008', 'e-003', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:54:04', NULL, 0, NULL),
('1569c2b5-8cf7-4332-b76f-b7e84d390f84', 'BON-2026-00013', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:55:22', NULL, 0, NULL),
('1cdba9e2-cdc3-4a24-a6ef-be8ae38d5034', 'BON-2026-00010', 'e-001', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:54:00', NULL, 0, NULL),
('23231b74-4ece-48ff-8094-0496e08c880d', 'BON-2026-00009', 'e-002', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 21:46:13', NULL, 0, NULL),
('272299ac-a07d-4147-a790-0c6da601e432', 'BON-2026-00001', 'e-008', 'تميز', '100.00', 'SAR', '2026-02-12', 2, 2026, 'تست', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-11 23:15:09', '2026-02-11 23:32:20', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-11T23:15:18+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-11T23:15:23+00:00\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-11T23:32:08+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-11T23:32:14+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-11T23:32:20+00:00\", \"role_required\": \"Finance Manager\"}]', 5, 'تم الاعتماد النهائي'),
('2e2f9937-fb91-4f9d-a924-7f1799dc32a2', 'BON-2026-00011', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:53:56', NULL, 0, NULL),
('37fc1b91-9bc6-4bf5-9ac0-40a7af65b617', 'BON-2026-00003', 'e-008', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:55:14', NULL, 0, NULL),
('38caab93-53ad-42f0-80f0-0f1d00025913', 'BON-2026-00012', 'd11c40d6-687e-446b-93a8-9c0464d91693', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:53:50', NULL, 0, NULL),
('55b62445-f30c-4dea-aa9e-4ffc3cc37318', 'BON-2026-00007', 'e-004', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:55:19', NULL, 0, NULL),
('57c1a3c8-5ed5-4542-8374-faf868681482', 'BON-2026-00015', 'e-008', 'ئسشسش', '33232.00', 'SAR', '2026-02-24', 2, 2026, 'سثصصث', 'pending', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-24 13:20:39', '2026-02-24 13:20:39', NULL, 0, NULL),
('750696de-b6fc-4d42-811c-650d5ea4fb54', 'BON-2026-00014', 'e-008', 'سيسي', '2323.00', 'SAR', '2026-02-24', 2, 2026, 'ثث', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-24 09:07:18', '2026-02-24 13:53:26', NULL, 0, NULL),
('96940e3e-4be4-4145-b11a-614a6084963f', 'BON-2026-00002', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'test', '100.00', 'SAR', '2026-02-12', 2, 2026, '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-12 01:26:05', '2026-02-12 01:26:21', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:26:10+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-12T01:26:14+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:26:17+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-12T01:26:21+00:00\", \"role_required\": \"Finance Manager\"}]', 4, 'تم الاعتماد النهائي'),
('c7831d6d-67cc-450f-be4a-be655da50141', 'BON-2026-00006', 'e-005', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:54:53', NULL, 0, NULL),
('fd77d065-3684-4cd8-89d9-197153a96528', 'BON-2026-00005', 'e-006', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 21:45:43', NULL, 0, NULL),
('ff502d8f-9eef-4bef-b83b-663bef6e1578', 'BON-2026-00004', 'e-007', '150', '150.00', 'SAR', '2026-02-22', 2, 2026, 'تميز', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 19:48:24', '2026-02-22 19:54:07', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `business_tasks`
--

CREATE TABLE `business_tasks` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `company_profile`
--

CREATE TABLE `company_profile` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phones` json DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_profile`
--

INSERT INTO `company_profile` (`id`, `company_name`, `address`, `phones`, `email`, `website`, `manager_id`, `logo_path`, `updated_at`, `created_at`) VALUES
('comp-001', 'ايفوري للتدريب والاستشارات', 'الرياض ، المرسلات طريق ابو بكر الصديق', '[\"+966 533 993 220\"]', 'info@ivorytraining.com', 'https://ivorytraining.com/', 'e-002', '/images/ivory.png', '2026-02-25 10:15:12', '2026-02-25 09:33:53');

-- --------------------------------------------------------

--
-- Table structure for table `competencies`
--

CREATE TABLE `competencies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level_definitions` json DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `competencies`
--

INSERT INTO `competencies` (`id`, `template_id`, `name`, `description`, `category`, `level_definitions`, `status`, `created_at`, `updated_at`) VALUES
('14254677-7528-4474-9073-ab0525ac967a', '7f4fa2ac-0598-4556-b04f-7677aaccae86', 'جدارة1', 'وصف جدارة1', 'الادارة', '{\"level_1\": \"ضعيف\", \"level_2\": \"مقبول\", \"level_3\": \"جيد\", \"level_4\": \"جيد جدا\", \"level_5\": \"ممتاز\"}', 'active', '2026-02-09 18:10:55', '2026-02-09 19:17:58'),
('1f64584a-2d00-4587-8ca4-ce95849fbbf4', '16ecb786-5dc7-4381-8398-5d6c6134f2fb', 'جدارة مختلفة', 'جدارة مختلفة ', 'الادارة', '{\"level_1\": \"ضعيف\", \"level_2\": \"مقبول يحتاج تحسين\", \"level_3\": \"يلبي التوقعات\", \"level_4\": \"يتجاوز التوقعات\", \"level_5\": \"استثنائي\"}', 'active', '2026-02-09 19:20:40', '2026-02-09 21:38:25'),
('35e0826d-5afc-438e-b956-f9bb0a316412', '7f4fa2ac-0598-4556-b04f-7677aaccae86', 'جدارة2', 'جدارة2', 'الجدارات العامة', '{\"level_1\": \"ضعيف\", \"level_2\": \"مقبول\", \"level_3\": \"جيد\", \"level_4\": \"جيد جدا\", \"level_5\": \"ممتاز\"}', 'active', '2026-02-09 19:18:40', '2026-02-09 19:18:40'),
('df206463-a0bd-4de3-9505-fa7d08510a78', '22186c84-5c5c-40f9-aeff-a108c65cf697', 'rtrtr', 'rtrt', 'General', '{\"level_1\": \"trt\", \"level_2\": \"rtrt\", \"level_3\": \"rtrt\", \"level_4\": \"rtr\", \"level_5\": \"trt\"}', 'active', '2026-02-12 20:57:02', '2026-02-12 20:57:02');

-- --------------------------------------------------------

--
-- Table structure for table `competency_ratings`
--

CREATE TABLE `competency_ratings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `evaluation_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `competency_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int DEFAULT NULL,
  `evaluator_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `competency_ratings`
--

INSERT INTO `competency_ratings` (`id`, `evaluation_id`, `employee_id`, `competency_id`, `rating`, `evaluator_id`, `evaluation_date`, `comments`, `created_at`) VALUES
('0e8d1789-e1d5-4340-ac37-bbfd324d1b18', '659ccd4b-c2b9-40f9-bf34-9568cbabab18', 'e-008', '35e0826d-5afc-438e-b956-f9bb0a316412', 2, 'u-admin-01', '2026-02-24', NULL, '2026-02-24 13:54:43'),
('184d515a-55eb-4b3a-9171-ac1cc31ff8d9', 'adf1622e-d6cc-4580-9aee-9bd7e96756ab', 'e-008', '35e0826d-5afc-438e-b956-f9bb0a316412', 4, 'u-admin-01', '2026-02-12', NULL, '2026-02-10 22:16:03'),
('22677b8c-281d-45e3-88e4-5edcbd9925e9', '659ccd4b-c2b9-40f9-bf34-9568cbabab18', 'e-008', '14254677-7528-4474-9073-ab0525ac967a', 2, 'u-admin-01', '2026-02-24', NULL, '2026-02-24 13:54:43'),
('3802026f-5a1e-4a6a-b558-ab73512a0f80', '0ef0af5f-745b-4cd0-bc01-8eee006d9d84', 'd11c40d6-687e-446b-93a8-9c0464d91693', '35e0826d-5afc-438e-b956-f9bb0a316412', 2, 'u-admin-01', '2026-02-23', NULL, '2026-02-23 11:31:00'),
('4d49b6d3-229a-48cc-b702-91ec2557da21', 'b32278ee-4d40-4dd4-bbd2-71d54ac086ba', 'e-008', '14254677-7528-4474-9073-ab0525ac967a', 1, 'u-admin-01', '2026-02-09', NULL, '2026-02-09 22:30:45'),
('b13d778f-6390-4efc-bb3e-3ea58585d7e8', 'b32278ee-4d40-4dd4-bbd2-71d54ac086ba', 'e-008', '35e0826d-5afc-438e-b956-f9bb0a316412', 2, 'u-admin-01', '2026-02-09', NULL, '2026-02-09 22:30:45'),
('b55fdf03-c301-4594-90ce-bb14eb2666d7', '0ef0af5f-745b-4cd0-bc01-8eee006d9d84', 'd11c40d6-687e-446b-93a8-9c0464d91693', '14254677-7528-4474-9073-ab0525ac967a', 1, 'u-admin-01', '2026-02-23', NULL, '2026-02-23 11:31:00'),
('b9d91a89-d5ba-411c-a1df-940cbaa1663a', '95e4b089-f3e3-4f5f-bbb5-4b25a310a4e9', 'd11c40d6-687e-446b-93a8-9c0464d91693', '14254677-7528-4474-9073-ab0525ac967a', 1, 'u-admin-01', '2026-02-23', NULL, '2026-02-23 11:07:03'),
('cf6a2393-c12c-49d2-b7c3-bfd429e1c399', 'adf1622e-d6cc-4580-9aee-9bd7e96756ab', 'e-008', '14254677-7528-4474-9073-ab0525ac967a', 5, 'u-admin-01', '2026-02-12', NULL, '2026-02-10 22:16:03'),
('f4346008-2e72-40d6-8a87-503d89025306', '95e4b089-f3e3-4f5f-bbb5-4b25a310a4e9', 'd11c40d6-687e-446b-93a8-9c0464d91693', '35e0826d-5afc-438e-b956-f9bb0a316412', 2, 'u-admin-01', '2026-02-23', NULL, '2026-02-23 11:07:03');

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `gross_salary` decimal(12,2) NOT NULL,
  `currency` enum('SAR','EGP','USD') COLLATE utf8mb4_unicode_ci DEFAULT 'SAR',
  `basic_salary` decimal(12,2) DEFAULT NULL,
  `housing_allowance` decimal(12,2) DEFAULT '0.00',
  `transport_allowance` decimal(12,2) DEFAULT '0.00',
  `other_allowances` decimal(12,2) DEFAULT '0.00',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `current_approval_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_history` json DEFAULT NULL,
  `requires_finance_approval` tinyint(1) DEFAULT '1',
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci,
  `approval_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'planned'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contracts`
--

INSERT INTO `contracts` (`id`, `request_number`, `employee_id`, `contract_number`, `contract_type`, `start_date`, `end_date`, `gross_salary`, `currency`, `basic_salary`, `housing_allowance`, `transport_allowance`, `other_allowances`, `status`, `current_approval_level`, `approval_history`, `requires_finance_approval`, `document_url`, `notes`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`, `approval_status`) VALUES
('077fcc17-fe8e-4c18-b676-bc89dc1b8c5a', 'CON-2026-00006', 'e-006', 'CON-2026', 'عقد دائم', '2026-02-06', '2030-02-06', '1295.00', 'SAR', '1000.00', '100.00', '95.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:05:35', '2026-02-05 23:05:35', NULL, 0, NULL, 'planned'),
('085984b0-abef-44a4-8efb-245cac221811', 'CON-2026-00015', 'e-003', 'CON-2037', 'عقد دائم', '2026-02-24', '2030-02-25', '2850.00', 'USD', '2000.00', '500.00', '200.00', '150.00', 'active', NULL, NULL, 1, NULL, NULL, '2026-02-24 09:01:24', '2026-02-24 13:16:26', NULL, 0, NULL, 'approved'),
('23fe8780-c4b5-4916-b70a-bafa7e32e8d1', 'CON-2026-00008', 'e-004', 'CON-2028', 'عقد مؤقت', '2026-02-06', '2030-02-06', '2599.00', 'SAR', '2000.00', '200.00', '199.00', '200.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:06:43', '2026-02-05 23:06:43', NULL, 0, NULL, 'planned'),
('63a1675a-f6f2-4859-9dc8-753811fc149e', 'CON-2026-00013', '5b7e0d98-28ef-44dc-8326-11f10dd0870f', 'CON-2035', 'عقد دائم', '2026-02-01', '2027-02-25', '675.00', 'SAR', '500.00', '50.00', '50.00', '75.00', 'active', NULL, NULL, 1, NULL, NULL, '2026-02-24 08:00:57', '2026-02-24 08:06:08', NULL, 0, NULL, 'approved'),
('63d9711d-7037-4364-ad21-7558a4b4e931', 'CON-2026-00005', 'e-007', 'CON-2025', 'عقد دائم', '2026-02-06', '2030-02-06', '1297.00', 'SAR', '1000.00', '100.00', '97.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:05:04', '2026-02-05 23:05:04', NULL, 0, NULL, 'planned'),
('9568b96d-6775-4097-925b-db80d09a0795', 'CON-2026-00014', 'd11c40d6-687e-446b-93a8-9c0464d91693', 'CON-2036', 'عقد دائم', '2026-02-24', '2027-02-24', '13000.00', 'USD', '10000.00', '1000.00', '1000.00', '1000.00', 'active', NULL, NULL, 1, NULL, NULL, '2026-02-24 08:27:09', '2026-02-24 08:29:02', NULL, 0, NULL, 'approved'),
('bc9fbc11-c25f-4663-bc69-58b2edcf5868', 'CON-2026-00007', 'e-005', 'CON-2027', 'عقد دائم', '2026-02-06', '2030-02-06', '1300.00', 'EGP', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:06:07', '2026-02-05 23:06:07', NULL, 0, NULL, 'planned'),
('bf1a371e-1ca1-4ad9-ba8f-5677e52d7d43', NULL, '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'CON-2029', 'عقد دائم', '2025-02-01', '2027-02-10', '1300.00', 'EGP', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, NULL, '2026-02-10 22:28:04', '2026-02-12 01:24:49', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-10T22:28:31.512Z\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-10T22:28:39.801Z\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-10T22:28:46.166Z\", \"role_required\": \"Finance Manager\"}]', 2, 'تم الاعتماد النهائي', 'planned'),
('c-001', NULL, 'e-001', 'CON-2020-001', 'عقد دائم', '2020-01-01', '2030-02-06', '1300.00', 'USD', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 14:57:42', '2026-02-05 23:03:38', NULL, 0, NULL, 'planned'),
('c-002', NULL, 'e-002', 'CON-2022-001', 'عقد دائم', '2022-03-15', '2030-02-06', '6300.00', 'SAR', '6000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 14:57:42', '2026-02-05 23:03:54', NULL, 0, NULL, 'planned'),
('c-003', NULL, 'e-003', 'CON-2023-001', 'عقد دائم', '2023-06-01', '2026-02-23', '5300.00', 'EGP', '5000.00', '100.00', '100.00', '100.00', 'expired', NULL, NULL, 1, NULL, '-', '2026-02-05 14:57:42', '2026-02-24 09:01:24', NULL, 0, NULL, 'planned'),
('c629705b-3f6b-4fcf-9c62-a6d01531c7ae', 'CON-2026-00011', 'd11c40d6-687e-446b-93a8-9c0464d91693', 'CON-2033', 'عقد دائم', '2026-02-01', '2026-02-24', '400.00', 'SAR', '100.00', '100.00', '100.00', '100.00', 'expired', NULL, NULL, 1, NULL, NULL, '2026-02-23 12:17:43', '2026-02-24 07:51:00', NULL, 0, NULL, 'approved'),
('f8dafbeb-9edb-457a-b7d5-747cbc6bbf5f', NULL, 'e-008', 'CON-2030', 'عقد دائم', '2025-02-01', '2027-02-01', '1300.00', 'USD', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, 'تجربة عقد', '2026-02-21 19:57:06', '2026-02-22 14:55:48', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-10T22:28:31.512Z\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-10T22:28:39.801Z\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-10T22:28:46.166Z\", \"role_required\": \"Finance Manager\"}]', 2, 'تم الاعتماد النهائي', 'planned'),
('f8dafbeb-9edb-457a-b7d5-747cbc6bbf5h', NULL, 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', 'CON-2032', 'عقد دائم', '2025-02-01', '2027-02-01', '1300.00', 'USD', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, 'تجربة عقد', '2026-02-21 19:57:06', '2026-02-22 14:59:28', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-10T22:28:31.512Z\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-10T22:28:39.801Z\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-10T22:28:46.166Z\", \"role_required\": \"Finance Manager\"}]', 2, 'تم الاعتماد النهائي', 'planned');

-- --------------------------------------------------------

--
-- Table structure for table `contract_types`
--

CREATE TABLE `contract_types` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contract_types`
--

INSERT INTO `contract_types` (`id`, `name`, `code`, `description`, `created_at`, `status`) VALUES
('09676b46-02d6-11f1-95cc-d481d76a1bbe', 'عقد مؤقت', 'cont2', 'عقد مؤقت', '2026-02-05 21:02:52', 'active'),
('fad4c836-02d5-11f1-95cc-d481d76a1bbe', 'عقد دائم', 'cont1', 'عقد دائم', '2026-02-05 21:02:28', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `deductions`
--

CREATE TABLE `deductions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` enum('SAR','EGP','USD') COLLATE utf8mb4_unicode_ci DEFAULT 'SAR',
  `date` date DEFAULT NULL,
  `month` int DEFAULT NULL,
  `year` int DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'approved',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deduction_types`
--

CREATE TABLE `deduction_types` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deduction_types`
--

INSERT INTO `deduction_types` (`id`, `name`, `code`, `description`, `created_at`, `status`) VALUES
('05bf570d-02a3-11f1-a178-d481d76a1bbe', 'خصم تأخير', 'LATE', 'خصم تأخير', '2026-02-05 14:57:42', 'active'),
('05bf5b92-02a3-11f1-a178-d481d76a1bbe', 'سلفة', 'LOAN', 'سلفة', '2026-02-05 14:57:42', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_department_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manager_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `code`, `parent_department_id`, `manager_id`, `description`, `status`, `created_at`, `updated_at`) VALUES
('51b1aad9-871b-4b38-910c-138c16e41d14', 'IvoryTraining', 'IvoryTraining', NULL, 'e-002', 'IvoryTraining', 'active', '2026-02-05 16:10:43', '2026-02-05 16:10:43'),
('cefdd52a-b663-4a76-9e51-d20bea6ce9e7', 'التعليم الرقمي', 'EL', 'd-it', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', 'التعليم الرقمي', 'active', '2026-02-22 14:00:07', '2026-02-22 14:06:23'),
('d-fin', 'المالية', 'FIN', '51b1aad9-871b-4b38-910c-138c16e41d14', 'e-006', 'المالية', 'active', '2026-02-05 14:57:42', '2026-02-05 21:38:28'),
('d-hr', 'الموارد البشرية', 'HR', '51b1aad9-871b-4b38-910c-138c16e41d14', 'e-005', 'الموارد البشرية', 'active', '2026-02-05 14:57:42', '2026-02-05 21:38:42'),
('d-it', 'تقنية المعلومات', 'IT', 'd630c421-c5b2-4d07-8975-4e2b2fa6e08c', 'e-007', 'تقنية المعلومات', 'active', '2026-02-05 14:57:42', '2026-02-05 21:39:43'),
('d630c421-c5b2-4d07-8975-4e2b2fa6e08c', 'الدعم اللوجستي', 'support', '51b1aad9-871b-4b38-910c-138c16e41d14', 'e-004', 'الدعم اللوجستي', 'active', '2026-02-05 21:39:25', '2026-02-05 21:39:25');

-- --------------------------------------------------------

--
-- Table structure for table `development_logs`
--

CREATE TABLE `development_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `task_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `log_date` date DEFAULT NULL,
  `technical_description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'feature',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'planned',
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `assigned_to` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `business_logic` text COLLATE utf8mb4_unicode_ci,
  `business_rules` json DEFAULT NULL,
  `database_entities` json DEFAULT NULL,
  `frontend_backend_flow` text COLLATE utf8mb4_unicode_ci,
  `dependencies` json DEFAULT NULL,
  `ai_reproduction_prompt` text COLLATE utf8mb4_unicode_ci,
  `module_interconnections` json DEFAULT NULL,
  `api_endpoints` json DEFAULT NULL,
  `affected_files` json DEFAULT NULL,
  `performance_notes` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `development_logs`
--

INSERT INTO `development_logs` (`id`, `task_title`, `log_date`, `technical_description`, `category`, `status`, `priority`, `assigned_to`, `completed_at`, `created_at`, `updated_at`, `business_logic`, `business_rules`, `database_entities`, `frontend_backend_flow`, `dependencies`, `ai_reproduction_prompt`, `module_interconnections`, `api_endpoints`, `affected_files`, `performance_notes`, `notes`) VALUES
('23c87bfb-c443-4564-9a2d-cdd743c7c269', 'تفعيل نظام سجل الرقابة الإدارية (Audit Log)', '2026-02-13', 'تم دمج نظام مراقبة شامل يسجل جميع عمليات الإضافة والتعديل والحذف والاعتماد تلقائياً في النظام مع حفظ القيم القديمة والجديدة.', 'feature', 'completed', 'high', NULL, NULL, '2026-02-13 00:00:46', '2026-02-13 00:00:46', 'استخدام الـ BaseController لاعتراض جميع طلبات الـ POST/PUT/DELETE وتسجيل البيانات قبل وبعد العملية في جدول audit_logs. تم ربط الهوية الرقمية عبر headers التوثيق.', NULL, '[\"audit_logs\"]', NULL, NULL, 'قم بإنشاء جدول audit_logs يحتوي على (user_id, action, entity_type, entity_id, old_values, new_values). ثم عدل BaseController ليقوم باستدعاء وظيفة recordAuditLog في دوال store و update و destroy.', NULL, NULL, '[\"BaseController.php\", \"AuditLogsController.php\", \"audit.php\", \"index.php\"]', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_location_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_schedule_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `date_of_joining` date DEFAULT NULL,
  `termination_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `profile_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documents` json DEFAULT NULL,
  `nationality` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_number`, `full_name`, `id_number`, `phone`, `email`, `position`, `department`, `work_location_id`, `work_schedule_id`, `hire_date`, `date_of_joining`, `termination_date`, `status`, `profile_image`, `documents`, `nationality`, `gender`, `birth_date`, `bank_name`, `bank_account`, `iban`, `created_at`, `updated_at`) VALUES
('1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'EMP-0002', 'نعمة عوض', '2255889966', '0115242552', 'nema@ivory.com', 'أخصائي رواتب', 'الموارد البشرية', 'loc-main', '0d13882f-f1e3-467a-aa18-1604e5c31cdd', '2025-02-10', '2025-01-01', NULL, 'active', NULL, '[]', 'مصري', 'female', '1993-02-10', 'بنك مصر', '3218520', 'iban3218520', '2026-02-10 21:47:11', '2026-02-24 20:46:45'),
('5b7e0d98-28ef-44dc-8326-11f10dd0870f', 'EMP-0013', 'test', NULL, NULL, 'test@test', 'مطور برمجيات', 'تقنية المعلومات', 'loc-remote', '0d13882f-f1e3-467a-aa18-1604e5c31cdd', NULL, '2026-02-01', '2026-02-24', 'active', NULL, '[]', 'مصري', 'male', NULL, NULL, NULL, NULL, '2026-02-24 08:00:04', '2026-02-24 20:46:37'),
('d11c40d6-687e-446b-93a8-9c0464d91693', 'EMP-0011', 'ريان وائل', NULL, NULL, 'ryan@ivory.com', 'مطور برمجيات', 'التعليم الرقمي', 'loc-remote', '0d13882f-f1e3-467a-aa18-1604e5c31cdd', '2026-02-01', '2025-01-01', '2026-02-10', 'active', NULL, '[]', 'مصري', NULL, '2000-02-01', NULL, NULL, NULL, '2026-02-21 19:26:44', '2026-02-24 20:46:25'),
('ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', 'EMP-0012', 'هشام سعد', NULL, NULL, 'hisham@ivory.com', 'مدير قسم التعلم الرقمي', 'التعليم الرقمي', 'loc-remote', '0d13882f-f1e3-467a-aa18-1604e5c31cdd', '2025-02-01', '2025-01-01', NULL, 'active', NULL, '[]', 'مصري', NULL, '2026-02-01', NULL, NULL, NULL, '2026-02-21 19:33:10', '2026-02-24 20:46:17'),
('e-001', 'EMP001', 'مدير النظام-كل الصلاحيات', '2245185950', '01150240451', 'admin@ivory.com', 'أدمن النظام', 'تقنية المعلومات', 'ee7c04a4-4c7f-47e8-84f3-ad8235e3d8f8', '99c9cbeb-2df0-4013-ad63-ae6045278aa1', '2020-01-01', '2025-01-01', NULL, 'active', NULL, '[]', 'مصري', 'male', '2000-02-05', 'بنك مصر', '2335', 'iban2335', '2026-02-05 14:57:42', '2026-02-24 21:11:34'),
('e-002', 'EMP002', 'محمود الصالح', '1010101010', NULL, 'mahmoudalsaleh@ivory.com', 'مدير قسم', 'IvoryTraining', 'loc-main', '99c9cbeb-2df0-4013-ad63-ae6045278aa1', '2022-03-15', '2025-01-01', NULL, 'active', NULL, '[]', 'سوري', NULL, '1978-10-01', 'بنك الرياض', '2336', 'iban2336', '2026-02-05 14:57:42', '2026-02-24 20:46:08'),
('e-003', 'EMP003', 'هاني متولي', '10102020', '01150241523', 'hany@ivory.com', 'مستشار التقنية', 'الدعم اللوجستي', 'loc-remote', '0d13882f-f1e3-467a-aa18-1604e5c31cdd', '2023-06-01', '2025-01-01', NULL, 'active', NULL, '[]', 'مصري', NULL, '1977-02-06', 'بنك مصر', '23371', 'iban23371', '2026-02-05 14:57:42', '2026-02-24 20:45:59'),
('e-004', 'EMP004', 'عبدالمؤمن ايمن', '101030245', '0115024325', 'abdalmumn@ivory.com', 'مدير الدعم اللوجستي', 'الدعم اللوجستي', 'loc-main', '99c9cbeb-2df0-4013-ad63-ae6045278aa1', '2023-06-01', '2025-01-01', NULL, 'active', NULL, '[]', 'سوري', NULL, '1994-02-06', 'بنك الرياض', '78654', 'iban78654', '2026-02-05 14:57:42', '2026-02-24 20:45:18'),
('e-005', 'EMP005', 'أمانى رسلان', '10104040452', '0115236352', 'amany@ivory.com', 'مدير قسم الموارد البشرية', 'الموارد البشرية', 'loc-main', 'a59f6b22-bc6f-43d3-88ed-09521290a3bd', '2023-06-01', '2025-01-01', NULL, 'active', NULL, '[]', 'مصري', NULL, '1999-02-01', 'بنك مصر', '987456', 'iban987456', '2026-02-05 14:57:42', '2026-02-24 20:45:09'),
('e-006', 'EMP006', 'محمود مراد', '10908071', '0524252525', 'murad@ivory.com', 'مدير الحسابات', 'المالية', 'loc-main', '99c9cbeb-2df0-4013-ad63-ae6045278aa1', '2023-06-01', '2025-01-01', NULL, 'active', NULL, '[]', 'فلسطيني', NULL, '2026-02-01', 'بنك مصر', '88772211', 'iban88772211', '2026-02-05 14:57:42', '2026-02-24 20:44:59'),
('e-007', 'EMP007', 'ابراهيم عبدالوهاب', '10002003', '1010202020', 'ibrahim@ivory.com', 'مدير التقنية', 'تقنية المعلومات', 'loc-main', '99c9cbeb-2df0-4013-ad63-ae6045278aa1', '2023-06-01', '2025-01-01', NULL, 'active', NULL, '[]', 'مصري', NULL, '2004-02-01', 'بنك الرياض', '909080', 'iban909080', '2026-02-05 14:57:42', '2026-02-24 20:44:48'),
('e-008', 'EMP008', 'ابراهيم لبدع', '224535255', '10205497', 'ibrahimlebdaa@ivory.com', 'مطور برمجيات', 'تقنية المعلومات', 'loc-main', 'a59f6b22-bc6f-43d3-88ed-09521290a3bd', '2023-06-01', '2025-01-01', NULL, 'active', NULL, '[]', 'مغربي', NULL, '2004-02-02', 'بنك المغرب', '7777778', 'iban7777778', '2026-02-05 14:57:42', '2026-02-24 20:44:35');

-- --------------------------------------------------------

--
-- Table structure for table `employee_bonus_totals`
--

CREATE TABLE `employee_bonus_totals` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'YYYY-MM',
  `total_count` int DEFAULT '0',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_bonus_totals`
--

INSERT INTO `employee_bonus_totals` (`id`, `employee_id`, `month`, `total_count`, `total_amount`, `created_at`, `updated_at`) VALUES
('1c86cf45-e155-4da7-8743-3c8c7aa360dc', 'e-007', '2026-02', 1, '150.00', '2026-02-22 19:54:07', '2026-02-22 19:54:07'),
('5078ab1e-8230-4112-bd20-f4c21c38be82', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', '2026-02', 1, '150.00', '2026-02-22 19:53:56', '2026-02-22 19:53:56'),
('643e2788-aee4-4a42-ae3a-bb1916cbd047', 'e-002', '2026-02', 1, '150.00', '2026-02-22 21:46:13', '2026-02-22 21:46:13'),
('681153ca-b43f-47a9-8071-08f56204ea93', 'e-004', '2026-02', 1, '150.00', '2026-02-22 19:55:19', '2026-02-22 19:55:19'),
('7f0e8f9f-dfa3-43ef-b5ef-2a5ca069d596', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', '2026-02', 2, '250.00', '2026-02-22 19:55:22', '2026-02-22 19:55:22'),
('8d0e57fc-c132-48cd-8241-e44e9b528905', 'e-001', '2026-02', 1, '150.00', '2026-02-22 19:54:00', '2026-02-22 19:54:00'),
('9e8a8ef9-2f52-41a7-85c6-da2a898cadbc', 'e-005', '2026-02', 1, '150.00', '2026-02-22 19:54:53', '2026-02-22 19:54:53'),
('b44be01a-7b25-4f0d-8d68-5abb29d84ae2', 'd11c40d6-687e-446b-93a8-9c0464d91693', '2026-02', 1, '150.00', '2026-02-22 19:53:50', '2026-02-22 19:53:50'),
('dbf95caa-9649-477b-82b6-0b9150423b01', 'e-006', '2026-02', 1, '150.00', '2026-02-22 21:45:43', '2026-02-22 21:45:43'),
('f6b5cd9c-c169-4d89-a16e-de1284899dcc', 'e-003', '2026-02', 1, '150.00', '2026-02-22 19:54:04', '2026-02-22 19:54:04'),
('ffac0d16-b821-46e5-bac1-f2f23f2e2373', 'e-008', '2026-02', 3, '2573.00', '2026-02-22 19:55:14', '2026-02-24 13:53:26');

-- --------------------------------------------------------

--
-- Table structure for table `employee_leave_balances`
--

CREATE TABLE `employee_leave_balances` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_type_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` int NOT NULL,
  `total_balance` int DEFAULT '0',
  `used_balance` int DEFAULT '0',
  `remaining_balance` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_leave_balances`
--

INSERT INTO `employee_leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `total_balance`, `used_balance`, `remaining_balance`, `created_at`, `updated_at`) VALUES
('32c04a5a-206d-4434-9256-2df37e982fd2', 'e-007', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('4eb14415-9f96-4c61-b731-7585b83b1166', 'e-008', 'c35fd762-1197-4894-8937-25b89723c76c', 2026, 10, 3, 7, '2026-02-24 13:20:05', '2026-02-24 13:20:05'),
('7066b7a7-af35-4e26-8973-28159058e43e', 'e-005', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('7b8f8538-c13b-448a-9cf0-bcbe400d9dc1', 'e-006', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('8650eedd-d849-42cd-a936-ee80bb30b291', 'e-001', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('88803bc1-9a4f-46d8-a555-8788cb15e4e3', 'e-008', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 4, 17, '2026-02-08 22:41:14', '2026-02-24 15:35:37'),
('8b596dbf-2694-4ad7-8377-e51f8acb6920', 'd11c40d6-687e-446b-93a8-9c0464d91693', '9fea73dd-d9a4-4404-aa38-61845e3b7782', 2026, 10, 0, 10, '2026-02-21 19:26:44', '2026-02-21 19:26:44'),
('b445fa53-9413-4208-b56a-2db6e9a16cde', 'e-008', '6c1681e5-02a0-11f1-a178-d481d76a1bbe', 2026, 30, 4, 26, '2026-02-22 09:48:40', '2026-02-22 09:48:40'),
('b623cce9-b3ab-43ba-8614-a4164dafcdd1', 'e-002', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('c19e4c29-d585-4189-b008-e76692c76acf', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', 'c35fd762-1197-4894-8937-25b89723c76c', 2026, 10, 0, 10, '2026-02-21 19:33:10', '2026-02-21 19:33:10'),
('c91ff56b-a47e-46e8-8fa6-ab0e3a1bb427', 'e-004', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('f9e7f173-e3d7-427c-957f-7ec462ec8506', 'e-003', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14');

-- --------------------------------------------------------

--
-- Table structure for table `employee_overtime_bonuses`
--

CREATE TABLE `employee_overtime_bonuses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'YYYY-MM',
  `total_hours` decimal(8,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_overtime_bonuses`
--

INSERT INTO `employee_overtime_bonuses` (`id`, `employee_id`, `month`, `total_hours`, `total_amount`, `created_at`, `updated_at`) VALUES
('14e00cd1-811d-42ac-9b59-566a55160b9d', 'e-002', '2026-02', '10.00', '375.00', '2026-02-22 19:53:40', '2026-02-22 19:53:40'),
('1c0e9721-950f-45be-bf1a-871ff7112366', 'd11c40d6-687e-446b-93a8-9c0464d91693', '2026-02', '10.00', '62.50', '2026-02-22 19:55:05', '2026-02-22 19:55:05'),
('3c1f9361-a18f-4757-8074-9df194465ef8', 'e-008', '2026-02', '51.00', '287.50', '2026-02-22 19:02:18', '2026-02-24 13:53:43'),
('4dfa6b1c-1ea2-4b1a-abd6-d6f520e59697', 'e-007', '2026-02', '10.00', '62.50', '2026-02-22 19:02:32', '2026-02-22 19:02:32'),
('56cc9efd-ac4a-4838-9a48-59e69e711199', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', '2026-02', '10.00', '62.50', '2026-02-22 19:55:01', '2026-02-22 19:55:01'),
('62989c2a-e01a-4000-8149-35b4e04a4dfb', 'e-005', '2026-02', '10.00', '62.50', '2026-02-22 19:02:39', '2026-02-22 19:02:39'),
('79bc95ff-7494-4ebf-a7ae-2bca632c0c31', 'e-004', '2026-02', '10.00', '125.00', '2026-02-22 19:02:35', '2026-02-22 19:02:35'),
('a5d64f5b-08a5-44fe-90ec-889d4c908304', 'e-003', '2026-02', '10.00', '312.50', '2026-02-22 19:02:46', '2026-02-22 19:02:46'),
('c87b6a82-fb53-461e-a9ca-d8ebd999cbb1', 'e-006', '2026-02', '10.00', '62.50', '2026-02-22 19:53:02', '2026-02-22 19:53:02'),
('d37ed8e6-fe59-4fa5-b275-d50abf099f66', 'e-001', '2026-02', '10.00', '62.50', '2026-02-22 19:02:27', '2026-02-22 19:02:27'),
('fabcc8c0-9fd7-4f95-ab6d-ad7d929f526f', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', '2026-02', '17.50', '109.38', '2026-02-22 19:02:51', '2026-02-22 19:02:51');

-- --------------------------------------------------------

--
-- Table structure for table `employee_permission_deductions`
--

CREATE TABLE `employee_permission_deductions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'YYYY-MM',
  `total_approved_minutes` int DEFAULT '0',
  `monthly_limit_minutes` int DEFAULT '240',
  `excess_minutes` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_trainings`
--

CREATE TABLE `employee_trainings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `training_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `current_stage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'direct_manager',
  `approval_log` json DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `approval_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `current_approval_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_history` json DEFAULT NULL,
  `requires_finance_approval` tinyint(1) DEFAULT '0',
  `registration_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `certificate_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_trainings`
--

INSERT INTO `employee_trainings` (`id`, `request_number`, `employee_id`, `training_id`, `status`, `current_stage`, `approval_log`, `rejection_reason`, `approval_status`, `current_approval_level`, `approval_history`, `requires_finance_approval`, `registration_date`, `start_date`, `end_date`, `completion_date`, `score`, `certificate_url`, `notes`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`) VALUES
('d873643d-da65-4309-a7be-edc2a8ce56fb', 'TRN-2026-00001', 'e-008', '518cc135-e17c-478f-a677-8a88e1b08b74', 'completed', 'direct_manager', NULL, NULL, 'approved', NULL, NULL, 0, NULL, '2026-02-24', '2026-02-25', NULL, NULL, NULL, '', '2026-02-24 14:36:52', '2026-02-24 14:52:40', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_violations`
--

CREATE TABLE `employee_violations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `workflow_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `violation_type_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `incident_date` date NOT NULL,
  `occurrence_number` int NOT NULL,
  `applied_action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `applied_value` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','applied','forgiven') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `letter_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_violations`
--

INSERT INTO `employee_violations` (`id`, `workflow_id`, `employee_id`, `violation_type_id`, `incident_date`, `occurrence_number`, `applied_action`, `applied_value`, `status`, `letter_content`, `notes`, `created_at`, `updated_at`) VALUES
('2e35d39c-d850-449b-aa66-038c1ff844bf', '31e778c4-66fc-4d08-a954-4cd2e43a1b0e', 'e-007', 'v-type-delay', '2026-02-25', 1, 'warning', '0.00', 'pending', 'السيد ابراهيم عبدالوهاب،\n\nتم تسجيل تأخير صباحي بتاريخ 2026-02-25.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: إنذار كتابي.\n\nإدارة الموارد البشرية', '', '2026-02-25 21:33:53', '2026-02-25 21:33:53'),
('883ed68b-ecff-4c3d-8b9b-1de331fa6f86', 'dcc2424e-6632-42a8-a20c-58524c723b98', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'v-type-delay', '2026-02-24', 1, 'warning', '0.00', 'pending', 'السيد نعمة عوض،\n\nتم تسجيل تأخير صباحي بتاريخ 2026-02-24.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: إنذار كتابي.\n\nإدارة الموارد البشرية', 'تأخير تجريبي 1', '2026-02-25 21:31:47', '2026-02-25 21:31:47'),
('9198524b-adfa-4afa-af48-041b1d105260', '1baeb022-ad20-40ec-a9e3-185cd06aa8e0', 'e-006', 'v-type-absence', '2026-02-25', 1, 'warning', '0.00', 'pending', 'السيد محمود مراد،\n\nتم تسجيل غياب يوم 2026-02-25 بدون عذر مسبق.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: إنذار كتابي.\n\nإدارة الموارد البشرية', '', '2026-02-25 21:34:05', '2026-02-25 21:34:05'),
('b8b25af5-b4ad-4b3d-8eff-62e3703f0c72', '00d521d7-8eae-4d89-b82b-e7232aa600c4', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'v-type-delay', '2026-02-25', 2, 'deduction_days', '0.25', 'pending', 'السيد نعمة عوض،\n\nتم تسجيل تأخير صباحي بتاريخ 2026-02-25.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: خصم 0.25 يوم من الراتب.\n\nإدارة الموارد البشرية', 'تأخير تجريبي 2', '2026-02-25 21:31:47', '2026-02-25 21:31:47');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_templates`
--

CREATE TABLE `evaluation_templates` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `period` enum('annual','semi-annual','quarterly','monthly','probation') COLLATE utf8mb4_unicode_ci DEFAULT 'annual',
  `position_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kpis` json DEFAULT NULL,
  `total_weight` int DEFAULT '100',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_templates`
--

INSERT INTO `evaluation_templates` (`id`, `name`, `description`, `period`, `position_id`, `department_id`, `kpis`, `total_weight`, `status`, `created_at`, `updated_at`) VALUES
('16ecb786-5dc7-4381-8398-5d6c6134f2fb', 'قالب اخر', 'قالب اخر', 'annual', 'p-dev', 'd-it', '[]', 100, 'active', '2026-02-09 19:19:11', '2026-02-12 20:56:29'),
('22186c84-5c5c-40f9-aeff-a108c65cf697', 'tttt', 'trtrrt', 'semi-annual', 'p-dev', 'd-it', '[]', 100, 'active', '2026-02-12 20:56:20', '2026-02-12 20:56:20'),
('7f4fa2ac-0598-4556-b04f-7677aaccae86', 'قالب تقييم مطور برمجيات', 'قالب تقييم مطور برمجيات', 'probation', 'p-dev', 'd-it', '[]', 100, 'active', '2026-02-09 17:55:10', '2026-02-09 22:17:31');

-- --------------------------------------------------------

--
-- Table structure for table `insurance_settings`
--

CREATE TABLE `insurance_settings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `location_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int NOT NULL,
  `employee_percentage` decimal(5,2) DEFAULT '0.00',
  `company_percentage` decimal(5,2) DEFAULT '0.00',
  `max_insurable_salary` decimal(12,2) DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `insurance_settings`
--

INSERT INTO `insurance_settings` (`id`, `location_type`, `year`, `employee_percentage`, `company_percentage`, `max_insurable_salary`, `status`, `created_at`, `updated_at`) VALUES
('05c2b68d-02a3-11f1-a178-d481d76a1bbe', 'saudi_madd', 2026, '10.00', '0.00', '100000.00', 'active', '2026-02-05 14:57:42', '2026-02-05 22:40:15'),
('7da5e1ee-cf93-4d8a-8575-29897af80f2c', 'egypt', 2026, '5.00', '0.00', '50000.00', 'active', '2026-02-05 22:43:05', '2026-02-05 22:43:23');

-- --------------------------------------------------------

--
-- Table structure for table `job_descriptions`
--

CREATE TABLE `job_descriptions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `position_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_objective` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `main_tasks` json DEFAULT NULL,
  `core_competencies` json DEFAULT NULL,
  `qualifications` json DEFAULT NULL,
  `required_skills` json DEFAULT NULL,
  `required_experience` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `last_review_date` date DEFAULT NULL,
  `next_review_date` date DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `employee_notes` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_descriptions`
--

INSERT INTO `job_descriptions` (`id`, `position_id`, `position_name`, `department_id`, `job_objective`, `main_tasks`, `core_competencies`, `qualifications`, `required_skills`, `required_experience`, `notes`, `version`, `last_review_date`, `next_review_date`, `status`, `employee_notes`, `created_at`, `updated_at`) VALUES
('0f15add1-7f43-4e17-88d4-16537e85af49', NULL, 'مبرمج', 'd-it', 'تصميم المواقع الاكترونية', '[\"تصميم الواجهة\"]', '[{\"name\": \"كتابة كود نظيف\", \"description\": \"كتابة كود نظيف\", \"measurement_method\": \"كتابة كود نظيف\", \"performance_indicator\": \"كتابة كود نظيف\"}]', '[\"بكالوريوس هندسة\"]', '[\"البرمجة\"]', '5', '-', '1', '2026-02-06', NULL, 'active', NULL, '2026-02-06 00:05:59', '2026-02-06 00:07:28');

-- --------------------------------------------------------

--
-- Table structure for table `kpi_results`
--

CREATE TABLE `kpi_results` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `evaluation_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kpi_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kpi_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `achieved` text COLLATE utf8mb4_unicode_ci,
  `target` text COLLATE utf8mb4_unicode_ci,
  `score` decimal(5,2) DEFAULT NULL,
  `weight` int DEFAULT NULL,
  `weighted_score` decimal(5,2) DEFAULT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kpi_results`
--

INSERT INTO `kpi_results` (`id`, `evaluation_id`, `kpi_id`, `kpi_name`, `unit`, `achieved`, `target`, `score`, `weight`, `weighted_score`, `comments`, `created_at`) VALUES
('a167bb3a-0b76-4db9-8231-39fb4fb2a6e2', '0ef0af5f-745b-4cd0-bc01-8eee006d9d84', 'da531933-cc02-421d-b175-377f74f73701', 'مؤشر1', 'نسبة في المائة من (100%)', '4', '8', '3.00', 30, '0.90', NULL, '2026-02-23 11:31:00'),
('d9463399-f8b3-4f2e-82a9-01948f69cc3a', '659ccd4b-c2b9-40f9-bf34-9568cbabab18', 'da531933-cc02-421d-b175-377f74f73701', 'مؤشر1', 'نسبة في المائة من (100%)', '5', '9', '4.00', 30, '1.20', NULL, '2026-02-24 13:54:43');

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leave_type_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_count` int DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `current_stage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'direct_manager',
  `approval_log` json DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `current_approval_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_history` json DEFAULT NULL,
  `requires_finance_approval` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `request_number`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `days_count`, `reason`, `document_url`, `status`, `current_stage`, `approval_log`, `rejection_reason`, `current_approval_level`, `approval_history`, `requires_finance_approval`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`) VALUES
('1a9a121a-8c36-4576-8ba3-4a4c0a5e0716', 'LV-2026-00007', 'e-008', '6c168039-02a0-11f1-a178-d481d76a1bbe', '2026-02-01', '2026-02-04', 4, NULL, NULL, 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-24 15:35:31', '2026-02-24 15:35:37', NULL, 0, NULL),
('38207527-5b92-419c-a16f-ecf84882900f', 'LV-2026-00006', 'e-008', 'c35fd762-1197-4894-8937-25b89723c76c', '2026-02-01', '2026-02-03', 3, NULL, NULL, 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-24 09:06:33', '2026-02-24 13:20:05', NULL, 0, NULL),
('6bf3db9a-d3a7-4242-b6eb-7ec688515276', 'LV-2026-00005', 'e-008', '6c1681e5-02a0-11f1-a178-d481d76a1bbe', '2026-02-01', '2026-02-04', 4, 'تم التعديل\nيرجى الاعتماد', NULL, 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 09:35:40', '2026-02-22 09:48:40', NULL, 0, NULL),
('cb312d32-68a9-4908-aba2-10a3b6b4ee4f', 'LV-2026-00003', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', 'c35fd762-1197-4894-8937-25b89723c76c', '2026-02-21', '2026-02-21', 1, 'Test reason 11477', NULL, 'active', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-21 19:33:10', '2026-02-21 19:33:10', NULL, 0, NULL),
('d8450e6a-d697-465e-94c6-bb55f4211928', 'LV-2026-00002', 'd11c40d6-687e-446b-93a8-9c0464d91693', '9fea73dd-d9a4-4404-aa38-61845e3b7782', '2026-02-21', '2026-02-21', 1, 'Feeling unwell', NULL, 'active', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-21 19:26:44', '2026-02-21 19:26:44', NULL, 0, NULL),
('ea46ab86-fe3a-4464-bd0f-72d662c51667', 'LV-2026-00001', 'e-008', '6c168039-02a0-11f1-a178-d481d76a1bbe', '2026-02-01', '2026-02-03', 3, NULL, NULL, 'approved', 'direct_manager', NULL, NULL, 'finance', NULL, 1, '2026-02-10 19:53:01', '2026-02-10 20:16:18', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-10T20:15:42.398Z\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-10T20:15:54.777Z\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-10T20:16:03.474Z\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-10T20:16:12.418Z\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-10T20:16:18.390Z\", \"role_required\": \"Finance Manager\"}]', 4, 'تم الاعتماد النهائي');

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_balance` int DEFAULT '0',
  `min_days` int DEFAULT '1',
  `is_paid` tinyint(1) DEFAULT '1',
  `requires_document` tinyint(1) DEFAULT '0',
  `max_consecutive_days` int DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `name`, `code`, `default_balance`, `min_days`, `is_paid`, `requires_document`, `max_consecutive_days`, `status`, `created_at`, `updated_at`) VALUES
('6c168039-02a0-11f1-a178-d481d76a1bbe', 'إجازة سنوية', 'ANNUAL', 21, 1, 1, 1, 5, 'active', '2026-02-05 14:39:05', '2026-02-05 21:57:08'),
('6c1681e5-02a0-11f1-a178-d481d76a1bbe', 'إجازة مرضية', 'SICK', 30, 1, 1, 0, NULL, 'active', '2026-02-05 14:39:05', '2026-02-05 14:39:05'),
('6c168296-02a0-11f1-a178-d481d76a1bbe', 'إجازة طارئة', 'EMERGENCY', 5, 1, 1, 0, NULL, 'active', '2026-02-05 14:39:05', '2026-02-05 14:39:05'),
('6c168309-02a0-11f1-a178-d481d76a1bbe', 'إجازة بدون راتب', 'UNPAID', 30, 1, 0, 0, NULL, 'active', '2026-02-05 14:39:05', '2026-02-05 14:39:05'),
('6c168375-02a0-11f1-a178-d481d76a1bbe', 'إجازة أمومة', 'MATERNITY', 70, 70, 1, 0, NULL, 'active', '2026-02-05 14:39:05', '2026-02-05 14:39:05'),
('6c1683dd-02a0-11f1-a178-d481d76a1bbe', 'إجازة أبوة', 'PATERNITY', 3, 1, 1, 0, NULL, 'active', '2026-02-05 14:39:05', '2026-02-05 14:39:05'),
('9162929c-e664-43e3-9a10-6158ad50e953', 'Test Leave 95252', NULL, 10, 1, 1, 0, NULL, 'active', '2026-02-21 19:34:19', '2026-02-21 19:34:19'),
('9fea73dd-d9a4-4404-aa38-61845e3b7782', 'Sick Leave', NULL, 10, 1, 1, 0, NULL, 'active', '2026-02-21 19:26:44', '2026-02-21 19:26:44'),
('c35fd762-1197-4894-8937-25b89723c76c', 'Test Leave 11477', NULL, 10, 1, 1, 0, NULL, 'active', '2026-02-21 19:33:10', '2026-02-21 19:33:10');

-- --------------------------------------------------------

--
-- Table structure for table `nationalities`
--

CREATE TABLE `nationalities` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nationalities`
--

INSERT INTO `nationalities` (`id`, `name`, `code`, `created_at`, `status`) VALUES
('39e94be0-970d-4738-a65a-8182b970049f', 'مغربي', 'mo', '2026-02-05 22:14:35', 'active'),
('50bb92b5-02af-11f1-8e69-d481d76a1bbe', 'مصري', 'eg', '2026-02-05 16:25:42', 'active'),
('67d96ef2-02af-11f1-8e69-d481d76a1bbe', 'سعودي', 'sa', '2026-02-05 16:26:21', 'active'),
('7051ce75-02af-11f1-8e69-d481d76a1bbe', 'سوري', 'sy', '2026-02-05 16:26:35', 'active'),
('864d67be-02af-11f1-8e69-d481d76a1bbe', 'أردني', 'jr', '2026-02-05 16:27:12', 'active'),
('864d6f9d-02af-11f1-8e69-d481d76a1bbe', 'فلسطيني', 'pl', '2026-02-05 16:27:12', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `overtime`
--

CREATE TABLE `overtime` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `hours` decimal(5,2) NOT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `overtime_rate` decimal(5,2) DEFAULT '1.50',
  `total_amount` decimal(12,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `current_stage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'direct_manager',
  `approval_log` json DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `current_approval_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_history` json DEFAULT NULL,
  `requires_finance_approval` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `overtime`
--

INSERT INTO `overtime` (`id`, `request_number`, `employee_id`, `date`, `hours`, `hourly_rate`, `overtime_rate`, `total_amount`, `notes`, `status`, `current_stage`, `approval_log`, `rejection_reason`, `current_approval_level`, `approval_history`, `requires_finance_approval`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`) VALUES
('0d169634-f517-4fbf-89ce-f20b2b1204c8', 'OT-2026-00005', 'e-006', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:53:02', NULL, 0, NULL),
('2bc64ed0-e1ea-43a0-b7ac-d31a31e86cde', 'OT-2026-00010', 'e-001', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:02:27', NULL, 0, NULL),
('30c7351d-16a9-48eb-a31c-b40104e8eda7', 'OT-2026-00013', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:02:51', NULL, 0, NULL),
('41d19cb1-7ca9-49b4-8b30-38fbf0cd7074', 'OT-2026-00012', 'd11c40d6-687e-446b-93a8-9c0464d91693', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:55:05', NULL, 0, NULL),
('5d6a9ffd-9740-420a-93c2-98af1f3e9bbf', 'OT-2026-00007', 'e-004', '2026-02-22', '10.00', '8.33', '12.50', '125.00', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:02:35', NULL, 0, NULL),
('6f7c09f9-07c7-433e-a56c-c107a884ef57', 'OT-2026-00001', 'e-008', '2026-02-12', '10.00', '2.08', '3.13', '31.25', NULL, 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-12 01:05:00', '2026-02-12 01:05:24', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-12T01:05:05+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-12T01:05:11+00:00\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-12T01:05:16+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:05:20+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-12T01:05:24+00:00\", \"role_required\": \"Finance Manager\"}]', 5, 'تم الاعتماد النهائي'),
('73b00d28-ad6c-4cac-8b74-74e4c832f721', 'OT-2026-00002', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', '2026-02-12', '7.50', '4.17', '6.25', '46.88', NULL, 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-12 01:26:58', '2026-02-12 01:27:12', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:27:01+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-12T01:27:05+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:27:08+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-12T01:27:12+00:00\", \"role_required\": \"Finance Manager\"}]', 4, 'تم الاعتماد النهائي'),
('9173bfa6-84d6-4e73-9226-cb200520caae', 'OT-2026-00011', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:55:01', NULL, 0, NULL),
('91e633ba-b7ee-49c7-a08e-2792f95fecaa', 'OT-2026-00003', 'e-008', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:02:18', NULL, 0, NULL),
('b17865b2-6585-4433-9f1a-96773e696dc2', 'OT-2026-00006', 'e-005', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:02:39', NULL, 0, NULL),
('b82b8cfb-4950-4c5b-9144-7e2e7d47f179', 'OT-2026-00014', 'e-008', '2026-02-24', '31.00', '4.17', '6.25', '193.75', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-24 09:07:38', '2026-02-24 13:53:43', NULL, 0, NULL),
('d534f23d-8f15-4c7a-ab40-ec1f2ed583f1', 'OT-2026-00009', 'e-002', '2026-02-22', '10.00', '25.00', '37.50', '375.00', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:53:40', NULL, 0, NULL),
('e07423f5-fe22-4c9e-9f1e-b9fc8f1750f4', 'OT-2026-00008', 'e-003', '2026-02-22', '10.00', '20.83', '31.25', '312.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:02:46', NULL, 0, NULL),
('f6317727-7e52-413c-ba78-9541e495746c', 'OT-2026-00004', 'e-007', '2026-02-22', '10.00', '4.17', '6.25', '62.50', '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-22 15:33:22', '2026-02-22 19:02:32', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `batch_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payroll_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `payroll_date` date DEFAULT NULL,
  `basic_salary` decimal(12,2) DEFAULT '0.00',
  `housing_allowance` decimal(12,2) DEFAULT '0.00',
  `transport_allowance` decimal(12,2) DEFAULT '0.00',
  `other_allowances` decimal(12,2) DEFAULT '0.00',
  `additional_allowances` decimal(12,2) DEFAULT '0.00',
  `bonuses_amount` decimal(12,2) DEFAULT '0.00',
  `overtime_amount` decimal(12,2) DEFAULT '0.00',
  `gross_salary` decimal(12,2) DEFAULT '0.00',
  `insurance_deduction` decimal(12,2) DEFAULT '0.00',
  `late_deduction` decimal(12,2) DEFAULT '0.00',
  `absence_deduction` decimal(12,2) DEFAULT '0.00',
  `other_deductions` decimal(12,2) DEFAULT '0.00',
  `total_deductions` decimal(12,2) DEFAULT '0.00',
  `net_salary` decimal(12,2) DEFAULT '0.00',
  `currency` enum('SAR','EGP','USD') COLLATE utf8mb4_unicode_ci DEFAULT 'SAR',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `issue_date` date DEFAULT NULL,
  `working_days` int DEFAULT '0',
  `absent_days` int DEFAULT '0',
  `late_minutes` int DEFAULT '0',
  `overtime_hours` decimal(5,2) DEFAULT '0.00',
  `allowances_breakdown` json DEFAULT NULL,
  `deductions_breakdown` json DEFAULT NULL,
  `bonuses_breakdown` json DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `batch_id`, `payroll_number`, `employee_id`, `month`, `year`, `payroll_date`, `basic_salary`, `housing_allowance`, `transport_allowance`, `other_allowances`, `additional_allowances`, `bonuses_amount`, `overtime_amount`, `gross_salary`, `insurance_deduction`, `late_deduction`, `absence_deduction`, `other_deductions`, `total_deductions`, `net_salary`, `currency`, `status`, `issue_date`, `working_days`, `absent_days`, `late_minutes`, `overtime_hours`, `allowances_breakdown`, `deductions_breakdown`, `bonuses_breakdown`, `notes`, `created_at`, `updated_at`) VALUES
('205a9f67-a9d8-4373-acab-29e751bff9f7', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-53BD1', 'e-004', 2, 2026, '2026-02-25', '2000.00', '200.00', '199.00', '200.00', '0.00', '150.00', '125.00', '2874.00', '200.00', '0.00', '133.33', '0.00', '333.33', '2540.67', 'SAR', 'approved', NULL, 28, 2, 0, '10.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('48355f14-43a7-4463-bb10-f9a0326ddd98', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-58EBF', 'd11c40d6-687e-446b-93a8-9c0464d91693', 2, 2026, '2026-02-25', '10000.00', '1000.00', '1000.00', '1000.00', '0.00', '150.00', '62.50', '13212.50', '1000.00', '0.00', '0.00', '0.00', '1000.00', '12212.50', 'USD', 'approved', NULL, 30, 0, 0, '10.00', NULL, NULL, NULL, '', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('4b557752-8eea-47be-9b50-84b66c370f1a', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-60090', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', 2, 2026, '2026-02-25', '1000.00', '100.00', '100.00', '100.00', '0.00', '150.00', '62.50', '1512.50', '100.00', '0.00', '0.00', '0.00', '100.00', '1412.50', 'USD', 'approved', NULL, 30, 0, 0, '10.00', NULL, NULL, NULL, '', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('69a61905-b18a-4bac-9e36-fd0aec8ce7e7', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-5A0AD', 'e-005', 2, 2026, '2026-02-25', '1000.00', '100.00', '100.00', '100.00', '0.00', '150.00', '62.50', '1512.50', '100.00', '6.25', '66.67', '0.00', '172.92', '1339.58', 'EGP', 'approved', NULL, 28, 2, 90, '10.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('69f083dd-1ce1-4b7a-983e-052f7dc2f5e8', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-5778D', 'e-007', 2, 2026, '2026-02-25', '1000.00', '100.00', '97.00', '100.00', '0.00', '150.00', '62.50', '1509.50', '100.00', '0.00', '0.00', '0.00', '100.00', '1409.50', 'SAR', 'approved', NULL, 30, 0, 0, '10.00', NULL, NULL, NULL, '', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('8fde0530-611f-41f5-9154-ee034b7e2669', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-51ECA', 'e-003', 2, 2026, '2026-02-25', '2000.00', '500.00', '200.00', '150.00', '0.00', '150.00', '312.50', '3312.50', '200.00', '24.17', '200.00', '0.00', '424.17', '2888.33', 'USD', 'approved', NULL, 27, 3, 174, '10.00', NULL, NULL, NULL, 'خصم 3 يوم غياب. ', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('94415d10-ff2d-4a61-99d2-1ff6d46359ff', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-5B7FB', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 2, 2026, '2026-02-25', '1000.00', '100.00', '100.00', '100.00', '0.00', '250.00', '109.38', '1659.38', '100.00', '0.00', '0.00', '0.00', '100.00', '1559.38', 'EGP', 'approved', NULL, 30, 0, 0, '17.50', NULL, NULL, NULL, '', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('ad3ee627-5193-4828-bde9-54a4c9369ab7', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-5C8B6', 'e-001', 2, 2026, '2026-02-25', '1000.00', '100.00', '100.00', '100.00', '0.00', '150.00', '62.50', '1512.50', '100.00', '111.46', '66.67', '0.00', '278.13', '1234.38', 'USD', 'approved', NULL, 28, 2, 1605, '10.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('c5a68808-364b-4292-97e6-a23164856e1a', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-5D8EA', 'e-002', 2, 2026, '2026-02-25', '6000.00', '100.00', '100.00', '100.00', '0.00', '150.00', '375.00', '6825.00', '600.00', '0.00', '400.00', '0.00', '1000.00', '5825.00', 'SAR', 'approved', NULL, 28, 2, 0, '10.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('c70cf3f2-1cba-4c30-8d09-0a117779a0fe', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-5586D', '5b7e0d98-28ef-44dc-8326-11f10dd0870f', 2, 2026, '2026-02-25', '500.00', '50.00', '50.00', '75.00', '0.00', '0.00', '0.00', '675.00', '50.00', '0.00', '0.00', '0.00', '50.00', '625.00', 'SAR', 'approved', NULL, 30, 0, 0, '0.00', NULL, NULL, NULL, '', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('ec7a5c30-824a-4668-94cd-af7c40495733', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-50AD5', 'e-006', 2, 2026, '2026-02-25', '1000.00', '100.00', '95.00', '100.00', '0.00', '150.00', '62.50', '1507.50', '100.00', '0.00', '0.00', '0.00', '100.00', '1407.50', 'SAR', 'approved', NULL, 30, 0, 0, '10.00', NULL, NULL, NULL, '', '2026-02-25 07:21:27', '2026-02-25 07:23:29'),
('fdb7cd9a-ddd6-4f8c-8914-e45fd015fc0c', '4131e37b-d849-483a-8d11-ebf12d65c8e4', 'PAY-2026-2-5F045', 'e-008', 2, 2026, '2026-02-25', '1000.00', '100.00', '100.00', '100.00', '0.00', '2573.00', '287.50', '4160.50', '100.00', '0.00', '0.00', '0.00', '100.00', '4060.50', 'USD', 'approved', NULL, 30, 0, 0, '51.00', NULL, NULL, NULL, '', '2026-02-25 07:21:27', '2026-02-25 07:23:29');

-- --------------------------------------------------------

--
-- Table structure for table `payroll_batches`
--

CREATE TABLE `payroll_batches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `total_amount` decimal(15,2) DEFAULT '0.00',
  `status` enum('draft','pending_approval','approved','paid') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `workflow_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payroll_batches`
--

INSERT INTO `payroll_batches` (`id`, `month`, `year`, `total_amount`, `status`, `workflow_id`, `created_at`, `updated_at`) VALUES
('4131e37b-d849-483a-8d11-ebf12d65c8e4', 2, 2026, '36514.84', 'approved', '89d87b05-436b-4ad5-9c7c-d0d2465cf78b', '2026-02-25 07:21:27', '2026-02-25 07:23:29');

-- --------------------------------------------------------

--
-- Table structure for table `penalty_policies`
--

CREATE TABLE `penalty_policies` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `violation_type_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `occurrence_number` int NOT NULL,
  `action_type` enum('warning','deduction_days','deduction_amount') COLLATE utf8mb4_unicode_ci NOT NULL,
  `penalty_value` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `penalty_policies`
--

INSERT INTO `penalty_policies` (`id`, `violation_type_id`, `occurrence_number`, `action_type`, `penalty_value`, `created_at`, `updated_at`) VALUES
('p-pol-699f6a0740b35', 'v-type-absence', 1, 'warning', '0.00', '2026-02-25 21:30:47', '2026-02-25 21:30:47'),
('p-pol-699f6a07418a6', 'v-type-absence', 2, 'deduction_days', '1.00', '2026-02-25 21:30:47', '2026-02-25 21:30:47'),
('p-pol-699f6a0742d17', 'v-type-absence', 3, 'deduction_days', '3.00', '2026-02-25 21:30:47', '2026-02-25 21:30:47'),
('p-pol-699f6a0743b8c', 'v-type-delay', 1, 'warning', '0.00', '2026-02-25 21:30:47', '2026-02-25 21:30:47'),
('p-pol-699f6a0744a0a', 'v-type-delay', 2, 'deduction_days', '0.25', '2026-02-25 21:30:47', '2026-02-25 21:30:47');

-- --------------------------------------------------------

--
-- Table structure for table `performance_evaluations`
--

CREATE TABLE `performance_evaluations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `evaluation_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `evaluator_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `overall_score` decimal(5,2) DEFAULT NULL,
  `overall_rating` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kpi_scores` json DEFAULT NULL,
  `strengths` text COLLATE utf8mb4_unicode_ci,
  `areas_for_improvement` text COLLATE utf8mb4_unicode_ci,
  `goals` text COLLATE utf8mb4_unicode_ci,
  `recommendations` text COLLATE utf8mb4_unicode_ci,
  `signatures` json DEFAULT NULL,
  `development_plan` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `performance_evaluations`
--

INSERT INTO `performance_evaluations` (`id`, `evaluation_number`, `employee_id`, `evaluator_id`, `template_id`, `period_start`, `period_end`, `overall_score`, `overall_rating`, `kpi_scores`, `strengths`, `areas_for_improvement`, `goals`, `recommendations`, `signatures`, `development_plan`, `status`, `submitted_at`, `reviewed_at`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`, `rejection_reason`) VALUES
('0ef0af5f-745b-4cd0-bc01-8eee006d9d84', 'EVAL-1771846222561', 'd11c40d6-687e-446b-93a8-9c0464d91693', 'u-admin-01', '7f4fa2ac-0598-4556-b04f-7677aaccae86', '2025-02-01', '2026-02-01', '60.00', NULL, NULL, 'نقاط القوة الرئيسية\n1', 'فجوات الأداء / فرص التحسين\n2', NULL, NULL, '{\"hr_signature_date\": \"2026-02-03\", \"employee_signature_date\": \"2026-02-01\", \"evaluator_signature_date\": \"2026-02-02\"}', 'إجراءات التطوير المقترحة\n3', 'completed', NULL, NULL, '2026-02-23 11:30:22', '2026-02-23 11:42:50', NULL, 0, NULL, NULL),
('659ccd4b-c2b9-40f9-bf34-9568cbabab18', 'EVAL-1771941252515', 'e-008', 'u-admin-01', '7f4fa2ac-0598-4556-b04f-7677aaccae86', '2026-02-01', '2026-02-24', '80.00', NULL, NULL, 'نقاط القوة الرئيسية\n', 'فجوات الأداء / فرص التحسين\n', NULL, NULL, '{\"hr_signature_date\": \"2026-02-03\", \"employee_signature_date\": \"2026-02-01\", \"evaluator_signature_date\": \"2026-02-02\"}', 'إجراءات التطوير المقترحة\n', 'completed', NULL, NULL, '2026-02-24 13:54:12', '2026-02-24 14:13:56', NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permission_requests`
--

CREATE TABLE `permission_requests` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int NOT NULL COMMENT 'Calculated duration in minutes',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','returned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci,
  `current_stage_role_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Role ID currently required to approve',
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `manager_approval_date` datetime DEFAULT NULL,
  `hr_approval_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission_requests`
--

INSERT INTO `permission_requests` (`id`, `request_number`, `user_id`, `employee_id`, `request_date`, `start_time`, `end_time`, `duration_minutes`, `reason`, `status`, `approval_chain`, `current_level_idx`, `current_status_desc`, `current_stage_role_id`, `rejection_reason`, `created_at`, `updated_at`, `manager_approval_date`, `hr_approval_date`) VALUES
('0d11b925-0bd2-4b29-8d69-bc194318105b', 'PR-2026-00003', 'u-admin-01', 'd11c40d6-687e-446b-93a8-9c0464d91693', '2026-02-22', '16:33:00', '16:36:00', 3, 'شسشس', 'approved', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:33:45', '2026-02-24 13:19:15', NULL, NULL),
('13d60709-4f6b-40f8-bc7c-0bae3281e355', 'PR-2026-00002', 'u-admin-01', 'e-003', '2026-02-22', '16:33:00', '16:34:00', 1, 'صثصث', 'approved', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:33:14', '2026-02-22 15:05:41', NULL, NULL),
('5479e798-0add-428e-b216-0bfc8029b5ac', 'PR-2026-00001', 'u-admin-01', 'e-008', '2026-02-22', '16:32:00', '16:33:00', 1, 'فففف', 'approved', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:32:42', '2026-02-22 15:05:44', NULL, NULL),
('5dc971f0-95e9-4823-bd58-3b1f862099b3', 'PR-2026-00006', 'u-admin-01', 'e-005', '2026-02-22', '16:41:00', '16:44:00', 3, 'asasas', 'returned', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:41:24', '2026-02-22 15:04:22', NULL, NULL),
('65f0f1f6-d32d-4833-bccc-615155a56fc9', 'PR-2026-00007', 'u-admin-01', 'e-006', '2026-02-22', '16:41:00', '16:45:00', 4, 'sasas', 'approved', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:41:51', '2026-02-22 19:01:57', NULL, NULL),
('a6ce2ae6-89c5-4242-b8ab-e348b12d4e86', 'PR-2026-00005', 'u-admin-01', 'e-004', '2026-02-22', '16:40:00', '16:43:00', 3, 'asas', 'pending', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:40:46', '2026-02-22 14:40:46', NULL, NULL),
('b2a2574a-6111-4901-89f9-026253c40ad3', 'PR-2026-00004', 'u-admin-01', 'e-007', '2026-02-22', '16:39:00', '16:41:00', 2, 'asas', 'approved', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:40:02', '2026-02-22 19:54:49', NULL, NULL),
('e6990ec5-201d-4a11-a43f-31c7a94529b1', 'PR-2026-00008', 'u-admin-01', 'e-002', '2026-02-22', '16:42:00', '16:47:00', 5, 'aAa', 'pending', NULL, 0, NULL, NULL, NULL, '2026-02-22 14:42:24', '2026-02-22 14:42:24', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`, `code`, `department`, `level`, `status`, `created_at`, `updated_at`) VALUES
('21982918-e6fa-4190-a39a-14971a346fef', 'مدير قسم الموارد البشرية', 'hr-manager', NULL, NULL, 'active', '2026-02-05 21:59:08', '2026-02-05 21:59:08'),
('372a4b0f-30ea-4d57-9928-0224e07a2c90', 'المدير العام', 'general-manager', NULL, NULL, 'active', '2026-02-05 22:00:33', '2026-02-05 22:00:33'),
('3d5e2cc2-ccb6-4287-a486-eab302f63e8f', 'مدير الحسابات', 'accounts-manager', NULL, NULL, 'active', '2026-02-05 22:12:31', '2026-02-05 22:12:31'),
('80c6154c-202e-45ea-aeef-d25080ec358e', 'مدير الدعم اللوجستي', 'support-manager', NULL, NULL, 'active', '2026-02-05 21:59:53', '2026-02-05 21:59:53'),
('8646bfb2-e96b-4c37-88e8-16e749240a2d', 'أدمن النظام', 'admin', NULL, NULL, 'active', '2026-02-05 22:01:31', '2026-02-05 22:01:31'),
('86acf26e-ab53-4633-aee4-8444d6572875', 'مستشار التقنية', 'it-consultant', NULL, NULL, 'active', '2026-02-05 22:08:23', '2026-02-05 22:08:23'),
('f76d57e5-e5c0-4ee9-9410-ab55e22f1f59', 'مدير التقنية', 'it-manager', NULL, NULL, 'active', '2026-02-05 21:58:20', '2026-02-05 21:58:20'),
('f7a2a166-c5a3-4702-804b-babbf44a8a4d', 'مدير قسم التعلم الرقمي', 'tl', NULL, NULL, 'active', '2026-02-22 14:34:42', '2026-02-22 14:34:42'),
('p-dev', 'مطور برمجيات', 'DEV', 'd-it', 'Senior', 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('p-mgr', 'مدير قسم', 'MGR', 'd-it', 'Management', 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('p-spec', 'أخصائي رواتب', 'SPEC', 'd-hr', 'Junior', 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42');

-- --------------------------------------------------------

--
-- Table structure for table `resignations`
--

CREATE TABLE `resignations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resignation_date` date NOT NULL,
  `last_working_day` date DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `current_approval_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_history` json DEFAULT NULL,
  `exit_interview_notes` text COLLATE utf8mb4_unicode_ci,
  `clearance_status` json DEFAULT NULL,
  `final_settlement` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `submission_date` date DEFAULT NULL,
  `end_of_service_date` date DEFAULT NULL,
  `notice_period_days` int DEFAULT '30',
  `handover_notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `permissions` json DEFAULT NULL,
  `data_scopes` json DEFAULT NULL,
  `approval_level` int DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `code`, `description`, `permissions`, `data_scopes`, `approval_level`, `status`, `created_at`, `updated_at`) VALUES
('0bf0c2a2-98ad-41e8-a114-7faf05d4ba1e', 'full_access', 'full_access', 'full_access', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 15:40:45', '2026-02-24 09:11:39'),
('6c1626e4-02a0-11f1-a178-d481d76a1bbe', 'super_admin', 'super_admin', 'super_admin', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\", \"manage_penalty_settings\", \"view_violations\", \"view_department_violations\", \"view_all_violations\", \"create_violation\", \"update_violation\", \"delete_violation\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-25 20:02:53'),
('6c1629cb-02a0-11f1-a178-d481d76a1bbe', 'hr_manager', 'hr_manager', 'hr_manager', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"view_contracts\", \"add_contracts\", \"approve_contract_hr\", \"view_trainings\", \"add_trainings\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"approve_resignation_hr\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_hr\", \"view_payroll\", \"view_bonuses\", \"add_bonuses\", \"approve_bonus_hr\", \"view_overtime\", \"add_overtime\", \"approve_overtime_hr\", \"view_evaluations\", \"create_evaluation\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"add_payroll\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:37:53'),
('6c162b0b-02a0-11f1-a178-d481d76a1bbe', 'hr_staff', 'hr_staff', 'hr_staff', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"view_contracts\", \"add_contracts\", \"view_trainings\", \"add_trainings\", \"view_resignations\", \"add_resignation\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"view_payroll\", \"add_payroll\", \"view_bonuses\", \"add_bonuses\", \"view_overtime\", \"add_overtime\", \"view_evaluations\", \"create_evaluation\", \"view_evaluation_templates\", \"add_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"add_employee_notes\", \"edit_evaluation_template\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:45:21'),
('6c162c07-02a0-11f1-a178-d481d76a1bbe', 'finance_manager', 'finance_manager', 'finance_manager', '[\"view_employees\", \"view_contracts\", \"add_contracts\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"view_resignations\", \"add_resignation\", \"approve_resignation_finance\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"view_evaluation_templates\", \"add_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_job_description\", \"add_employee_notes\", \"approve_training_finance\", \"approve_evaluation_finance\"]', '{\"view_leaves\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_payroll\": \"all\", \"edit_employees\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"view_attendance\": \"all\", \"delete_employees\": \"all\", \"view_evaluations\": \"all\", \"view_resignations\": \"all\", \"view_job_descriptions\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:43:46'),
('6c162cce-02a0-11f1-a178-d481d76a1bbe', 'department_manager', 'department_manager', 'department_manager', '[\"view_employees\", \"view_contracts\", \"view_trainings\", \"add_trainings\", \"view_resignations\", \"add_resignation\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_department_manager\", \"view_payroll\", \"view_bonuses\", \"add_bonuses\", \"view_overtime\", \"add_overtime\", \"approve_overtime_department_manager\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"approve_evaluation_manager\", \"view_evaluation_templates\", \"view_job_descriptions\", \"add_employee_notes\", \"approve_contract_manager\", \"approve_resignation_department_manager\", \"add_job_description\", \"add_evaluation_template\", \"edit_overtime\", \"add_contracts\", \"view_department_violations\", \"create_violation\", \"view_violations\"]', '{\"edit_leaves\": \"department\", \"view_leaves\": \"department\", \"edit_bonuses\": \"department\", \"edit_payroll\": \"department\", \"view_bonuses\": \"department\", \"view_payroll\": \"department\", \"delete_leaves\": \"department\", \"edit_overtime\": \"department\", \"view_overtime\": \"department\", \"delete_bonuses\": \"department\", \"delete_payroll\": \"department\", \"edit_contracts\": \"department\", \"edit_employees\": \"department\", \"edit_trainings\": \"department\", \"view_contracts\": \"department\", \"view_employees\": \"department\", \"view_trainings\": \"department\", \"delete_overtime\": \"department\", \"edit_attendance\": \"department\", \"edit_evaluation\": \"department\", \"view_attendance\": \"department\", \"delete_contracts\": \"department\", \"delete_employees\": \"department\", \"delete_trainings\": \"department\", \"edit_resignation\": \"department\", \"view_evaluations\": \"department\", \"delete_attendance\": \"department\", \"delete_evaluation\": \"department\", \"view_resignations\": \"department\", \"delete_resignation\": \"department\", \"edit_job_description\": \"department\", \"view_job_descriptions\": \"department\", \"delete_job_description\": \"department\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-25 15:51:26'),
('6c162dae-02a0-11f1-a178-d481d76a1bbe', 'employee', 'employee', 'employee', '[\"view_organizational_structure\", \"checkin_checkout\", \"view_attendance\", \"view_contracts\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"view_payroll\", \"view_bonuses\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"view_evaluations\", \"view_job_descriptions\"]', '{\"edit_leaves\": \"own\", \"view_leaves\": \"own\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"own\", \"view_payroll\": \"own\", \"delete_leaves\": \"own\", \"edit_overtime\": \"own\", \"view_overtime\": \"own\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"own\", \"view_contracts\": \"own\", \"view_employees\": \"all\", \"view_trainings\": \"own\", \"delete_overtime\": \"own\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"own\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"own\", \"edit_resignation\": \"own\", \"view_evaluations\": \"own\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"own\", \"delete_resignation\": \"own\", \"edit_job_description\": \"own\", \"view_job_descriptions\": \"own\", \"delete_job_description\": \"own\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-08 22:23:08'),
('978f139b-e1bf-43b9-a924-2eb12537c2aa', 'admin', 'admin', 'admin', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\", \"view_permission_requests\", \"add_permission_requests\", \"edit_permission_requests\", \"delete_permission_requests\", \"approve_permission_requests_manager\", \"approve_permission_requests_upper_managers\", \"approve_permission_requests_gm\", \"approve_permission_requests_hr\", \"approve_permission_requests_finance\", \"approve_training_manager\", \"approve_bonus_department_manager\", \"force_approve\", \"manage_penalty_settings\", \"view_violations\", \"view_department_violations\", \"view_all_violations\", \"create_violation\", \"update_violation\", \"delete_violation\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"view_violations\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"delete_violation\": \"all\", \"edit_resignation\": \"all\", \"update_violation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"view_all_violations\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\", \"edit_permission_requests\": \"all\", \"view_permission_requests\": \"all\", \"delete_permission_requests\": \"all\", \"view_department_violations\": \"all\"}', 0, 'active', '2026-02-08 22:19:33', '2026-02-25 20:34:36'),
('b5ce42b8-569d-4abe-85d0-c43758accb83', 'main_department_manager', 'main_department_manager', 'main_department_manager', '[\"view_employees\", \"add_employees\", \"view_contracts\", \"approve_contract_upper_managers\", \"view_trainings\", \"add_trainings\", \"approve_training_upper_managers\", \"view_resignations\", \"add_resignation\", \"approve_resignation_upper_managers\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_upper_managers\", \"view_payroll\", \"view_bonuses\", \"add_bonuses\", \"approve_bonus_upper_managers\", \"view_overtime\", \"add_overtime\", \"approve_overtime_upper_managers\", \"view_evaluations\", \"create_evaluation\", \"approve_evaluation_upper_managers\", \"view_evaluation_templates\", \"add_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_employee_notes\", \"add_job_description\"]', '{\"view_leaves\": \"department\", \"view_bonuses\": \"department\", \"view_payroll\": \"department\", \"view_overtime\": \"department\", \"view_contracts\": \"department\", \"view_employees\": \"department\", \"view_trainings\": \"department\", \"view_attendance\": \"department\", \"view_evaluations\": \"department\", \"view_resignations\": \"department\", \"view_job_descriptions\": \"department\"}', 0, 'active', '2026-02-10 21:43:01', '2026-02-10 21:43:01'),
('ff72942b-09d7-4e42-aab5-03b98039c08a', 'manager', 'manager', 'manager', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_gm\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_gm\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_gm\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_gm\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_gm\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_gm\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_gm\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_manager\", \"approve_contract_upper_managers\", \"approve_contract_hr\", \"approve_contract_finance\", \"approve_training_upper_managers\", \"approve_training_hr\", \"approve_training_finance\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_hr\", \"approve_leave_finance\", \"approve_bonus_upper_managers\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"approve_evaluation_manager\", \"approve_evaluation_upper_managers\", \"approve_evaluation_hr\", \"approve_evaluation_finance\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 16:38:19', '2026-02-24 09:11:39');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `setting_type` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `created_at`, `updated_at`) VALUES
('5eb0147d-0d19-11f1-8b1b-d481d76a1bbe', 'monthly_permission_limit_minutes', '240', 'number', 'monthly_permission_limit_minutes', '2026-02-18 22:30:03', '2026-02-19 21:34:36');

-- --------------------------------------------------------

--
-- Table structure for table `template_competencies`
--

CREATE TABLE `template_competencies` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `competency_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` int DEFAULT '0',
  `order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `template_kpis`
--

CREATE TABLE `template_kpis` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `template_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `weight` int DEFAULT '0',
  `max_score` int DEFAULT '100',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `template_kpis`
--

INSERT INTO `template_kpis` (`id`, `template_id`, `name`, `description`, `weight`, `max_score`, `unit`, `target`, `created_at`) VALUES
('05531659-e655-4995-9ae5-71f1f879f687', '16ecb786-5dc7-4381-8398-5d6c6134f2fb', 'مؤشر قالب اخر رقم 2', 'وصف مؤشر قالب اخر رقم 2', 25, 100, 'برامج', NULL, '2026-02-09 22:19:44'),
('da103eaa-4c4c-4bf3-9c33-948b5fd79361', '22186c84-5c5c-40f9-aeff-a108c65cf697', 'trtrt', 'rtr', 25, 100, 'rtrt', NULL, '2026-02-12 20:57:12'),
('da531933-cc02-421d-b175-377f74f73701', '7f4fa2ac-0598-4556-b04f-7677aaccae86', 'مؤشر1', 'وصف مؤشر1', 30, 100, 'نسبة في المائة من (100%)', NULL, '2026-02-09 22:21:05'),
('df5c6755-9182-4769-b611-06729ee44869', '16ecb786-5dc7-4381-8398-5d6c6134f2fb', 'مؤشر قالب اخر رقم 1', 'وصف مؤشر قالب اخر رقم 1', 10, 100, 'الساعات', NULL, '2026-02-09 22:19:09');

-- --------------------------------------------------------

--
-- Table structure for table `trainings`
--

CREATE TABLE `trainings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_hours` int DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_chain` json DEFAULT NULL,
  `current_level_idx` int DEFAULT '0',
  `current_status_desc` text COLLATE utf8mb4_unicode_ci,
  `cost` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trainings`
--

INSERT INTO `trainings` (`id`, `name`, `description`, `provider`, `duration_hours`, `category`, `start_date`, `end_date`, `location`, `max_participants`, `status`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`, `cost`) VALUES
('0eefe2dc-f28e-49f6-b00e-8684b668c1bb', 'Web Development', 'Web Development', 'IvoryTraining', 75, 'تقنية المعلومات', NULL, NULL, NULL, NULL, 'active', '2026-02-05 22:52:38', '2026-02-05 23:10:48', NULL, 0, NULL, '0.00'),
('518cc135-e17c-478f-a677-8a88e1b08b74', 'Python', 'Python', 'IvoryTraining', 60, 'تقنية المعلومات', NULL, NULL, NULL, NULL, 'active', '2026-02-05 23:39:30', '2026-02-05 23:39:30', NULL, 0, NULL, '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `training_statuses`
--

CREATE TABLE `training_statuses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `training_statuses`
--

INSERT INTO `training_statuses` (`id`, `name`, `code`, `created_at`, `status`) VALUES
('0c605cfe-084e-4c82-aee3-cfa5bd39a547', 'جاري', 'pending', '2026-02-05 22:17:48', 'active'),
('8caa4190-02d7-11f1-95cc-d481d76a1bbe', 'مكتمل', 'complete', '2026-02-05 21:13:42', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `avatar`, `status`, `created_at`, `updated_at`) VALUES
('7b99aa04-e91e-443a-a7d4-51b5fd606a92', 'ryan@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ريان وائل', NULL, 'pending', '2026-02-21 19:33:10', '2026-02-22 14:08:23'),
('9ef8d021-8440-4c46-af92-53f65a47d1d0', 'hisham@ivory.com', '$2y$10$/LA6koELBjOEavl5seeIie8vt/bA5nU63he2IKcEzao6FqR1yLxyO', 'هشام سعد جاد', NULL, 'active', '2026-02-22 14:51:38', '2026-02-22 14:51:38'),
('a2a11d8c-7847-4fce-aed7-4d33f4f3bf54', 'test@test', '$2y$10$qijiwbV0FhMoOvASeQ0nfe8VqW1NsEQH1xkSnDWtU4frsIGtV0qR6', 'test', NULL, 'active', '2026-02-24 07:59:20', '2026-02-24 07:59:20'),
('u-admin-01', 'admin@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدير النظام-كل الصلاحيات', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 16:15:14'),
('u-emp-01', 'mahmoudalsaleh@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'محمود الصالح', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 16:14:45'),
('u-emp-02', 'hany@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'هاني متولي', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 16:15:33'),
('u-emp-03', 'abdalmumn@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'عبدالمؤمن أيمن', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('u-emp-04', 'amany@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أمانى رسلان', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('u-emp-05', 'murad@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'محمود مراد', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('u-emp-06', 'ibrahim@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ابراهيم عبدالوهاب', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('u-emp-07', 'ibrahimlebdaa@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ابراهيم لبدع', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('u-emp-08', 'test@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'موظف التجارب', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42'),
('u-emp-09', 'nema@ivory.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'نعمة عوض', NULL, 'active', '2026-02-05 14:57:42', '2026-02-05 14:57:42');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `user_id`, `role_id`, `employee_id`, `assigned_by`, `assigned_at`, `status`) VALUES
('05b25fa5-02a3-11f1-a178-d481d76a1bbe', 'u-emp-01', 'ff72942b-09d7-4e42-aab5-03b98039c08a', 'e-002', NULL, '2026-02-05 14:57:42', 'active'),
('05b263d4-02a3-11f1-a178-d481d76a1bbe', 'u-emp-02', '6c162dae-02a0-11f1-a178-d481d76a1bbe', 'e-003', NULL, '2026-02-05 14:57:42', 'active'),
('05b63c8f-2dcc-4211-9659-4f11f1ccc150', 'u-emp-07', '6c162dae-02a0-11f1-a178-d481d76a1bbe', 'e-008', NULL, '2026-02-05 16:46:57', 'active'),
('0d2a2e91-3e60-4ca4-811f-ae7a5c0cfc12', 'u-emp-08', '6c162dae-02a0-11f1-a178-d481d76a1bbe', '5b7e0d98-28ef-44dc-8326-11f10dd0870f', NULL, '2026-02-05 23:33:05', 'active'),
('41c9a670-f49b-4bbf-80ce-0fe4539aaaa2', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 'e-005', NULL, '2026-02-05 16:43:40', 'active'),
('539b083b-c8e1-475f-89a9-5c8cddc164dc', '7b99aa04-e91e-443a-a7d4-51b5fd606a92', '6c162dae-02a0-11f1-a178-d481d76a1bbe', 'd11c40d6-687e-446b-93a8-9c0464d91693', NULL, '2026-02-22 14:05:17', 'active'),
('579ea9ad-c6fe-48a4-ba12-9268761bde4c', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 'e-006', NULL, '2026-02-05 16:44:34', 'active'),
('7d29f1f9-4935-42b3-a4f1-d0d8bf064422', 'u-emp-03', '6c162cce-02a0-11f1-a178-d481d76a1bbe', 'e-004', NULL, '2026-02-05 16:37:15', 'active'),
('86346d4a-5e22-4523-a476-ffd2c4bd416d', 'u-emp-06', '6c162cce-02a0-11f1-a178-d481d76a1bbe', 'e-007', NULL, '2026-02-05 16:45:40', 'active'),
('ad9763d1-6f1a-4048-90e6-34cfaedc1b85', '9ef8d021-8440-4c46-af92-53f65a47d1d0', '6c162dae-02a0-11f1-a178-d481d76a1bbe', 'ddcaf7b3-d9ef-4bc5-87d4-033f592ac85b', NULL, '2026-02-22 14:51:56', 'active'),
('af1343f2-db68-421b-a8c8-230005a36e6f', 'u-emp-09', '6c162b0b-02a0-11f1-a178-d481d76a1bbe', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', NULL, '2026-02-10 21:48:33', 'active'),
('bd70c0e4-02d7-11f1-95cc-d481d76a1bbe', 'u-admin-01', '6c1626e4-02a0-11f1-a178-d481d76a1bbe', 'e-001', NULL, '2026-02-05 21:15:04', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `violation_types`
--

CREATE TABLE `violation_types` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `letter_template` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `violation_types`
--

INSERT INTO `violation_types` (`id`, `name`, `description`, `letter_template`, `created_at`, `updated_at`) VALUES
('v-type-absence', 'غياب بدون عذر', 'الغياب عن العمل بدون إذن مسبق أو عذر مقبول', 'السيد {employee_name}،\n\nتم تسجيل غياب يوم {incident_date} بدون عذر مسبق.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: {penalty_action}.\n\nإدارة الموارد البشرية', '2026-02-25 21:30:47', '2026-02-25 21:30:47'),
('v-type-delay', 'تأخير صباحي', 'التأخر عن موعد الحضور الرسمي صباحاً', 'السيد {employee_name}،\n\nتم تسجيل تأخير صباحي بتاريخ {incident_date}.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: {penalty_action}.\n\nإدارة الموارد البشرية', '2026-02-25 21:30:47', '2026-02-25 21:30:47');

-- --------------------------------------------------------

--
-- Table structure for table `workflow_blueprints`
--

CREATE TABLE `workflow_blueprints` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `request_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `workflow_blueprints`
--

INSERT INTO `workflow_blueprints` (`id`, `request_type`, `is_active`, `created_at`, `updated_at`) VALUES
('195602c0-f5f3-4afb-a723-3d0a1656a8ce', 'test_request', 1, '2026-02-21 17:40:01', '2026-02-21 17:40:01'),
('2ca3c1281fb54f4a139f8cce16b5eaba', 'TrainingRequest', 1, '2026-02-22 21:03:51', '2026-02-22 21:03:51'),
('54a072c6-4bdd-44ba-afb0-61b4ec67a06f', 'PermissionRequest', 1, '2026-02-21 15:49:12', '2026-02-21 15:49:12'),
('67e0af1bac1dde9f9072c8b8f78cb35c', 'ContractRequest', 1, '2026-02-22 22:08:27', '2026-02-22 22:08:27'),
('953e66a0-01a1-452f-b3e9-a21bd75551c9', 'PayrollBatch', 1, '2026-02-24 22:47:32', '2026-02-24 22:47:32'),
('9b737938-cfdf-45fb-82f8-f91c87aaea49', 'OvertimeRequest', 1, '2026-02-21 19:42:34', '2026-02-21 19:42:34'),
('9c8979f5-af77-42cd-b060-dd9dd4f00c04', 'TestRequest', 1, '2026-02-21 15:21:15', '2026-02-21 15:21:15'),
('9d0fe34c-a45c-4cd2-b49c-091afa56136b', 'LeaveRequest', 1, '2026-02-21 19:34:19', '2026-02-21 19:34:19'),
('c2c76c69-252a-4215-8de4-6f1154831544', 'ResignationRequest', 1, '2026-02-21 19:44:14', '2026-02-21 19:44:14'),
('cb30f03c-f74e-4694-b41f-96cb60e37b0e', 'PerformanceEvaluation', 1, '2026-02-23 11:28:47', '2026-02-23 11:28:47'),
('eaeef642-0eaa-49a6-818e-5d75b122521c', 'BonusRequest', 1, '2026-02-21 19:43:29', '2026-02-21 19:43:29'),
('f1092790-af38-490b-9f97-3adeaddee5d6', 'Payroll', 1, '2026-02-21 19:44:52', '2026-02-21 19:44:52'),
('violation-bp-1772054975', 'EmployeeViolation', 1, '2026-02-25 21:29:35', '2026-02-25 21:29:35');

-- --------------------------------------------------------

--
-- Table structure for table `workflow_blueprint_steps`
--

CREATE TABLE `workflow_blueprint_steps` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `blueprint_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_order` int NOT NULL,
  `role_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_direct_manager` tinyint(1) DEFAULT '0',
  `is_dept_manager` tinyint(1) DEFAULT '0',
  `show_approver_name` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `workflow_blueprint_steps`
--

INSERT INTO `workflow_blueprint_steps` (`id`, `blueprint_id`, `step_order`, `role_id`, `is_direct_manager`, `is_dept_manager`, `show_approver_name`, `created_at`, `updated_at`) VALUES
('0088321d-ceb6-45b4-a5c6-05a952ab94a3', 'eaeef642-0eaa-49a6-818e-5d75b122521c', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-21 19:43:29', '2026-02-21 19:43:29'),
('03429d0e-6092-4836-bf9e-ccbcfa397a01', '9d0fe34c-a45c-4cd2-b49c-091afa56136b', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-22 07:37:32', '2026-02-22 07:37:32'),
('0526f019-c728-4aa0-8abd-ca689eba6e5c', '9d0fe34c-a45c-4cd2-b49c-091afa56136b', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-22 07:37:32', '2026-02-22 07:37:32'),
('0ce9d7e3-a4a6-4e15-81c1-d634bc64bb09', 'cb30f03c-f74e-4694-b41f-96cb60e37b0e', 1, NULL, 1, 0, 1, '2026-02-23 11:28:47', '2026-02-23 11:28:47'),
('14737bf7-8b76-4529-b3f8-eab002cf8e42', '2ca3c1281fb54f4a139f8cce16b5eaba', 1, NULL, 1, 0, 1, '2026-02-22 21:41:26', '2026-02-22 21:41:26'),
('14e7f898-369d-4008-9455-889cb5a83c32', '67e0af1bac1dde9f9072c8b8f78cb35c', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-22 22:31:55', '2026-02-22 22:31:55'),
('1aa66bd4-60d3-4a8d-89ef-b87716e5c41c', '9d0fe34c-a45c-4cd2-b49c-091afa56136b', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-22 07:37:32', '2026-02-22 07:37:32'),
('210945d9-b62c-42a6-b217-fb3be6742af2', 'cb30f03c-f74e-4694-b41f-96cb60e37b0e', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-23 11:28:47', '2026-02-23 11:28:47'),
('2f86e854-e706-47ed-b283-7d99f10592c0', 'f1092790-af38-490b-9f97-3adeaddee5d6', 1, NULL, 1, 0, 1, '2026-02-21 19:44:52', '2026-02-21 19:44:52'),
('349a0d9e-8975-4e3a-bb46-b787357051aa', 'cb30f03c-f74e-4694-b41f-96cb60e37b0e', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-23 11:28:47', '2026-02-23 11:28:47'),
('3d1f479b-1ffa-4917-8b10-5377fc579517', 'f1092790-af38-490b-9f97-3adeaddee5d6', 2, NULL, 0, 1, 1, '2026-02-21 19:44:52', '2026-02-21 19:44:52'),
('46483841-9dea-4174-9b6f-ab09b3a7b320', '9d0fe34c-a45c-4cd2-b49c-091afa56136b', 2, NULL, 0, 1, 1, '2026-02-22 07:37:32', '2026-02-22 07:37:32'),
('48ce5694-a654-4d3a-9184-6d26f66caff4', '9b737938-cfdf-45fb-82f8-f91c87aaea49', 1, NULL, 1, 0, 1, '2026-02-21 19:42:34', '2026-02-21 19:42:34'),
('4da58722-2ffe-45e9-9c7e-3c6b95bf57ed', '54a072c6-4bdd-44ba-afb0-61b4ec67a06f', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-21 19:41:53', '2026-02-21 19:41:53'),
('5744a456-b47b-41fd-82fa-3aeae5461335', '54a072c6-4bdd-44ba-afb0-61b4ec67a06f', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-21 19:41:53', '2026-02-21 19:41:53'),
('57770023-9a0b-47d8-bdb4-828d682c6008', 'f1092790-af38-490b-9f97-3adeaddee5d6', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-21 19:44:52', '2026-02-21 19:44:52'),
('5a5e8543-f371-4d26-839c-f69c059e49d9', 'f1092790-af38-490b-9f97-3adeaddee5d6', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-21 19:44:52', '2026-02-21 19:44:52'),
('5b1e6525-b999-4682-88a9-fa94186926ef', '9d0fe34c-a45c-4cd2-b49c-091afa56136b', 1, NULL, 1, 0, 1, '2026-02-22 07:37:32', '2026-02-22 07:37:32'),
('63185d0b-c6f3-44e8-b351-d7733ca7a5c6', 'f1092790-af38-490b-9f97-3adeaddee5d6', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-21 19:44:52', '2026-02-21 19:44:52'),
('66a6dfee-a2c9-4c29-a4be-22f451516e45', 'c2c76c69-252a-4215-8de4-6f1154831544', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-21 19:44:14', '2026-02-21 19:44:14'),
('66ed2acb-efd4-4971-90dc-7ca64cebdf41', 'eaeef642-0eaa-49a6-818e-5d75b122521c', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-21 19:43:29', '2026-02-21 19:43:29'),
('68c3101e-d00c-450b-8e1e-b916fdaf3976', '953e66a0-01a1-452f-b3e9-a21bd75551c9', 1, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-24 23:49:52', '2026-02-24 23:49:52'),
('69e93672-695c-4536-8e40-94fe820e2d16', '54a072c6-4bdd-44ba-afb0-61b4ec67a06f', 2, NULL, 0, 1, 1, '2026-02-21 19:41:53', '2026-02-21 19:41:53'),
('6daa3cf3-08b5-429d-aa93-77e3fce740c9', '9b737938-cfdf-45fb-82f8-f91c87aaea49', 2, NULL, 0, 1, 1, '2026-02-21 19:42:34', '2026-02-21 19:42:34'),
('6ec4780f-4b76-426c-b723-015cad4bb7f7', '67e0af1bac1dde9f9072c8b8f78cb35c', 1, NULL, 1, 0, 1, '2026-02-22 22:31:55', '2026-02-22 22:31:55'),
('78745a7f-eaa2-4b43-a7e3-04bbc40521ca', 'c2c76c69-252a-4215-8de4-6f1154831544', 1, NULL, 1, 0, 1, '2026-02-21 19:44:14', '2026-02-21 19:44:14'),
('7d8d2329-3016-4c37-8a94-93de1da80fa1', '67e0af1bac1dde9f9072c8b8f78cb35c', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-22 22:31:55', '2026-02-22 22:31:55'),
('7f3b839f-9055-4656-a290-f6fb9bdc24cc', 'c2c76c69-252a-4215-8de4-6f1154831544', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-21 19:44:14', '2026-02-21 19:44:14'),
('8abb6d4f-e8d3-488c-8a53-ef0d2e0f4326', '54a072c6-4bdd-44ba-afb0-61b4ec67a06f', 1, NULL, 1, 0, 1, '2026-02-21 19:41:53', '2026-02-21 19:41:53'),
('8df7a246-77d4-41db-9da9-6247c30c1330', 'cb30f03c-f74e-4694-b41f-96cb60e37b0e', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-23 11:28:47', '2026-02-23 11:28:47'),
('8ea22a13-a4c2-48f2-a103-8082971869a6', 'eaeef642-0eaa-49a6-818e-5d75b122521c', 1, NULL, 1, 0, 1, '2026-02-21 19:43:29', '2026-02-21 19:43:29'),
('8edb35ca-a3e3-4df9-96cb-c43685b7c382', '2ca3c1281fb54f4a139f8cce16b5eaba', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-22 21:41:26', '2026-02-22 21:41:26'),
('8efd7dc6-b820-4842-a004-ae8a4c625884', '2ca3c1281fb54f4a139f8cce16b5eaba', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-22 21:41:26', '2026-02-22 21:41:26'),
('9ba7f231-bf2a-47c3-b088-c8bdb313229d', '953e66a0-01a1-452f-b3e9-a21bd75551c9', 3, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-24 23:49:52', '2026-02-24 23:49:52'),
('a404c650-141e-4358-b196-3110f38de4ed', '2ca3c1281fb54f4a139f8cce16b5eaba', 2, NULL, 0, 1, 1, '2026-02-22 21:41:26', '2026-02-22 21:41:26'),
('aa40ab18-d985-45bd-87c7-1133b53c2f09', 'c2c76c69-252a-4215-8de4-6f1154831544', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-21 19:44:14', '2026-02-21 19:44:14'),
('ae5670f1-f1df-4671-bf94-c68a4ede10b4', '9b737938-cfdf-45fb-82f8-f91c87aaea49', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-21 19:42:34', '2026-02-21 19:42:34'),
('b0c339ed-038c-451f-b843-0ca562b253e1', 'cb30f03c-f74e-4694-b41f-96cb60e37b0e', 2, NULL, 0, 1, 1, '2026-02-23 11:28:47', '2026-02-23 11:28:47'),
('b63bbf12-d0d4-411d-a3d1-e7fced2ed39d', '67e0af1bac1dde9f9072c8b8f78cb35c', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-22 22:31:55', '2026-02-22 22:31:55'),
('c1289127-5782-4515-82af-a13e60ee8100', 'c2c76c69-252a-4215-8de4-6f1154831544', 2, NULL, 0, 1, 1, '2026-02-21 19:44:14', '2026-02-21 19:44:14'),
('c26ac245-e563-4cb9-a610-e1a264d038ac', '67e0af1bac1dde9f9072c8b8f78cb35c', 2, NULL, 0, 1, 1, '2026-02-22 22:31:55', '2026-02-22 22:31:55'),
('c3f8f534-bb53-42a8-8931-3093349a8c22', 'eaeef642-0eaa-49a6-818e-5d75b122521c', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-21 19:43:29', '2026-02-21 19:43:29'),
('c42210fd-cc03-4594-9f37-37e6bec7efd2', '9b737938-cfdf-45fb-82f8-f91c87aaea49', 5, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-21 19:42:34', '2026-02-21 19:42:34'),
('ce8787b2-ac85-4911-b515-d765811ab802', '953e66a0-01a1-452f-b3e9-a21bd75551c9', 2, '6c162c07-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-24 23:49:52', '2026-02-24 23:49:52'),
('d4bb1e5e-eb57-4c82-8460-9bf0dc2f43da', 'eaeef642-0eaa-49a6-818e-5d75b122521c', 2, NULL, 0, 1, 1, '2026-02-21 19:43:29', '2026-02-21 19:43:29'),
('dc466011-79b5-410b-994e-ab391dd599ec', '2ca3c1281fb54f4a139f8cce16b5eaba', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-22 21:41:26', '2026-02-22 21:41:26'),
('ddd60e85-7691-4ef9-8ff0-747706fdfad0', '9c8979f5-af77-42cd-b060-dd9dd4f00c04', 2, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-21 15:21:15', '2026-02-21 15:21:15'),
('e5664a20-b523-4b8a-b193-8ffdb07c6502', '9c8979f5-af77-42cd-b060-dd9dd4f00c04', 1, NULL, 1, 0, 1, '2026-02-21 15:21:15', '2026-02-21 15:21:15'),
('f24f1463-3b5b-4ee8-9205-1293bdf82ce3', '195602c0-f5f3-4afb-a723-3d0a1656a8ce', 1, NULL, 0, 1, 1, '2026-02-21 17:40:01', '2026-02-21 17:40:01'),
('f54b3440-0624-45b1-817b-be0cb5703b25', '54a072c6-4bdd-44ba-afb0-61b4ec67a06f', 3, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 0, '2026-02-21 19:41:53', '2026-02-21 19:41:53'),
('fda3815c-4c4d-4e69-8287-7cd0a3bef632', '9b737938-cfdf-45fb-82f8-f91c87aaea49', 4, 'ff72942b-09d7-4e42-aab5-03b98039c08a', 0, 0, 1, '2026-02-21 19:42:34', '2026-02-21 19:42:34'),
('step1-1772054975', 'violation-bp-1772054975', 1, NULL, 0, 1, 1, '2026-02-25 21:29:35', '2026-02-25 21:29:35'),
('step2-1772054975', 'violation-bp-1772054975', 2, '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 0, 0, 1, '2026-02-25 21:29:35', '2026-02-25 21:29:35');

-- --------------------------------------------------------

--
-- Table structure for table `work_locations`
--

CREATE TABLE `work_locations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `use_coordinates` tinyint(1) DEFAULT '1',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `radius_meters` int DEFAULT '100',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_locations`
--

INSERT INTO `work_locations` (`id`, `name`, `code`, `address`, `use_coordinates`, `latitude`, `longitude`, `radius_meters`, `status`, `created_at`, `updated_at`) VALUES
('ee7c04a4-4c7f-47e8-84f3-ad8235e3d8f8', 'مدد السعودية', 'sa', 'حي المرسلات - الرياض- السعودية', 1, '30.68139180', '31.77790409', 1000000, 'active', '2026-02-05 15:36:46', '2026-02-12 20:50:34'),
('loc-main', 'المقر الرئيسي - القاهرة', 'eg', 'شارع التسعين، التجمع الخامس', 1, '30.02750000', '31.49140000', 100000, 'active', '2026-02-05 14:57:42', '2026-02-12 20:50:50'),
('loc-remote', 'عن بعد', 'online', 'Remote Work', 0, '30.72223978', '31.79537354', 100000, 'active', '2026-02-05 14:57:42', '2026-02-12 20:50:18');

-- --------------------------------------------------------

--
-- Table structure for table `work_schedules`
--

CREATE TABLE `work_schedules` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_location_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schedule_type` enum('fixed','flexible') COLLATE utf8mb4_unicode_ci DEFAULT 'fixed',
  `total_hours` decimal(5,2) DEFAULT '8.00',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `working_days` json DEFAULT NULL,
  `grace_period_minutes` int DEFAULT '15',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ramadan_start_date` date DEFAULT NULL,
  `ramadan_end_date` date DEFAULT NULL,
  `ramadan_start_time` time DEFAULT NULL,
  `ramadan_end_time` time DEFAULT NULL,
  `ramadan_total_hours` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_schedules`
--

INSERT INTO `work_schedules` (`id`, `name`, `work_location_id`, `schedule_type`, `total_hours`, `start_time`, `end_time`, `working_days`, `grace_period_minutes`, `status`, `created_at`, `updated_at`, `ramadan_start_date`, `ramadan_end_date`, `ramadan_start_time`, `ramadan_end_time`, `ramadan_total_hours`) VALUES
('0d13882f-f1e3-467a-aa18-1604e5c31cdd', 'جدول مرن', 'loc-remote', 'flexible', '8.00', NULL, NULL, '[\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\"]', 15, 'active', '2026-02-24 20:10:52', '2026-02-24 20:33:23', '2026-02-19', '2026-03-19', NULL, NULL, '6.00'),
('99c9cbeb-2df0-4013-ad63-ae6045278aa1', 'جدول العمل في السعودية', 'ee7c04a4-4c7f-47e8-84f3-ad8235e3d8f8', 'fixed', '8.00', '09:00:00', '17:00:00', '[\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\"]', 15, 'active', '2026-02-05 21:44:06', '2026-02-24 21:13:05', '2026-02-19', '2026-03-19', '11:59:00', '16:54:00', NULL),
('a59f6b22-bc6f-43d3-88ed-09521290a3bd', 'جدول العمل عن بعد', 'loc-remote', 'fixed', '8.00', '09:00:00', '17:00:00', '[\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Saturday\"]', 15, 'active', '2026-02-05 21:45:41', '2026-02-08 21:22:08', NULL, NULL, NULL, NULL, NULL),
('caf051ff-d697-4f73-8f7d-a0c4861bdf4c', 'جدول العمل في مصر', 'loc-main', 'fixed', '8.00', '09:00:00', '17:00:00', '[\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\"]', 15, 'active', '2026-02-05 21:44:55', '2026-02-08 21:22:08', NULL, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `allowances`
--
ALTER TABLE `allowances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `allowance_types`
--
ALTER TABLE `allowance_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `approval_requests`
--
ALTER TABLE `approval_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_model` (`model_type`,`model_id`);

--
-- Indexes for table `approval_steps`
--
ALTER TABLE `approval_steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approval_request_id` (`approval_request_id`),
  ADD KEY `approver_user_id` (`approver_user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attendance` (`employee_id`,`date`),
  ADD KEY `idx_attendance_date` (`date`),
  ADD KEY `idx_attendance_employee_date` (`employee_id`,`date`);

--
-- Indexes for table `attendance_statuses`
--
ALTER TABLE `attendance_statuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_logs_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_audit_logs_user` (`user_id`);

--
-- Indexes for table `bank_names`
--
ALTER TABLE `bank_names`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bonuses`
--
ALTER TABLE `bonuses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bonuses_employee` (`employee_id`);

--
-- Indexes for table `business_tasks`
--
ALTER TABLE `business_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `company_profile`
--
ALTER TABLE `company_profile`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `competencies`
--
ALTER TABLE `competencies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `competency_ratings`
--
ALTER TABLE `competency_ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `competency_id` (`competency_id`),
  ADD KEY `evaluation_id` (`evaluation_id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_contracts_req_num` (`request_number`),
  ADD KEY `idx_contracts_employee` (`employee_id`),
  ADD KEY `idx_contracts_status` (`status`);

--
-- Indexes for table `contract_types`
--
ALTER TABLE `contract_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deductions`
--
ALTER TABLE `deductions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_deductions_employee` (`employee_id`);

--
-- Indexes for table `deduction_types`
--
ALTER TABLE `deduction_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_department_id` (`parent_department_id`);

--
-- Indexes for table `development_logs`
--
ALTER TABLE `development_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_number` (`employee_number`),
  ADD KEY `work_location_id` (`work_location_id`),
  ADD KEY `idx_employees_department` (`department`),
  ADD KEY `idx_employees_status` (`status`),
  ADD KEY `idx_employees_email` (`email`);

--
-- Indexes for table `employee_bonus_totals`
--
ALTER TABLE `employee_bonus_totals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_emp_month` (`employee_id`,`month`);

--
-- Indexes for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_balance` (`employee_id`,`leave_type_id`,`year`),
  ADD KEY `leave_type_id` (`leave_type_id`);

--
-- Indexes for table `employee_overtime_bonuses`
--
ALTER TABLE `employee_overtime_bonuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_emp_month` (`employee_id`,`month`);

--
-- Indexes for table `employee_permission_deductions`
--
ALTER TABLE `employee_permission_deductions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_emp_month` (`employee_id`,`month`);

--
-- Indexes for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `training_id` (`training_id`);

--
-- Indexes for table `employee_violations`
--
ALTER TABLE `employee_violations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `violation_type_id` (`violation_type_id`);

--
-- Indexes for table `evaluation_templates`
--
ALTER TABLE `evaluation_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `insurance_settings`
--
ALTER TABLE `insurance_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_descriptions`
--
ALTER TABLE `job_descriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kpi_results`
--
ALTER TABLE `kpi_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `evaluation_id` (`evaluation_id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_type_id` (`leave_type_id`),
  ADD KEY `idx_leave_requests_employee` (`employee_id`),
  ADD KEY `idx_leave_requests_status` (`status`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nationalities`
--
ALTER TABLE `nationalities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `overtime`
--
ALTER TABLE `overtime`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_overtime_employee` (`employee_id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_payroll` (`employee_id`,`month`,`year`),
  ADD KEY `idx_payroll_employee_period` (`employee_id`,`year`,`month`),
  ADD KEY `fk_payroll_batch` (`batch_id`);

--
-- Indexes for table `payroll_batches`
--
ALTER TABLE `payroll_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `penalty_policies`
--
ALTER TABLE `penalty_policies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `violation_type_id` (`violation_type_id`);

--
-- Indexes for table `performance_evaluations`
--
ALTER TABLE `performance_evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `permission_requests`
--
ALTER TABLE `permission_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `current_stage_role_id` (`current_stage_role_id`),
  ADD KEY `idx_permission_requests_employee_id` (`employee_id`),
  ADD KEY `idx_permission_requests_request_number` (`request_number`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `resignations`
--
ALTER TABLE `resignations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `unique_code` (`code`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `template_competencies`
--
ALTER TABLE `template_competencies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `competency_id` (`competency_id`);

--
-- Indexes for table `template_kpis`
--
ALTER TABLE `template_kpis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `trainings`
--
ALTER TABLE `trainings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `training_statuses`
--
ALTER TABLE `training_statuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `violation_types`
--
ALTER TABLE `violation_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `workflow_blueprints`
--
ALTER TABLE `workflow_blueprints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `request_type` (`request_type`);

--
-- Indexes for table `workflow_blueprint_steps`
--
ALTER TABLE `workflow_blueprint_steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blueprint_id` (`blueprint_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `work_locations`
--
ALTER TABLE `work_locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `work_schedules`
--
ALTER TABLE `work_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `work_location_id` (`work_location_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `allowances`
--
ALTER TABLE `allowances`
  ADD CONSTRAINT `allowances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `approval_steps`
--
ALTER TABLE `approval_steps`
  ADD CONSTRAINT `approval_steps_ibfk_1` FOREIGN KEY (`approval_request_id`) REFERENCES `approval_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `approval_steps_ibfk_2` FOREIGN KEY (`approver_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `approval_steps_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bonuses`
--
ALTER TABLE `bonuses`
  ADD CONSTRAINT `bonuses_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `business_tasks`
--
ALTER TABLE `business_tasks`
  ADD CONSTRAINT `business_tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `competency_ratings`
--
ALTER TABLE `competency_ratings`
  ADD CONSTRAINT `competency_ratings_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `competency_ratings_ibfk_2` FOREIGN KEY (`competency_id`) REFERENCES `competencies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `deductions`
--
ALTER TABLE `deductions`
  ADD CONSTRAINT `deductions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`parent_department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`work_location_id`) REFERENCES `work_locations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  ADD CONSTRAINT `employee_leave_balances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  ADD CONSTRAINT `employee_trainings_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_trainings_ibfk_2` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_violations`
--
ALTER TABLE `employee_violations`
  ADD CONSTRAINT `employee_violations_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_violations_ibfk_2` FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kpi_results`
--
ALTER TABLE `kpi_results`
  ADD CONSTRAINT `kpi_results_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `performance_evaluations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `overtime`
--
ALTER TABLE `overtime`
  ADD CONSTRAINT `overtime_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `fk_payroll_batch` FOREIGN KEY (`batch_id`) REFERENCES `payroll_batches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `penalty_policies`
--
ALTER TABLE `penalty_policies`
  ADD CONSTRAINT `penalty_policies_ibfk_1` FOREIGN KEY (`violation_type_id`) REFERENCES `violation_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performance_evaluations`
--
ALTER TABLE `performance_evaluations`
  ADD CONSTRAINT `performance_evaluations_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `performance_evaluations_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `evaluation_templates` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `permission_requests`
--
ALTER TABLE `permission_requests`
  ADD CONSTRAINT `fk_permission_requests_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `permission_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_requests_ibfk_2` FOREIGN KEY (`current_stage_role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `resignations`
--
ALTER TABLE `resignations`
  ADD CONSTRAINT `resignations_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `template_competencies`
--
ALTER TABLE `template_competencies`
  ADD CONSTRAINT `template_competencies_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `evaluation_templates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `template_competencies_ibfk_2` FOREIGN KEY (`competency_id`) REFERENCES `competencies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `template_kpis`
--
ALTER TABLE `template_kpis`
  ADD CONSTRAINT `template_kpis_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `evaluation_templates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `workflow_blueprint_steps`
--
ALTER TABLE `workflow_blueprint_steps`
  ADD CONSTRAINT `workflow_blueprint_steps_ibfk_1` FOREIGN KEY (`blueprint_id`) REFERENCES `workflow_blueprints` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `workflow_blueprint_steps_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `work_schedules`
--
ALTER TABLE `work_schedules`
  ADD CONSTRAINT `work_schedules_ibfk_1` FOREIGN KEY (`work_location_id`) REFERENCES `work_locations` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
