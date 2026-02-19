<?php
/**
 * Payroll Controller - الرواتب (نسخة مطورة)
 */

require_once __DIR__ . '/BaseController.php';

class PayrollController extends BaseController {
    protected $table = 'payroll';
    
    protected $fillable = [
        'id', 'payroll_number', 'employee_id', 'month', 'year', 'payroll_date',
        'basic_salary', 'housing_allowance', 'transport_allowance', 'other_allowances',
        'additional_allowances', 'bonuses_amount', 'overtime_amount', 'gross_salary',
        'insurance_deduction', 'late_deduction', 'absence_deduction', 'other_deductions',
        'total_deductions', 'net_salary', 'currency', 'status', 'issue_date',
        'working_days', 'absent_days', 'late_minutes', 'overtime_hours',
        'allowances_breakdown', 'deductions_breakdown', 'bonuses_breakdown', 'notes'
    ];
    
    protected $searchable = ['payroll_number'];
    
    public function index() {
        $params = getQueryParams();
        $month = $params['month'] ?? date('n');
        $year = $params['year'] ?? date('Y');
        
        $sql = "SELECT p.*, e.full_name as employee_name, e.employee_number
                FROM payroll p
                LEFT JOIN employees e ON p.employee_id = e.id
                WHERE p.month = :month AND p.year = :year
                ORDER BY e.full_name";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':month' => $month, ':year' => $year]);
        $data = $stmt->fetchAll();
        
        $totals = [
            'gross_salary' => 0,
            'total_deductions' => 0,
            'net_salary' => 0,
            'employees_count' => count($data)
        ];
        
        foreach ($data as &$row) {
            $row = $this->processRow($row);
            $totals['gross_salary'] += $row['gross_salary'];
            $totals['total_deductions'] += $row['total_deductions'];
            $totals['net_salary'] += $row['net_salary'];
        }
        
        return [
            'data' => $data,
            'totals' => $totals,
            'filters' => ['month' => $month, 'year' => $year]
        ];
    }
    
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'calculate':
                return $this->calculatePayroll($data);
            case 'calculate-all':
                return $this->calculateAllPayroll($data);
            case 'approve':
                return $this->update($id, ['status' => 'approved']);
            case 'mark-paid':
                return $this->update($id, ['status' => 'paid']);
            default:
                return parent::customAction($id, $action, $data);
        }
    }
    
    public function calculatePayroll($data) {
        $employeeId = $data['employee_id'] ?? null;
        $month = intval($data['month'] ?? date('n'));
        $year = intval($data['year'] ?? date('Y'));
        
        if (!$employeeId) throw new Exception('employee_id مطلوب');
        
        // حذف الراتب القديم لنفس الشهر إذا كان "مسودة"
        $this->db->prepare("DELETE FROM payroll WHERE employee_id = :eid AND month = :m AND year = :y AND status = 'draft'")
                 ->execute([':eid' => $employeeId, ':m' => $month, ':y' => $year]);
        
        // التأكد من عدم وجود راتب معتمد أو مدفوع
        $stmt = $this->db->prepare("SELECT id FROM payroll WHERE employee_id = :eid AND month = :m AND year = :y");
        $stmt->execute([':eid' => $employeeId, ':m' => $month, ':y' => $year]);
        if ($stmt->fetch()) throw new Exception('يوجد راتب معتمد أو مدفوع لهذا الشهر');

        // 1. جلب البيانات الأساسية (الموظف والعقد)
        $employee = $this->getRecord('employees', $employeeId);
        $stmt = $this->db->prepare("SELECT * FROM contracts WHERE employee_id = :id AND status = 'active' LIMIT 1");
        $stmt->execute([':id' => $employeeId]);
        $contract = $stmt->fetch();
        if (!$contract) throw new Exception('لا يوجد عقد نشط للموظف');

        // 2. حساب تواريخ الشهر
        $monthStart = sprintf('%04d-%02d-01', $year, $month);
        $monthEnd = date('Y-m-t', strtotime($monthStart));
        $daysInMonth = 30; // الحساب التجاري المعتاد 30 يوم

        // 3. جلب الإجازات المعتمدة خلال الشهر
        $stmt = $this->db->prepare("
            SELECT lr.*, lt.is_paid 
            FROM leave_requests lr 
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.employee_id = :eid AND lr.status = 'approved'
            AND ((lr.start_date BETWEEN :start_d AND :end_d) OR (lr.end_date BETWEEN :start_d2 AND :end_d2))
        ");
        $stmt->execute([
            ':eid' => $employeeId, 
            ':start_d' => $monthStart, 
            ':end_d' => $monthEnd,
            ':start_d2' => $monthStart,
            ':end_d2' => $monthEnd
        ]);
        $leaves = $stmt->fetchAll();

        $unpaidLeaveDays = 0;
        $paidLeaveDates = [];
        foreach ($leaves as $leave) {
            $start = max(strtotime($monthStart), strtotime($leave['start_date']));
            $end = min(strtotime($monthEnd), strtotime($leave['end_date']));
            $days = floor(($end - $start) / (60 * 60 * 24)) + 1;
            
            if (!$leave['is_paid']) {
                $unpaidLeaveDays += $days;
            } else {
                // تجميع تواريخ الإجازات المدفوعة لإلغاء غياب الحضور فيها
                for($d = $start; $d <= $end; $d += 86400) {
                    $paidLeaveDates[] = date('Y-m-d', $d);
                }
            }
        }

        // 4. جلب سجلات الحضور والغياب
        $stmt = $this->db->prepare("
            SELECT * FROM attendance 
            WHERE employee_id = :eid AND date BETWEEN :start AND :end
        ");
        $stmt->execute([':eid' => $employeeId, ':start' => $monthStart, ':end' => $monthEnd]);
        $attendanceRecords = $stmt->fetchAll();

        $absentDays = 0;
        $lateMinutes = 0;
        foreach ($attendanceRecords as $record) {
            if ($record['status'] === 'absent') {
                // إلغاء الغياب إذا كان في يوم إجازة مدفوعة
                if (!in_array($record['date'], $paidLeaveDates)) {
                    $absentDays++;
                }
            }
            $lateMinutes += (int)($record['late_minutes'] ?? 0);
        }

        // 5. جلب الساعات الإضافية المعتمدة
        $stmt = $this->db->prepare("
            SELECT SUM(hours) as total_hours, SUM(total_amount) as total_val 
            FROM overtime 
            WHERE employee_id = :eid AND status = 'approved'
            AND date BETWEEN :start AND :end
        ");
        $stmt->execute([':eid' => $employeeId, ':start' => $monthStart, ':end' => $monthEnd]);
        $otData = $stmt->fetch();
        $overtimeHours = (float)($otData['total_hours'] ?? 0);
        $overtimeAmount = (float)($otData['total_val'] ?? 0);

        // 6. جلب المكافآت المعتمدة
        $stmt = $this->db->prepare("
            SELECT SUM(amount) as total FROM bonuses 
            WHERE employee_id = :eid AND month = :m AND year = :y AND status = 'approved'
        ");
        $stmt->execute([':eid' => $employeeId, ':m' => $month, ':y' => $year]);
        $bonusesAmount = (float)($stmt->fetch()['total'] ?? 0);

        // 7. جلب العلاوات الإضافية
        $stmt = $this->db->prepare("
            SELECT SUM(amount) as total FROM allowances 
            WHERE employee_id = :eid AND status = 'active'
            AND start_date <= :end_dt AND (end_date IS NULL OR end_date >= :start_dt)
        ");
        $stmt->execute([':eid' => $employeeId, ':start_dt' => $monthStart, ':end_dt' => $monthEnd]);
        $additionalAllowances = (float)($stmt->fetch()['total'] ?? 0);

        // 8. جلب إعدادات التأمين
        $stmt = $this->db->prepare("
            SELECT employee_percentage, max_insurable_salary FROM insurance_settings 
            WHERE year = :y AND status = 'active' LIMIT 1
        ");
        $stmt->execute([':y' => $year]);
        $insSettings = $stmt->fetch();
        $insPerc = (float)($insSettings['employee_percentage'] ?? 0);
        $insMax = (float)($insSettings['max_insurable_salary'] ?? 0);

        // --- الحسابات المالية ---
        $basic = (float)$contract['basic_salary'];
        $housing = (float)($contract['housing_allowance'] ?? 0);
        $transport = (float)($contract['transport_allowance'] ?? 0);
        $otherAlw = (float)($contract['other_allowances'] ?? 0);
        
        $dailyRate = $basic / 30;
        $minuteRate = ($basic / 30 / 8) / 60;

        $absDed = ($absentDays + $unpaidLeaveDays) * $dailyRate;
        $lateDed = $lateMinutes * $minuteRate;
        
        $insBase = min($basic, $insMax);
        $insDed = ($insBase * $insPerc) / 100;

        $gross = $basic + $housing + $transport + $otherAlw + $additionalAllowances + $bonusesAmount + $overtimeAmount;
        $totalDed = $insDed + $absDed + $lateDed;
        $net = $gross - $totalDed;

        // توليد رقم المسير
        $payrollNumber = 'PAY-' . $year . '-' . $month . '-' . substr(strtoupper(uniqid()), -5);

        $payrollData = [
            'payroll_number' => $payrollNumber,
            'employee_id' => $employeeId,
            'month' => $month,
            'year' => $year,
            'payroll_date' => date('Y-m-d'),
            'basic_salary' => round($basic, 2),
            'housing_allowance' => round($housing, 2),
            'transport_allowance' => round($transport, 2),
            'other_allowances' => round($otherAlw, 2),
            'additional_allowances' => round($additionalAllowances, 2),
            'bonuses_amount' => round($bonusesAmount, 2),
            'overtime_amount' => round($overtimeAmount, 2),
            'gross_salary' => round($gross, 2),
            'insurance_deduction' => round($insDed, 2),
            'late_deduction' => round($lateDed, 2),
            'absence_deduction' => round($absDed, 2),
            'other_deductions' => 0,
            'total_deductions' => round($totalDed, 2),
            'net_salary' => round($net, 2),
            'currency' => $contract['currency'] ?? 'SAR',
            'status' => 'draft',
            'working_days' => 30 - ($absentDays + $unpaidLeaveDays),
            'absent_days' => $absentDays + $unpaidLeaveDays,
            'late_minutes' => $lateMinutes,
            'overtime_hours' => round($overtimeHours, 2),
            'notes' => ($unpaidLeaveDays > 0 ? "خصم $unpaidLeaveDays يوم إجازة بدون راتب. " : "") . 
                       ($absentDays > 0 ? "خصم $absentDays يوم غياب. " : "")
        ];

        return $this->store($payrollData);
    }

    public function calculateAllPayroll($data) {
        $month = $data['month'] ?? date('n');
        $year = $data['year'] ?? date('Y');
        
        $stmt = $this->db->prepare("SELECT id FROM employees WHERE status = 'active'");
        $stmt->execute();
        $employees = $stmt->fetchAll();
        
        $success = 0; $errors = [];
        foreach ($employees as $emp) {
            try {
                $this->calculatePayroll(['employee_id' => $emp['id'], 'month' => $month, 'year' => $year]);
                $success++;
            } catch (Exception $e) {
                $errors[] = ['id' => $emp['id'], 'error' => $e->getMessage()];
            }
        }
        
        return ['message' => 'تمت العملية', 'calculated' => $success, 'errors' => $errors];
    }

    private function getRecord($table, $id) {
        $stmt = $this->db->prepare("SELECT * FROM `$table` WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }
}
