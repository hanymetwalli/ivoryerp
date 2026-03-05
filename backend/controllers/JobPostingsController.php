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
            $access = $this->getUserAccess();
            $params = getQueryParams();
            
            $where = ' WHERE 1=1 ';
            $sqlParams = [];

            if (!$access) {
                // Public access (Careers.jsx)
                $where .= " AND jp.status = 'open'";
            } else {
                // Logged in: Check permissions
                if (!$access['is_admin']) {
                    $scope = $access['data_scopes']['view_jobs'] ?? null;
                    if (!$scope && !in_array('view_jobs', $access['permissions'])) {
                        return response_error("ليس لديك صلاحية لعرض الوظائف", 403);
                    }
                    
                    if ($scope === 'department') {
                        $deptId = $access['department_id'];
                        if ($deptId) {
                            $where .= " AND jp.department_id = :user_dept_id";
                            $sqlParams[':user_dept_id'] = $deptId;
                        } else {
                            $where .= " AND 1=0";
                        }
                    }
                }
            }

            $page = max(1, intval($params['page'] ?? 1));
            $limit = min(1000, max(1, intval($params['limit'] ?? 100)));
            $offset = ($page - 1) * $limit;

            $sort = $params['sort'] ?? $this->defaultSort;
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $sort)) $sort = $this->primaryKey;
            $order = (isset($params['order']) && strtoupper($params['order']) === 'ASC') ? 'ASC' : 'DESC';

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
            $access = $this->getUserAccess();
            // Optional: careers showing public job info might not provide access info
            
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

            // Scoping check for show
            if ($access) { // Only apply scope if user is authenticated
                if (!$access['is_admin']) {
                    $scope = $access['data_scopes']['view_jobs'] ?? null;
                    if (!$scope && !in_array('view_jobs', $access['permissions'])) {
                        return response_error("ليس لديك صلاحية لعرض هذه الوظيفة", 403);
                    }

                    if ($scope === 'department') {
                        $deptId = $access['department_id'];
                        if ($deptId && $data['department_id'] !== $deptId) {
                            return response_error("ليس لديك صلاحية لعرض وظائف خارج قسمك", 403);
                        }
                    }
                }
            } else {
                // If not authenticated, ensure only 'open' jobs are viewable
                if ($data['status'] !== 'open') {
                    return response_error("هذه الوظيفة غير متاحة للعرض العام", 403);
                }
            }
            
            return $this->processRow($data);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    public function store($data) {
        $user = $this->authenticate();
        $this->checkPermission($user['id'], 'create_jobs');
        return parent::store($data);
    }

    public function update($id, $data) {
        $user = $this->authenticate();
        $this->checkPermission($user['id'], 'edit_jobs');
        return parent::update($id, $data);
    }

    public function destroy($id) {
        $user = $this->authenticate();
        $this->checkPermission($user['id'], 'delete_jobs');
        return parent::destroy($id);
    }
}
