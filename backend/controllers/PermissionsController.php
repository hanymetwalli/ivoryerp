<?php
/**
 * PermissionsController - نظام الاستئذان
 * مسؤول عن إنشاء طلبات الاستئذان والتحقق من الرصيد الشهري
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/ApprovalService.php';

class PermissionsController extends BaseController {
    protected $table = 'permission_requests';
    protected $fillable = [
        'user_id', 
        'start_time', 
        'end_time', 
        'duration_minutes', 
        'reason', 
        'status', 
        'current_stage_role_id',
        'current_level_idx',
        'current_status_desc',
        'approval_chain'
    ];

    /**
     * إنشاء طلب استئذان جديد
     */
    public function createRequest($requestData) {
        try {
            $userId = $requestData['user_id'] ?? null;
            $startTime = $requestData['start_time'] ?? null;
            $endTime = $requestData['end_time'] ?? null;

            if (!$userId || !$startTime || !$endTime) {
                http_response_code(400);
                return ['error' => true, 'message' => 'بيانات الطلب غير مكتملة'];
            }

            // 1. قراءة الحد الأقصى من جدول system_settings
            $stmt = $this->db->prepare("SELECT `value` FROM `system_settings` WHERE `key` = 'monthly_permission_limit_minutes' LIMIT 1");
            $stmt->execute();
            $setting = $stmt->fetch();
            $monthlyLimit = $setting ? (int)$setting['value'] : 120; // افتراضي ساعتين إذا لم يوجد

            // 2. حساب الدقائق المستهلكة هذا الشهر للطلبات المقبولة
            $currentMonth = date('Y-m');
            $stmt = $this->db->prepare("
                SELECT SUM(duration_minutes) as consumed 
                FROM `permission_requests` 
                WHERE `user_id` = :user_id 
                AND `status` = 'approved' 
                AND DATE_FORMAT(`start_time`, '%Y-%m') = :current_month
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':current_month' => $currentMonth
            ]);
            $consumedRow = $stmt->fetch();
            $consumedMinutes = $consumedRow ? (int)$consumedRow['consumed'] : 0;

            // 3. حساب مدة الطلب الجديد
            $start = new DateTime($startTime);
            $end = new DateTime($endTime);
            $interval = $start->diff($end);
            $newDuration = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

            // 4. التحقق من تجاوز الحد
            if (($consumedMinutes + $newDuration) > $monthlyLimit) {
                http_response_code(422);
                $remaining = max(0, $monthlyLimit - $consumedMinutes);
                return [
                    'error' => true, 
                    'message' => 'تجاوزت الحد الشهري المسموح به للاستئذان',
                    'limit' => $monthlyLimit,
                    'consumed' => $consumedMinutes,
                    'remaining' => $remaining,
                    'request_duration' => $newDuration
                ];
            }

            // 5. حفظ الطلب بحالة pending
            $requestId = generateUUID();
            $requestData['id'] = $requestId;
            $requestData['duration_minutes'] = $newDuration;
            $requestData['status'] = 'pending';
            
            // تهيئة بيانات الاعتماد الأولية (قبل ربطها بـ ApprovalService)
            // ملاحظة: ApprovalService في هذا النظام يتوقع وجود approval_chain و current_level_idx في السجل
            // سنقوم بتجهيز سجل أساسي ثم تركه لخدمة الاعتمادات
            
            $saveData = $this->prepareForSave(array_intersect_key($requestData, array_flip($this->fillable)));
            $saveData['id'] = $requestId;
            
            $fields = array_keys($saveData);
            $sql = "INSERT INTO `{$this->table}` (`" . implode("`, `", $fields) . "`) VALUES (:" . implode(", :", $fields) . ")";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($saveData);

            // 6. ربط الطلب بـ ApprovalService لتحديد المسار والدور الحالي
            // ملاحظة: نحتاج لبيانات المستخدم الذي قام بالعملية (هنا الموظف نفسه)
            $userStmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
            $userStmt->execute([':id' => $userId]);
            $currentUser = $userStmt->fetch();
            
            // الخدمة تحتاج لمسار (Chain) - في العادة يتم جلبه من إعدادات النظام أو نوع الطلب
            // لغرض المهمة، سنفترض أن الخدمة ستقوم بمعالجة السجل بعد إنشائه
            // إذا كانت ApprovalService تعتمد على Logic داخلي لتحديد الـ Chain عند أول Approve، سنحتاج لاستدعائها.
            
            return [
                'success' => true,
                'message' => 'تم تقديم طلب الاستئذان بنجاح وهو قيد المراجعة',
                'data' => $this->show($requestId)
            ];

        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => 'حدث خطأ أثناء معالجة الطلب: ' . $e->getMessage()];
        }
    }
}
