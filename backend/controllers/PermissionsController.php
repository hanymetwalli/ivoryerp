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
        'request_date',
        'start_time', 
        'end_time', 
        'duration_minutes', 
        'status', 
        'current_stage_role_id',
        'reason' // Added back as DB requires it
    ];

    /**
     * إنشاء طلب استئذان جديد
     */
    public function createRequest($requestData) {
        try {
            $userId = $requestData['user_id'] ?? null;
            $startTime = $requestData['start_time'] ?? null;
            $endTime = $requestData['end_time'] ?? null;

            // 1. التحقق من صحة البيانات الأساسية
            if (!$userId || !$startTime || !$endTime) {
                http_response_code(400);
                return ['error' => true, 'message' => 'بيانات الطلب غير مكتملة (user_id, start_time, end_time مطلوبة)'];
            }

            // 2. حساب مدة الطلب والتحقق من المنطق الزمني
            $start = new DateTime($startTime);
            $end = new DateTime($endTime);
            
            if ($end <= $start) {
                http_response_code(422);
                return ['error' => true, 'message' => 'وقت النهاية يجب أن يكون بعد وقت البداية'];
            }

            $interval = $start->diff($end);
            $newDuration = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;

            if ($newDuration <= 0) {
                 http_response_code(422);
                 return ['error' => true, 'message' => 'مدة الاستئذان غير صالحة'];
            }

            // 3. قراءة الحد الأقصى من جدول system_settings
            $stmt = $this->db->prepare("SELECT `setting_value` FROM `system_settings` WHERE `setting_key` = 'monthly_permission_limit_minutes' LIMIT 1");
            $stmt->execute();
            $setting = $stmt->fetch();
            // استخدام 120 دقيقة كحد افتراضي إذا لم يتم إعداد النظام
            $monthlyLimit = ($setting && isset($setting['setting_value'])) ? (int)$setting['setting_value'] : 120;

            // 4. حساب الدقائق المستهلكة هذا الشهر للطلبات المقبولة (Approved only)
            // نستخدم DATE_FORMAT للتحقق من الشهر والسنة الحالية
            $currentMonth = date('Y-m');
            $stmt = $this->db->prepare("
                SELECT SUM(duration_minutes) as consumed 
                FROM `permission_requests` 
                WHERE `user_id` = :user_id 
                AND `status` = 'approved' 
                AND DATE_FORMAT(`request_date`, '%Y-%m') = :current_month
            ");
            
            $stmt->execute([
                ':user_id' => $userId,
                ':current_month' => $currentMonth
            ]);
            $consumedRow = $stmt->fetch();
            $consumedMinutes = $consumedRow ? (int)$consumedRow['consumed'] : 0;

            // 5. التحقق من تجاوز الحد
            if (($consumedMinutes + $newDuration) > $monthlyLimit) {
                http_response_code(422);
                $remaining = max(0, $monthlyLimit - $consumedMinutes);
                return [
                    'error' => true, 
                    'message' => 'عذراً، هذا الطلب يتجاوز رصيد الاستئذان الشهري المسموح به.',
                    'details' => [
                        'limit_minutes' => $monthlyLimit,
                        'consumed_minutes' => $consumedMinutes,
                        'remaining_minutes' => $remaining,
                        'requested_minutes' => $newDuration,
                        'status' => 'limit_exceeded'
                    ]
                ];
            }

            // 6. تجهيز بيانات الدور (Manager Role ID)
            // نبحث عن الدور المسمى 'manager'
            $roleStmt = $this->db->prepare("SELECT id FROM roles WHERE name = 'manager' LIMIT 1");
            $roleStmt->execute();
            $managerRole = $roleStmt->fetch();
            $managerRoleId = $managerRole ? $managerRole['id'] : null;

            // إذا لم نجد دور 'manager'، ربما نستخدم 'department_manager' أو نتركها فارغة، 
            // لكن حسب التعليمات يجب استخدام 'manager'. سنستخدم الـ ID إذا وجد.
            if (!$managerRoleId) {
                // Fallback logic or error? 
                // سنحاول البحث عن 'admin' كبديل مؤقت لتجنب الخطأ، أو نرجع خطأ.
                // لكن الأفضل احترام التعليمات وإرجاع خطأ إذا لم يوجد.
                // Http 500 configuration error
                 http_response_code(500);
                 return ['error' => true, 'message' => 'Configuration Error: Role "manager" not found in system.'];
            }

            // 7. تجهيز البيانات للحفظ عبر BaseController::store
            $dataToStore = [
                'user_id' => $userId,
                'request_date' => date('Y-m-d', strtotime($startTime)),
                'start_time' => $start->format('H:i:s'),
                'end_time' => $end->format('H:i:s'),
                'duration_minutes' => $newDuration,
                'reason' => $requestData['reason'] ?? null,
                'status' => 'pending',
                'current_stage_role_id' => $managerRoleId, 
            ];

            // 7. الحفظ باستخدام دالة store من BaseController
            // هذه الدالة ستتولى توليد UUID إذا لم يرسل، وتسجيل Audit Log
            $storedRequest = $this->store($dataToStore);

            if (isset($storedRequest['error']) && $storedRequest['error']) {
                return $storedRequest;
            }

            return [
                'success' => true,
                'message' => 'تم تقديم طلب الاستئذان بنجاح',
                'data' => $storedRequest
            ];

        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => 'حدث خطأ غير متوقع: ' . $e->getMessage()];
        }
    }
}
