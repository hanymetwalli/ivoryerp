<?php
/**
 * Work Schedules Controller
 */

require_once __DIR__ . '/BaseController.php';

class WorkSchedulesController extends BaseController {
    protected $table = 'work_schedules';
    
    protected $fillable = [
        'id', 'name', 'work_location_id', 'start_time', 'end_time',
        'working_days', 'grace_period_minutes', 'status'
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
}
