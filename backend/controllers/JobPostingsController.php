<?php
/**
 * Job Postings Controller - كنترولر الوظائف المتاحة
 * CRUD + عرض عدد المتقدمين لكل وظيفة
 */

require_once __DIR__ . '/BaseController.php';

class JobPostingsController extends BaseController {
    protected $table = 'job_postings';

    protected $fillable = [
        'id', 'title', 'department_id', 'description', 'requirements',
        'employment_type', 'status', 'deadline'
    ];

    protected $searchable = ['title', 'description', 'requirements'];

    /**
     * عرض قائمة الوظائف مع عدد المتقدمين واسم القسم
     */
    public function index() {
        try {
            $params = getQueryParams();
            $page = max(1, intval($params['page'] ?? 1));
            $limit = min(1000, max(1, intval($params['limit'] ?? 100)));
            $offset = ($page - 1) * $limit;

            $sort = $params['sort'] ?? $this->defaultSort;
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $sort)) $sort = $this->primaryKey;
            $order = (isset($params['order']) && strtoupper($params['order']) === 'ASC') ? 'ASC' : 'DESC';

            $where = ' WHERE 1=1 ';
            $sqlParams = [];

            // Search
            if (!empty($params['search'])) {
                $where .= " AND (jp.title LIKE :search OR jp.description LIKE :search2)";
                $sqlParams[':search'] = '%' . $params['search'] . '%';
                $sqlParams[':search2'] = '%' . $params['search'] . '%';
            }

            // Filter by status
            if (!empty($params['status'])) {
                $where .= " AND jp.status = :filter_status";
                $sqlParams[':filter_status'] = $params['status'];
            }

            // Count
            $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM job_postings jp" . $where);
            $countStmt->execute($sqlParams);
            $total = (int)$countStmt->fetch()['total'];

            // Main query with applications count and department name
            $sql = "SELECT jp.*, 
                        d.name as department_name,
                        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_posting_id = jp.id) as applications_count
                    FROM job_postings jp
                    LEFT JOIN departments d ON d.id = jp.department_id
                    $where
                    ORDER BY jp.`$sort` $order
                    LIMIT $limit OFFSET $offset";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($sqlParams);

            return [
                'data' => array_map([$this, 'processRow'], $stmt->fetchAll()),
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
     * عرض وظيفة واحدة مع عدد المتقدمين
     */
    public function show($id) {
        try {
            $sql = "SELECT jp.*, 
                        d.name as department_name,
                        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_posting_id = jp.id) as applications_count
                    FROM job_postings jp
                    LEFT JOIN departments d ON d.id = jp.department_id
                    WHERE jp.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $data = $stmt->fetch();

            if (!$data) {
                http_response_code(404);
                return ['error' => true, 'message' => 'Job posting not found'];
            }

            return $this->processRow($data);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}
