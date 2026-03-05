<?php
/**
 * Interviews Controller - كنترولر المقابلات والتقييم الفعلي
 * 
 * عند حفظ مقابلة:
 * 1. يحفظ المقابلة في جدول interviews
 * 2. يحفظ تقييمات البنود في interview_evaluations
 * 3. يحسب total_score بجمع الدرجات الممنوحة
 * 4. (Trigger) يحدّث interview_score في job_applications ويغير الحالة إلى 'interview'
 */

require_once __DIR__ . '/BaseController.php';

class InterviewsController extends BaseController {
    protected $table = 'interviews';

    protected $fillable = [
        'id', 'job_application_id', 'template_id', 'interviewer_id',
        'interview_date', 'total_score', 'notes', 'status'
    ];

    protected $searchable = ['notes'];

    /**
     * عرض قائمة المقابلات مع بيانات المرشح والقالب
     */
    public function index() {
        try {
            $access = $this->getUserAccess();
            if (!$access) return response_error("Unauthorized", 401);

            if (!$access['is_admin']) {
                $scope = $access['data_scopes']['view_interviews'] ?? null;
                if (!$scope && !in_array('view_interviews', $access['permissions'])) {
                    return response_error("ليس لديك صلاحية لعرض المقابلات", 403);
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

            $params = getQueryParams();
            $page = max(1, intval($params['page'] ?? 1));
            $limit = min(1000, max(1, intval($params['limit'] ?? 100)));
            $offset = ($page - 1) * $limit;

            $sort = $params['sort'] ?? 'created_at';
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $sort)) $sort = 'created_at';
            $order = (isset($params['order']) && strtoupper($params['order']) === 'ASC') ? 'ASC' : 'DESC';

            $where = ' WHERE 1=1 ';
            $sqlParams = [];

            // Filter by application
            if (!empty($params['job_application_id'])) {
                $where .= " AND iv.job_application_id = :app_id";
                $sqlParams[':app_id'] = $params['job_application_id'];
            }

            // Filter by template
            if (!empty($params['template_id'])) {
                $where .= " AND iv.template_id = :template_id";
                $sqlParams[':template_id'] = $params['template_id'];
            }

            // Filter by status
            if (!empty($params['status'])) {
                $where .= " AND iv.status = :filter_status";
                $sqlParams[':filter_status'] = $params['status'];
            }

            // Search by candidate name
            if (!empty($params['search'])) {
                $where .= " AND (a.full_name LIKE :search OR iv.notes LIKE :search2)";
                $sqlParams[':search'] = '%' . $params['search'] . '%';
                $sqlParams[':search2'] = '%' . $params['search'] . '%';
            }

            $countStmt = $this->db->prepare(
                "SELECT COUNT(*) as total FROM interviews iv
                 LEFT JOIN job_applications a ON a.id = iv.job_application_id" . $where
            );
            $countStmt->execute($sqlParams);
            $total = (int)$countStmt->fetch()['total'];

            $sql = "SELECT iv.*,
                        a.full_name as applicant_name,
                        a.email as applicant_email,
                        jp.title as job_title,
                        it.name as template_name,
                        it.total_score as template_total_score,
                        e.full_name as interviewer_name
                    FROM interviews iv
                    LEFT JOIN job_applications a ON a.id = iv.job_application_id
                    LEFT JOIN job_postings jp ON jp.id = a.job_posting_id
                    LEFT JOIN interview_templates it ON it.id = iv.template_id
                    LEFT JOIN employees e ON e.id = iv.interviewer_id
                    $where
                    ORDER BY iv.`$sort` $order
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
     * عرض مقابلة واحدة مع التقييمات التفصيلية
     */
    public function show($id) {
        try {
            $access = $this->getUserAccess();

            $sql = "SELECT iv.*,
                        a.full_name as applicant_name,
                        a.email as applicant_email,
                        jp.title as job_title,
                        it.name as template_name,
                        it.total_score as template_total_score,
                        e.full_name as interviewer_name
                    FROM interviews iv
                    LEFT JOIN job_applications a ON a.id = iv.job_application_id
                    LEFT JOIN job_postings jp ON jp.id = a.job_posting_id
                    LEFT JOIN interview_templates it ON it.id = iv.template_id
                    LEFT JOIN employees e ON e.id = iv.interviewer_id
                    WHERE iv.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $interview = $stmt->fetch();

            if (!$interview) {
                http_response_code(404);
                return ['error' => true, 'message' => 'Interview not found'];
            }

            // Scoping check for show
            if ($access && !$access['is_admin']) {
                $scope = $access['data_scopes']['view_interviews'] ?? null;
                if (!$scope && !in_array('view_interviews', $access['permissions'])) {
                    return response_error("ليس لديك صلاحية لعرض هذه المقابلة", 403);
                }

                if ($scope === 'department') {
                    $stmt = $this->db->prepare("SELECT department_id FROM job_postings WHERE id = (SELECT job_posting_id FROM job_applications WHERE id = :app_id)");
                    $stmt->execute([':app_id' => $interview['job_application_id']]);
                    $jobDeptId = $stmt->fetchColumn();

                    if ($access['department_id'] && $jobDeptId !== $access['department_id']) {
                        return response_error("ليس لديك صلاحية لعرض مقابلات خارج قسمك", 403);
                    }
                }
            }

            $interview = $this->processRow($interview);

            // Load evaluation details with criteria names
            $evalStmt = $this->db->prepare(
                "SELECT ev.*, iti.criteria_name, iti.max_score
                 FROM interview_evaluations ev
                 LEFT JOIN interview_template_items iti ON iti.id = ev.template_item_id
                 WHERE ev.interview_id = :id
                 ORDER BY iti.sort_order ASC"
            );
            $evalStmt->execute([':id' => $id]);
            $interview['evaluations'] = array_map([$this, 'processRow'], $evalStmt->fetchAll());

            return $interview;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * إنشاء مقابلة جديدة مع التقييمات
     * 
     * Expected payload:
     * {
     *   job_application_id, template_id, interviewer_id, interview_date, notes,
     *   evaluations: [
     *     { template_item_id: "xxx", given_score: 8 },
     *     ...
     *   ]
     * }
     */
    public function store($data) {
        try {
            $this->checkPermission('create_interviews');
            $this->db->beginTransaction();

            $evaluations = $data['evaluations'] ?? [];
            unset($data['evaluations']);

            // 1. Calculate total_score from evaluations
            $totalScore = 0;
            foreach ($evaluations as $eval) {
                $totalScore += floatval($eval['given_score'] ?? 0);
            }
            $data['total_score'] = $totalScore;
            $data['status'] = $data['status'] ?? 'completed';

            // 2. Save interview record
            $result = parent::store($data);
            if (isset($result['error'])) {
                $this->db->rollBack();
                return $result;
            }

            $interviewId = $result['id'];

            // 3. Save evaluation details
            $this->saveEvaluations($interviewId, $evaluations);

            // 4. TRIGGER: Update job_applications interview_score and status
            $this->updateApplicationScore($data['job_application_id']);

            $this->db->commit();
            return $this->show($interviewId);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * تحديث مقابلة مع إعادة حساب الدرجات
     */
    public function update($id, $data) {
        try {
            $this->checkPermission('edit_interviews');
            $this->db->beginTransaction();

            // Get existing interview to know the application_id
            $existing = $this->db->prepare("SELECT * FROM interviews WHERE id = :id");
            $existing->execute([':id' => $id]);
            $existingData = $existing->fetch();

            if (!$existingData) {
                $this->db->rollBack();
                http_response_code(404);
                return ['error' => true, 'message' => 'Interview not found'];
            }

            $evaluations = $data['evaluations'] ?? null;
            unset($data['evaluations']);

            // Recalculate total_score if evaluations provided
            if ($evaluations !== null) {
                $totalScore = 0;
                foreach ($evaluations as $eval) {
                    $totalScore += floatval($eval['given_score'] ?? 0);
                }
                $data['total_score'] = $totalScore;
            }

            $result = parent::update($id, $data);
            if (isset($result['error'])) {
                $this->db->rollBack();
                return $result;
            }

            // Re-save evaluations if provided
            if ($evaluations !== null) {
                $this->db->prepare("DELETE FROM interview_evaluations WHERE interview_id = :id")
                         ->execute([':id' => $id]);
                $this->saveEvaluations($id, $evaluations);
            }

            // TRIGGER: Recalculate application score
            $appId = $data['job_application_id'] ?? $existingData['job_application_id'];
            $this->updateApplicationScore($appId);

            $this->db->commit();
            return $this->show($id);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * حذف مقابلة مع إعادة حساب درجة المرشح
     */
    public function destroy($id) {
        try {
            $this->checkPermission('delete_interviews');
            // Get application_id before deleting
            $stmt = $this->db->prepare("SELECT job_application_id FROM interviews WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $interview = $stmt->fetch();

            $result = parent::destroy($id);

            // Recalculate application score after deletion
            if ($interview && $interview['job_application_id']) {
                $this->updateApplicationScore($interview['job_application_id']);
            }

            return $result;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * حفظ تقييمات البنود
     */
    private function saveEvaluations($interviewId, $evaluations) {
        $sql = "INSERT INTO interview_evaluations (id, interview_id, template_item_id, given_score)
                VALUES (:id, :interview_id, :template_item_id, :given_score)";
        $stmt = $this->db->prepare($sql);

        foreach ($evaluations as $eval) {
            $stmt->execute([
                ':id'               => $eval['id'] ?? generateUUID(),
                ':interview_id'     => $interviewId,
                ':template_item_id' => $eval['template_item_id'],
                ':given_score'      => $eval['given_score'] ?? 0
            ]);
        }
    }

    /**
     * (TRIGGER) تحديث درجة المقابلة في طلب التوظيف
     * يأخذ أعلى درجة من جميع المقابلات المكتملة لهذا المرشح
     * ويغير حالة الطلب إلى 'interview'
     */
    private function updateApplicationScore($applicationId) {
        // Get the highest score from all completed interviews for this application
        $stmt = $this->db->prepare(
            "SELECT MAX(total_score) as best_score, COUNT(*) as interview_count
             FROM interviews 
             WHERE job_application_id = :app_id AND status = 'completed'"
        );
        $stmt->execute([':app_id' => $applicationId]);
        $result = $stmt->fetch();

        $bestScore = $result['best_score'] ?? null;
        $interviewCount = (int)($result['interview_count'] ?? 0);

        if ($interviewCount > 0 && $bestScore !== null) {
            // Update interview_score and status to 'interview'
            $updateStmt = $this->db->prepare(
                "UPDATE job_applications 
                 SET interview_score = :score, status = 'interview'
                 WHERE id = :id"
            );
            $updateStmt->execute([':score' => $bestScore, ':id' => $applicationId]);
        } else {
            // No completed interviews: reset score to NULL
            $updateStmt = $this->db->prepare(
                "UPDATE job_applications 
                 SET interview_score = NULL
                 WHERE id = :id"
            );
            $updateStmt->execute([':id' => $applicationId]);
        }
    }
}
