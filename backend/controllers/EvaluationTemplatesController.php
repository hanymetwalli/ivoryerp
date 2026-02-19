<?php
/**
 * Evaluation Templates Controller
 * الكود الكامل والصحيح (الحفظ + التعديل + العرض)
 */

require_once __DIR__ . '/BaseController.php';

class EvaluationTemplatesController extends BaseController {
    protected $table = 'evaluation_templates';
    
    protected $fillable = [
        'id', 'name', 'description', 'period', 'position_id', 'department_id',
        'kpis', 'total_weight', 'status'
    ];
    
    protected $searchable = ['name', 'description'];

    // =========================================================================
    // 1. القراءة والعرض (Read & Show)
    // =========================================================================

    public function index() {
        $result = parent::index();
        
        if (isset($result['data']) && is_array($result['data'])) {
            foreach ($result['data'] as &$row) {
                $this->processTemplateRow($row);
            }
        }
        
        return $result;
    }

    public function show($id) {
        $result = parent::show($id);
        
        if ($result && !isset($result['error'])) {
            // 1. معالجة الصف الأساسي
            $this->processTemplateRow($result);
            
            // 2. جلب المؤشرات من الجدول الفرعي (TemplateKPIs)
            // هذا هو المصدر الحقيقي والدقيق للمؤشرات
            $stmt = $this->db->prepare("SELECT * FROM template_kpis WHERE template_id = :id ORDER BY created_at ASC");
            $stmt->execute([':id' => $id]);
            $childKpis = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // تحسين بيانات المؤشرات للعرض
            foreach ($childKpis as &$kpi) {
                if (isset($kpi['unit']) && !isset($kpi['measurement_unit'])) {
                    $kpi['measurement_unit'] = $kpi['unit'];
                }
            }

            // إذا وجدنا مؤشرات في الجدول الفرعي، نعتمد عليها
            if (!empty($childKpis)) {
                $result['kpis'] = $childKpis;
            }

            // 3. جلب الجدارات (Competencies)
            $this->loadCompetencies($id, $result);
        }
        
        return $result;
    }

    // دالة مساعدة لتحسين بيانات الصف (للعرض)
    private function processTemplateRow(&$row) {
        // 1. ترجمة الفترة (Period) لتفهمها الواجهة
        // الواجهة تتوقع evaluation_period لتعرض القيمة المختارة في القائمة المنسدلة
        if (isset($row['period'])) {
            $row['evaluation_period'] = $row['period']; 
        }

        // 2. فك تشفير JSON للمؤشرات
        if (isset($row['kpis']) && is_string($row['kpis'])) {
            $decoded = json_decode($row['kpis'], true);
            $row['kpis'] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : [];
        } elseif (!isset($row['kpis'])) {
            $row['kpis'] = [];
        }

        // 3. جلب أسماء الأقسام والوظائف
        if (!empty($row['department_id'])) {
            $stmt = $this->db->prepare("SELECT name FROM departments WHERE id = ?");
            $stmt->execute([$row['department_id']]);
            $d = $stmt->fetch();
            $row['department_name'] = $d ? $d['name'] : null;
        }
        if (!empty($row['position_id'])) {
            $stmt = $this->db->prepare("SELECT name FROM positions WHERE id = ?");
            $stmt->execute([$row['position_id']]);
            $p = $stmt->fetch();
            $row['position_name'] = $p ? $p['name'] : null;
        }
    }

