<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=ivory_hr_2026', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->prepare("SELECT * FROM workflow_blueprints WHERE name = 'TrainingRequest'");
    $stmt->execute();
    $blueprint = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($blueprint) {
        echo "TrainingRequest blueprint exists.\n";
        print_r($blueprint);
    } else {
        echo "TrainingRequest blueprint NOT found. Creating a default one.\n";
        $id = bin2hex(random_bytes(16)); // Simple UUID fallback
        // Create a default workflow: Manager -> HR
        $steps = json_encode([
            ['level_name' => 'مدير القسم', 'role_id' => 'manager', 'show_approver_name' => true],
            ['level_name' => 'الموارد البشرية', 'role_id' => 'hr_admin', 'show_approver_name' => true]
        ]);
        $stmt = $db->prepare("INSERT INTO workflow_blueprints (id, name, description, steps_json, created_at) VALUES (?, 'TrainingRequest', 'اعتماد الدورات التدريبية', ?, NOW())");
        $stmt->execute([$id, $steps]);
        echo "TrainingRequest blueprint created.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
