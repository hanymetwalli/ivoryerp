<?php
/**
 * Deductions Controller
 */

require_once __DIR__ . '/BaseController.php';

class DeductionsController extends BaseController {
    protected $table = 'deductions';
    
    protected $fillable = [
        'id', 'employee_id', 'type', 'amount', 'currency',
        'date', 'month', 'year', 'reason', 'status'
    ];
    
    public function index() {
        $params = getQueryParams();
        
        $sql = "SELECT d.*, e.full_name as employee_name, e.employee_number
                FROM deductions d
                LEFT JOIN employees e ON d.employee_id = e.id
                WHERE 1=1";
        
        $queryParams = [];
        
        if (!empty($params['employee_id'])) {
            $sql .= " AND d.employee_id = :employee_id";
            $queryParams[':employee_id'] = $params['employee_id'];
        }
        
        if (!empty($params['month']) && !empty($params['year'])) {
            $sql .= " AND d.month = :month AND d.year = :year";
            $queryParams[':month'] = $params['month'];
            $queryParams[':year'] = $params['year'];
        }
        
        $sql .= " ORDER BY d.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($queryParams);
        
        return ['data' => $stmt->fetchAll()];
    }
}