    // دالة لجلب الجدارات
    private function loadCompetencies($templateId, &$result) {
        // نحاول أولاً من الجدول المباشر (competencies table)
        $stmt = $this->db->prepare("SELECT * FROM competencies WHERE template_id = :id");
        $stmt->execute([':id' => $templateId]);
        $comps = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // إذا لم نجد، نحاول من جدول الربط (template_competencies)
        if (empty($comps)) {
            $sql = "SELECT c.* FROM competencies c 
                    JOIN template_competencies tc ON c.id = tc.competency_id 
                    WHERE tc.template_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $templateId]);
            $comps = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        $result['competencies'] = $comps;
    }

    // =========================================================================
    // 2. الحفظ والتعديل (Store & Update)
    // =========================================================================

    public function store($data) {
        $data = $this->prepareData($data);
        
        $result = parent::store($data);

        if ($result && !isset($result['error'])) {
            // حفظ المؤشرات في الجدول الفرعي
            $kpiList = json_decode($data['kpis'], true);
            if (!empty($kpiList)) {
                $this->saveChildKPIs($result['id'], $kpiList);
            }
            
            // حفظ الجدارات (إذا أرسلت)
            if (isset($data['competencies'])) {
                $this->saveCompetencyLinks($result['id'], $data['competencies']);
            }

            return $this->show($result['id']);
        }
        
        return $result;
    }

    public function update($id, $data) {
        $data = $this->prepareData($data);
        
        $result = parent::update($id, $data);

        if ($result && !isset($result['error'])) {
            // تحديث المؤشرات
            $kpiList = json_decode($data['kpis'], true);
            if (!empty($kpiList)) {
                $this->saveChildKPIs($id, $kpiList);
            }

            // تحديث الجدارات
            if (isset($data['competencies'])) {
                $this->saveCompetencyLinks($id, $data['competencies']);
            }

            return $this->show($id);
        }

        return $result;
    }

    // دالة لتجهيز البيانات قبل الحفظ
    private function prepareData($data) {
        // 1. تصحيح الفترة (Sanitize Period)
        $period = $data['evaluation_period'] ?? $data['period'] ?? null;

        if ($period) {
            // تحويل لحروف صغيرة
            $period = strtolower(trim($period));
            // استبدال المسافات والشرطات السفلية بشرطة عادية (لحل مشكلة semi annual أو semi_annual)
            $period = str_replace([' ', '_'], '-', $period);

            // قائمة القيم المسموحة في قاعدة البيانات (ENUM)
            $allowed = ['annual', 'semi-annual', 'quarterly', 'monthly', 'probation'];
            
            // إذا كانت القيمة صالحة بعد التنظيف، نعتمدها
            if (in_array($period, $allowed)) {
                $data['period'] = $period;
            } else {
                // إذا كانت القيمة غير صالحة، يمكننا تعيين قيمة افتراضية (اختياري)
                // أو نتركها كما هي لتعطي خطأ واضح، لكن سنحاول اعتماد التنظيف
                $data['period'] = $period;
            }
        }

        // 2. تجهيز JSON للمؤشرات
        $kpiList = $data['kpis'] ?? $data['kpi_list'] ?? [];
        if (!empty($kpiList) && (is_array($kpiList) || is_object($kpiList))) {
            $data['kpis'] = json_encode($kpiList, JSON_UNESCAPED_UNICODE);
        } else {
            $data['kpis'] = json_encode([], JSON_UNESCAPED_UNICODE);
        }

        return $data;
    }

    // حفظ المؤشرات في الجدول الفرعي
    private function saveChildKPIs($templateId, $kpis) {
        try {
            $this->db->prepare("DELETE FROM template_kpis WHERE template_id = :id")->execute([':id' => $templateId]);

            $sql = "INSERT INTO template_kpis (id, template_id, name, description, weight, max_score, unit, target) 
                    VALUES (:id, :template_id, :name, :description, :weight, :max_score, :unit, :target)";
            $stmt = $this->db->prepare($sql);

            foreach ($kpis as $kpi) {
                $stmt->execute([
                    ':id' => $kpi['id'] ?? generateUUID(),
                    ':template_id' => $templateId,
                    ':name' => $kpi['name'] ?? $kpi['kpi_name'] ?? 'KPI',
                    ':description' => $kpi['description'] ?? '',
                    ':weight' => $kpi['weight'] ?? 0,
                    ':max_score' => $kpi['max_score'] ?? 100,
                    ':unit' => $kpi['unit'] ?? $kpi['measurement_unit'] ?? '',
                    ':target' => $kpi['target'] ?? $kpi['target_value'] ?? 0
                ]);
            }
        } catch (Exception $e) {
            error_log("Error saving child KPIs: " . $e->getMessage());
        }
    }

    // حفظ ربط الجدارات (اختياري، إذا كنت ترسل الجدارات مع القالب)
    private function saveCompetencyLinks($templateId, $competencies) {
        try {
            // هنا نفترض أننا نحدث جدول الربط template_competencies
            // تأكد أولاً أن الجدول موجود (لقد أنشأناه في الخطوة السابقة)
            $this->db->prepare("DELETE FROM template_competencies WHERE template_id = :id")->execute([':id' => $templateId]);
            
            $sql = "INSERT INTO template_competencies (id, template_id, competency_id) VALUES (:id, :tid, :cid)";
            $stmt = $this->db->prepare($sql);

            foreach ($competencies as $comp) {
                $compId = is_array($comp) ? ($comp['id'] ?? null) : $comp;
                if ($compId) {
                    $stmt->execute([
                        ':id' => generateUUID(),
                        ':tid' => $templateId,
                        ':cid' => $compId
                    ]);
                }
            }
        } catch (Exception $e) {
            error_log("Error linking competencies: " . $e->getMessage());
        }
    }
}
