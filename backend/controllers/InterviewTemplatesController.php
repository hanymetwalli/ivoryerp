<?php
/**
 * Interview Templates Controller - كنترولر قوالب تقييم المقابلات
 * CRUD مع حفظ/تحديث العناصر (Nested Insert/Update)
 */

require_once __DIR__ . '/BaseController.php';

class InterviewTemplatesController extends BaseController {
    protected $table = 'interview_templates';

    protected $fillable = [
        'id', 'name', 'description', 'total_score', 'status'
    ];

    protected $searchable = ['name', 'description'];

    /**
     * عرض قائمة القوالب مع عدد بنود التقييم
     */
    public function index() {
        try {
            $params = getQueryParams();
            $page = max(1, intval($params['page'] ?? 1));
            $limit = min(1000, max(1, intval($params['limit'] ?? 100)));
            $offset = ($page - 1) * $limit;

            $sort = $params['sort'] ?? 'created_at';
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $sort)) $sort = 'created_at';
            $order = (isset($params['order']) && strtoupper($params['order']) === 'ASC') ? 'ASC' : 'DESC';

            $where = ' WHERE 1=1 ';
            $sqlParams = [];

            if (!empty($params['search'])) {
                $where .= " AND (t.name LIKE :search OR t.description LIKE :search2)";
                $sqlParams[':search'] = '%' . $params['search'] . '%';
                $sqlParams[':search2'] = '%' . $params['search'] . '%';
            }

            if (!empty($params['status'])) {
                $where .= " AND t.status = :filter_status";
                $sqlParams[':filter_status'] = $params['status'];
            }

            $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM interview_templates t" . $where);
            $countStmt->execute($sqlParams);
            $total = (int)$countStmt->fetch()['total'];

            $sql = "SELECT t.*,
                        (SELECT COUNT(*) FROM interview_template_items i WHERE i.template_id = t.id) as items_count
                    FROM interview_templates t
                    $where
                    ORDER BY t.`$sort` $order
                    LIMIT $limit OFFSET $offset";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($sqlParams);

            $templates = array_map([$this, 'processRow'], $stmt->fetchAll());

            if (!empty($templates)) {
                $templateIds = array_column($templates, 'id');
                $placeholders = implode(',', array_fill(0, count($templateIds), '?'));
                $itemsStmt = $this->db->prepare("SELECT * FROM interview_template_items WHERE template_id IN ($placeholders) ORDER BY sort_order ASC, created_at ASC");
                $itemsStmt->execute($templateIds);
                $allItems = array_map([$this, 'processRow'], $itemsStmt->fetchAll());

                $itemsByTemplate = [];
                foreach ($allItems as $item) {
                    $itemsByTemplate[$item['template_id']][] = $item;
                }

                foreach ($templates as &$t) {
                    $t['items'] = $itemsByTemplate[$t['id']] ?? [];
                }
            }

            return [
                'data' => $templates,
                'pagination' => [
                    'total' => $total,
                    'page' => $page,
                    'limit' => $limit,
                    'pages' => ($total > 0) ? ceil($total / $limit) : 1
                ]
            ];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * عرض قالب واحد مع جميع بنود التقييم
     */
    public function show($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM interview_templates WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $template = $stmt->fetch();

            if (!$template) {
                http_response_code(404);
                return ['error' => true, 'message' => 'Template not found'];
            }

            $template = $this->processRow($template);

            // Load items
            $itemsStmt = $this->db->prepare(
                "SELECT * FROM interview_template_items WHERE template_id = :id ORDER BY sort_order ASC, created_at ASC"
            );
            $itemsStmt->execute([':id' => $id]);
            $template['items'] = array_map([$this, 'processRow'], $itemsStmt->fetchAll());

            return $template;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * إنشاء قالب مع بنوده (Nested Insert)
     */
    public function store($data) {
        try {
            $this->db->beginTransaction();

            // 1. Save template
            $items = $data['items'] ?? [];
            unset($data['items']);

            // Calculate total_score from items
            $totalScore = 0;
            foreach ($items as $item) {
                $totalScore += floatval($item['max_score'] ?? 10);
            }
            $data['total_score'] = $totalScore;

            $result = parent::store($data);
            if (isset($result['error'])) {
                $this->db->rollBack();
                return $result;
            }

            $templateId = $result['id'];

            // 2. Save items
            $this->saveItems($templateId, $items);

            $this->db->commit();
            return $this->show($templateId);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * تحديث قالب مع بنوده (Delete + Re-insert)
     */
    public function update($id, $data) {
        try {
            $this->db->beginTransaction();

            $items = $data['items'] ?? null;
            unset($data['items']);

            // Recalculate total_score if items provided
            if ($items !== null) {
                $totalScore = 0;
                foreach ($items as $item) {
                    $totalScore += floatval($item['max_score'] ?? 10);
                }
                $data['total_score'] = $totalScore;
            }

            $result = parent::update($id, $data);
            if (isset($result['error'])) {
                $this->db->rollBack();
                return $result;
            }

            // Re-save items if provided
            if ($items !== null) {
                // Delete old items then insert new
                $this->db->prepare("DELETE FROM interview_template_items WHERE template_id = :id")
                         ->execute([':id' => $id]);
                $this->saveItems($id, $items);
            }

            $this->db->commit();
            return $this->show($id);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * حفظ بنود التقييم في الجدول الفرعي
     */
    private function saveItems($templateId, $items) {
        $sql = "INSERT INTO interview_template_items (id, template_id, criteria_name, max_score, sort_order)
                VALUES (:id, :template_id, :criteria_name, :max_score, :sort_order)";
        $stmt = $this->db->prepare($sql);

        foreach ($items as $index => $item) {
            $stmt->execute([
                ':id'            => $item['id'] ?? generateUUID(),
                ':template_id'   => $templateId,
                ':criteria_name' => $item['criteria_name'] ?? $item['name'] ?? 'معيار',
                ':max_score'     => $item['max_score'] ?? 10,
                ':sort_order'    => $item['sort_order'] ?? $index
            ]);
        }
    }
}
