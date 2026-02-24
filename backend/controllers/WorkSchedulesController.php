<?php
/**
 * Work Schedules Controller
 */

require_once __DIR__ . '/BaseController.php';

class WorkSchedulesController extends BaseController {
    protected $table = 'work_schedules';
    
    protected $fillable = [
        'id', 'name', 'work_location_id', 'schedule_type', 'total_hours', 
        'start_time', 'end_time', 'working_days', 'grace_period_minutes', 'status',
        'ramadan_start_date', 'ramadan_end_date', 'ramadan_start_time', 'ramadan_end_time', 'ramadan_total_hours'
    ];
    
    protected $searchable = ['name'];
    
    public function index() {
        $result = parent::index();
        
        foreach ($result['data'] as &$schedule) {
            if ($schedule['work_location_id']) {
                $stmt = $this->db->prepare("SELECT name FROM work_locations WHERE id = :id");
                $stmt->execute([':id' => $schedule['work_location_id']]);
                $loc = $stmt->fetch();
                $schedule['work_location_name'] = $loc ? $loc['name'] : null;
            }
        }
        
        return $result;
    }

    public function store($data) {
        $this->validateSchedule($data);
        return parent::store($data);
    }

    public function update($id, $data) {
        $this->validateSchedule($data);
        return parent::update($id, $data);
    }

    private function validateSchedule($data) {
        $type = $data['schedule_type'] ?? 'fixed';
        if ($type === 'fixed') {
            if (empty($data['start_time']) || empty($data['end_time'])) {
                http_response_code(422);
                echo json_encode(['error' => true, 'message' => 'وقت الحضور ووقت الانصراف مطلوبان للدوام الثابت']);
                exit;
            }
        }
    }
}
