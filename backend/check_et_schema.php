<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=ivory_hr_2026', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->query("DESCRIBE employee_trainings");
    echo "Columns in employee_trainings:\n";
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['Field'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
