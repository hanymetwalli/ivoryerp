<?php
/**
 * Job Applications Controller - كنترولر طلبات التوظيف (المرشحون)
 * CRUD + ترتيب المرشحين حسب درجة المقابلة + رفع السيرة الذاتية
 */

require_once __DIR__ . '/BaseController.php';

class JobApplicationsController extends BaseController {
    protected $table = 'job_applications';

    protected $fillable = [
        'id', 'job_posting_id', 'full_name', 'date_of_birth', 'gender',
        'marital_status', 'phones', 'email', 'address', 'current_job',
        'qualifications', 'bio', 'cv_path', 'interview_score', 'status', 'notes'
    ];

    protected $searchable = ['full_name', 'email', 'current_job', 'address'];

    protected $casts = [
        'phones' => 'array',
        'qualifications' => 'array',
        'experiences' => 'array'
    ];

    /**
     * عرض قائمة المرشحين مع دعم الترتيب حسب interview_score تنازلياً
     */
    public function index() {
        try {
            $params = getQueryParams();
            $page = max(1, intval($params['page'] ?? 1));
            $limit = min(1000, max(1, intval($params['limit'] ?? 100)));
            $offset = ($page - 1) * $limit;

            $where = ' WHERE 1=1 ';
            $sqlParams = [];

            // Search
            if (!empty($params['search'])) {
                $where .= " AND (a.full_name LIKE :search OR a.email LIKE :search2 OR a.current_job LIKE :search3)";
                $sqlParams[':search'] = '%' . $params['search'] . '%';
                $sqlParams[':search2'] = '%' . $params['search'] . '%';
                $sqlParams[':search3'] = '%' . $params['search'] . '%';
            }

            // Filter by job_posting_id
            if (!empty($params['job_posting_id'])) {
                $where .= " AND a.job_posting_id = :job_posting_id";
                $sqlParams[':job_posting_id'] = $params['job_posting_id'];
            }

            // Filter by status
            if (!empty($params['status'])) {
                $where .= " AND a.status = :filter_status";
                $sqlParams[':filter_status'] = $params['status'];
            }

            // Filter by gender
            if (!empty($params['gender'])) {
                $where .= " AND a.gender = :filter_gender";
                $sqlParams[':filter_gender'] = $params['gender'];
            }

            // Sorting logic
            // If sort=interview_score, order by score DESC with NULLs last
            $sort = $params['sort'] ?? 'created_at';
            $order = (isset($params['order']) && strtoupper($params['order']) === 'ASC') ? 'ASC' : 'DESC';

            if ($sort === 'interview_score') {
                $orderClause = "a.interview_score IS NULL ASC, a.interview_score $order";
            } else {
                if (!preg_match('/^[a-zA-Z0-9_]+$/', $sort)) $sort = 'created_at';
                $orderClause = "a.`$sort` $order";
            }

            // Count
            $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM job_applications a" . $where);
            $countStmt->execute($sqlParams);
            $total = (int)$countStmt->fetch()['total'];

            // Main query with job posting title
            $sql = "SELECT a.*, jp.title as job_title
                    FROM job_applications a
                    LEFT JOIN job_postings jp ON jp.id = a.job_posting_id
                    $where
                    ORDER BY $orderClause
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
     * عرض طلب توظيف واحد مع اسم الوظيفة
     */
    public function show($id) {
        try {
            $sql = "SELECT a.*, jp.title as job_title
                    FROM job_applications a
                    LEFT JOIN job_postings jp ON jp.id = a.job_posting_id
                    WHERE a.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $data = $stmt->fetch();

            if (!$data) {
                http_response_code(404);
                return ['error' => true, 'message' => 'Application not found'];
            }

            return $this->processRow($data);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    public function store($data) {
        // Handle CV file upload if present
        if (isset($_FILES['cv_file']) && $_FILES['cv_file']['error'] === UPLOAD_ERR_OK) {
            $data['cv_path'] = $this->handleCvUpload($_FILES['cv_file']);
        } elseif (isset($_FILES['cv']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
            // Frontend is sending it as "cv"
            $data['cv_path'] = $this->handleCvUpload($_FILES['cv']);
        }

        // Fix: BaseController defaults status to 'active', but our enum requires 'new'
        if (empty($data['status'])) {
            $data['status'] = 'new';
        }

        return parent::store($data);
    }

    /**
     * تحديث طلب توظيف مع دعم رفع CV جديد
     */
    public function update($id, $data) {
        // Handle CV file upload if present
        if (isset($_FILES['cv_file']) && $_FILES['cv_file']['error'] === UPLOAD_ERR_OK) {
            $data['cv_path'] = $this->handleCvUpload($_FILES['cv_file']);
        }

        return parent::update($id, $data);
    }

    /**
     * Custom actions: update-score
     */
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'update-score':
                return $this->updateInterviewScore($id, $data);
            default:
                return parent::customAction($id, $action, $data);
        }
    }

    /**
     * تحديث درجة المقابلة (يُستدعى من نظام المقابلات)
     */
    private function updateInterviewScore($id, $data) {
        try {
            $score = $data['score'] ?? $data['interview_score'] ?? null;
            if ($score === null) {
                http_response_code(400);
                return ['error' => true, 'message' => 'Score is required'];
            }

            $stmt = $this->db->prepare("UPDATE job_applications SET interview_score = :score WHERE id = :id");
            $stmt->execute([':score' => $score, ':id' => $id]);

            return $this->show($id);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * رفع ملف السيرة الذاتية
     */
    private function handleCvUpload($file) {
        $uploadDir = __DIR__ . '/../../uploads/cvs/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
        if (!in_array(strtolower($ext), $allowed)) {
            throw new Exception('Invalid file type. Allowed: ' . implode(', ', $allowed));
        }

        $fileName = 'cv_' . time() . '_' . generateUUID() . '.' . $ext;
        $filePath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception('Failed to upload CV file');
        }

        return '/uploads/cvs/' . $fileName;
    }
}
