<?php
/**
 * Dashboard Controller
 */

require_once __DIR__ . '/BaseController.php';

class DashboardController extends BaseController {
    protected $table = 'employees'; 
    
    public function index() {
        try {
            $today = date('Y-m-d');
            $currentMonth = date('n');
            $currentYear = date('Y');
            
            // 1. Employees Stats
            $emp = $this->db->query("SELECT COUNT(*) as total, 
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
                FROM `employees`")->fetch();
            
            // 2. Attendance Today
            $att = $this->db->prepare("SELECT COUNT(*) as present,
                SUM(CASE WHEN is_late = 1 THEN 1 ELSE 0 END) as late
                FROM `attendance` WHERE `date` = :today");
            $att->execute([':today' => $today]);
            $todayAtt = $att->fetch();
            
            // 3. Pending Items
            $pendingLeaves = $this->db->query("SELECT COUNT(*) as count FROM `leave_requests` WHERE `status` = 'pending'")->fetch()['count'];
            
            return [
                'employees' => [
                    'total' => (int)$emp['total'],
                    'active' => (int)$emp['active']
                ],
                'attendance_today' => [
                    'present' => (int)$todayAtt['present'],
                    'late' => (int)$todayAtt['late']
                ],
                'pending_approvals' => [
                    'leaves' => (int)$pendingLeaves,
                    'total' => (int)$pendingLeaves
                ]
            ];
        } catch (Exception $e) {
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}
