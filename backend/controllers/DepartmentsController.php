<?php
/**
 * Departments Controller
 */

require_once __DIR__ . '/BaseController.php';

class DepartmentsController extends BaseController {
    protected $table = 'departments';
    
    protected $fillable = [
        'id', 'name', 'code', 'parent_department_id', 'manager_id', 'description', 'status'
    ];
    
    protected $searchable = ['name', 'code'];
    
    /**
     * Get department with employees count
     */
    public function index() {
        $result = parent::index();
        
        foreach ($result['data'] as &$dept) {
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM employees WHERE department = :id");
            $stmt->execute([':id' => $dept['id']]);
            $dept['employees_count'] = (int) $stmt->fetch()['count'];
            
            // Get manager name
            if ($dept['manager_id']) {
                $stmt = $this->db->prepare("SELECT full_name FROM employees WHERE id = :id");
                $stmt->execute([':id' => $dept['manager_id']]);
                $manager = $stmt->fetch();
                $dept['manager_name'] = $manager ? $manager['full_name'] : null;
            }
        }
        
        return $result;
    }
    
    /**
     * Get department hierarchy
     */
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'employees':
                return $this->getEmployees($id);
            case 'hierarchy':
                return $this->getHierarchy($id);
            default:
                parent::customAction($id, $action, $data);
        }
    }
    
    private function getEmployees($deptId) {
        $stmt = $this->db->prepare("SELECT * FROM employees WHERE department = :id ORDER BY full_name");
        $stmt->execute([':id' => $deptId]);
        return $stmt->fetchAll();
    }
    
    private function getHierarchy($deptId) {
        $dept = $this->show($deptId);
        
        // Get children
        $stmt = $this->db->prepare("SELECT * FROM departments WHERE parent_department_id = :id");
        $stmt->execute([':id' => $deptId]);
        $dept['children'] = $stmt->fetchAll();
        
        return $dept;
    }
}
