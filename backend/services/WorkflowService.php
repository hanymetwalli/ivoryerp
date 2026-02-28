<?php
/**
 * Workflow Service - محرك الاعتمادات وسير العمل الديناميكي
 */

class WorkflowService {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/../config/database.php';
        $this->db = getDB();
    }

    /**
     * جلب خطوات الاعتماد لطلب معين
     */
    public function getRequestSteps($requestId) {
        $stmt = $this->db->prepare("
            SELECT s.*, u.full_name as approver_name, r.name as role_name, r.description as role_arabic_name,
                   approver_emp.position as approver_job_title
            FROM approval_steps s
            LEFT JOIN users u ON s.approver_user_id = u.id
            LEFT JOIN roles r ON s.role_id = r.id
            LEFT JOIN employees approver_emp ON approver_emp.email = u.email
            WHERE s.approval_request_id = :id
            ORDER BY s.step_order ASC
        ");
        $stmt->execute([':id' => $requestId]);
        return $stmt->fetchAll();
    }

    public function generateFlow($modelType, $modelId, $requestType, $employeeId = null) {
        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction) $this->db->beginTransaction();

            // 1. جلب القالب النشط
            $stmt = $this->db->prepare("SELECT id FROM workflow_blueprints WHERE request_type = :type AND is_active = 1 LIMIT 1");
            $stmt->execute([':type' => $requestType]);
            $blueprint = $stmt->fetch();

            if (!$blueprint) {
                throw new Exception("لا يوجد قالب نشط لهذا النوع من الطلبات: " . $requestType);
            }

            // 2. إنشاء طلب الاعتماد
            $requestId = $this->generateUUID();
            $stmt = $this->db->prepare("
                INSERT INTO approval_requests (id, model_type, model_id, status) 
                VALUES (:id, :mtype, :mid, 'pending')
            ");
            $stmt->execute([
                ':id' => $requestId,
                ':mtype' => $modelType,
                ':mid' => $modelId
            ]);

            // 3. جلب الموظف المرتبط بالطلب (لأتمتة جلب المدير المباشر)
            // استخدام المعامل الممرر أولاً، وإن لم يوجد نحاول استنتاجه من الموديل
            $employeeId = $employeeId ?: $this->getEmployeeIdFromModel($modelType, $modelId);

            // 4. نسخ خطوات القالب
            $stmt = $this->db->prepare("SELECT * FROM workflow_blueprint_steps WHERE blueprint_id = :bid ORDER BY step_order ASC");
            $stmt->execute([':bid' => $blueprint['id']]);
            $steps = $stmt->fetchAll();

            // مصفوفة لمنع تكرار المعتمدين
            $assignedUsers = [];
            $actualOrder = 1;

            foreach ($steps as $step) {
                // === خطوة "مدير القسم" = سلسلة مديري الأقسام الأعلى ===
                if (isset($step['is_dept_manager']) && $step['is_dept_manager'] && $employeeId) {
                    // جلب سلسلة مديري الأقسام الأعلى (باستثناء القسم الجذر = مدير الشركة)
                    $chainManagers = $this->getParentDeptManagerChain($employeeId, $assignedUsers);
                    foreach ($chainManagers as $chainUserId) {
                        $assignedUsers[] = $chainUserId;
                        $this->db->prepare("
                            INSERT INTO approval_steps (id, approval_request_id, approver_user_id, role_id, step_order, status, is_name_visible)
                            VALUES (:id, :arid, :auid, :rid, :sorder, 'pending', :visible)
                        ")->execute([
                            ':id' => $this->generateUUID(),
                            ':arid' => $requestId,
                            ':auid' => $chainUserId,
                            ':rid' => $step['role_id'],
                            ':sorder' => $actualOrder++,
                            ':visible' => $step['show_approver_name'] ? 1 : 0
                        ]);
                    }
                    continue; // الانتقال للخطوة التالية في القالب
                }

                // === الخطوات العادية (مدير مباشر أو دور وظيفي) ===
                $approverUserId = null;
                
                if ($step['is_direct_manager'] && $employeeId) {
                    $approverUserId = $this->getDirectManagerUserId($employeeId);
                } elseif (!empty($step['role_id'])) {
                    $approverUserId = $this->getUserIdByRole($step['role_id']);
                }

                // منع التكرار: تخطي إذا كان المعتمد معيّن مسبقاً
                if ($approverUserId && in_array($approverUserId, $assignedUsers)) {
                    continue;
                }

                if ($approverUserId) {
                    $assignedUsers[] = $approverUserId;
                }

                $this->db->prepare("
                    INSERT INTO approval_steps (id, approval_request_id, approver_user_id, role_id, step_order, status, is_name_visible)
                    VALUES (:id, :arid, :auid, :rid, :sorder, 'pending', :visible)
                ")->execute([
                    ':id' => $this->generateUUID(),
                    ':arid' => $requestId,
                    ':auid' => $approverUserId,
                    ':rid' => $step['role_id'],
                    ':sorder' => $actualOrder++,
                    ':visible' => $step['show_approver_name'] ? 1 : 0
                ]);
            }

            if (!$inTransaction) $this->db->commit();
            return ['status' => 'success', 'approval_request_id' => $requestId];

        } catch (Exception $e) {
            if (!$inTransaction && $this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * معالجة إجراء المعتمد
     */
    public function processAction($stepId, $userId, $action, $comments) {
        // Run DDL checks outside of transaction if needed
        $this->ensureTablesExist();

        $inTransaction = $this->db->inTransaction();
        try {
            if (!$inTransaction) $this->db->beginTransaction();

            // 1. جلب بيانات الخطوة والتحقق من أنها الخطوة الحالية المعلقة
            $stmt = $this->db->prepare("SELECT * FROM approval_steps WHERE id = :id");
            $stmt->execute([':id' => $stepId]);
            $step = $stmt->fetch();

            if (!$step || $step['status'] !== 'pending') {
                throw new Exception("خطوة غير صالحة أو تمت معالجتها بالفعل");
            }

            // التأكد أن هذه هي أول خطوة معلقة فعلياً (منع تخطي الخطوات)
            $stmt = $this->db->prepare("
                SELECT id FROM approval_steps 
                WHERE approval_request_id = :rid AND status = 'pending' 
                ORDER BY step_order ASC LIMIT 1
            ");
            $stmt->execute([':rid' => $step['approval_request_id']]);
            $currentStepId = $stmt->fetch()['id'] ?? null;
            
            if ($currentStepId !== $stepId) {
                throw new Exception("هذه الخطوة ليست الخطوة الحالية المطلوبة للاعتماد");
            }

            // 2. التحقق من صلاحية المستخدم (Role Check)
            if (!empty($step['role_id'])) {
                $stmt = $this->db->prepare("
                    SELECT COUNT(*) as has_role 
                    FROM user_roles 
                    WHERE user_id = :uid AND role_id = :rid AND status = 'active'
                ");
                $stmt->execute([':uid' => $userId, ':rid' => $step['role_id']]);
                $roleCheck = $stmt->fetch();
                
                // إذا كان للمخطط دور محدد، يجب أن يمتلكه المستخدم (إلا إذا كان Admin، سيتم التحقق في الـ Controller)
                if ($roleCheck['has_role'] == 0) {
                    // ملاحظة: سنترك التحقق النهائي للـ Controller لأنه يمرر الـ userId
                }
            }

            // 3. تحديث الخطوة الحالية فقط
            $stmt = $this->db->prepare("
                UPDATE approval_steps 
                SET status = :status, comments = :comments, action_date = CURRENT_TIMESTAMP, approver_user_id = :uid
                WHERE id = :id
            ");
            $stmt->execute([
                ':status' => $action,
                ':comments' => $comments,
                ':uid' => $userId, 
                ':id' => $stepId
            ]);

            $requestId = $step['approval_request_id'];
            $finalStatus = 'pending';

            // 4. تحديث حالة الطلب الكلي
            if ($action === 'rejected') {
                $finalStatus = 'rejected';
                $this->updateRequestStatus($requestId, 'rejected');
            } elseif ($action === 'returned') {
                $finalStatus = 'returned';
                $this->updateRequestStatus($requestId, 'returned');
                // Also update the model status so the employee can see it's returned
                $this->updateModelStatus($requestId, 'returned');
            } elseif ($action === 'approved') {
                // التحقق هل هذه آخر خطوة؟
                $stmt = $this->db->prepare("SELECT MAX(step_order) as max_order FROM approval_steps WHERE approval_request_id = :rid");
                $stmt->execute([':rid' => $requestId]);
                $maxOrder = $stmt->fetch()['max_order'];

                if ($step['step_order'] >= $maxOrder) {
                    $finalStatus = 'approved';
                    $this->updateRequestStatus($requestId, 'approved');
                    // هنا يمكن إضافة logic لتحديث حالة الجدول الأساسي (Model) إلى Approved
                    $this->updateModelStatus($requestId, 'approved');
                } else {
                    // الطلب لا يزال pending ولكن انتقل للخطوة التالية
                }
            }
            if (!$inTransaction) $this->db->commit();
            return ['status' => 'success', 'final_status' => $finalStatus];

        } catch (Throwable $e) {
            if (!$inTransaction && $this->db->inTransaction()) $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * الاعتماد النهائي الاستثنائي (Force Approve)
     * ميزة للمدير لتخطي الخطوات المتبقية واعتماد الطلب مباشرة
     */
    public function forceApprove($requestId, $adminUserId) {
        $inTransaction = $this->db->inTransaction();
        error_log("⚡ WorkflowService::forceApprove - RequestID: $requestId, AdminUserID: $adminUserId");
        try {
            if (!$inTransaction) $this->db->beginTransaction();

            // 1. التأكد من وجود الطلب وأنه لا يزال معلقاً
            $stmt = $this->db->prepare("SELECT * FROM approval_requests WHERE id = :id FOR UPDATE");
            $stmt->execute([':id' => $requestId]);
            $request = $stmt->fetch();

            if (!$request) {
                error_log("❌ WorkflowService: Record not found for RequestID: $requestId");
                throw new Exception("الطلب غير موجود");
            }

            error_log("📄 WorkflowService: Request found. Status: " . $request['status']);

            if ($request['status'] !== 'pending') {
                error_log("❌ WorkflowService: Request is already " . $request['status']);
                throw new Exception("الطلب بالفعل في حالة: " . $request['status']);
            }

            // 2. تحديث الخطوات المعلقة فقط (Pending ONLY)
            // القاعدة الذهبية: لا يتم المساس بالخطوات المعتمدة سابقاً
            $stmt = $this->db->prepare("
                UPDATE approval_steps 
                SET status = 'approved', 
                    comments = 'اعتماد نهائي استثنائي (تأسيس النظام)', 
                    action_date = CURRENT_TIMESTAMP, 
                    approver_user_id = :uid
                WHERE approval_request_id = :rid AND status = 'pending'
            ");
            $success = $stmt->execute([
                ':uid' => $adminUserId,
                ':rid' => $requestId
            ]);
            
            $rowCount = $stmt->rowCount();
            error_log("🛠️ WorkflowService: Updated $rowCount pending steps.");

            // 3. تحديث حالة الطلب الكلي
            error_log("🔄 WorkflowService: Updating request status to 'approved'...");
            $this->updateRequestStatus($requestId, 'approved');

            // 4. تحديث حالة الموديل الأصلي (فعيل الخطافات)
            error_log("🔄 WorkflowService: Updating model status for model_type: " . $request['model_type']);
            $this->updateModelStatus($requestId, 'approved');

            if (!$inTransaction) {
                $this->db->commit();
                error_log("💳 WorkflowService: Transaction committed.");
            }
            return ['status' => 'success', 'message' => 'تم الاعتماد النهائي الاستثنائي بنجاح'];

        } catch (Throwable $e) {
            error_log("🚨 WorkflowService Exception: " . $e->getMessage());
            if (!$inTransaction && $this->db->inTransaction()) {
                $this->db->rollBack();
                error_log("🔙 WorkflowService: Transaction rolled back.");
            }
            throw $e;
        }
    }

    private function updateRequestStatus($requestId, $status) {
        $stmt = $this->db->prepare("UPDATE approval_requests SET status = :status WHERE id = :id");
        $stmt->execute([':status' => $status, ':id' => $requestId]);
    }

    /**
     * تحديث حالة الموديل الأصلي (اختياري لكن مفيد)
     */
    private function updateModelStatus($requestId, $status) {
        $stmt = $this->db->prepare("SELECT model_type, model_id FROM approval_requests WHERE id = :id");
        $stmt->execute([':id' => $requestId]);
        $req = $stmt->fetch();
        
        if ($req) {
            $table = $req['model_type'];
            
            // Map entity names to table names if they differ
            $tableName = $table;
            if ($table === 'EmployeeViolation') {
                $tableName = 'employee_violations';
            }
        
            // Handle models that use 'approval_status' instead of 'status' for workflow tracking
            // Trainings also use 'approval_status' primarily as 'status' is an ENUM with limited values
            $statusColumn = ($table === 'contracts' || $table === 'employee_trainings') ? 'approval_status' : 'status';
            
            // Map standard workflow statuses to performance_evaluations statues if needed
            // (e.g., 'approved' -> 'completed' or 'approved')

            // Custom Status Mappings before updating DB
            $dbStatus = $status;
            if ($table === 'EmployeeViolation' && $status === 'approved') {
                $dbStatus = 'applied'; // Because 'approved' is not a valid enum value for employee_violations table
            }
            if ($table === 'EmployeeViolation' && $status === 'rejected') {
                $dbStatus = 'revoked'; // In case is rejected
            }
            
            error_log("UpdateModelStatus: Table $tableName (was $table), Column $statusColumn, ID {$req['model_id']}, Status $dbStatus");
            
            $stmt = $this->db->prepare("UPDATE `$tableName` SET `$statusColumn` = :status WHERE id = :id");
            $success = $stmt->execute([':status' => $dbStatus, ':id' => $req['model_id']]);

            error_log("Workflow update: Table $table, Column $statusColumn, ID {$req['model_id']}, Status $dbStatus, Success: " . ($success ? 'YES' : 'NO'));

            // Special case for employee_trainings: 
            if ($table === 'employee_trainings') {
                error_log("Training record updated: ID [{$req['model_id']}] set to approval_status [$status]");
                if ($status === 'approved' || $status === 'completed') {
                    $this->db->prepare("UPDATE employee_trainings SET status = 'completed' WHERE id = :id")
                             ->execute([':id' => $req['model_id']]);
                    error_log("Training main status forced to 'completed' for ID {$req['model_id']}");
                }
            }

            // Map standard workflow statuses to performance_evaluations statues if needed
            // (e.g., 'approved' -> 'completed' or 'approved')
            
            // If fully approved, trigger specialized logic
            if ($status === 'approved') {
                $this->handleFinalApproval($table, $req['model_id']);
            }
        }
    }

    /**
     * تنفيذ مهام إضافية بعد الاعتماد النهائي (مثل تحديث رصيد الإجازات)
     */
    private function handleFinalApproval($modelType, $modelId) {
        if ($modelType === 'leave_requests') {
            // جلب بيانات الإجازة
            $stmt = $this->db->prepare("SELECT * FROM leave_requests WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            $leave = $stmt->fetch();

            if ($leave) {
                // تحديث رصيد الإجازات
                $this->updateLeaveBalance($leave['employee_id'], $leave['leave_type_id'], $leave['days_count']);
            }
        } elseif ($modelType === 'permission_requests') {
            // خطاف الاعتماد النهائي لطلبات الاستئذان
            // حساب ساعات الاستئذان المستهلكة ومقارنتها بالحد الأقصى
            $stmt = $this->db->prepare("SELECT * FROM permission_requests WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            $permission = $stmt->fetch();

            if ($permission) {
                $this->handlePermissionFinalApproval($permission);
            }
        } elseif ($modelType === 'overtime') {
            // خطاف الاعتماد النهائي للساعات الإضافية
            // إضافة مبلغ الساعات الإضافية كمكافأة على الراتب
            $stmt = $this->db->prepare("SELECT * FROM overtime WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            $overtime = $stmt->fetch();

            if ($overtime) {
                $this->handleOvertimeFinalApproval($overtime);
            }
        } elseif ($modelType === 'bonuses') {
            // خطاف الاعتماد النهائي للمكافآت
            $stmt = $this->db->prepare("SELECT * FROM bonuses WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            $bonus = $stmt->fetch();

            if ($bonus) {
                $this->handleBonusFinalApproval($bonus);
            }
        } elseif ($modelType === 'employee_trainings') {
            // خطاف الاعتماد النهائي لطلبات التدريب
            // المنطق الإداري: عند الاعتماد النهائي، يتم تحويل حالة السجل إلى 'completed' (حسب الـ ENUM في القاعدة)
            // وحالة الاعتماد إلى 'approved' للمتابعة في التقارير
            $this->db->prepare("UPDATE employee_trainings SET status = 'completed', approval_status = 'approved' WHERE id = :id")
                     ->execute([':id' => $modelId]);
            error_log("Training request $modelId fully approved and status updated to 'completed'.");
        } elseif ($modelType === 'resignations') {
            // خطاف الاعتماد النهائي للاستقالات
            $stmt = $this->db->prepare("SELECT * FROM resignations WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            $resignation = $stmt->fetch();

            if ($resignation) {
                // تحديث حالة الموظف وتاريخ نهاية الخدمة
                // المنطق الإداري: عند الاعتماد النهائي للاستقالة، يجب تحديث حقل status للموظف إلى 'resigned'
                $terminationDate = $resignation['last_working_day'] ?? $resignation['end_of_service_date'] ?? date('Y-m-d');
                
                $this->db->prepare("UPDATE employees SET status = 'resigned', termination_date = :tdate WHERE id = :eid")
                         ->execute([
                             ':tdate' => $terminationDate,
                             ':eid' => $resignation['employee_id']
                         ]);
                         
                error_log("Employee {$resignation['employee_id']} status updated to 'resigned' due to approved resignation $modelId. Termination date: $terminationDate");
            }
        } elseif ($modelType === 'performance_evaluations') {
            // Final approval hook for performance evaluations
            // For example, update the evaluation status to 'completed' if 'approved' isn't enough
            $this->db->prepare("UPDATE performance_evaluations SET status = 'completed' WHERE id = :id")
                     ->execute([':id' => $modelId]);
            error_log("Performance evaluation $modelId fully approved and marked as completed.");
        } elseif ($modelType === 'contracts') {
            // Final approval hook for contracts - Safe Versioning
            $stmt = $this->db->prepare("SELECT employee_id, start_date FROM contracts WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            $newContract = $stmt->fetch();

            if ($newContract) {
                $employeeId = $newContract['employee_id'];
                $startDate = $newContract['start_date'];
                
                // 1. Calculate the end date for the old contract (one day before the new one starts)
                $oldContractEndDate = date('Y-m-d', strtotime($startDate . ' -1 day'));

                // 2. Find the current active contract for the employee and update it to 'expired'
                $this->db->prepare("
                    UPDATE contracts 
                    SET status = 'expired', end_date = :end_date 
                    WHERE employee_id = :eid AND status = 'active' AND id != :new_id
                ")->execute([
                    ':end_date' => $oldContractEndDate,
                    ':eid' => $employeeId,
                    ':new_id' => $modelId
                ]);

                // 3. Activate the new contract
                $this->db->prepare("UPDATE contracts SET approval_status = 'approved', status = 'active' WHERE id = :id")
                         ->execute([':id' => $modelId]);
                
                error_log("Contract $modelId for employee $employeeId fully approved and activated. Previous active contracts expired.");
            }
        } elseif ($modelType === 'payroll_batches') {
            // Final approval hook for payroll batches
            // 1. Update batch status to 'approved'
            $this->db->prepare("UPDATE payroll_batches SET status = 'approved' WHERE id = :id")
                     ->execute([':id' => $modelId]);
            
            // 2. Update all associated payroll records to 'approved'
            $this->db->prepare("UPDATE payroll SET status = 'approved' WHERE batch_id = :bid")
                     ->execute([':bid' => $modelId]);
            
        } elseif ($modelType === 'EmployeeViolation') {
            // Final approval hook for disciplinary violations
            $this->db->prepare("UPDATE employee_violations SET status = 'applied' WHERE id = :id")
                     ->execute([':id' => $modelId]);
            error_log("WorkflowService: EmployeeViolation $modelId marked as applied.");
        }
    }

    private function updateLeaveBalance($employeeId, $leaveTypeId, $daysUsed) {
        $year = date('Y');
        
        // التحقق من وجود رصيد
        $stmt = $this->db->prepare("
            SELECT id, used_balance, remaining_balance FROM employee_leave_balances 
            WHERE employee_id = :eid AND leave_type_id = :ltid AND year = :year
        ");
        $stmt->execute([':eid' => $employeeId, ':ltid' => $leaveTypeId, ':year' => $year]);
        $balance = $stmt->fetch();
        
        if ($balance) {
            $stmt = $this->db->prepare("
                UPDATE employee_leave_balances 
                SET used_balance = used_balance + :plus_days,
                    remaining_balance = remaining_balance - :minus_days
                WHERE id = :id
            ");
            $stmt->execute([
                ':plus_days' => $daysUsed, 
                ':minus_days' => $daysUsed, 
                ':id' => $balance['id']
            ]);
        } else {
            // إنشاء سجل رصيد تلقائي إذا لم يكن موجوداً
            $stmt = $this->db->prepare("SELECT default_balance FROM leave_types WHERE id = :id");
            $stmt->execute([':id' => $leaveTypeId]);
            $type = $stmt->fetch();
            
            $defaultBalance = $type ? $type['default_balance'] : 0;
            
            $stmt = $this->db->prepare("
                INSERT INTO employee_leave_balances 
                (id, employee_id, leave_type_id, year, total_balance, used_balance, remaining_balance, created_at)
                VALUES (:uuid, :eid, :ltid, :year, :total, :used, :remaining, NOW())
            ");
            $stmt->execute([
                ':uuid' => $this->generateUUID(),
                ':eid' => $employeeId,
                ':ltid' => $leaveTypeId,
                ':year' => $year,
                ':total' => $defaultBalance,
                ':used' => $daysUsed,
                ':remaining' => $defaultBalance - $daysUsed
            ]);
        }
    }

    /**
     * خطاف ما بعد الاعتماد النهائي لطلبات الاستئذان
     * يحسب إجمالي الدقائق المعتمدة للموظف في نفس الشهر ويسجل التجاوز إن وُجد
     */
    private function handlePermissionFinalApproval($permission) {
        try {
            $employeeId = $permission['employee_id'];
            $requestDate = $permission['request_date'];
            $month = date('Y-m', strtotime($requestDate));

            // 1. قراءة الحد الأقصى من الإعدادات
            $stmt = $this->db->prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'monthly_permission_limit_minutes' LIMIT 1");
            $stmt->execute();
            $setting = $stmt->fetch();
            $monthlyLimit = ($setting && isset($setting['setting_value']) && (int)$setting['setting_value'] > 0)
                ? (int)$setting['setting_value'] : 240;

            // 2. حساب إجمالي الدقائق المعتمدة هذا الشهر
            $stmt = $this->db->prepare("
                SELECT SUM(duration_minutes) as total_mins
                FROM permission_requests
                WHERE employee_id = :eid AND status = 'approved'
                AND DATE_FORMAT(request_date, '%Y-%m') = :month
            ");
            $stmt->execute([':eid' => $employeeId, ':month' => $month]);
            $totalApproved = (int)($stmt->fetch()['total_mins'] ?? 0);

            // 3. إذا تجاوز الحد، سجل الفائض كخصم مالي
            if ($totalApproved > $monthlyLimit) {
                $excessMinutes = $totalApproved - $monthlyLimit;

                // Record excess in deductions (table should have been created by ensureTablesExist)

                // تحديث أو إدراج سجل الخصم
                $stmt = $this->db->prepare("
                    SELECT id FROM employee_permission_deductions
                    WHERE employee_id = :eid AND month = :month LIMIT 1
                ");
                $stmt->execute([':eid' => $employeeId, ':month' => $month]);
                $existing = $stmt->fetch();

                if ($existing) {
                    $this->db->prepare("
                        UPDATE employee_permission_deductions
                        SET total_approved_minutes = :total, excess_minutes = :excess,
                            monthly_limit_minutes = :lim, updated_at = NOW()
                        WHERE id = :id
                    ")->execute([
                        ':total' => $totalApproved,
                        ':excess' => $excessMinutes,
                        ':lim' => $monthlyLimit,
                        ':id' => $existing['id']
                    ]);
                } else {
                    $this->db->prepare("
                        INSERT INTO employee_permission_deductions
                        (id, employee_id, month, total_approved_minutes, monthly_limit_minutes, excess_minutes)
                        VALUES (:id, :eid, :month, :total, :lim, :excess)
                    ")->execute([
                        ':id' => $this->generateUUID(),
                        ':eid' => $employeeId,
                        ':month' => $month,
                        ':total' => $totalApproved,
                        ':lim' => $monthlyLimit,
                        ':excess' => $excessMinutes
                    ]);
                }

                error_log("Permission deduction recorded: Employee $employeeId, Month $month, Excess $excessMinutes mins");
            }
        } catch (Exception $e) {
            error_log('handlePermissionFinalApproval error: ' . $e->getMessage());
        }
    }

    /**
     * معالجة الاعتماد النهائي للساعات الإضافية
     * إضافة مبلغ الساعات الإضافية كمكافأة على الراتب
     */
    private function handleOvertimeFinalApproval($overtime) {
        try {
            $employeeId = $overtime['employee_id'];
            $date = $overtime['date'];
            $month = date('Y-m', strtotime($date));
            $totalAmount = (float)($overtime['total_amount'] ?? 0);

            // 1. حساب إجمالي مبالغ الساعات الإضافية المعتمدة هذا الشهر
            $stmt = $this->db->prepare("
                SELECT SUM(total_amount) as total_amount, SUM(hours) as total_hours
                FROM overtime
                WHERE employee_id = :eid AND status = 'approved'
                AND DATE_FORMAT(date, '%Y-%m') = :month
            ");
            $stmt->execute([':eid' => $employeeId, ':month' => $month]);
            $monthlyTotals = $stmt->fetch();
            $monthlyAmount = (float)($monthlyTotals['total_amount'] ?? 0);
            $monthlyHours = (float)($monthlyTotals['total_hours'] ?? 0);

            // Record overtime bonus (table should have been created by ensureTablesExist)

            // 3. تحديث أو إدراج سجل المكافأة
            $stmt = $this->db->prepare("
                SELECT id FROM employee_overtime_bonuses
                WHERE employee_id = :eid AND month = :month LIMIT 1
            ");
            $stmt->execute([':eid' => $employeeId, ':month' => $month]);
            $existing = $stmt->fetch();

            if ($existing) {
                $this->db->prepare("
                    UPDATE employee_overtime_bonuses
                    SET total_hours = :hours, total_amount = :amount, updated_at = NOW()
                    WHERE id = :id
                ")->execute([
                    ':hours' => $monthlyHours,
                    ':amount' => $monthlyAmount,
                    ':id' => $existing['id']
                ]);
            } else {
                $this->db->prepare("
                    INSERT INTO employee_overtime_bonuses
                    (id, employee_id, month, total_hours, total_amount)
                    VALUES (:id, :eid, :month, :hours, :amount)
                ")->execute([
                    ':id' => $this->generateUUID(),
                    ':eid' => $employeeId,
                    ':month' => $month,
                    ':hours' => $monthlyHours,
                    ':amount' => $monthlyAmount
                ]);
            }

            error_log("Overtime bonus recorded: Employee $employeeId, Month $month, Amount $monthlyAmount");
        } catch (Exception $e) {
            error_log('handleOvertimeFinalApproval error: ' . $e->getMessage());
        }
    }

    /**
     * معالجة الاعتماد النهائي للمكافآت
     * تجميع إجمالي المكافآت المعتمدة للشهر
     */
    private function handleBonusFinalApproval($bonus) {
        try {
            $employeeId = $bonus['employee_id'];
            $month = (int)($bonus['month'] ?? date('n'));
            $year = (int)($bonus['year'] ?? date('Y'));
            $monthStr = sprintf('%04d-%02d', $year, $month);

            // 1. حساب إجمالي مبالغ المكافآت المعتمدة هذا الشهر
            $stmt = $this->db->prepare("
                SELECT SUM(amount) as total_amount, COUNT(*) as total_count
                FROM bonuses
                WHERE employee_id = :eid AND status = 'approved'
                AND month = :month AND year = :year
            ");
            $stmt->execute([':eid' => $employeeId, ':month' => $month, ':year' => $year]);
            $monthlyTotals = $stmt->fetch();
            $monthlyAmount = (float)($monthlyTotals['total_amount'] ?? 0);
            $monthlyCount = (int)($monthlyTotals['total_count'] ?? 0);

            // Record bonus total (table should have been created by ensureTablesExist)

            // 3. تحديث أو إدراج سجل الإجمالي
            $stmt = $this->db->prepare("
                SELECT id FROM employee_bonus_totals
                WHERE employee_id = :eid AND month = :month LIMIT 1
            ");
            $stmt->execute([':eid' => $employeeId, ':month' => $monthStr]);
            $existing = $stmt->fetch();

            if ($existing) {
                $this->db->prepare("
                    UPDATE employee_bonus_totals
                    SET total_count = :cnt, total_amount = :amount, updated_at = NOW()
                    WHERE id = :id
                ")->execute([
                    ':cnt' => $monthlyCount,
                    ':amount' => $monthlyAmount,
                    ':id' => $existing['id']
                ]);
            } else {
                $this->db->prepare("
                    INSERT INTO employee_bonus_totals
                    (id, employee_id, month, total_count, total_amount)
                    VALUES (:id, :eid, :month, :cnt, :amount)
                ")->execute([
                    ':id' => $this->generateUUID(),
                    ':eid' => $employeeId,
                    ':month' => $monthStr,
                    ':cnt' => $monthlyCount,
                    ':amount' => $monthlyAmount
                ]);
            }

            error_log("Bonus total recorded: Employee $employeeId, Month $monthStr, Amount $monthlyAmount");
        } catch (Exception $e) {
            error_log('handleBonusFinalApproval error: ' . $e->getMessage());
        }
    }

    private function getEmployeeIdFromModel($modelType, $modelId) {
        try {
            $stmt = $this->db->prepare("SELECT employee_id FROM `$modelType` WHERE id = :id");
            $stmt->execute([':id' => $modelId]);
            return $stmt->fetch()['employee_id'] ?? null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * تصعيد: صعود شجرة الأقسام من قسم الموظف (مقدم الطلب) للبحث عن مدير قسم أعلى
     * @param string $employeeId - معرف الموظف مقدم الطلب
     * @param array $assignedUsers - قائمة المعتمدين المعينين مسبقاً
     * @return string|null - user_id لمدير القسم الأعلى
     */
    private function getParentDepartmentManagerUserId($employeeId, $assignedUsers = []) {
        try {
            // 1. جلب قسم الموظف مقدم الطلب
            $sql = "SELECT department FROM employees WHERE id = :eid LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':eid' => $employeeId]);
            $emp = $stmt->fetch();
            if (!$emp) return null;

            // 2. جلب القسم الحالي
            $sql = "SELECT id, parent_department_id FROM departments WHERE (id = :dept1 OR name = :dept2) LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':dept1' => $emp['department'], ':dept2' => $emp['department']]);
            $currentDept = $stmt->fetch();
            if (!$currentDept) return null;

            // 3. صعود شجرة الأقسام عبر parent_department_id
            $maxIterations = 10; // حماية من الحلقات اللانهائية
            $visitedDepts = [];
            $deptId = $currentDept['parent_department_id'];

            while ($deptId && $maxIterations-- > 0) {
                // منع الحلقات الدائرية
                if (in_array($deptId, $visitedDepts)) break;
                $visitedDepts[] = $deptId;

                // جلب القسم الأب ومديره
                $sql = "SELECT d.id, d.parent_department_id, d.manager_id FROM departments d WHERE d.id = :did LIMIT 1";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':did' => $deptId]);
                $parentDept = $stmt->fetch();
                if (!$parentDept) break;

                if ($parentDept['manager_id']) {
                    // تحويل manager_id (employee) إلى user_id
                    $sql = "SELECT u.id FROM users u
                            JOIN employees e ON e.email = u.email
                            WHERE e.id = :eid LIMIT 1";
                    $stmt = $this->db->prepare($sql);
                    $stmt->execute([':eid' => $parentDept['manager_id']]);
                    $managerUserId = $stmt->fetch()['id'] ?? null;

                    // إذا وجدنا مديراً غير مكرر، نعيده
                    if ($managerUserId && !in_array($managerUserId, $assignedUsers)) {
                        return $managerUserId;
                    }
                }

                // الانتقال للقسم الأعلى
                $deptId = $parentDept['parent_department_id'];
            }

            // 4. وصلنا للقسم الجذر (لا parent) - جلب مدير الشركة (أول admin)
            $sql = "SELECT u.id FROM users u
                    JOIN user_roles ur ON u.id = ur.user_id
                    JOIN roles r ON ur.role_id = r.id
                    WHERE r.name = 'admin' AND ur.status = 'active'
                    LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $admin = $stmt->fetch();
            if ($admin && !in_array($admin['id'], $assignedUsers)) {
                return $admin['id'];
            }

            return null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * البحث عن مستخدم بناءً على الدور (يدعم ID أو اسم الدور)
     */
    private function getUserIdByRole($roleId) {
        try {
            $sql = "SELECT u.id 
                    FROM users u
                    JOIN user_roles ur ON u.id = ur.user_id
                    JOIN roles r ON ur.role_id = r.id
                    WHERE (r.id = :rid1 OR r.name = :rid2)
                    AND ur.status = 'active'
                    LIMIT 1";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':rid1' => $roleId, ':rid2' => $roleId]);
            return $stmt->fetch()['id'] ?? null;
        } catch (Exception $e) {
            return null;
        }
    }

    private function getDirectManagerUserId($employeeId) {
        // البحث عن المدير المباشر (حالياً نعتبره مدير القسم لعدم وجود حقل مدير مباشر في جدول الموظفين)
        return $this->getDepartmentManagerUserId($employeeId);
    }

    private function getDepartmentManagerUserId($employeeId) {
        // البحث عن مدير القسم المرتبط بالموظف من جدول الأقسام
        $sql = "SELECT u.id 
                FROM employees e
                JOIN departments d ON (e.department = d.id OR e.department = d.name)
                JOIN employees mgr ON d.manager_id = mgr.id
                JOIN users u ON mgr.email = u.email
                WHERE e.id = :eid LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':eid' => $employeeId]);
        return $stmt->fetch()['id'] ?? null;
    }

    /**
     * سلسلة مديري الأقسام الأعلى من قسم الموظف حتى ما قبل القسم الجذر
     * القسم الجذر (parent_department_id = NULL) يُستثنى لأن مديره = مدير الشركة (له خطوة دور خاصة)
     *
     * @param string $employeeId
     * @param array $assignedUsers المعتمدون المعيّنون مسبقاً لتجنب التكرار
     * @return array قائمة user_ids لمديري الأقسام بالترتيب التصاعدي
     */
    private function getParentDeptManagerChain($employeeId, $assignedUsers = []) {
        $chain = [];
        try {
            // 1. جلب قسم الموظف
            $stmt = $this->db->prepare("SELECT department FROM employees WHERE id = :eid LIMIT 1");
            $stmt->execute([':eid' => $employeeId]);
            $emp = $stmt->fetch();
            if (!$emp) return $chain;

            // 2. جلب القسم الحالي ومعرف القسم الأب
            $stmt = $this->db->prepare("SELECT id, parent_department_id FROM departments WHERE (id = :d1 OR name = :d2) LIMIT 1");
            $stmt->execute([':d1' => $emp['department'], ':d2' => $emp['department']]);
            $currentDept = $stmt->fetch();
            if (!$currentDept) return $chain;

            // 3. صعود شجرة الأقسام عبر parent_department_id
            $deptId = $currentDept['parent_department_id'];
            $visitedDepts = [];
            $maxIterations = 10;

            while ($deptId && $maxIterations-- > 0) {
                if (in_array($deptId, $visitedDepts)) break; // حماية من الحلقات
                $visitedDepts[] = $deptId;

                // جلب القسم الأب
                $stmt = $this->db->prepare("SELECT id, parent_department_id, manager_id FROM departments WHERE id = :did LIMIT 1");
                $stmt->execute([':did' => $deptId]);
                $parentDept = $stmt->fetch();
                if (!$parentDept) break;

                // إذا كان القسم الأب هو الجذر (لا parent) → توقف
                // مدير القسم الجذر = مدير الشركة، وسيظهر في خطوة الدور "manager"
                if ($parentDept['parent_department_id'] === null) {
                    break;
                }

                // تحويل manager_id (employee) إلى user_id
                if ($parentDept['manager_id']) {
                    $stmt = $this->db->prepare("
                        SELECT u.id FROM users u
                        JOIN employees e ON e.email = u.email
                        WHERE e.id = :eid LIMIT 1
                    ");
                    $stmt->execute([':eid' => $parentDept['manager_id']]);
                    $managerUserId = $stmt->fetch()['id'] ?? null;

                    if ($managerUserId && !in_array($managerUserId, $assignedUsers) && !in_array($managerUserId, $chain)) {
                        $chain[] = $managerUserId;
                    }
                }

                // الانتقال للقسم الأعلى
                $deptId = $parentDept['parent_department_id'];
            }
        } catch (Exception $e) {
            error_log('getParentDeptManagerChain error: ' . $e->getMessage());
        }
        return $chain;
    }

    private function generateUUID() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    /**
     * التأكد من وجود الجداول اللازمة خارج سياق المعاملات (Transactions)
     */
    private function ensureTablesExist() {
        if ($this->db->inTransaction()) return;

        try {
            // جدول خصومات الاستئذان
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS employee_permission_deductions (
                    id VARCHAR(36) PRIMARY KEY,
                    employee_id VARCHAR(36) NOT NULL,
                    month VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
                    total_approved_minutes INT DEFAULT 0,
                    monthly_limit_minutes INT DEFAULT 240,
                    excess_minutes INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_emp_month (employee_id, month)
                )
            ");

            // جدول مكافآت الساعات الإضافية
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS employee_overtime_bonuses (
                    id VARCHAR(36) PRIMARY KEY,
                    employee_id VARCHAR(36) NOT NULL,
                    month VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
                    total_hours DECIMAL(8,2) DEFAULT 0,
                    total_amount DECIMAL(12,2) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_emp_month (employee_id, month)
                )
            ");

            // جدول إجمالي المكافآت
            $this->db->exec("
                CREATE TABLE IF NOT EXISTS employee_bonus_totals (
                    id VARCHAR(36) PRIMARY KEY,
                    employee_id VARCHAR(36) NOT NULL,
                    month VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',
                    total_count INT DEFAULT 0,
                    total_amount DECIMAL(12,2) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_emp_month (employee_id, month)
                )
            ");
        } catch (Exception $e) {
            error_log('ensureTablesExist error: ' . $e->getMessage());
        }
    }
}
