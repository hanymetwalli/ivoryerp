<?php
/**
 * Job Descriptions Controller - النسخة النهائية المطابقة للفرونت إند
 */

require_once __DIR__ . '/BaseController.php';

class JobDescriptionsController extends BaseController {
    protected $table = 'job_descriptions';
    
    protected $fillable = [
        'id', 'position_id', 'position_name', 'department_id', 'job_objective', 
        'main_tasks', 'core_competencies', 'qualifications', 'required_skills', 
        'required_experience', 'notes', 'version', 'last_review_date', 
        'next_review_date', 'status', 'employee_notes'
    ];
    
    protected $searchable = ['position_name', 'job_objective'];
    
    public function index() {
        // Use parent index to get base data with pagination
        $result = parent::index();
        
        // Enrich data with department names
        if (isset($result['data'])) {
            foreach ($result['data'] as &$jd) {
                if (isset($jd['department_id']) && $jd['department_id']) {
                    $stmt = $this->db->prepare("SELECT `name` FROM `departments` WHERE `id` = :id OR `name` = :name");
                    $stmt->execute([':id' => $jd['department_id'], ':name' => $jd['department_id']]);
                    $dept = $stmt->fetch();
                    $jd['department_name'] = $dept ? $dept['name'] : $jd['department_id'];
                }
            }
        }
        
        return $result;
    }
}
