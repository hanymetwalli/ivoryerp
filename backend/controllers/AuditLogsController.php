<?php
/**
 * Audit Logs Controller
 */

require_once __DIR__ . '/BaseController.php';

class AuditLogsController extends BaseController {
    protected $table = 'audit_logs';
    
    protected $fillable = [
        'id', 'user_id', 'action', 'entity_type', 'entity_id',
        'old_values', 'new_values', 'ip_address', 'user_agent'
    ];
    
    protected $searchable = ['action', 'entity_type'];
    
    public function index() {
        try {
            $params = getQueryParams();
            $limit = min(1000, max(1, intval($params['limit'] ?? 500)));
            
            $sql = "SELECT al.*, u.email as user_email, u.full_name as user_name
                    FROM `audit_logs` al
                    LEFT JOIN `users` u ON al.user_id = u.id
                    WHERE 1=1";
            
            $sqlParams = [];
            if (!empty($params['entity_type'])) {
                $sql .= " AND al.entity_type = :et";
                $sqlParams[':et'] = $params['entity_type'];
            }
            
            $sql .= " ORDER BY al.created_at DESC LIMIT $limit";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($sqlParams);
            
            return ['data' => array_map([$this, 'processRow'], $stmt->fetchAll())];
        } catch (Exception $e) {
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'log':
                return $this->store($data);
            default:
                jsonError('Action not implemented', 501);
        }
    }
}
