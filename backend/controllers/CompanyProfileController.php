<?php
/**
 * Company Profile Controller - بيانات المنشأة
 */

require_once __DIR__ . '/BaseController.php';

class CompanyProfileController extends BaseController {
    protected $table = 'company_profile';
    
    protected $fillable = [
        'id', 'company_name', 'address', 'phones', 'email', 'website', 'manager_id', 'logo_path'
    ];
    
    public function index() {
        try {
            // جلب أول سجل (عادة ما يكون واحد فقط للمنشأة)
            $sql = "SELECT cp.*, e.full_name as manager_name 
                    FROM company_profile cp
                    LEFT JOIN employees e ON cp.manager_id = e.id
                    LIMIT 1";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $data = $stmt->fetch();
            
            if (!$data) {
                return ['error' => true, 'message' => 'Company profile not found'];
            }
            
            return $this->processRow($data);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * تحديث بيانات المنشأة
     * بما أن الجدول يحتوي على سجل واحد، سنقوم بتحديث هذا السجل بغض النظر عن الـ ID المرسل
     */
    public function update($id, $data) {
        try {
            // جلب السجل الحالي للتأكد من وجوده
            $existing = $this->index();
            if (isset($existing['error'])) {
                // إذا لم يوجد، نقوم بإنشائه (اختياري، لكن هنا نكتفي بالتحديث)
                return $existing;
            }

            $currentId = $existing['id'];
            
            // تنظيف البيانات
            $cleanData = array_intersect_key($data, array_flip($this->fillable));
            if (isset($cleanData['id'])) unset($cleanData['id']);
            
            // الهواتف يجب أن تكون JSON
            if (isset($cleanData['phones']) && !is_string($cleanData['phones'])) {
                $cleanData['phones'] = json_encode($cleanData['phones']);
            }

            // استخدام دالة التحديث من الكلاس الأب
            return parent::update($currentId, $cleanData);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}
