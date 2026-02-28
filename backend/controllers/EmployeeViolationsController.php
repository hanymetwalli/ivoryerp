<?php
/**
 * Employee Violations Controller
 * Includes record logic, automatic penalty calculation, and letter generation.
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/WorkflowService.php';

class EmployeeViolationsController extends BaseController {
    protected $table = 'employee_violations';
    
    protected $fillable = [
        'id', 'employee_id', 'violation_type_id', 'incident_date', 
        'occurrence_number', 'applied_action', 'applied_value', 
        'status', 'letter_content', 'notes', 'workflow_id'
    ];
    
    protected $searchable = ['applied_action', 'notes'];

    /**
     * Override index to handle Data Scoping
     */
    public function index() {
        $userId = getCurrentUserId();
        if (!$userId) {
            http_response_code(401);
            return ['error' => true, 'message' => 'Unauthorized'];
        }

        // Get current user and their employee record
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();

        // Get user role and permissions for scoping
        // Note: permissions are stored as a JSON string or comma-separated in the roles table
        $stmt = $this->db->prepare("
            SELECT r.permissions, ur.employee_id 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :user_id AND ur.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([':user_id' => $userId]);
        $roleData = $stmt->fetch();

        $permissionsData = $roleData['permissions'] ?? '';
        $currentEmployeeId = $roleData['employee_id'] ?? null;

        $permissions = [];
        if (is_array($permissionsData)) {
            $permissions = $permissionsData;
        } else if (is_string($permissionsData) && !empty($permissionsData)) {
            $permissions = json_decode($permissionsData, true) ?: [];
        }

        $where = " WHERE 1=1 ";
        $params = [];

        // Scoping Logic: STRICT array checking! No more 'strpos' flaws!
        $isAdmin = ($user['email'] === 'admin@ivory.com');
        $canViewAll = $isAdmin || in_array('view_all_violations', $permissions) || in_array('*', $permissions) || in_array('all', $permissions);
        $canViewDept = in_array('view_department_violations', $permissions);

        if ($canViewAll) {
            // No extra filters for global view
        } elseif ($canViewDept && $currentEmployeeId) {
            // Get department of the current user
            $stmt = $this->db->prepare("SELECT department FROM employees WHERE id = :id");
            $stmt->execute([':id' => $currentEmployeeId]);
            $userDept = $stmt->fetchColumn();
            
            if ($userDept) {
                // Must explicitly specify table alias e for employees
                $where .= " AND e.department = :dept";
                $params[':dept'] = $userDept;
            } else {
                $where .= " AND t.employee_id = :emp_id";
                $params[':emp_id'] = $currentEmployeeId;
            }
        } elseif ($currentEmployeeId) {
            // Regular employee: strictly own records
            $where .= " AND t.employee_id = :emp_id";
            $params[':emp_id'] = $currentEmployeeId;
        } else {
            // No link to employee, can't see anything (handled strictly)
            $where .= " AND 1=0";
        }

        // Pagination and sorting
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(1000, max(1, intval($_GET['limit'] ?? 100)));
        $offset = ($page - 1) * $limit;
        $order = (isset($_GET['order']) && strtoupper($_GET['order']) === 'ASC') ? 'ASC' : 'DESC';

        // Count for pagination
        $countSql = "SELECT COUNT(*) FROM `{$this->table}` t 
                     LEFT JOIN employees e ON t.employee_id = e.id" . $where;
        $totalStmt = $this->db->prepare($countSql);
        $totalStmt->execute($params);
        $total = $totalStmt->fetchColumn();

        // Main Query - Must include workflow_id
        $stmt = $this->db->prepare("
            SELECT t.*, t.workflow_id, e.full_name as employee_name, vt.name as violation_name 
            FROM `{$this->table}` t
            LEFT JOIN employees e ON t.employee_id = e.id
            LEFT JOIN violation_types vt ON t.violation_type_id = vt.id
            " . $where . " 
            ORDER BY t.incident_date $order 
            LIMIT $limit OFFSET $offset
        ");
        $stmt->execute($params);
        $data = array_map([$this, 'processRow'], $stmt->fetchAll());

        return [
            'data' => $data,
            'pagination' => ['total' => (int)$total, 'page' => $page, 'limit' => $limit, 'pages' => ceil($total / $limit)]
        ];
    }

    /**
     * Override show to include joined names and workflow_id so creating a new record returns all UI dependencies.
     */
    public function show($id) {
        $stmt = $this->db->prepare("
            SELECT t.*, t.workflow_id, e.full_name as employee_name, vt.name as violation_name 
            FROM `{$this->table}` t
            LEFT JOIN employees e ON t.employee_id = e.id
            LEFT JOIN violation_types vt ON t.violation_type_id = vt.id
            WHERE t.`{$this->primaryKey}` = :id
        ");
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch();
        if (!$data) {
            http_response_code(404);
            return ['error' => true, 'message' => 'Record not found'];
        }
        return $this->processRow($data);
    }

    /**
     * Override store to handle automatic penalty and letter generation
     */
    public function store($data) {
        try {
            $employeeId = $data['employee_id'];
            $violationTypeId = $data['violation_type_id'];
            $incidentDate = $data['incident_date'] ?? date('Y-m-d');
            
            // 1. Calculate Occurrence Number
            $stmt = $this->db->prepare("
                SELECT COUNT(*) FROM `employee_violations` 
                WHERE employee_id = :emp_id AND violation_type_id = :v_id
            ");
            $stmt->execute([':emp_id' => $employeeId, ':v_id' => $violationTypeId]);
            $count = (int)$stmt->fetchColumn();
            $occurrenceNumber = $count + 1;
            $data['occurrence_number'] = $occurrenceNumber;

            // 2. Fetch Penalty Policy
            $stmt = $this->db->prepare("
                SELECT * FROM `penalty_policies` 
                WHERE violation_type_id = :v_id AND occurrence_number = :occ
            ");
            $stmt->execute([':v_id' => $violationTypeId, ':occ' => $occurrenceNumber]);
            $policy = $stmt->fetch();

            // If no exact match, use the highest occurrence policy for this type
            if (!$policy) {
                $stmt = $this->db->prepare("
                    SELECT * FROM `penalty_policies` 
                    WHERE violation_type_id = :v_id 
                    ORDER BY occurrence_number DESC LIMIT 1
                ");
                $stmt->execute([':v_id' => $violationTypeId]);
                $policy = $stmt->fetch();
            }

            if ($policy) {
                $data['applied_action'] = $policy['action_type'];
                $data['applied_value'] = $policy['penalty_value'];
            } else {
                $data['applied_action'] = 'warning';
                $data['applied_value'] = 0;
            }

            // 3. Generate Letter Content
            $stmt = $this->db->prepare("SELECT * FROM `violation_types` WHERE id = :id");
            $stmt->execute([':id' => $violationTypeId]);
            $vType = $stmt->fetch();

            $stmt = $this->db->prepare("SELECT * FROM `employees` WHERE id = :id");
            $stmt->execute([':id' => $employeeId]);
            $employee = $stmt->fetch();

            $template = $vType['letter_template'] ?? "إنذار بخصوص مخالفة: {violation_name}\n\nعزيزي {employee_name}،\nنحيطكم علماً بأنه تم رصد مخالفة بتاريخ {incident_date}، وبناءً عليه تم تطبيق الإجراء التالي: {penalty_action}.";
            
            $penaltyDesc = $this->getPenaltyDescription($data['applied_action'], $data['applied_value']);
            
            $letterContent = str_replace(
                ['{employee_name}', '{violation_name}', '{incident_date}', '{penalty_action}'],
                [$employee['full_name'], $vType['name'], $incidentDate, $penaltyDesc],
                $template
            );
            
            $data['letter_content'] = $letterContent;
            $data['status'] = 'pending_approval';

            // 4. Save Record
            $violation = parent::store($data);
            
            if ($violation && !isset($violation['error'])) {
                // 5. Initiate Workflow
                $workflowService = new WorkflowService();
                $workflowResult = $workflowService->generateFlow('EmployeeViolation', $violation['id'], 'EmployeeViolation', $employeeId);
                
                if ($workflowResult['status'] === 'success') {
                    $wfId = $workflowResult['approval_request_id'];
                    $this->db->prepare("UPDATE `employee_violations` SET workflow_id = :wf_id, status = 'pending_approval' WHERE id = :id")
                             ->execute([':wf_id' => $wfId, ':id' => $violation['id']]);
                    $violation['workflow_id'] = $wfId;
                    $violation['status'] = 'pending_approval';
                }
            }

            return $violation;
            
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    private function getPenaltyDescription($action, $value) {
        $actions = [
            'warning' => 'إنذار كتابي',
            'deduction_days' => "خصم $value يوم من الراتب",
            'deduction_amount' => "خصم مبلغ $value من الراتب"
        ];
        return $actions[$action] ?? 'إجراء تأديبي';
    }
}
