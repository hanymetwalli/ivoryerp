<?php
/**
 * Competencies Controller
 * تم التحديث لحل مشكلة ربط القالب (template_id) وحقل التصنيف (category)
 */

require_once __DIR__ . '/BaseController.php';

class CompetenciesController extends BaseController {
    protected $table = 'competencies';
    
    protected $fillable = [
        'id', 'template_id', 'name', 'description', 'category', 'level_definitions', 'status'
    ];
    
    protected $searchable = ['name', 'description'];

    // دالة مخصصة لجلب قائمة التصنيفات الفريدة
    public function customAction($id, $action, $data = null) {
        if ($action === 'categories') {
            try {
                // جلب القيم الفريدة وغير الفارغة من عمود category
                $stmt = $this->db->query("SELECT DISTINCT category FROM competencies WHERE category IS NOT NULL AND category != '' ORDER BY category ASC");
                $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
                return ['data' => $categories];
            } catch (Exception $e) {
                return ['error' => true, 'message' => $e->getMessage()];
            }
        }
        return parent::customAction($id, $action, $data);
    }

    // دالة لتجهيز البيانات قبل الحفظ
    private function prepareData($data) {
        // 1. التأكد من وجود template_id
        // الواجهة قد ترسله في الـ Query Params أو في الـ Body
        if (empty($data['template_id']) && isset($_GET['template_id'])) {
            $data['template_id'] = $_GET['template_id'];
        }

        // 2. معالجة التصنيف (Category)
        // إذا كان فارغاً، يمكننا وضع قيمة افتراضية "General" أو تركه
        if (empty($data['category'])) {
            $data['category'] = 'General'; 
        }

        // 3. معالجة مستويات التقييم (BARS)
        $bars = [];
        
        // أ) إذا جاءت كـ JSON string أو Array في level_definitions
        if (isset($data['level_definitions'])) {
            if (is_string($data['level_definitions'])) {
                $decoded = json_decode($data['level_definitions'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $bars = $decoded;
                }
            } elseif (is_array($data['level_definitions'])) {
                $bars = $data['level_definitions'];
            }
        }

        // ب) إذا جاءت كحقول منفصلة (bars_level_X) - وهذا شائع في النماذج
        for ($i = 1; $i <= 5; $i++) {
            $key = "bars_level_$i";
            if (isset($data[$key])) {
                $bars["level_$i"] = $data[$key];
                unset($data[$key]); // تنظيف البيانات
            }
        }
        
        // ج) الحفظ النهائي في level_definitions
        if (!empty($bars)) {
            $data['level_definitions'] = json_encode($bars, JSON_UNESCAPED_UNICODE);
        }

        return $data;
    }

    public function store($data) {
        $data = $this->prepareData($data);
        return parent::store($data);
    }
    
    public function update($id, $data) {
        $data = $this->prepareData($data);
        return parent::update($id, $data);
    }

    // معالجة البيانات عند القراءة (للعرض في الواجهة)
    protected function processRow($row) {
        $row = parent::processRow($row);
        
        if (isset($row['level_definitions'])) {
            // تحويل JSON إلى مصفوفة
            if (is_string($row['level_definitions'])) {
                $decoded = json_decode($row['level_definitions'], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $row['level_definitions'] = $decoded;
                }
            }
            
            // تفكيك المستويات إلى حقول منفصلة للواجهة (bars_level_X)
            if (is_array($row['level_definitions'])) {
                foreach ($row['level_definitions'] as $key => $val) {
                    if (preg_match('/^level_(\d+)$/', $key, $m)) {
                        $row['bars_level_' . $m[1]] = $val;
                    }
                }
            }
        }
        
        return $row;
    }
}
