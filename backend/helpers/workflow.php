<?php
/**
 * Workflow Helper - نظام سلاسل الاعتماد المطورة
 */

class WorkflowHelper {
    private $db;

    public function __construct($db = null) {
        $this->db = $db ?: getDB();
    }

    /**
     * بناء سلسلة الاعتماد لموظف معين
     */
    public function getApprovalChain($employeeId, $requiresFinance = false, $entity = null) {
        $chain = [];
        
        // 1. جلب بيانات الموظف
        $stmt = $this->db->prepare("SELECT * FROM `employees` WHERE `id` = :id");
        $stmt->execute([':id' => $employeeId]);
        $employee = $stmt->fetch();
        
        if (!$employee) return [];

        $currentDeptId = $employee['department'];
        
        // 2. البحث في الهيكل الإداري (صعوداً)
        while ($currentDeptId) {
            // البحث عن القسم بالاسم أو المعرف (لان قاعدة البيانات فيها اسماء)
            $stmt = $this->db->prepare("SELECT * FROM `departments` WHERE `id` = :id OR `name` = :name");
            $stmt->execute([':id' => $currentDeptId, ':name' => $currentDeptId]);
            $dept = $stmt->fetch();
            
            if (!$dept) break;

            if ($dept['manager_id'] && $dept['manager_id'] !== $employeeId) {
                // جلب بيانات المدير
                $stmtMgr = $this->db->prepare("SELECT full_name, employee_number, position, email FROM `employees` WHERE `id` = :id");
                $stmtMgr->execute([':id' => $dept['manager_id']]);
                $manager = $stmtMgr->fetch();

                if ($manager) {
                    $chain[] = [
                        'level' => 'dept_manager_' . $dept['id'],
                        'level_name' => 'مدير ' . $dept['name'],
                        'approver_id' => $dept['manager_id'],
                        'approver_name' => $manager['full_name'],
                        'approval_status' => 'pending'
                    ];
                }
            }
            
            // صعود للقسم الأعلى
            $currentDeptId = $dept['parent_department_id'];
        }

        // 3. إضافة الموارد البشرية
        // نحاول البحث عن موظف يحمل دور hr_manager
        $stmtHR = $this->db->prepare("
            SELECT e.id, e.full_name FROM `employees` e
            JOIN `user_roles` ur ON e.id = ur.employee_id
            JOIN `roles` r ON ur.role_id = r.id
            WHERE (r.name = 'hr_manager' OR r.name = 'super_admin') AND ur.status = 'active'
            ORDER BY r.approval_level DESC
            LIMIT 1
        ");
        $stmtHR->execute();
        $hr = $stmtHR->fetch();
        if ($hr) {
            $chain[] = [
                'level' => 'hr_manager',
                'level_name' => 'الموارد البشرية',
                'approver_id' => $hr['id'],
                'approver_name' => $hr['full_name'],
                'approval_status' => 'pending'
            ];
        }

        // 4. إضافة المالية إذا طلب الأمر
        if ($requiresFinance) {
            $stmtFin = $this->db->prepare("
                SELECT e.id, e.full_name FROM `employees` e
                JOIN `user_roles` ur ON e.id = ur.employee_id
                JOIN `roles` r ON ur.role_id = r.id
                WHERE (r.name = 'finance_manager' OR r.name = 'super_admin') AND ur.status = 'active'
                LIMIT 1
            ");
            $stmtFin->execute();
            $fin = $stmtFin->fetch();
            if ($fin) {
                $chain[] = [
                    'level' => 'finance_manager',
                    'level_name' => 'مدير الحسابات',
                    'approver_id' => $fin['id'],
                    'approver_name' => $fin['full_name'],
                    'approval_status' => 'pending'
                ];
            }
        }

        return $chain;
    }
}
