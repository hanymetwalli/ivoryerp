<?php
/**
 * Disciplinary Seeder Script
 * Seeds violation types, penalty policies, and test violations.
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/EmployeeViolationsController.php';

$db = getDB();

echo "Starting Disciplinary Seeder...\n";

// 1. Create Violation Types
$violation_types = [
    [
        'id' => 'v-type-absence',
        'name' => 'غياب بدون عذر',
        'description' => 'الغياب عن العمل بدون إذن مسبق أو عذر مقبول',
        'letter_template' => "السيد {employee_name}،\n\nتم تسجيل غياب يوم {incident_date} بدون عذر مسبق.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: {penalty_action}.\n\nإدارة الموارد البشرية"
    ],
    [
        'id' => 'v-type-delay',
        'name' => 'تأخير صباحي',
        'description' => 'التأخر عن موعد الحضور الرسمي صباحاً',
        'letter_template' => "السيد {employee_name}،\n\nتم تسجيل تأخير صباحي بتاريخ {incident_date}.\nبناءً على لائحة الجزاءات، الإجراء المطبق هو: {penalty_action}.\n\nإدارة الموارد البشرية"
    ]
];

foreach ($violation_types as $vt) {
    $stmt = $db->prepare("SELECT id FROM violation_types WHERE name = ?");
    $stmt->execute([$vt['name']]);
    if (!$stmt->fetch()) {
        $stmt = $db->prepare("INSERT INTO violation_types (id, name, description, letter_template) VALUES (?, ?, ?, ?)");
        $stmt->execute([$vt['id'], $vt['name'], $vt['description'], $vt['letter_template']]);
        echo "Inserted violation type: {$vt['name']}\n";
    } else {
        echo "Violation type already exists: {$vt['name']}\n";
    }
}

// 2. Create Penalty Policies
$policies = [
    // Absence
    ['vt_name' => 'غياب بدون عذر', 'occ' => 1, 'action' => 'warning', 'val' => 0],
    ['vt_name' => 'غياب بدون عذر', 'occ' => 2, 'action' => 'deduction_days', 'val' => 1.00],
    ['vt_name' => 'غياب بدون عذر', 'occ' => 3, 'action' => 'deduction_days', 'val' => 3.00],
    // Delay
    ['vt_name' => 'تأخير صباحي', 'occ' => 1, 'action' => 'warning', 'val' => 0],
    ['vt_name' => 'تأخير صباحي', 'occ' => 2, 'action' => 'deduction_days', 'val' => 0.25],
];

foreach ($policies as $p) {
    $stmt = $db->prepare("SELECT id FROM violation_types WHERE name = ?");
    $stmt->execute([$p['vt_name']]);
    $vtId = $stmt->fetchColumn();
    
    if ($vtId) {
        $stmt = $db->prepare("SELECT id FROM penalty_policies WHERE violation_type_id = ? AND occurrence_number = ?");
        $stmt->execute([$vtId, $p['occ']]);
        if (!$stmt->fetch()) {
            $stmt = $db->prepare("INSERT INTO penalty_policies (id, violation_type_id, occurrence_number, action_type, penalty_value) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['p-pol-' . uniqid(), $vtId, $p['occ'], $p['action'], $p['val']]);
            echo "Inserted policy for {$p['vt_name']} (Occ: {$p['occ']})\n";
        }
    }
}

// 3. Register Test Violations for an employee
$stmt = $db->prepare("SELECT id, full_name FROM employees LIMIT 1");
$stmt->execute();
$employee = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$employee) {
    die("Error: No employees found in database.\n");
}

echo "Seeding violations for employee: {$employee['full_name']} (ID: {$employee['id']})\n";

$stmt = $db->prepare("SELECT id FROM violation_types WHERE name = 'تأخير صباحي'");
$stmt->execute();
$delayTypeId = $stmt->fetchColumn();

if ($delayTypeId) {
    // Clear existing test violations for this employee to start fresh
    $db->prepare("DELETE FROM employee_violations WHERE employee_id = ?")->execute([$employee['id']]);
    
    $controller = new EmployeeViolationsController();
    
    // Violation 1: Yesterday
    $yesterday = date('Y-m-d', strtotime('-1 day'));
    echo "Recording violation 1 (Yesterday)...\n";
    $res1 = $controller->store([
        'employee_id' => $employee['id'],
        'violation_type_id' => $delayTypeId,
        'incident_date' => $yesterday,
        'notes' => 'تأخير تجريبي 1'
    ]);
    if (isset($res1['error'])) {
        echo "Result 1 Error: " . $res1['message'] . "\n";
    } else {
        echo "Result 1: Status=" . ($res1['status'] ?? 'N/A') . ", Action=" . ($res1['applied_action'] ?? 'N/A') . "\n";
    }

    // Violation 2: Today
    $today = date('Y-m-d');
    echo "Recording violation 2 (Today)...\n";
    $res2 = $controller->store([
        'employee_id' => $employee['id'],
        'violation_type_id' => $delayTypeId,
        'incident_date' => $today,
        'notes' => 'تأخير تجريبي 2'
    ]);
    if (isset($res2['error'])) {
        echo "Result 2 Error: " . $res2['message'] . "\n";
    } else {
        echo "Result 2: Status=" . ($res2['status'] ?? 'N/A') . ", Action=" . ($res2['applied_action'] ?? 'N/A') . "\n";
    }
}

echo "Seeding completed successfully.\n";
