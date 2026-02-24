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

        // Apply Ramadan overrides if applicable
        if ($schedule['ramadan_start_date'] && $schedule['ramadan_end_date']) {
            $ramadanStart = new DateTime($schedule['ramadan_start_date']);
            $ramadanEnd = new DateTime($schedule['ramadan_end_date']);
            
            if ($currentDate >= $ramadanStart && $currentDate <= $ramadanEnd) {
                $active['is_ramadan'] = true;
                if ($schedule['ramadan_start_time']) $active['start_time'] = $schedule['ramadan_start_time'];
                if ($schedule['ramadan_end_time']) $active['end_time'] = $schedule['ramadan_end_time'];
                if ($schedule['ramadan_total_hours']) $active['total_hours'] = (float)$schedule['ramadan_total_hours'];
                else if ($schedule['ramadan_start_time'] && $schedule['ramadan_end_time']) {
                    // Recalculate total hours if only times provided for Ramadan
                    $start = new DateTime($schedule['ramadan_start_time']);
                    $end = new DateTime($schedule['ramadan_end_time']);
                    $interval = $start->diff($end);
                    $active['total_hours'] = round($interval->h + ($interval->i / 60), 2);
                }
            }
        }

        return $active;
    }

    /**
     * Calculate expected working hours for an employee on a specific date
     */
    public function calculateExpectedHours($employeeId, $date) {
        $schedule = $this->getScheduleForDate($employeeId, $date);
        return $schedule ? $schedule['total_hours'] : 8.00;
    }
}
