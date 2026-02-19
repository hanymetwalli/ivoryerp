<?php

require_once __DIR__ . '/../helpers/audit.php';

class ApprovalService {
    private $db;
    private $user; // User performing the action

    public function __construct($db, $user) {
        $this->db = $db;
        $this->user = $user;
    }

    /**
     * Process an approval action (Enhanced for JSON Chain)
     */
    public function process($table, $id, $action, $notes = null, $forceFinal = false) {
        // 1. Fetch Request
        $stmt = $this->db->prepare("SELECT * FROM `$table` WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            return ['success' => false, 'error' => 'Record not found'];
        }

        // 2. Parse Chain Data
        $chain = !empty($record['approval_chain']) ? json_decode($record['approval_chain'], true) : [];
        $currentIdx = (int)($record['current_level_idx'] ?? 0);
        
        // Fallback for Legacy Records (No chain)
        if (empty($chain)) {
            // Attempt to build a basic chain on the fly or fail gracefully
            return ['success' => false, 'error' => 'Approval chain not initialized for this record.'];
        }

        // 3. Handle Action
        $newStatus = $record['status'];
        $newIdx = $currentIdx;
        $statusDesc = $record['current_status_desc'];
        
        // Get Current Step Node
        if (isset($chain[$currentIdx])) {
            $step = &$chain[$currentIdx];
            
            // Validate: Is this user allowed? (Skip if Force Final)
            // Ideally check $this->user['id'] vs $step['approver_id'] 
            // OR check $this->user['role'] vs required role permissions.
            // For now, assume Controller/Frontend checked permission, or trust authenticated user.
            
            if ($action === 'reject') {
                $step['status'] = 'rejected';
                $step['decision_date'] = date('c'); // ISO 8601
                $step['actor_name'] = $this->user['name'];
                $step['actor_id'] = $this->user['id'];
                $step['notes'] = $notes;
                
                $newStatus = 'rejected';
                $statusDesc = "تم الرفض بواسطة: " . $this->user['name'];
                
            } elseif ($action === 'approve') {
                $step['status'] = 'approved';
                $step['decision_date'] = date('c');
                $step['actor_name'] = $this->user['name'];
                $step['actor_id'] = $this->user['id'];
                $step['notes'] = $notes;
                
                // Move to Next
                $newIdx++;
                
                // Check if chain ended
                if ($newIdx >= count($chain)) {
                    // Completed!
                    $newStatus = 'approved'; // Or specific final status map
                    $statusDesc = 'تم الاعتماد النهائي';
                    
                    // Map legacy status if needed
                    $lastStep = $chain[count($chain)-1];
                    if ($lastStep['level'] === 'hr') $newStatus = 'hr_approved';
                    
                } else {
                    // Pending Next
                    $newStatus = 'pending';
                    $nextStep = $chain[$newIdx];
                    $chain[$newIdx]['status'] = 'pending'; // Ensure next is pending
                    
                    $approverTitle = $nextStep['level_name'] ?? $nextStep['role_required'];
                    $approverName = $nextStep['approver_name'] ?? '';
                    
                    $statusDesc = "جارى الاعتماد من: {$approverTitle}" . ($approverName ? " ({$approverName})" : "");
                }
            }
        } else {
            return ['success' => false, 'error' => 'Invalid approval stage index'];
        }

        // 4. Update Database
        $sql = "UPDATE `$table` SET 
                status = :status, 
                approval_chain = :chain, 
                current_level_idx = :idx, 
                current_status_desc = :desc,
                updated_at = NOW() 
                WHERE id = :id";
        
        $params = [
            ':status' => $newStatus,
            ':chain' => json_encode($chain, JSON_UNESCAPED_UNICODE),
            ':idx' => $newIdx,
            ':desc' => $statusDesc,
            ':id' => $id
        ];

        $stmt = $this->db->prepare($sql);
        $success = $stmt->execute($params);

        if ($success) {
            recordAuditLog($action, $table, $id, $record, [
                'status' => $newStatus,
                'idx' => $newIdx,
                'desc' => $statusDesc,
                'notes' => $notes
            ]);
            return [
                'success' => true, 
                'new_status' => $newStatus, 
                'chain' => $chain
            ];
        } else {
            return ['success' => false, 'error' => 'Database update failed'];
        }
    }
}
