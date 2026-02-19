-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 19, 2026 at 02:24 PM
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
('b4ef44ea-0854-11f1-9a95-d481d76a1bbe', 'e-001', '2026-02-12', '20:52:13', '{\"latitude\": 30.681340746800203, \"longitude\": 31.777889400568306}', '20:53:11', '{\"latitude\": 30.68138708613295, \"longitude\": 31.777899437457982}', 'present', NULL, 1, 712, '0.02', '0.00', 'mobile_app', '2026-02-12 20:52:13', '2026-02-12 20:53:11');

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
('0ecec7d7-4009-4cfc-ac09-50a3ae38b5ce', NULL, 'update', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 23:18:43'),
('1b388212-16b4-4c88-8839-29669989833b', NULL, 'delete', 'employees', '829561a6-4a7e-4ec9-a1c5-0e1cae9cc707', '{\"id\": \"829561a6-4a7e-4ec9-a1c5-0e1cae9cc707\", \"iban\": null, \"email\": \"tttttt@tttttt.com\", \"phone\": 34343434, \"gender\": \"male\", \"status\": \"active\", \"position\": \"مدير قسم\", \"bank_name\": null, \"documents\": [], \"full_name\": \"على على على على على\", \"hire_date\": null, \"id_number\": null, \"birth_date\": \"2026-02-13\", \"created_at\": \"2026-02-13 01:18:28\", \"department\": \"تقنية المعلومات\", \"updated_at\": \"2026-02-13 01:18:43\", \"nationality\": \"فلسطيني\", \"bank_account\": null, \"department_id\": \"d-it\", \"position_name\": \"مدير قسم\", \"profile_image\": null, \"department_name\": \"تقنية المعلومات\", \"employee_number\": \"EMP-0003\", \"work_location_id\": \"loc-main\", \"work_location_name\": \"المقر الرئيسي - القاهرة\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-12 23:18:54'),
('1b4ec868-1265-4752-a665-8b041f3ee285', NULL, 'update', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:10:30\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-17T12:10:30+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"status\": \"pending\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 2, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: مدير الموارد البشرية (أمانى رسلان)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:10:30\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-17T12:10:30+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"status\": \"pending\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 2, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: مدير الموارد البشرية (أمانى رسلان)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:10:30'),
('1e2bef03-9ebd-4c37-9cd1-34f20ab402da', NULL, 'delete', 'employee_trainings', '083f031c-cf65-4215-ab90-6917fc831875', '{\"id\": \"083f031c-cf65-4215-ab90-6917fc831875\", \"notes\": null, \"score\": null, \"status\": \"جاري\", \"end_date\": \"2026-02-12\", \"created_at\": \"2026-02-13 01:20:33\", \"start_date\": \"2026-02-12\", \"updated_at\": \"2026-02-13 01:21:03\", \"employee_id\": \"e-005\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"gm\", \"status\": \"pending\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 0, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-12 23:21:21'),
('1ebb86c8-baba-4340-9837-494f8fd304f1', NULL, 'update', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:10:14\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"status\": \"pending\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"status\": \"pending\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 1, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:10:14\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"status\": \"pending\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"status\": \"pending\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 1, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:10:14'),
('28a51657-1f81-4da6-8645-e84ba2f44b3d', NULL, 'update', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 22:49:06'),
('3ba22a06-3683-48c7-bc1f-0599c0843970', NULL, 'update', 'payroll', '23bb450e-49d3-489a-b3fb-2009328919c1', '{\"id\": \"23bb450e-49d3-489a-b3fb-2009328919c1\", \"year\": 2026, \"month\": 2, \"notes\": \"\", \"status\": \"approved\", \"currency\": \"SAR\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1197, \"updated_at\": \"2026-02-17 14:21:39\", \"absent_days\": 0, \"employee_id\": \"e-007\", \"basic_salary\": 1000, \"gross_salary\": 1297, \"late_minutes\": 0, \"payroll_date\": \"2026-02-12\", \"working_days\": 30, \"bonuses_amount\": 0, \"late_deduction\": 0, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-44015\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 100, \"absence_deduction\": 0, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 97, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '{\"id\": \"23bb450e-49d3-489a-b3fb-2009328919c1\", \"year\": 2026, \"month\": 2, \"notes\": \"\", \"status\": \"paid\", \"currency\": \"SAR\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1197, \"updated_at\": \"2026-02-17 14:21:45\", \"absent_days\": 0, \"employee_id\": \"e-007\", \"basic_salary\": 1000, \"gross_salary\": 1297, \"late_minutes\": 0, \"payroll_date\": \"2026-02-12\", \"working_days\": 30, \"bonuses_amount\": 0, \"late_deduction\": 0, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-44015\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 100, \"absence_deduction\": 0, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 97, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:21:45'),
('3c325ef9-565f-4791-ad67-8cc5c03d13d8', NULL, 'update', 'employee_trainings', '083f031c-cf65-4215-ab90-6917fc831875', '{\"id\": \"083f031c-cf65-4215-ab90-6917fc831875\", \"notes\": null, \"score\": null, \"status\": \"جاري\", \"end_date\": \"2026-02-12\", \"created_at\": \"2026-02-13 01:20:33\", \"start_date\": \"2026-02-12\", \"updated_at\": \"2026-02-13 01:20:33\", \"employee_id\": \"e-005\", \"training_id\": \"518cc135-e17c-478f-a677-8a88e1b08b74\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"gm\", \"status\": \"pending\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 0, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"id\": \"083f031c-cf65-4215-ab90-6917fc831875\", \"notes\": null, \"score\": null, \"status\": \"جاري\", \"end_date\": \"2026-02-12\", \"created_at\": \"2026-02-13 01:20:33\", \"start_date\": \"2026-02-12\", \"updated_at\": \"2026-02-13 01:21:03\", \"employee_id\": \"e-005\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"gm\", \"status\": \"pending\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 0, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-12 23:21:03'),
('3f631f77-e67c-4148-97f7-187de3ee39f4', NULL, 'update', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:11:27\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-17T12:10:30+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:11:27+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 3, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: مدير الحسابات (محمود مراد)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:11:27\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-17T12:10:30+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:11:27+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 3, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: مدير الحسابات (محمود مراد)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:11:27'),
('45699eca-f161-4c60-9397-65ba4fdf5538', NULL, 'approve', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:10:30\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": \"[{\\\"level\\\": \\\"direct_manager\\\", \\\"notes\\\": \\\"\\\", \\\"status\\\": \\\"approved\\\", \\\"actor_id\\\": \\\"u-admin-01\\\", \\\"actor_name\\\": \\\"مدير النظام-كل الصلاحيات\\\", \\\"level_name\\\": \\\"المدير المباشر\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"decision_date\\\": \\\"2026-02-17T12:10:14+00:00\\\", \\\"role_required\\\": \\\"Direct Manager\\\"}, {\\\"level\\\": \\\"gm\\\", \\\"notes\\\": \\\"\\\", \\\"status\\\": \\\"approved\\\", \\\"actor_id\\\": \\\"u-admin-01\\\", \\\"actor_name\\\": \\\"مدير النظام-كل الصلاحيات\\\", \\\"level_name\\\": \\\"المدير العام\\\", \\\"approver_id\\\": \\\"e-002\\\", \\\"approver_name\\\": \\\"محمود الصالح\\\", \\\"decision_date\\\": \\\"2026-02-17T12:10:30+00:00\\\", \\\"role_required\\\": \\\"General Manager\\\"}, {\\\"level\\\": \\\"hr\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"مدير الموارد البشرية\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"role_required\\\": \\\"HR Manager\\\"}, {\\\"level\\\": \\\"finance\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"مدير الحسابات\\\", \\\"approver_id\\\": \\\"e-006\\\", \\\"approver_name\\\": \\\"محمود مراد\\\", \\\"role_required\\\": \\\"Finance Manager\\\"}]\", \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 2, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: مدير الموارد البشرية (أمانى رسلان)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"idx\": 3, \"desc\": \"جارى الاعتماد من: مدير الحسابات (محمود مراد)\", \"notes\": \"\", \"status\": \"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:11:27'),
('48072430-1039-407d-8cdd-981bad79aaf7', NULL, 'update', 'payroll', '2b20e5a9-94b2-4a72-adff-a1609888d31c', '{\"id\": \"2b20e5a9-94b2-4a72-adff-a1609888d31c\", \"year\": 2026, \"month\": 2, \"notes\": \"خصم 2 يوم غياب. \", \"status\": \"pending_review\", \"currency\": \"EGP\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1127.08, \"updated_at\": \"2026-02-17 13:38:34\", \"absent_days\": 2, \"employee_id\": \"e-005\", \"basic_salary\": 1000, \"gross_salary\": 1300, \"late_minutes\": 90, \"payroll_date\": \"2026-02-12\", \"working_days\": 28, \"bonuses_amount\": 0, \"late_deduction\": 6.25, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-515D2\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 172.92, \"absence_deduction\": 66.67, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 100, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '{\"id\": \"2b20e5a9-94b2-4a72-adff-a1609888d31c\", \"year\": 2026, \"month\": 2, \"notes\": \"خصم 2 يوم غياب. \", \"status\": \"approved\", \"currency\": \"EGP\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1127.08, \"updated_at\": \"2026-02-17 13:38:39\", \"absent_days\": 2, \"employee_id\": \"e-005\", \"basic_salary\": 1000, \"gross_salary\": 1300, \"late_minutes\": 90, \"payroll_date\": \"2026-02-12\", \"working_days\": 28, \"bonuses_amount\": 0, \"late_deduction\": 6.25, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-515D2\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 172.92, \"absence_deduction\": 66.67, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 100, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 11:38:39'),
('5365d869-367f-4807-b37a-ec52a6199494', NULL, 'update', 'payroll', '23bb450e-49d3-489a-b3fb-2009328919c1', '{\"id\": \"23bb450e-49d3-489a-b3fb-2009328919c1\", \"year\": 2026, \"month\": 2, \"notes\": \"\", \"status\": \"draft\", \"currency\": \"SAR\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1197, \"updated_at\": \"2026-02-12 03:40:46\", \"absent_days\": 0, \"employee_id\": \"e-007\", \"basic_salary\": 1000, \"gross_salary\": 1297, \"late_minutes\": 0, \"payroll_date\": \"2026-02-12\", \"working_days\": 30, \"bonuses_amount\": 0, \"late_deduction\": 0, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-44015\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 100, \"absence_deduction\": 0, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 97, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '{\"id\": \"23bb450e-49d3-489a-b3fb-2009328919c1\", \"year\": 2026, \"month\": 2, \"notes\": \"\", \"status\": \"pending_review\", \"currency\": \"SAR\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1197, \"updated_at\": \"2026-02-17 14:21:33\", \"absent_days\": 0, \"employee_id\": \"e-007\", \"basic_salary\": 1000, \"gross_salary\": 1297, \"late_minutes\": 0, \"payroll_date\": \"2026-02-12\", \"working_days\": 30, \"bonuses_amount\": 0, \"late_deduction\": 0, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-44015\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 100, \"absence_deduction\": 0, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 97, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:21:33'),
('5c19e57a-6579-4d5c-a032-7b16907b1c1d', NULL, 'update', 'payroll', '23bb450e-49d3-489a-b3fb-2009328919c1', '{\"id\": \"23bb450e-49d3-489a-b3fb-2009328919c1\", \"year\": 2026, \"month\": 2, \"notes\": \"\", \"status\": \"pending_review\", \"currency\": \"SAR\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1197, \"updated_at\": \"2026-02-17 14:21:33\", \"absent_days\": 0, \"employee_id\": \"e-007\", \"basic_salary\": 1000, \"gross_salary\": 1297, \"late_minutes\": 0, \"payroll_date\": \"2026-02-12\", \"working_days\": 30, \"bonuses_amount\": 0, \"late_deduction\": 0, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-44015\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 100, \"absence_deduction\": 0, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 97, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '{\"id\": \"23bb450e-49d3-489a-b3fb-2009328919c1\", \"year\": 2026, \"month\": 2, \"notes\": \"\", \"status\": \"approved\", \"currency\": \"SAR\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1197, \"updated_at\": \"2026-02-17 14:21:39\", \"absent_days\": 0, \"employee_id\": \"e-007\", \"basic_salary\": 1000, \"gross_salary\": 1297, \"late_minutes\": 0, \"payroll_date\": \"2026-02-12\", \"working_days\": 30, \"bonuses_amount\": 0, \"late_deduction\": 0, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-44015\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 100, \"absence_deduction\": 0, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 97, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:21:39'),
('5d8c3ab7-f315-45c0-94dd-4b860aec3fdc', NULL, 'create', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', NULL, '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"مكتمل\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:09:44\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"status\": \"pending\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"status\": \"pending\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"status\": \"pending\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 0, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير المباشر (أمانى رسلان)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:09:44'),
('650a2d16-75de-405e-b644-7ed4c3fc36f3', NULL, 'create', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 23:18:28'),
('6852cbe0-c050-493f-817c-513e3ecefa42', NULL, 'update', 'attendance', '1b9ca1c3-b187-44ec-b25c-b40d7f2b7025', '{\"id\": \"1b9ca1c3-b187-44ec-b25c-b40d7f2b7025\", \"date\": \"2026-02-17\", \"notes\": null, \"source\": \"mobile_app\", \"status\": \"present\", \"is_late\": 1, \"created_at\": \"2026-02-17 14:30:32\", \"updated_at\": \"2026-02-17 14:30:32\", \"employee_id\": \"e-001\", \"late_minutes\": 210, \"check_in_time\": \"12:30:32\", \"working_hours\": 0, \"check_out_time\": null, \"overtime_hours\": 0, \"check_in_location\": {\"latitude\": 30.0434, \"longitude\": 31.2352}, \"check_out_location\": null}', '{\"id\": \"1b9ca1c3-b187-44ec-b25c-b40d7f2b7025\", \"date\": \"2026-02-17\", \"notes\": null, \"source\": \"mobile_app\", \"status\": \"present\", \"is_late\": 1, \"created_at\": \"2026-02-17 14:30:32\", \"updated_at\": \"2026-02-17 14:30:35\", \"employee_id\": \"e-001\", \"late_minutes\": 210, \"check_in_time\": \"12:30:32\", \"working_hours\": 0, \"check_out_time\": \"12:30:35\", \"overtime_hours\": 0, \"check_in_location\": {\"latitude\": 30.0434, \"longitude\": 31.2352}, \"check_out_location\": {\"latitude\": 30.0434, \"longitude\": 31.2352}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:30:35'),
('694f9740-5a26-4bb8-b454-34085ea2c80f', NULL, 'delete', 'employees', '16fbc2cc-8376-4f4b-92c7-fd3244092dc6', '{\"id\": \"16fbc2cc-8376-4f4b-92c7-fd3244092dc6\", \"iban\": null, \"email\": \"test22@test22.com\", \"phone\": \"434343434343\", \"gender\": \"male\", \"status\": \"active\", \"position\": \"أخصائي رواتب\", \"bank_name\": null, \"documents\": [], \"full_name\": \"test22@test22.net\", \"hire_date\": \"2026-02-05\", \"id_number\": null, \"birth_date\": null, \"created_at\": \"2026-02-12 22:35:31\", \"department\": \"الدعم اللوجستي\", \"updated_at\": \"2026-02-13 00:49:06\", \"nationality\": null, \"bank_account\": null, \"department_id\": \"d630c421-c5b2-4d07-8975-4e2b2fa6e08c\", \"position_name\": \"أخصائي رواتب\", \"profile_image\": null, \"department_name\": \"الدعم اللوجستي\", \"employee_number\": \"EMP-0003\", \"work_location_id\": \"loc-remote\", \"work_location_name\": \"عن بعد\"}', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-12 22:49:12'),
('71d5a6a1-9847-4ad5-aae3-b9ac512e6059', NULL, 'update', 'payroll', '2b20e5a9-94b2-4a72-adff-a1609888d31c', '{\"id\": \"2b20e5a9-94b2-4a72-adff-a1609888d31c\", \"year\": 2026, \"month\": 2, \"notes\": \"خصم 2 يوم غياب. \", \"status\": \"approved\", \"currency\": \"EGP\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1127.08, \"updated_at\": \"2026-02-17 13:38:39\", \"absent_days\": 2, \"employee_id\": \"e-005\", \"basic_salary\": 1000, \"gross_salary\": 1300, \"late_minutes\": 90, \"payroll_date\": \"2026-02-12\", \"working_days\": 28, \"bonuses_amount\": 0, \"late_deduction\": 6.25, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-515D2\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 172.92, \"absence_deduction\": 66.67, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 100, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '{\"id\": \"2b20e5a9-94b2-4a72-adff-a1609888d31c\", \"year\": 2026, \"month\": 2, \"notes\": \"خصم 2 يوم غياب. \", \"status\": \"paid\", \"currency\": \"EGP\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1127.08, \"updated_at\": \"2026-02-17 13:38:50\", \"absent_days\": 2, \"employee_id\": \"e-005\", \"basic_salary\": 1000, \"gross_salary\": 1300, \"late_minutes\": 90, \"payroll_date\": \"2026-02-12\", \"working_days\": 28, \"bonuses_amount\": 0, \"late_deduction\": 6.25, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-515D2\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 172.92, \"absence_deduction\": 66.67, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 100, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 11:38:50'),
('71f4ab6e-e874-4c53-99de-29b9b2f086a8', NULL, 'create', 'employee_trainings', '083f031c-cf65-4215-ab90-6917fc831875', NULL, '{\"id\": \"083f031c-cf65-4215-ab90-6917fc831875\", \"notes\": null, \"score\": null, \"status\": \"جاري\", \"end_date\": \"2026-02-12\", \"created_at\": \"2026-02-13 01:20:33\", \"start_date\": \"2026-02-12\", \"updated_at\": \"2026-02-13 01:20:33\", \"employee_id\": \"e-005\", \"training_id\": \"518cc135-e17c-478f-a677-8a88e1b08b74\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"gm\", \"status\": \"pending\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"status\": \"pending\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 0, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-12 23:20:33'),
('ac1f96c8-0ed1-4e47-a415-de7f572ffbcf', NULL, 'approve', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:10:14\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": \"[{\\\"level\\\": \\\"direct_manager\\\", \\\"notes\\\": \\\"\\\", \\\"status\\\": \\\"approved\\\", \\\"actor_id\\\": \\\"u-admin-01\\\", \\\"actor_name\\\": \\\"مدير النظام-كل الصلاحيات\\\", \\\"level_name\\\": \\\"المدير المباشر\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"decision_date\\\": \\\"2026-02-17T12:10:14+00:00\\\", \\\"role_required\\\": \\\"Direct Manager\\\"}, {\\\"level\\\": \\\"gm\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"المدير العام\\\", \\\"approver_id\\\": \\\"e-002\\\", \\\"approver_name\\\": \\\"محمود الصالح\\\", \\\"role_required\\\": \\\"General Manager\\\"}, {\\\"level\\\": \\\"hr\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"مدير الموارد البشرية\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"role_required\\\": \\\"HR Manager\\\"}, {\\\"level\\\": \\\"finance\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"مدير الحسابات\\\", \\\"approver_id\\\": \\\"e-006\\\", \\\"approver_name\\\": \\\"محمود مراد\\\", \\\"role_required\\\": \\\"Finance Manager\\\"}]\", \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 1, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"idx\": 2, \"desc\": \"جارى الاعتماد من: مدير الموارد البشرية (أمانى رسلان)\", \"notes\": \"\", \"status\": \"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:10:30'),
('b6b91826-fab3-4422-86e4-5499de59ed28', NULL, 'update', 'employees', '829561a6-4a7e-4ec9-a1c5-0e1cae9cc707', '{\"id\": \"829561a6-4a7e-4ec9-a1c5-0e1cae9cc707\", \"iban\": null, \"email\": \"tttttt@tttttt.com\", \"phone\": 34343434, \"gender\": \"male\", \"status\": \"active\", \"position\": \"مدير قسم\", \"bank_name\": null, \"documents\": [], \"full_name\": \"فففففففف\", \"hire_date\": null, \"id_number\": null, \"birth_date\": \"2026-02-13\", \"created_at\": \"2026-02-13 01:18:28\", \"department\": \"تقنية المعلومات\", \"updated_at\": \"2026-02-13 01:18:28\", \"nationality\": \"فلسطيني\", \"bank_account\": null, \"department_id\": \"d-it\", \"position_name\": \"مدير قسم\", \"profile_image\": null, \"department_name\": \"تقنية المعلومات\", \"employee_number\": \"EMP-0003\", \"work_location_id\": \"loc-main\", \"work_location_name\": \"المقر الرئيسي - القاهرة\"}', '{\"id\": \"829561a6-4a7e-4ec9-a1c5-0e1cae9cc707\", \"iban\": null, \"email\": \"tttttt@tttttt.com\", \"phone\": 34343434, \"gender\": \"male\", \"status\": \"active\", \"position\": \"مدير قسم\", \"bank_name\": null, \"documents\": [], \"full_name\": \"على على على على على\", \"hire_date\": null, \"id_number\": null, \"birth_date\": \"2026-02-13\", \"created_at\": \"2026-02-13 01:18:28\", \"department\": \"تقنية المعلومات\", \"updated_at\": \"2026-02-13 01:18:43\", \"nationality\": \"فلسطيني\", \"bank_account\": null, \"department_id\": \"d-it\", \"position_name\": \"مدير قسم\", \"profile_image\": null, \"department_name\": \"تقنية المعلومات\", \"employee_number\": \"EMP-0003\", \"work_location_id\": \"loc-main\", \"work_location_name\": \"المقر الرئيسي - القاهرة\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-12 23:18:43'),
('bd067d5d-cda5-4151-8151-3c79a6243494', NULL, 'update', 'employees', '16fbc2cc-8376-4f4b-92c7-fd3244092dc6', '{\"id\": \"16fbc2cc-8376-4f4b-92c7-fd3244092dc6\", \"iban\": null, \"email\": \"test22@test22.com\", \"phone\": \"434343434343\", \"gender\": \"male\", \"status\": \"active\", \"position\": \"أخصائي رواتب\", \"bank_name\": null, \"documents\": [], \"full_name\": \"test22@test22.com\", \"hire_date\": \"2026-02-05\", \"id_number\": null, \"birth_date\": null, \"created_at\": \"2026-02-12 22:35:31\", \"department\": \"الدعم اللوجستي\", \"updated_at\": \"2026-02-12 22:35:31\", \"nationality\": null, \"bank_account\": null, \"department_id\": \"d630c421-c5b2-4d07-8975-4e2b2fa6e08c\", \"position_name\": \"أخصائي رواتب\", \"profile_image\": null, \"department_name\": \"الدعم اللوجستي\", \"employee_number\": \"EMP-0003\", \"work_location_id\": \"loc-remote\", \"work_location_name\": \"عن بعد\"}', '{\"id\": \"16fbc2cc-8376-4f4b-92c7-fd3244092dc6\", \"iban\": null, \"email\": \"test22@test22.com\", \"phone\": \"434343434343\", \"gender\": \"male\", \"status\": \"active\", \"position\": \"أخصائي رواتب\", \"bank_name\": null, \"documents\": [], \"full_name\": \"test22@test22.net\", \"hire_date\": \"2026-02-05\", \"id_number\": null, \"birth_date\": null, \"created_at\": \"2026-02-12 22:35:31\", \"department\": \"الدعم اللوجستي\", \"updated_at\": \"2026-02-13 00:49:06\", \"nationality\": null, \"bank_account\": null, \"department_id\": \"d630c421-c5b2-4d07-8975-4e2b2fa6e08c\", \"position_name\": \"أخصائي رواتب\", \"profile_image\": null, \"department_name\": \"الدعم اللوجستي\", \"employee_number\": \"EMP-0003\", \"work_location_id\": \"loc-remote\", \"work_location_name\": \"عن بعد\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-12 22:49:06'),
('c40be1b9-f4f5-4e9a-8970-453cd36b302a', NULL, 'delete', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 23:18:54'),
('d3199db9-ee98-4a45-b0b4-a57d0ffb5a4c', NULL, 'update', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"rejected\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:17:48\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-17T12:10:30+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:11:27+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"rejected\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-17T12:17:48+00:00\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 3, \"registration_date\": null, \"current_status_desc\": \"تم الرفض بواسطة: مدير النظام-كل الصلاحيات\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"rejected\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:17:48\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": [{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-17T12:10:30+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:11:27+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"rejected\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-17T12:17:48+00:00\", \"role_required\": \"Finance Manager\"}], \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"rejected\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 3, \"registration_date\": null, \"current_status_desc\": \"تم الرفض بواسطة: مدير النظام-كل الصلاحيات\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:17:48'),
('d5441350-08a4-4f40-aee2-2fcd64592897', NULL, 'approve', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"مكتمل\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:09:44\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": \"[{\\\"level\\\": \\\"direct_manager\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"المدير المباشر\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"role_required\\\": \\\"Direct Manager\\\"}, {\\\"level\\\": \\\"gm\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"المدير العام\\\", \\\"approver_id\\\": \\\"e-002\\\", \\\"approver_name\\\": \\\"محمود الصالح\\\", \\\"role_required\\\": \\\"General Manager\\\"}, {\\\"level\\\": \\\"hr\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"مدير الموارد البشرية\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"role_required\\\": \\\"HR Manager\\\"}, {\\\"level\\\": \\\"finance\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"مدير الحسابات\\\", \\\"approver_id\\\": \\\"e-006\\\", \\\"approver_name\\\": \\\"محمود مراد\\\", \\\"role_required\\\": \\\"Finance Manager\\\"}]\", \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 0, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: المدير المباشر (أمانى رسلان)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"idx\": 1, \"desc\": \"جارى الاعتماد من: المدير العام (محمود الصالح)\", \"notes\": \"\", \"status\": \"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:10:14'),
('dea495ea-fd53-4c1d-af6f-59f0854dfe52', NULL, 'delete', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 22:49:12');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
('f5bb9a95-2b77-443b-b82d-c2c3e3d81b2a', NULL, 'reject', 'employee_trainings', '3768bfa5-7766-4415-862e-1be5cd8aed3a', '{\"id\": \"3768bfa5-7766-4415-862e-1be5cd8aed3a\", \"notes\": null, \"score\": null, \"status\": \"pending\", \"end_date\": \"2026-02-04\", \"created_at\": \"2026-02-17 14:09:44\", \"start_date\": \"2026-02-01\", \"updated_at\": \"2026-02-17 14:11:27\", \"employee_id\": \"1bc8bb7c-ef2c-48ba-84bf-646e1de9f866\", \"training_id\": \"0eefe2dc-f28e-49f6-b00e-8684b668c1bb\", \"approval_log\": null, \"current_stage\": \"direct_manager\", \"approval_chain\": \"[{\\\"level\\\": \\\"direct_manager\\\", \\\"notes\\\": \\\"\\\", \\\"status\\\": \\\"approved\\\", \\\"actor_id\\\": \\\"u-admin-01\\\", \\\"actor_name\\\": \\\"مدير النظام-كل الصلاحيات\\\", \\\"level_name\\\": \\\"المدير المباشر\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"decision_date\\\": \\\"2026-02-17T12:10:14+00:00\\\", \\\"role_required\\\": \\\"Direct Manager\\\"}, {\\\"level\\\": \\\"gm\\\", \\\"notes\\\": \\\"\\\", \\\"status\\\": \\\"approved\\\", \\\"actor_id\\\": \\\"u-admin-01\\\", \\\"actor_name\\\": \\\"مدير النظام-كل الصلاحيات\\\", \\\"level_name\\\": \\\"المدير العام\\\", \\\"approver_id\\\": \\\"e-002\\\", \\\"approver_name\\\": \\\"محمود الصالح\\\", \\\"decision_date\\\": \\\"2026-02-17T12:10:30+00:00\\\", \\\"role_required\\\": \\\"General Manager\\\"}, {\\\"level\\\": \\\"hr\\\", \\\"notes\\\": \\\"\\\", \\\"status\\\": \\\"approved\\\", \\\"actor_id\\\": \\\"u-admin-01\\\", \\\"actor_name\\\": \\\"مدير النظام-كل الصلاحيات\\\", \\\"level_name\\\": \\\"مدير الموارد البشرية\\\", \\\"approver_id\\\": \\\"e-005\\\", \\\"approver_name\\\": \\\"أمانى رسلان\\\", \\\"decision_date\\\": \\\"2026-02-17T12:11:27+00:00\\\", \\\"role_required\\\": \\\"HR Manager\\\"}, {\\\"level\\\": \\\"finance\\\", \\\"status\\\": \\\"pending\\\", \\\"level_name\\\": \\\"مدير الحسابات\\\", \\\"approver_id\\\": \\\"e-006\\\", \\\"approver_name\\\": \\\"محمود مراد\\\", \\\"role_required\\\": \\\"Finance Manager\\\"}]\", \"request_number\": \"TRN-2026-00001\", \"approval_status\": \"pending\", \"certificate_url\": null, \"completion_date\": null, \"approval_history\": null, \"rejection_reason\": null, \"current_level_idx\": 3, \"registration_date\": null, \"current_status_desc\": \"جارى الاعتماد من: مدير الحسابات (محمود مراد)\", \"current_approval_level\": null, \"requires_finance_approval\": 0}', '{\"idx\": 3, \"desc\": \"تم الرفض بواسطة: مدير النظام-كل الصلاحيات\", \"notes\": \"\", \"status\": \"rejected\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 12:17:48'),
('f5fb83b0-a348-48c8-a48e-ce5a7b88e234', NULL, 'update', 'payroll', '2b20e5a9-94b2-4a72-adff-a1609888d31c', '{\"id\": \"2b20e5a9-94b2-4a72-adff-a1609888d31c\", \"year\": 2026, \"month\": 2, \"notes\": \"خصم 2 يوم غياب. \", \"status\": \"draft\", \"currency\": \"EGP\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1127.08, \"updated_at\": \"2026-02-12 03:40:46\", \"absent_days\": 2, \"employee_id\": \"e-005\", \"basic_salary\": 1000, \"gross_salary\": 1300, \"late_minutes\": 90, \"payroll_date\": \"2026-02-12\", \"working_days\": 28, \"bonuses_amount\": 0, \"late_deduction\": 6.25, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-515D2\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 172.92, \"absence_deduction\": 66.67, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 100, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '{\"id\": \"2b20e5a9-94b2-4a72-adff-a1609888d31c\", \"year\": 2026, \"month\": 2, \"notes\": \"خصم 2 يوم غياب. \", \"status\": \"pending_review\", \"currency\": \"EGP\", \"created_at\": \"2026-02-12 03:40:46\", \"issue_date\": null, \"net_salary\": 1127.08, \"updated_at\": \"2026-02-17 13:38:34\", \"absent_days\": 2, \"employee_id\": \"e-005\", \"basic_salary\": 1000, \"gross_salary\": 1300, \"late_minutes\": 90, \"payroll_date\": \"2026-02-12\", \"working_days\": 28, \"bonuses_amount\": 0, \"late_deduction\": 6.25, \"overtime_hours\": 0, \"payroll_number\": \"PAY-2026-2-515D2\", \"overtime_amount\": 0, \"other_allowances\": 100, \"other_deductions\": 0, \"total_deductions\": 172.92, \"absence_deduction\": 66.67, \"bonuses_breakdown\": null, \"housing_allowance\": 100, \"insurance_deduction\": 100, \"transport_allowance\": 100, \"allowances_breakdown\": null, \"deductions_breakdown\": null, \"additional_allowances\": 0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-17 11:38:34'),
('f890043b-e648-4cf0-a5d2-118d6d00f469', NULL, 'create', 'employees', '829561a6-4a7e-4ec9-a1c5-0e1cae9cc707', NULL, '{\"id\": \"829561a6-4a7e-4ec9-a1c5-0e1cae9cc707\", \"iban\": null, \"email\": \"tttttt@tttttt.com\", \"phone\": 34343434, \"gender\": \"male\", \"status\": \"active\", \"position\": \"مدير قسم\", \"bank_name\": null, \"documents\": [], \"full_name\": \"فففففففف\", \"hire_date\": null, \"id_number\": null, \"birth_date\": \"2026-02-13\", \"created_at\": \"2026-02-13 01:18:28\", \"department\": \"تقنية المعلومات\", \"updated_at\": \"2026-02-13 01:18:28\", \"nationality\": \"فلسطيني\", \"bank_account\": null, \"department_id\": \"d-it\", \"position_name\": \"مدير قسم\", \"profile_image\": null, \"department_name\": \"تقنية المعلومات\", \"employee_number\": \"EMP-0003\", \"work_location_id\": \"loc-main\", \"work_location_name\": \"المقر الرئيسي - القاهرة\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-12 23:18:28');

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
('272299ac-a07d-4147-a790-0c6da601e432', 'BON-2026-00001', 'e-008', 'تميز', '100.00', 'SAR', '2026-02-12', 2, 2026, 'تست', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-11 23:15:09', '2026-02-11 23:32:20', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-11T23:15:18+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-11T23:15:23+00:00\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-11T23:32:08+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-11T23:32:14+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-11T23:32:20+00:00\", \"role_required\": \"Finance Manager\"}]', 5, 'تم الاعتماد النهائي'),
('96940e3e-4be4-4145-b11a-614a6084963f', 'BON-2026-00002', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'test', '100.00', 'SAR', '2026-02-12', 2, 2026, '', 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-12 01:26:05', '2026-02-12 01:26:21', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:26:10+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-12T01:26:14+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:26:17+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-12T01:26:21+00:00\", \"role_required\": \"Finance Manager\"}]', 4, 'تم الاعتماد النهائي');

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
('184d515a-55eb-4b3a-9171-ac1cc31ff8d9', 'adf1622e-d6cc-4580-9aee-9bd7e96756ab', 'e-008', '35e0826d-5afc-438e-b956-f9bb0a316412', 4, 'u-admin-01', '2026-02-12', NULL, '2026-02-10 22:16:03'),
('4d49b6d3-229a-48cc-b702-91ec2557da21', 'b32278ee-4d40-4dd4-bbd2-71d54ac086ba', 'e-008', '14254677-7528-4474-9073-ab0525ac967a', 1, 'u-admin-01', '2026-02-09', NULL, '2026-02-09 22:30:45'),
('b13d778f-6390-4efc-bb3e-3ea58585d7e8', 'b32278ee-4d40-4dd4-bbd2-71d54ac086ba', 'e-008', '35e0826d-5afc-438e-b956-f9bb0a316412', 2, 'u-admin-01', '2026-02-09', NULL, '2026-02-09 22:30:45'),
('cf6a2393-c12c-49d2-b7c3-bfd429e1c399', 'adf1622e-d6cc-4580-9aee-9bd7e96756ab', 'e-008', '14254677-7528-4474-9073-ab0525ac967a', 5, 'u-admin-01', '2026-02-12', NULL, '2026-02-10 22:16:03');

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
  `current_status_desc` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contracts`
--

INSERT INTO `contracts` (`id`, `request_number`, `employee_id`, `contract_number`, `contract_type`, `start_date`, `end_date`, `gross_salary`, `currency`, `basic_salary`, `housing_allowance`, `transport_allowance`, `other_allowances`, `status`, `current_approval_level`, `approval_history`, `requires_finance_approval`, `document_url`, `notes`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`) VALUES
('077fcc17-fe8e-4c18-b676-bc89dc1b8c5a', 'CON-2026-00006', 'e-006', 'CON-2026', 'عقد دائم', '2026-02-06', '2030-02-06', '1295.00', 'SAR', '1000.00', '100.00', '95.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:05:35', '2026-02-05 23:05:35', NULL, 0, NULL),
('23fe8780-c4b5-4916-b70a-bafa7e32e8d1', 'CON-2026-00008', 'e-004', 'CON-2028', 'عقد مؤقت', '2026-02-06', '2030-02-06', '2599.00', 'SAR', '2000.00', '200.00', '199.00', '200.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:06:43', '2026-02-05 23:06:43', NULL, 0, NULL),
('63d9711d-7037-4364-ad21-7558a4b4e931', 'CON-2026-00005', 'e-007', 'CON-2025', 'عقد دائم', '2026-02-06', '2030-02-06', '1297.00', 'SAR', '1000.00', '100.00', '97.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:05:04', '2026-02-05 23:05:04', NULL, 0, NULL),
('a6d45e7f-8cc3-4dcb-a0bf-bfb4b1551292', 'CON-2026-00004', 'e-008', 'CON-2024', 'عقد دائم', '2026-02-06', '2030-02-06', '800.00', 'USD', '500.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:04:31', '2026-02-05 23:04:31', NULL, 0, NULL),
('bc9fbc11-c25f-4663-bc69-58b2edcf5868', 'CON-2026-00007', 'e-005', 'CON-2027', 'عقد دائم', '2026-02-06', '2030-02-06', '1300.00', 'EGP', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 23:06:07', '2026-02-05 23:06:07', NULL, 0, NULL),
('bf1a371e-1ca1-4ad9-ba8f-5677e52d7d43', NULL, '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'CON-2029', 'عقد دائم', '2025-02-01', '2027-02-10', '1300.00', 'EGP', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, NULL, '2026-02-10 22:28:04', '2026-02-12 01:24:49', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-10T22:28:31.512Z\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-10T22:28:39.801Z\", \"role_required\": \"General Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-10T22:28:46.166Z\", \"role_required\": \"Finance Manager\"}]', 2, 'تم الاعتماد النهائي'),
('c-001', NULL, 'e-001', 'CON-2020-001', 'عقد دائم', '2020-01-01', '2030-02-06', '1300.00', 'USD', '1000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 14:57:42', '2026-02-05 23:03:38', NULL, 0, NULL),
('c-002', NULL, 'e-002', 'CON-2022-001', 'عقد دائم', '2022-03-15', '2030-02-06', '6300.00', 'SAR', '6000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 14:57:42', '2026-02-05 23:03:54', NULL, 0, NULL),
('c-003', NULL, 'e-003', 'CON-2023-001', 'عقد دائم', '2023-06-01', '2027-02-28', '5300.00', 'EGP', '5000.00', '100.00', '100.00', '100.00', 'active', NULL, NULL, 1, NULL, '-', '2026-02-05 14:57:42', '2026-02-05 23:02:59', NULL, 0, NULL);

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
  `hire_date` date DEFAULT NULL,
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

INSERT INTO `employees` (`id`, `employee_number`, `full_name`, `id_number`, `phone`, `email`, `position`, `department`, `work_location_id`, `hire_date`, `status`, `profile_image`, `documents`, `nationality`, `gender`, `birth_date`, `bank_name`, `bank_account`, `iban`, `created_at`, `updated_at`) VALUES
('1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 'EMP-0002', 'نعمة عوض', '2255889966', '0115242552', 'nema@ivory.com', 'أخصائي رواتب', 'الموارد البشرية', 'loc-main', '2025-02-10', 'active', NULL, '[]', 'مصري', 'female', '1993-02-10', 'بنك مصر', '3218520', 'iban3218520', '2026-02-10 21:47:11', '2026-02-10 21:47:11'),
('a6291c93-b20c-4fc5-afc8-7422394e4f9e', 'EMP-0001', 'موظف التجارب', '11111111', '0123654', 'test@test.com', 'مطور برمجيات', 'تقنية المعلومات', 'loc-remote', '2026-02-01', 'active', NULL, '[]', 'أردني', 'male', '2026-02-01', 'بنك مصر', '11111111111', 'iban11111111111', '2026-02-05 23:31:39', '2026-02-05 23:31:39'),
('e-001', 'EMP001', 'مدير النظام-كل الصلاحيات', '2245185950', '01150240451', 'admin@ivory.com', 'أدمن النظام', 'تقنية المعلومات', 'loc-remote', '2020-01-01', 'active', NULL, '[]', 'مصري', 'male', '2000-02-05', 'بنك مصر', '2335', 'iban2335', '2026-02-05 14:57:42', '2026-02-08 18:20:46'),
('e-002', 'EMP002', 'محمود الصالح', '1010101010', NULL, 'mahmoudalsaleh@ivory.com', 'مدير قسم', 'IvoryTraining', 'loc-main', '2022-03-15', 'active', NULL, '[]', 'سوري', NULL, '1978-10-01', 'بنك الرياض', '2336', 'iban2336', '2026-02-05 14:57:42', '2026-02-05 21:37:46'),
('e-003', 'EMP003', 'هاني متولي', '10102020', '01150241523', 'hany@ivory.com', 'مستشار التقنية', 'الدعم اللوجستي', 'loc-remote', '2023-06-01', 'active', NULL, '[]', 'مصري', NULL, '1977-02-06', 'بنك مصر', '23371', 'iban23371', '2026-02-05 14:57:42', '2026-02-08 18:22:41'),
('e-004', 'EMP004', 'عبدالمؤمن ايمن', '101030245', '0115024325', 'abdalmumn@ivory.com', 'مدير الدعم اللوجستي', 'الدعم اللوجستي', 'loc-main', '2023-06-01', 'active', NULL, '[]', 'سوري', NULL, '1994-02-06', 'بنك الرياض', '78654', 'iban78654', '2026-02-05 14:57:42', '2026-02-05 22:09:39'),
('e-005', 'EMP005', 'أمانى رسلان', '10104040452', '0115236352', 'amany@ivory.com', 'مدير قسم الموارد البشرية', 'الموارد البشرية', 'loc-main', '2023-06-01', 'active', NULL, '[]', 'مصري', NULL, '1999-02-01', 'بنك مصر', '987456', 'iban987456', '2026-02-05 14:57:42', '2026-02-05 22:10:37'),
('e-006', 'EMP006', 'محمود مراد', '10908071', '0524252525', 'murad@ivory.com', 'مدير الحسابات', 'المالية', 'loc-main', '2023-06-01', 'active', NULL, '[]', 'فلسطيني', NULL, '2026-02-01', 'بنك مصر', '88772211', 'iban88772211', '2026-02-05 14:57:42', '2026-02-05 22:13:01'),
('e-007', 'EMP007', 'ابراهيم عبدالوهاب', '10002003', '1010202020', 'ibrahim@ivory.com', 'مدير التقنية', 'تقنية المعلومات', 'loc-main', '2023-06-01', 'active', NULL, '[]', 'مصري', NULL, '2004-02-01', 'بنك الرياض', '909080', 'iban909080', '2026-02-05 14:57:42', '2026-02-05 22:14:04'),
('e-008', 'EMP008', 'ابراهيم لبدع', '224535255', '10205497', 'ibrahimlebdaa@ivory.com', 'مطور برمجيات', 'تقنية المعلومات', 'loc-main', '2023-06-01', 'active', NULL, '[]', 'مغربي', NULL, '2004-02-02', 'بنك المغرب', '7777778', 'iban7777778', '2026-02-05 14:57:42', '2026-02-05 22:17:11');

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
('7066b7a7-af35-4e26-8973-28159058e43e', 'e-005', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('7b8f8538-c13b-448a-9cf0-bcbe400d9dc1', 'e-006', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('7b92c4db-2e02-42ac-844c-1be6677880f1', 'a6291c93-b20c-4fc5-afc8-7422394e4f9e', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('8650eedd-d849-42cd-a936-ee80bb30b291', 'e-001', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('88803bc1-9a4f-46d8-a555-8788cb15e4e3', 'e-008', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('b623cce9-b3ab-43ba-8614-a4164dafcdd1', 'e-002', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('c91ff56b-a47e-46e8-8fa6-ab0e3a1bb427', 'e-004', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14'),
('f9e7f173-e3d7-427c-957f-7ec462ec8506', 'e-003', '6c168039-02a0-11f1-a178-d481d76a1bbe', 2026, 21, 0, 21, '2026-02-08 22:41:14', '2026-02-08 22:41:14');

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
('3768bfa5-7766-4415-862e-1be5cd8aed3a', 'TRN-2026-00001', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', '0eefe2dc-f28e-49f6-b00e-8684b668c1bb', 'rejected', 'direct_manager', NULL, NULL, 'rejected', NULL, NULL, 0, NULL, '2026-02-01', '2026-02-04', NULL, NULL, NULL, NULL, '2026-02-17 12:09:44', '2026-02-17 12:17:48', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:10:14+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-17T12:10:30+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-17T12:11:27+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"rejected\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-17T12:17:48+00:00\", \"role_required\": \"Finance Manager\"}]', 3, 'تم الرفض بواسطة: مدير النظام-كل الصلاحيات'),
('7bdf5037-e9f0-444c-9bdb-48f4409db4dc', 'TRN-2026-00001', 'e-008', '0eefe2dc-f28e-49f6-b00e-8684b668c1bb', 'approved', 'direct_manager', NULL, NULL, 'approved', NULL, NULL, 0, NULL, '2026-02-01', '2026-02-03', NULL, NULL, NULL, NULL, '2026-02-11 00:27:55', '2026-02-11 00:28:27', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-11T00:28:03+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-11T00:28:10+00:00\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-11T00:28:16+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-11T00:28:21+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-11T00:28:27+00:00\", \"role_required\": \"Finance Manager\"}]', 5, 'تم الاعتماد النهائي');

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
('d8884920-da39-48f2-af57-641b019b4b47', 'adf1622e-d6cc-4580-9aee-9bd7e96756ab', 'da531933-cc02-421d-b175-377f74f73701', 'مؤشر1', 'نسبة في المائة من (100%)', '3', '7', '3.00', 30, '0.90', NULL, '2026-02-10 22:16:03');

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
('6c1683dd-02a0-11f1-a178-d481d76a1bbe', 'إجازة أبوة', 'PATERNITY', 3, 1, 1, 0, NULL, 'active', '2026-02-05 14:39:05', '2026-02-05 14:39:05');

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
('6f7c09f9-07c7-433e-a56c-c107a884ef57', 'OT-2026-00001', 'e-008', '2026-02-12', '10.00', '2.08', '3.13', '31.25', NULL, 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-12 01:05:00', '2026-02-12 01:05:24', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-12T01:05:05+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-12T01:05:11+00:00\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-12T01:05:16+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:05:20+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-12T01:05:24+00:00\", \"role_required\": \"Finance Manager\"}]', 5, 'تم الاعتماد النهائي'),
('73b00d28-ad6c-4cac-8b74-74e4c832f721', 'OT-2026-00002', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', '2026-02-12', '7.50', '4.17', '6.25', '46.88', NULL, 'approved', 'direct_manager', NULL, NULL, NULL, NULL, 1, '2026-02-12 01:26:58', '2026-02-12 01:27:12', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:27:01+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-12T01:27:05+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:27:08+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-12T01:27:12+00:00\", \"role_required\": \"Finance Manager\"}]', 4, 'تم الاعتماد النهائي');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
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

INSERT INTO `payroll` (`id`, `payroll_number`, `employee_id`, `month`, `year`, `payroll_date`, `basic_salary`, `housing_allowance`, `transport_allowance`, `other_allowances`, `additional_allowances`, `bonuses_amount`, `overtime_amount`, `gross_salary`, `insurance_deduction`, `late_deduction`, `absence_deduction`, `other_deductions`, `total_deductions`, `net_salary`, `currency`, `status`, `issue_date`, `working_days`, `absent_days`, `late_minutes`, `overtime_hours`, `allowances_breakdown`, `deductions_breakdown`, `bonuses_breakdown`, `notes`, `created_at`, `updated_at`) VALUES
('00339671-9ebe-4a24-a622-448e4392feda', 'PAY-2026-2-5949B', 'e-004', 2, 2026, '2026-02-12', '2000.00', '200.00', '199.00', '200.00', '0.00', '0.00', '0.00', '2599.00', '200.00', '0.00', '133.33', '0.00', '333.33', '2265.67', 'SAR', 'draft', NULL, 28, 2, 0, '0.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-12 01:40:46', '2026-02-12 01:40:46'),
('23bb450e-49d3-489a-b3fb-2009328919c1', 'PAY-2026-2-44015', 'e-007', 2, 2026, '2026-02-12', '1000.00', '100.00', '97.00', '100.00', '0.00', '0.00', '0.00', '1297.00', '100.00', '0.00', '0.00', '0.00', '100.00', '1197.00', 'SAR', 'paid', NULL, 30, 0, 0, '0.00', NULL, NULL, NULL, '', '2026-02-12 01:40:46', '2026-02-17 12:21:45'),
('2b20e5a9-94b2-4a72-adff-a1609888d31c', 'PAY-2026-2-515D2', 'e-005', 2, 2026, '2026-02-12', '1000.00', '100.00', '100.00', '100.00', '0.00', '0.00', '0.00', '1300.00', '100.00', '6.25', '66.67', '0.00', '172.92', '1127.08', 'EGP', 'paid', NULL, 28, 2, 90, '0.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-12 01:40:46', '2026-02-17 11:38:50'),
('2ea38ee0-0412-4284-94fd-9393bdc696bd', 'PAY-2026-2-6CF25', 'e-001', 2, 2026, '2026-02-12', '1000.00', '100.00', '100.00', '100.00', '0.00', '0.00', '0.00', '1300.00', '100.00', '6.94', '66.67', '0.00', '173.61', '1126.39', 'USD', 'draft', NULL, 28, 2, 100, '0.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-12 01:40:46', '2026-02-12 01:40:46'),
('47dff84b-91e6-4893-9cc3-fc21943035fc', 'PAY-2026-2-64236', 'e-002', 2, 2026, '2026-02-12', '6000.00', '100.00', '100.00', '100.00', '0.00', '0.00', '0.00', '6300.00', '600.00', '0.00', '400.00', '0.00', '1000.00', '5300.00', 'SAR', 'draft', NULL, 28, 2, 0, '0.00', NULL, NULL, NULL, 'خصم 2 يوم غياب. ', '2026-02-12 01:40:46', '2026-02-12 01:40:46'),
('697d180d-37cd-405a-8ffe-882a9ad1beae', 'PAY-2026-2-36671', 'e-008', 2, 2026, '2026-02-12', '500.00', '100.00', '100.00', '100.00', '0.00', '100.00', '31.25', '931.25', '50.00', '0.00', '0.00', '0.00', '50.00', '881.25', 'USD', 'draft', NULL, 30, 0, 0, '10.00', NULL, NULL, NULL, '', '2026-02-12 01:40:46', '2026-02-12 01:40:46'),
('aee1e4a0-1415-4646-9226-6ad901540d2f', 'PAY-2026-2-5E892', 'e-003', 2, 2026, '2026-02-12', '5000.00', '100.00', '100.00', '100.00', '0.00', '0.00', '0.00', '5300.00', '500.00', '0.00', '666.67', '0.00', '1166.67', '4133.33', 'EGP', 'draft', NULL, 26, 4, 0, '0.00', NULL, NULL, NULL, 'خصم 4 يوم غياب. ', '2026-02-12 01:40:46', '2026-02-12 01:40:46'),
('af7b42be-b73f-4ce9-9f32-e4584e459d42', 'PAY-2026-2-4B279', 'e-006', 2, 2026, '2026-02-12', '1000.00', '100.00', '95.00', '100.00', '0.00', '0.00', '0.00', '1295.00', '100.00', '0.00', '0.00', '0.00', '100.00', '1195.00', 'SAR', 'draft', NULL, 30, 0, 0, '0.00', NULL, NULL, NULL, '', '2026-02-12 01:40:46', '2026-02-12 01:40:46'),
('bc5f0aa2-9c51-41f8-86ae-b6bcb4cc65a6', 'PAY-2026-2-7C7CC', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', 2, 2026, '2026-02-12', '1000.00', '100.00', '100.00', '100.00', '0.00', '100.00', '46.88', '1446.88', '100.00', '0.00', '0.00', '0.00', '100.00', '1346.88', 'EGP', 'draft', NULL, 30, 0, 0, '7.50', NULL, NULL, NULL, '', '2026-02-12 01:40:46', '2026-02-12 01:40:46');

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
('adf1622e-d6cc-4580-9aee-9bd7e96756ab', 'EVAL-1770761718897', 'e-008', 'u-admin-01', '7f4fa2ac-0598-4556-b04f-7677aaccae86', '2026-02-10', '2026-02-01', '60.00', NULL, NULL, 'نقاط القوة الرئيسية', 'فجوات الأداء / فرص التحسين\n', NULL, NULL, '{\"hr_signature_date\": \"2026-02-03\", \"employee_signature_date\": \"2026-02-01\", \"evaluator_signature_date\": \"2026-02-02\"}', 'إجراءات التطوير المقترحة\n', 'approved', NULL, NULL, '2026-02-10 22:15:18', '2026-02-12 01:06:41', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-12T01:06:26+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-12T01:06:30+00:00\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-12T01:06:34+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-12T01:06:38+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"مدير النظام-كل الصلاحيات\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-12T01:06:41+00:00\", \"role_required\": \"Finance Manager\"}]', 5, 'تم الاعتماد النهائي', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permission_requests`
--

CREATE TABLE `permission_requests` (
  `id` int NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `duration_minutes` int NOT NULL COMMENT 'Calculated duration in minutes',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `current_stage_role_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Role ID currently required to approve',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

--
-- Dumping data for table `resignations`
--

INSERT INTO `resignations` (`id`, `request_number`, `employee_id`, `resignation_date`, `last_working_day`, `reason`, `status`, `current_approval_level`, `approval_history`, `exit_interview_notes`, `clearance_status`, `final_settlement`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`, `rejection_reason`, `submission_date`, `end_of_service_date`, `notice_period_days`, `handover_notes`) VALUES
('e3b5668b-8560-40cf-b203-8f09bf35bf64', 'RES-2026-00001', 'e-008', '2026-02-01', '2026-02-01', 'test', 'approved', NULL, NULL, NULL, NULL, NULL, '2026-02-11 22:36:39', '2026-02-11 22:37:07', '[{\"level\": \"direct_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير المباشر\", \"approver_id\": \"e-007\", \"approver_name\": \"ابراهيم عبدالوهاب\", \"decision_date\": \"2026-02-11T22:36:45+00:00\", \"role_required\": \"Direct Manager\"}, {\"level\": \"higher_manager\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير القسم الأعلى\", \"approver_id\": \"e-004\", \"approver_name\": \"عبدالمؤمن ايمن\", \"decision_date\": \"2026-02-11T22:36:51+00:00\", \"role_required\": \"Department Head\"}, {\"level\": \"gm\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"المدير العام\", \"approver_id\": \"e-002\", \"approver_name\": \"محمود الصالح\", \"decision_date\": \"2026-02-11T22:36:56+00:00\", \"role_required\": \"General Manager\"}, {\"level\": \"hr\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الموارد البشرية\", \"approver_id\": \"e-005\", \"approver_name\": \"أمانى رسلان\", \"decision_date\": \"2026-02-11T22:37:01+00:00\", \"role_required\": \"HR Manager\"}, {\"level\": \"finance\", \"notes\": \"\", \"status\": \"approved\", \"actor_id\": \"u-admin-01\", \"actor_name\": \"admin@ivory.com\", \"level_name\": \"مدير الحسابات\", \"approver_id\": \"e-006\", \"approver_name\": \"محمود مراد\", \"decision_date\": \"2026-02-11T22:37:07+00:00\", \"role_required\": \"Finance Manager\"}]', 5, 'تم الاعتماد النهائي', NULL, '2026-02-01', '2026-02-01', 30, NULL);

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
('0bf0c2a2-98ad-41e8-a114-7faf05d4ba1e', 'full_access', 'full_access', 'full_access', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_manager\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_department_manager\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 15:40:45', '2026-02-10 21:38:15'),
('6c1626e4-02a0-11f1-a178-d481d76a1bbe', 'super_admin', 'super_admin', 'super_admin', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_manager\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_department_manager\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:38:36'),
('6c1629cb-02a0-11f1-a178-d481d76a1bbe', 'hr_manager', 'hr_manager', 'hr_manager', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"view_contracts\", \"add_contracts\", \"approve_contract_hr\", \"view_trainings\", \"add_trainings\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"approve_resignation_hr\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_hr\", \"view_payroll\", \"view_bonuses\", \"add_bonuses\", \"approve_bonus_hr\", \"view_overtime\", \"add_overtime\", \"approve_overtime_hr\", \"view_evaluations\", \"create_evaluation\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"add_payroll\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:37:53'),
('6c162b0b-02a0-11f1-a178-d481d76a1bbe', 'hr_staff', 'hr_staff', 'hr_staff', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"view_contracts\", \"add_contracts\", \"view_trainings\", \"add_trainings\", \"view_resignations\", \"add_resignation\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"view_payroll\", \"add_payroll\", \"view_bonuses\", \"add_bonuses\", \"view_overtime\", \"add_overtime\", \"view_evaluations\", \"create_evaluation\", \"view_evaluation_templates\", \"add_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"add_employee_notes\", \"edit_evaluation_template\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:45:21'),
('6c162c07-02a0-11f1-a178-d481d76a1bbe', 'finance_manager', 'finance_manager', 'finance_manager', '[\"view_employees\", \"view_contracts\", \"add_contracts\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"view_resignations\", \"add_resignation\", \"approve_resignation_finance\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"view_evaluation_templates\", \"add_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_job_description\", \"add_employee_notes\", \"approve_training_finance\", \"approve_evaluation_finance\"]', '{\"view_leaves\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_payroll\": \"all\", \"edit_employees\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"view_attendance\": \"all\", \"delete_employees\": \"all\", \"view_evaluations\": \"all\", \"view_resignations\": \"all\", \"view_job_descriptions\": \"all\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:43:46'),
('6c162cce-02a0-11f1-a178-d481d76a1bbe', 'department_manager', 'department_manager', 'department_manager', '[\"view_employees\", \"view_contracts\", \"view_trainings\", \"add_trainings\", \"approve_training_manager\", \"view_resignations\", \"add_resignation\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_department_manager\", \"view_payroll\", \"view_bonuses\", \"add_bonuses\", \"approve_bonus_department_manager\", \"view_overtime\", \"add_overtime\", \"approve_overtime_department_manager\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"approve_evaluation_manager\", \"view_evaluation_templates\", \"view_job_descriptions\", \"add_employee_notes\", \"approve_contract_manager\", \"approve_resignation_department_manager\", \"add_job_description\", \"add_evaluation_template\", \"edit_overtime\", \"add_contracts\"]', '{\"edit_leaves\": \"department\", \"view_leaves\": \"department\", \"edit_bonuses\": \"department\", \"edit_payroll\": \"department\", \"view_bonuses\": \"department\", \"view_payroll\": \"department\", \"delete_leaves\": \"department\", \"edit_overtime\": \"department\", \"view_overtime\": \"department\", \"delete_bonuses\": \"department\", \"delete_payroll\": \"department\", \"edit_contracts\": \"department\", \"edit_employees\": \"department\", \"edit_trainings\": \"department\", \"view_contracts\": \"department\", \"view_employees\": \"department\", \"view_trainings\": \"department\", \"delete_overtime\": \"department\", \"edit_attendance\": \"department\", \"edit_evaluation\": \"department\", \"view_attendance\": \"department\", \"delete_contracts\": \"department\", \"delete_employees\": \"department\", \"delete_trainings\": \"department\", \"edit_resignation\": \"department\", \"view_evaluations\": \"department\", \"delete_attendance\": \"department\", \"delete_evaluation\": \"department\", \"view_resignations\": \"department\", \"delete_resignation\": \"department\", \"edit_job_description\": \"department\", \"view_job_descriptions\": \"department\", \"delete_job_description\": \"department\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-10 21:40:13'),
('6c162dae-02a0-11f1-a178-d481d76a1bbe', 'employee', 'employee', 'employee', '[\"view_organizational_structure\", \"checkin_checkout\", \"view_attendance\", \"view_contracts\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"view_payroll\", \"view_bonuses\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"view_evaluations\", \"view_job_descriptions\"]', '{\"edit_leaves\": \"own\", \"view_leaves\": \"own\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"own\", \"view_payroll\": \"own\", \"delete_leaves\": \"own\", \"edit_overtime\": \"own\", \"view_overtime\": \"own\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"own\", \"view_contracts\": \"own\", \"view_employees\": \"all\", \"view_trainings\": \"own\", \"delete_overtime\": \"own\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"own\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"own\", \"edit_resignation\": \"own\", \"view_evaluations\": \"own\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"own\", \"delete_resignation\": \"own\", \"edit_job_description\": \"own\", \"view_job_descriptions\": \"own\", \"delete_job_description\": \"own\"}', 99, 'active', '2026-02-05 14:39:05', '2026-02-08 22:23:08'),
('978f139b-e1bf-43b9-a924-2eb12537c2aa', 'admin', 'admin', 'admin', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_manager\", \"approve_contract_gm\", \"approve_contract_hr\", \"approve_contract_finance\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_manager\", \"approve_training_gm\", \"approve_training_hr\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_gm\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_gm\", \"approve_leave_hr\", \"approve_leave_finance\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_department_manager\", \"approve_bonus_upper_managers\", \"approve_bonus_gm\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_gm\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_manager\", \"approve_evaluation_gm\", \"approve_evaluation_hr\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_upper_managers\", \"approve_training_upper_managers\", \"approve_training_finance\", \"approve_evaluation_upper_managers\", \"approve_evaluation_finance\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 0, 'active', '2026-02-08 22:19:33', '2026-02-10 21:34:17'),
('b5ce42b8-569d-4abe-85d0-c43758accb83', 'main_department_manager', 'main_department_manager', 'main_department_manager', '[\"view_employees\", \"add_employees\", \"view_contracts\", \"approve_contract_upper_managers\", \"view_trainings\", \"add_trainings\", \"approve_training_upper_managers\", \"view_resignations\", \"add_resignation\", \"approve_resignation_upper_managers\", \"view_organizational_structure\", \"view_work_locations\", \"checkin_checkout\", \"view_attendance\", \"view_leaves\", \"add_leaves\", \"approve_leave_upper_managers\", \"view_payroll\", \"view_bonuses\", \"add_bonuses\", \"approve_bonus_upper_managers\", \"view_overtime\", \"add_overtime\", \"approve_overtime_upper_managers\", \"view_evaluations\", \"create_evaluation\", \"approve_evaluation_upper_managers\", \"view_evaluation_templates\", \"add_evaluation_template\", \"view_reports\", \"view_job_descriptions\", \"add_employee_notes\", \"add_job_description\"]', '{\"view_leaves\": \"department\", \"view_bonuses\": \"department\", \"view_payroll\": \"department\", \"view_overtime\": \"department\", \"view_contracts\": \"department\", \"view_employees\": \"department\", \"view_trainings\": \"department\", \"view_attendance\": \"department\", \"view_evaluations\": \"department\", \"view_resignations\": \"department\", \"view_job_descriptions\": \"department\"}', 0, 'active', '2026-02-10 21:43:01', '2026-02-10 21:43:01'),
('ff72942b-09d7-4e42-aab5-03b98039c08a', 'manager', 'manager', 'manager', '[\"view_dashboard\", \"view_employees\", \"add_employees\", \"edit_employees\", \"delete_employees\", \"view_contracts\", \"add_contracts\", \"edit_contracts\", \"delete_contracts\", \"approve_contract_gm\", \"view_trainings\", \"add_trainings\", \"edit_trainings\", \"delete_trainings\", \"approve_training_gm\", \"view_resignations\", \"add_resignation\", \"edit_resignation\", \"delete_resignation\", \"approve_resignation_gm\", \"view_organizational_structure\", \"add_organizational_structure\", \"edit_organizational_structure\", \"delete_organizational_structure\", \"view_work_locations\", \"add_work_locations\", \"edit_work_locations\", \"delete_work_locations\", \"checkin_checkout\", \"view_attendance\", \"add_attendance\", \"edit_attendance\", \"delete_attendance\", \"view_leaves\", \"add_leaves\", \"edit_leaves\", \"delete_leaves\", \"approve_leave_gm\", \"view_payroll\", \"add_payroll\", \"edit_payroll\", \"delete_payroll\", \"view_bonuses\", \"add_bonuses\", \"edit_bonuses\", \"delete_bonuses\", \"approve_bonus_gm\", \"view_overtime\", \"add_overtime\", \"edit_overtime\", \"delete_overtime\", \"approve_overtime_gm\", \"view_evaluations\", \"create_evaluation\", \"edit_evaluation\", \"delete_evaluation\", \"approve_evaluation_gm\", \"view_evaluation_templates\", \"add_evaluation_template\", \"edit_evaluation_template\", \"delete_evaluation_template\", \"view_reports\", \"generate_reports\", \"view_settings\", \"edit_settings\", \"manage_roles\", \"manage_users\", \"view_job_descriptions\", \"add_job_description\", \"edit_job_description\", \"delete_job_description\", \"add_employee_notes\", \"approve_contract_manager\", \"approve_contract_upper_managers\", \"approve_contract_hr\", \"approve_contract_finance\", \"approve_training_manager\", \"approve_training_upper_managers\", \"approve_training_hr\", \"approve_training_finance\", \"approve_resignation_department_manager\", \"approve_resignation_upper_managers\", \"approve_resignation_hr\", \"approve_resignation_finance\", \"approve_leave_department_manager\", \"approve_leave_upper_managers\", \"approve_leave_hr\", \"approve_leave_finance\", \"approve_bonus_department_manager\", \"approve_bonus_upper_managers\", \"approve_bonus_hr\", \"approve_bonus_finance\", \"approve_overtime_department_manager\", \"approve_overtime_upper_managers\", \"approve_overtime_hr\", \"approve_overtime_finance\", \"approve_evaluation_manager\", \"approve_evaluation_upper_managers\", \"approve_evaluation_hr\", \"approve_evaluation_finance\"]', '{\"edit_leaves\": \"all\", \"view_leaves\": \"all\", \"edit_bonuses\": \"all\", \"edit_payroll\": \"all\", \"view_bonuses\": \"all\", \"view_payroll\": \"all\", \"delete_leaves\": \"all\", \"edit_overtime\": \"all\", \"view_overtime\": \"all\", \"delete_bonuses\": \"all\", \"delete_payroll\": \"all\", \"edit_contracts\": \"all\", \"edit_employees\": \"all\", \"edit_trainings\": \"all\", \"view_contracts\": \"all\", \"view_employees\": \"all\", \"view_trainings\": \"all\", \"delete_overtime\": \"all\", \"edit_attendance\": \"all\", \"edit_evaluation\": \"all\", \"view_attendance\": \"all\", \"delete_contracts\": \"all\", \"delete_employees\": \"all\", \"delete_trainings\": \"all\", \"edit_resignation\": \"all\", \"view_evaluations\": \"all\", \"delete_attendance\": \"all\", \"delete_evaluation\": \"all\", \"view_resignations\": \"all\", \"delete_resignation\": \"all\", \"edit_job_description\": \"all\", \"view_job_descriptions\": \"all\", \"delete_job_description\": \"all\"}', 99, 'active', '2026-02-05 16:38:19', '2026-02-10 21:39:09');

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
('5eb0147d-0d19-11f1-8b1b-d481d76a1bbe', 'monthly_permission_limit_minutes', '240', 'number', 'Maximum permission duration per month in minutes', '2026-02-18 22:30:03', '2026-02-18 22:30:03');

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
  `current_status_desc` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trainings`
--

INSERT INTO `trainings` (`id`, `name`, `description`, `provider`, `duration_hours`, `category`, `start_date`, `end_date`, `location`, `max_participants`, `status`, `created_at`, `updated_at`, `approval_chain`, `current_level_idx`, `current_status_desc`) VALUES
('0eefe2dc-f28e-49f6-b00e-8684b668c1bb', 'Web Development', 'Web Development', 'IvoryTraining', 75, 'تقنية المعلومات', NULL, NULL, NULL, NULL, 'active', '2026-02-05 22:52:38', '2026-02-05 23:10:48', NULL, 0, NULL),
('518cc135-e17c-478f-a677-8a88e1b08b74', 'Python', 'Python', 'IvoryTraining', 60, 'تقنية المعلومات', NULL, NULL, NULL, NULL, 'active', '2026-02-05 23:39:30', '2026-02-05 23:39:30', NULL, 0, NULL);

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
('4c0abeda-a41b-4f89-ac90-7e2c9661e4ca', 'test22@test22.com', '$2y$10$QaA7rSlAOF4uEP.6sj2OnOAuWQ2U2a9TrgPOhDF0eIm6fW17doBty', 'test22@test22.com', NULL, 'active', '2026-02-12 20:34:44', '2026-02-12 20:41:10'),
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
('0d2a2e91-3e60-4ca4-811f-ae7a5c0cfc12', 'u-emp-08', '6c162dae-02a0-11f1-a178-d481d76a1bbe', 'a6291c93-b20c-4fc5-afc8-7422394e4f9e', NULL, '2026-02-05 23:33:05', 'active'),
('1d0d7940-0cf5-4c68-a9c7-eb86f11170bc', '4c0abeda-a41b-4f89-ac90-7e2c9661e4ca', 'ff72942b-09d7-4e42-aab5-03b98039c08a', '16fbc2cc-8376-4f4b-92c7-fd3244092dc6', NULL, '2026-02-12 20:35:53', 'active'),
('41c9a670-f49b-4bbf-80ce-0fe4539aaaa2', 'u-emp-04', '6c1629cb-02a0-11f1-a178-d481d76a1bbe', 'e-005', NULL, '2026-02-05 16:43:40', 'active'),
('579ea9ad-c6fe-48a4-ba12-9268761bde4c', 'u-emp-05', '6c162c07-02a0-11f1-a178-d481d76a1bbe', 'e-006', NULL, '2026-02-05 16:44:34', 'active'),
('7d29f1f9-4935-42b3-a4f1-d0d8bf064422', 'u-emp-03', '6c162cce-02a0-11f1-a178-d481d76a1bbe', 'e-004', NULL, '2026-02-05 16:37:15', 'active'),
('86346d4a-5e22-4523-a476-ffd2c4bd416d', 'u-emp-06', '6c162cce-02a0-11f1-a178-d481d76a1bbe', 'e-007', NULL, '2026-02-05 16:45:40', 'active'),
('af1343f2-db68-421b-a8c8-230005a36e6f', 'u-emp-09', '6c162b0b-02a0-11f1-a178-d481d76a1bbe', '1bc8bb7c-ef2c-48ba-84bf-646e1de9f866', NULL, '2026-02-10 21:48:33', 'active'),
('bd70c0e4-02d7-11f1-95cc-d481d76a1bbe', 'u-admin-01', '6c1626e4-02a0-11f1-a178-d481d76a1bbe', 'e-001', NULL, '2026-02-05 21:15:04', 'active');

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
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `working_days` json DEFAULT NULL,
  `grace_period_minutes` int DEFAULT '15',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `work_schedules`
--

INSERT INTO `work_schedules` (`id`, `name`, `work_location_id`, `start_time`, `end_time`, `working_days`, `grace_period_minutes`, `status`, `created_at`, `updated_at`) VALUES
('99c9cbeb-2df0-4013-ad63-ae6045278aa1', 'جدول العمل في السعودية', 'ee7c04a4-4c7f-47e8-84f3-ad8235e3d8f8', '09:00:00', '17:00:00', '[\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\"]', 15, 'active', '2026-02-05 21:44:06', '2026-02-08 21:22:08'),
('a59f6b22-bc6f-43d3-88ed-09521290a3bd', 'جدول العمل عن بعد', 'loc-remote', '09:00:00', '17:00:00', '[\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\", \"Saturday\"]', 15, 'active', '2026-02-05 21:45:41', '2026-02-08 21:22:08'),
('caf051ff-d697-4f73-8f7d-a0c4861bdf4c', 'جدول العمل في مصر', 'loc-main', '09:00:00', '17:00:00', '[\"Sunday\", \"Monday\", \"Tuesday\", \"Wednesday\", \"Thursday\"]', 15, 'active', '2026-02-05 21:44:55', '2026-02-08 21:22:08');

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
-- Indexes for table `employee_leave_balances`
--
ALTER TABLE `employee_leave_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_balance` (`employee_id`,`leave_type_id`,`year`),
  ADD KEY `leave_type_id` (`leave_type_id`);

--
-- Indexes for table `employee_trainings`
--
ALTER TABLE `employee_trainings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `training_id` (`training_id`);

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
  ADD KEY `idx_payroll_employee_period` (`employee_id`,`year`,`month`);

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
  ADD KEY `current_stage_role_id` (`current_stage_role_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `permission_requests`
--
ALTER TABLE `permission_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `allowances`
--
ALTER TABLE `allowances`
  ADD CONSTRAINT `allowances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `work_schedules`
--
ALTER TABLE `work_schedules`
  ADD CONSTRAINT `work_schedules_ibfk_1` FOREIGN KEY (`work_location_id`) REFERENCES `work_locations` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
