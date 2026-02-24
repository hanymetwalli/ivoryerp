<?php
/**
 * Employees Controller
 */

require_once __DIR__ . '/BaseController.php';

class EmployeesController extends BaseController {
    protected $table = 'employees';
    
    protected $fillable = [
        'id', 'employee_number', 'full_name', 'id_number', 'phone', 'email',
        'position', 'department', 'work_location_id', 'work_schedule_id', 'hire_date', 'date_of_joining', 'status',
        'profile_image', 'documents', 'nationality', 'gender', 'birth_date',
        'bank_name', 'bank_account', 'iban'
    ];
    
    protected $searchable = ['full_name', 'employee_number', 'email', 'phone', 'id_number'];
    
    /**
     * Override index to include related data
     */
    public function index() {
        $result = parent::index();
        
        foreach ($result['data'] as &$employee) {
            $employee = $this->enrichEmployeeData($employee);
        }
        
        return $result;
    }
    
    /**
     * Override show to include related data
     */
    public function show($id) {
        $employee = parent::show($id);
        return $this->enrichEmployeeData($employee);
    }
    
    /**
     * Get employee with contract
     */
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'contract':
                return $this->getActiveContract($id);
            case 'attendance':
                return $this->getAttendance($id, $data);
            case 'leaves':
                return $this->getLeaves($id);
            case 'payroll':
                return $this->getPayroll($id, $data);
            default:
                parent::customAction($id, $action, $data);
        }
    }
    
    /**
     * Get active contract for employee
     */
    private function getActiveContract($employeeId) {
        $stmt = $this->db->prepare("
            SELECT * FROM `contracts` 
            WHERE `employee_id` = :employee_id AND `status` = 'active'
            ORDER BY `start_date` DESC LIMIT 1
        ");
        $stmt->execute([':employee_id' => $employeeId]);
        return $stmt->fetch() ?: null;
    }
    
    /**
     * Get attendance records
     */
    private function getAttendance($employeeId, $params = []) {
        $month = $params['month'] ?? date('n');
        $year = $params['year'] ?? date('Y');
        
        $stmt = $this->db->prepare("
            SELECT * FROM `attendance` 
            WHERE `employee_id` = :employee_id 
            AND MONTH(`date`) = :month AND YEAR(`date`) = :year
            ORDER BY `date` DESC
        ");
        $stmt->execute([
            ':employee_id' => $employeeId,
            ':month' => $month,
            ':year' => $year
        ]);
        return array_map([$this, 'processRow'], $stmt->fetchAll());
    }
    
    /**
     * Get leave requests
     */
    private function getLeaves($employeeId) {
        $stmt = $this->db->prepare("
            SELECT lr.*, lt.name as leave_type_name 
            FROM `leave_requests` lr
            LEFT JOIN `leave_types` lt ON lr.leave_type_id = lt.id
            WHERE lr.employee_id = :employee_id
            ORDER BY lr.created_at DESC
        ");
        $stmt->execute([':employee_id' => $employeeId]);
        return array_map([$this, 'processRow'], $stmt->fetchAll());
    }
    
    /**
     * Get payroll records
     */
    private function getPayroll($employeeId, $params = []) {
        $year = $params['year'] ?? date('Y');
        
        $stmt = $this->db->prepare("
            SELECT * FROM `payroll` 
            WHERE `employee_id` = :employee_id AND `year` = :year
            ORDER BY `month` DESC
        ");
        $stmt->execute([
            ':employee_id' => $employeeId,
            ':year' => $year
        ]);
        return array_map([$this, 'processRow'], $stmt->fetchAll());
    }
    
    /**
     * Enrich employee data with related info
     */
    private function enrichEmployeeData($employee) {
        if (!$employee) return $employee;
        
        // Get department details directly
        if (isset($employee['department'])) {
            // First try as ID
            $stmt = $this->db->prepare("SELECT `id`, `name`, `manager_id`, `parent_department_id` FROM `departments` WHERE `id` = :id");
            $stmt->execute([':id' => $employee['department']]);
            $dept = $stmt->fetch();
            
            // If not found by ID, try by name
            if (!$dept) {
                $stmt = $this->db->prepare("SELECT `id`, `name`, `manager_id`, `parent_department_id` FROM `departments` WHERE `name` = :name");
                $stmt->execute([':name' => $employee['department']]);
                $dept = $stmt->fetch();
            }

            if ($dept) {
                $employee['department_id'] = $dept['id']; // Always ensure ID is present
                $employee['department_name'] = $dept['name'];
            } else {
                $employee['department_name'] = $employee['department'];
            }
        }
        
        // Get position name
        if (isset($employee['position']) && $employee['position']) {
            $stmt = $this->db->prepare("SELECT `name` FROM `positions` WHERE `id` = :id OR `name` = :name");
            $stmt->execute([':id' => $employee['position'], ':name' => $employee['position']]);
            $pos = $stmt->fetch();
            $employee['position_name'] = $pos ? $pos['name'] : $employee['position'];
        }
        
        // Get work schedule name
        if (isset($employee['work_schedule_id']) && $employee['work_schedule_id']) {
            $stmt = $this->db->prepare("SELECT `name` FROM `work_schedules` WHERE `id` = :id");
            $stmt->execute([':id' => $employee['work_schedule_id']]);
            $sch = $stmt->fetch();
            $employee['work_schedule_name'] = $sch ? $sch['name'] : null;
        }
        
        return $employee;
    }
}
