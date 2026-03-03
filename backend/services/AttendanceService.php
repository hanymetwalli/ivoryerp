<?php
/**
 * Attendance Service - Calculations and Business Logic
 */

class AttendanceService {
    private $db;

    public function __construct() {
        require_once __DIR__ . '/../config/database.php';
        $this->db = getDB();
    }

    /**
     * Get active schedule details for an employee on a specific date
     * Handles Ramadan overrides automatically
     */
    public function getScheduleForDate($employeeId, $date) {
        $stmt = $this->db->prepare("SELECT work_schedule_id FROM employees WHERE id = :eid");
        $stmt->execute([':eid' => $employeeId]);
        $emp = $stmt->fetch();

        if (!$emp || !$emp['work_schedule_id']) return null;

        $stmt = $this->db->prepare("SELECT * FROM work_schedules WHERE id = :sid");
        $stmt->execute([':sid' => $emp['work_schedule_id']]);
        $schedule = $stmt->fetch();

        if (!$schedule) return null;

        $currentDate = new DateTime($date);
        $active = [
            'type' => $schedule['schedule_type'],
            'start_time' => $schedule['start_time'],
            'end_time' => $schedule['end_time'],
            'total_hours' => (float)($schedule['total_hours'] ?? 8.00),
            'grace_period' => (int)($schedule['grace_period_minutes'] ?? 0),
            'is_ramadan' => false
        ];

        // 1. Check if Ramadan overrides are explicitly set in the schedule
        $ramadanActive = false;
        if ($schedule['ramadan_start_date'] && $schedule['ramadan_end_date']) {
            $ramadanStart = new DateTime($schedule['ramadan_start_date']);
            $ramadanEnd = new DateTime($schedule['ramadan_end_date']);
            if ($currentDate >= $ramadanStart && $currentDate <= $ramadanEnd) {
                $ramadanActive = true;
            }
        } 
        
        // 2. Fallback: Check country-aware Ramadan window if not explicitly set or not active yet
        if (!$ramadanActive) {
            $country = $this->getCountryForEmployee($employeeId);
            $configs = [
                'Egypt'  => ['start' => '2026-02-18', 'end' => '2026-03-19', 'hours' => 6.00],
                'KSA'    => ['start' => '2026-02-18', 'end' => '2026-03-19', 'hours' => 6.00],
                'Jordan' => ['start' => '2026-02-18', 'end' => '2026-03-19', 'hours' => 6.00],
                'Turkey' => ['start' => '2026-02-18', 'end' => '2026-03-19', 'hours' => 6.00],
            ];
            
            if (isset($configs[$country])) {
                $cfg = $configs[$country];
                $ramadanStart = new DateTime($cfg['start']);
                $ramadanEnd = new DateTime($cfg['end']);
                
                if ($currentDate >= $ramadanStart && $currentDate <= $ramadanEnd) {
                    $ramadanActive = true;
                    // Apply default Ramadan hours if not set in schedule
                    if (!$schedule['ramadan_total_hours']) {
                        $active['total_hours'] = $cfg['hours'];
                    }
                }
            }
        }

        // 3. Apply overrides if Ramadan is active
        if ($ramadanActive) {
            $active['is_ramadan'] = true;
            if ($schedule['ramadan_start_time']) $active['start_time'] = $schedule['ramadan_start_time'];
            if ($schedule['ramadan_end_time']) $active['end_time'] = $schedule['ramadan_end_time'];
            if ($schedule['ramadan_total_hours']) $active['total_hours'] = (float)$schedule['ramadan_total_hours'];
            else if ($schedule['ramadan_start_time'] && $schedule['ramadan_end_time']) {
                $start = new DateTime($schedule['ramadan_start_time']);
                $end = new DateTime($schedule['ramadan_end_time']);
                $interval = $start->diff($end);
                $active['total_hours'] = round($interval->h + ($interval->i / 60), 2);
            }
        }

        return $active;
    }

    /**
     * Helper to determine country based on employee/location data
     */
    private function getCountryForEmployee($employeeId) {
        $stmt = $this->db->prepare("
            SELECT e.nationality, l.name as location_name, l.address as location_address
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            WHERE e.id = ?
        ");
        $stmt->execute([$employeeId]);
        $data = $stmt->fetch();
        
        if (!$data) return 'Egypt';
        
        $searchString = ($data['nationality'] ?? '') . ' ' . ($data['location_name'] ?? '') . ' ' . ($data['location_address'] ?? '');
        
        if (stripos($searchString, 'Saudi') !== false || stripos($searchString, 'السعودية') !== false || stripos($searchString, 'KSA') !== false) return 'KSA';
        if (stripos($searchString, 'Jordan') !== false || stripos($searchString, 'الأردن') !== false) return 'Jordan';
        if (stripos($searchString, 'Turkey') !== false || stripos($searchString, 'تركيا') !== false) return 'Turkey';
        
        return 'Egypt'; // Default fallback
    }

    /**
     * Calculate expected working hours for an employee on a specific date
     */
    public function calculateExpectedHours($employeeId, $date) {
        $schedule = $this->getScheduleForDate($employeeId, $date);
        return $schedule ? $schedule['total_hours'] : 8.00;
    }
}
