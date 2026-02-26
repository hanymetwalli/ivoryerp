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
        'status', 'letter_content', 'notes'
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

        // Get user role for scoping
        $stmt = $this->db->prepare("
            SELECT r.*, ur.employee_id 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :user_id AND ur.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([':user_id' => $userId]);
        $roleData = $stmt->fetch();

        $where = " WHERE 1=1 ";
        $params = [];

        // Admin check (Global admin or HR admin role)
        $isAdmin = ($user['email'] === 'admin@ivory.com' || (isset($roleData['permissions']) && (strpos($roleData['permissions'], 'view_all_violations') !== false || strpos($roleData['permissions'], 'all') !== false)));

        if (!$isAdmin) {
            $isDeptManager = (isset($roleData['permissions']) && strpos($roleData['permissions'], 'view_department_violations') !== false);
            
            if ($isDeptManager && isset($roleData['employee_id'])) {
                // Get department of the manager
                $stmt = $this->db->prepare("SELECT department FROM employees WHERE id = :id");
                $stmt->execute([':id' => $roleData['employee_id']]);
                $dept = $stmt->fetchColumn();
                
                if ($dept) {
                    $where .= " AND employee_id IN (SELECT id FROM employees WHERE department = :dept)";
                    $params[':dept'] = $dept;
                }
            } else if (isset($roleData['employee_id'])) {
                // Regular employee seeing own records
                $where .= " AND employee_id = :emp_id";
                $params[':emp_id'] = $roleData['employee_id'];
            } else {
                // No employee link, return nothing
                $where .= " AND 1=0";
            }
        }

        // Parent index logic manually to support our custom where
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(1000, max(1, intval($_GET['limit'] ?? 100)));
        $offset = ($page - 1) * $limit;
        $order = (isset($_GET['order']) && strtoupper($_GET['order']) === 'ASC') ? 'ASC' : 'DESC';

        $totalStmt = $this->db->prepare("SELECT COUNT(*) FROM `{$this->table}`" . $where);
        $totalStmt->execute($params);
        $total = $totalStmt->fetchColumn();

        $stmt = $this->db->prepare("SELECT * FROM `{$this->table}`" . $where . " ORDER BY incident_date $order LIMIT $limit OFFSET $offset");
        $stmt->execute($params);
        $data = array_map([$this, 'processRow'], $stmt->fetchAll());

        return [
            'data' => $data,
            'pagination' => ['total' => (int)$total, 'page' => $page, 'limit' => $limit, 'pages' => ceil($total / $limit)]
        ];
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
                $workflowResult = $workflowService->generateFlow('EmployeeViolation', $violation['id'], 'EmployeeViolation');
                
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
