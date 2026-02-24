<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=ivory_hr_2026', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->query("DESCRIBE workflow_blueprints");
    echo "Columns in workflow_blueprints:\n";
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- " . $row['Field'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
