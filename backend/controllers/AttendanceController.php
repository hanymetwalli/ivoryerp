<?php
/**
 * Attendance Controller
 */

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../services/AttendanceService.php';

class AttendanceController extends BaseController {
    protected $table = 'attendance';

    protected $fillable = [
        'id', 'employee_id', 'date', 'check_in_time', 'check_in_location',
        'check_out_time', 'check_out_location', 'status', 'notes',
        'is_late', 'late_minutes', 'working_hours', 'overtime_hours', 'source'
    ];

    private $attendanceService;

    public function __construct() {
        parent::__construct();
        $this->attendanceService = new AttendanceService();
    }

    protected $defaultSort = 'date';

    /**
     * Get attendance with employee names
     */
    public function index() {
        $params = getQueryParams();

        // Default to current month
        $month = $params['month'] ?? date('n');
        $year = $params['year'] ?? date('Y');
        $employeeId = $params['employee_id'] ?? null;

        $sql = "SELECT a.*, e.full_name as employee_name, e.employee_number
                FROM attendance a
                LEFT JOIN employees e ON a.employee_id = e.id
                WHERE MONTH(a.date) = :month AND YEAR(a.date) = :year";

        $queryParams = [':month' => $month, ':year' => $year];

        if ($employeeId) {
            $sql .= " AND a.employee_id = :employee_id";
            $queryParams[':employee_id'] = $employeeId;
        }

        $sql .= " ORDER BY a.date DESC, e.full_name";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($queryParams);
        $data = $stmt->fetchAll();

        return [
            'data' => array_map([$this, 'processRow'], $data),
            'filters' => ['month' => $month, 'year' => $year]
        ];
    }

    public function customAction($id, $action, $data = null) {
        // توجيه جميع أنواع الاستيراد للدالة الذكية الجديدة
        if (in_array($action, ['importFingerprintLogsSimple', 'import-fingerprint', 'import-bitrix'])) {
            return $this->importSmartCSV($data);
        }

        switch ($action) {
            case 'check-in': return $this->checkIn($data);
            case 'check-out': return $this->checkOut($id, $data);
            case 'summary': return $this->getSummary($id, $data);
            default: return parent::customAction($id, $action, $data);
        }
    }
    
    /**
     * Helper: Calculate Attendance Metrics (Late, Work Hours, Overtime)
     */
    /**
     * Helper: Calculate Attendance Metrics (Late, Work Hours, Overtime)
     */
    private function calculateAttendanceMetrics($employeeId, $date, $inTime, $outTime) {
        $metrics = [
            'is_late' => 0,
            'late_minutes' => 0,
            'working_hours' => 0.00,
            'overtime_hours' => 0.00
        ];

        if (!$inTime) return $metrics;

        $schedule = $this->attendanceService->getScheduleForDate($employeeId, $date);
        if (!$schedule) return $metrics;

        // 1. Calculate Late Status
        if ($schedule['type'] === 'fixed' && !empty($schedule['start_time'])) {
            $scheduledStart = $schedule['start_time']; 
            $grace = $schedule['grace_period'];
            
            $scheduledStartTs = strtotime("$date $scheduledStart");
            $actualInTs = strtotime("$date $inTime");
            $limitTs = $scheduledStartTs + ($grace * 60);

            if ($actualInTs > $limitTs) {
                $metrics['is_late'] = 1;
                $metrics['late_minutes'] = floor(($actualInTs - $scheduledStartTs) / 60);
            }
        }

        // 2. Calculate Work Hours & Overtime
        if ($outTime) {
            $inTs = strtotime("$date $inTime");
            $outTs = strtotime("$date $outTime");
            
            if ($outTs < $inTs) {
                $outTs += 24 * 60 * 60; // Handle overnight shift
            }
            
            $metrics['working_hours'] = round(($outTs - $inTs) / 3600, 2);
            $shiftDuration = $schedule['total_hours'];
            
            if ($metrics['working_hours'] > $shiftDuration) {
                $metrics['overtime_hours'] = $metrics['working_hours'] - $shiftDuration;
            }
        }

        return $metrics;
    }

    /**
     * Unified Import method for Fingerprint and Bitrix
     */
    public function importSmartCSV($data) {
        set_time_limit(600);
        ini_set('memory_limit', '512M');
        ini_set('display_errors', 0); 

        try {
            if (!isset($data['file_data'])) return ['success' => false, 'error' => 'لا توجد بيانات'];

            // 1. فك التشفير
            $base64 = $data['file_data'];
            if (strpos($base64, ',') !== false) $base64 = explode(',', $base64)[1];
            $content = base64_decode($base64);

            if (!$content) return ['success' => false, 'error' => 'فشل قراءة الملف (Base64)'];

            // 2. الحفظ المؤقت
            $tempFile = tempnam(sys_get_temp_dir(), 'imp_');
            file_put_contents($tempFile, $content);

            // 3. القراءة الذكية (Smart Read)
            $rows = [];
            if (($handle = fopen($tempFile, "r")) !== FALSE) {
                // تجاوز BOM
                $bom = fread($handle, 3);
                if ($bom != "\xEF\xBB\xBF") rewind($handle);
                
                // اكتشاف الفاصل (Delimiter Detection)
                $line1 = fgets($handle);
                $delimiters = [';', ',', "\t", '|'];
                $bestDelim = ',';
                $maxCols = 0;
                
                foreach ($delimiters as $d) {
                    $cols = count(str_getcsv($line1, $d));
                    if ($cols > $maxCols) {
                        $maxCols = $cols;
                        $bestDelim = $d;
                    }
                }
                
                rewind($handle);
                if ($bom != "\xEF\xBB\xBF") rewind($handle);
                
                while (($r = fgetcsv($handle, 10000, $bestDelim)) !== FALSE) { 
                    if (array_filter($r, function($v) { return trim($v) !== ''; })) {
                        $rows[] = $r;
                    }
                }
                fclose($handle);
            }
            @unlink($tempFile);

            if (count($rows) < 2) return ['success' => false, 'error' => 'الملف فارغ أو التنسيق غير مدعوم'];

            // 4. تحليل الأعمدة
            $headers = array_map(function($h) { 
                return trim(str_replace(['"', "'", "\xEF\xBB\xBF"], '', $h)); 
            }, $rows[0]);
            
            $idxID = -1; $idxDate = -1; $idxTime = -1;

            foreach ($headers as $i => $h) {
                if (preg_match('/(ac-no|user id|enno|id|emp|code)/i', $h)) $idxID = $i;
                // بحث مرن عن التاريخ (نتجنب time عشان ما يحصلش تداخل)
                if (preg_match('/(date|day|dt)/i', $h) && !preg_match('/(time|clock)/i', $h)) {
                    $idxDate = $i;
                }
                if (preg_match('/(time|clock|check)/i', $h)) $idxTime = $i;
            }
            
            if ($idxDate == -1) {
                foreach ($headers as $i => $h) { if (preg_match('/(datetime)/i', $h)) $idxDate = $i; }
            }
            if ($idxTime == -1) $idxTime = $idxDate;

            if ($idxID == -1 || $idxDate == -1) {
                return [
                    'success' => false, 
                    'error' => 'لم يتم التعرف على الأعمدة. يجب أن يحتوي الملف على: ID, Date. الأعمدة الموجودة: ' . implode(', ', $headers)
                ];
            }

            // 5. التنفيذ
            $this->db->beginTransaction();
            
            $stmt = $this->db->query("SELECT id, employee_number FROM employees");
            $empMap = [];
            while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $n = trim($r['employee_number']);
                $empMap[$n] = $r['id'];
                $digits = preg_replace('/[^0-9]/', '', $n);
                if ($digits !== '') { 
                    $empMap[(int)$digits] = $r['id']; 
                    $empMap[(string)$digits] = $r['id']; 
                }
            }

            $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];
            
            $checkStmt = $this->db->prepare("SELECT id, check_in_time, check_out_time FROM attendance WHERE employee_id=? AND date=?");
            
            $updateStmt = $this->db->prepare("
                UPDATE attendance 
                SET check_in_time=?, check_out_time=?, working_hours=?, overtime_hours=?, 
                    is_late=?, late_minutes=?, status=?, updated_at=NOW() 
                WHERE id=?
            ");

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                if (!isset($row[$idxID])) continue;

                $acNo = trim($row[$idxID]);
                $rawD = isset($row[$idxDate]) ? trim($row[$idxDate]) : '';
                $rawT = isset($row[$idxTime]) ? trim($row[$idxTime]) : '';

                if ($acNo === '' || $rawD === '') { $stats['skipped']++; continue; }

                $empId = $empMap[$acNo] ?? $empMap[(int)$acNo] ?? null;
                if (!$empId) { 
                    if(count($stats['errors']) < 5) $stats['errors'][] = "سطر $i: الموظف '$acNo' غير موجود";
                    $stats['skipped']++; 
                    continue; 
                }

                // استخراج التاريخ
                $dateYMD = null;
                $cleanD = preg_replace('/[^\x20-\x7E]/', '', $rawD);
                
                $ts = strtotime($cleanD);
                if (!$ts) $ts = strtotime(str_replace('-', '/', $cleanD));
                if (!$ts) $ts = strtotime(str_replace('/', '-', $cleanD));
                
                if ($ts) {
                    $dateYMD = date('Y-m-d', $ts);
                } else {
                     if (preg_match('/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/', $cleanD, $m)) {
                         $dateYMD = sprintf('%04d-%02d-%02d', $m[3], $m[1], $m[2]);
                     }
                }

                if (!$dateYMD) { $stats['skipped']++; continue; }

                // استخراج الأوقات
                $times = [];
                $fullStr = "$rawT $rawD";
                if (preg_match_all('/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)/i', $fullStr, $matches)) {
                    foreach($matches[1] as $t) {
                        $t_ts = strtotime("$dateYMD $t");
                        if ($t_ts) $times[] = date('H:i:s', $t_ts);
                    }
                }
                
                $status = 'present';
                $finalIn = null;
                $finalOut = null;
                $info = $this->getScheduleInfo($empId);

                if (empty($times)) { 
                    if (!empty($info['start_time']) && !empty($info['end_time'])) {
                        $status = 'absent';
                    } else {
                        $status = 'absent';
                    }
                } else {
                    sort($times);
                    $finalIn = $times[0]; 
                    $finalOut = (count($times) > 1) ? end($times) : null; 
                }

                $checkStmt->execute([$empId, $dateYMD]);
                $exist = $checkStmt->fetch(PDO::FETCH_ASSOC);

                $isUpdate = false;
                if ($exist) {
                    $isUpdate = true;
                    $dbIn = $exist['check_in_time'];
                    $dbOut = $exist['check_out_time'];
                    if ($finalIn) {
                        if (!$dbIn || $finalIn < $dbIn) {} else $finalIn = $dbIn; 
                    } else { $finalIn = $dbIn; }
                    if ($finalOut) {
                         if (!$dbOut || $finalOut > $dbOut) {} else $finalOut = $dbOut;
                    } else { $finalOut = $dbOut; }
                    if ($finalIn || $finalOut) $status = 'present';
                }

                $metrics = $this->calculateAttendanceMetrics($empId, $dateYMD, $finalIn, $finalOut);

                if ($isUpdate) {
                    $updateStmt->execute([
                        $finalIn, $finalOut, $metrics['working_hours'], $metrics['overtime_hours'], 
                        $metrics['is_late'], $metrics['late_minutes'], $status, $exist['id']
                    ]);
                    $stats['updated']++;
                } else {
                    $insertStmt = $this->db->prepare("
                        INSERT INTO attendance 
                        (id, employee_id, date, check_in_time, check_out_time, working_hours, 
                         overtime_hours, status, source, is_late, late_minutes, created_at) 
                        VALUES 
                        (UUID(), ?, ?, ?, ?, ?, ?, ?, 'fingerprint_device', ?, ?, NOW())
                    ");
                    $res = $insertStmt->execute([
                        $empId, $dateYMD, $finalIn, $finalOut, $metrics['working_hours'], $metrics['overtime_hours'], 
                        $status, $metrics['is_late'], $metrics['late_minutes']
                    ]);
                    if($res) $stats['created']++;
                    else {
                        $err = $insertStmt->errorInfo();
                        $stats['errors'][] = "فشل $acNo: " . $err[2];
                    }
                }
            }

            $this->db->commit();
            return ['success' => true, 'report' => $stats];

        } catch (Throwable $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Override store to handle direct entity creation with validation
     */
    public function store($data) {
        if (isset($data['source']) && in_array($data['source'], ['mobile_app', 'web', 'manual'])) {
            return $this->checkIn($data);
        }
        return parent::store($data);
    }

    /**
     * Override update to handle manual edits and recalculations
     */
    public function update($id, $data) {
        if (isset($data['source']) && $data['source'] === 'mobile_app' && isset($data['check_out_time'])) {
            return $this->checkOut($id, $data);
        }

        $record = $this->show($id);
        if (!$record) { return ['success' => false, 'error' => 'Record not found']; }

        $date = $data['date'] ?? $record['date'];
        $inTime = $data['check_in_time'] ?? $record['check_in_time'];
        $outTime = $data['check_out_time'] ?? $record['check_out_time'];
        
        $metrics = $this->calculateAttendanceMetrics($record['employee_id'], $date, $inTime, $outTime);
        $data = array_merge($data, $metrics);
        $data['updated_at'] = date('Y-m-d H:i:s');

        return parent::update($id, $data);
    }

    /**
     * Employee check-in
     */
    public function checkIn($data) {
        $employeeId = $data['employee_id'] ?? null;
        if (!$employeeId) { return ['success' => false, 'error' => 'مطلوب employee_id']; }

        $date = $data['date'] ?? date('Y-m-d');
        $status = $data['status'] ?? 'present';
        
        // FORCE MANUAL if not strictly mobile_app
        $source = ($data['source'] ?? '') === 'mobile_app' ? 'mobile_app' : 'manual';
        
        $inTimeStr = null;
        $outTimeStr = null;

        if ($status === 'present') {
            if ($source === 'mobile_app') {
                $inTimeStr = date('H:i:s');
                $outTimeStr = null;
            } else {
                $inTimeStr = $data['check_in_time'] ?? $data['time'] ?? date('H:i:s');
                $outTimeStr = $data['check_out_time'] ?? null; 
            }
        }

        $stmt = $this->db->prepare("
            SELECT e.*, l.name as location_name, l.latitude, l.longitude, l.radius_meters, l.use_coordinates
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            WHERE e.id = :id
        ");
        $stmt->execute([':id' => $employeeId]);
        $employee = $stmt->fetch();

        if (!$employee) { return ['success' => false, 'error' => 'الموظف غير موجود']; }

        $locationName = $employee['location_name'] ?? '';
        $isRemote = (stripos($locationName, 'Remote') !== false || stripos($locationName, 'عن بعد') !== false);

        if ($status === 'present' && $source === 'mobile_app' && !$isRemote && $employee['use_coordinates'] && $employee['radius_meters'] > 0) {
            $locationData = $data['check_in_location'] ?? null;
            if (is_string($locationData)) $locationData = json_decode($locationData, true);
            
            $userLat = $locationData['latitude'] ?? null;
            $userLon = $locationData['longitude'] ?? null;

            if ($userLat && $userLon && $employee['latitude'] && $employee['longitude']) {
                $distance = $this->calculateDistance($userLat, $userLon, $employee['latitude'], $employee['longitude']);
                if ($distance > $employee['radius_meters']) {
                    return ['success' => false, 'error' => "خارج النطاق. المسافة: " . round($distance) . "م"];
                }
            } else {
                 return ['success' => false, 'error' => "يرجى تفعيل الموقع الجغرافي (GPS) لتسجيل الحضور"];
            }
        }

        $stmt = $this->db->prepare("SELECT id FROM attendance WHERE employee_id = ? AND date = ?");
        $stmt->execute([$employeeId, $date]);
        if ($stmt->fetch()) { return ['success' => false, 'error' => 'مسجل مسبقاً لهذا اليوم']; }

        $metrics = $this->calculateAttendanceMetrics($employeeId, $date, $inTimeStr, $outTimeStr);

        try {
            $locJson = null;
            if (isset($data['check_in_location'])) {
                $locJson = is_string($data['check_in_location']) ? $data['check_in_location'] : json_encode($data['check_in_location']);
            }

            $sql = "INSERT INTO attendance 
                    (id, employee_id, date, check_in_time, check_out_time, working_hours, overtime_hours, status, source, is_late, late_minutes, check_in_location, created_at) 
                    VALUES 
                    (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $stmt = $this->db->prepare($sql);
            $success = $stmt->execute([
                $employeeId, 
                $date, 
                $inTimeStr ?: null, 
                $outTimeStr ?: null, 
                $metrics['working_hours'], 
                $metrics['overtime_hours'], 
                $status, 
                $source, 
                $metrics['is_late'], 
                $metrics['late_minutes'], 
                $locJson
            ]);

            if (!$success) {
                $err = $stmt->errorInfo();
                return ['success' => false, 'error' => 'Database Error: ' . $err[2]];
            }

            return ['success' => true];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371000; 
        $latFrom = deg2rad($lat1); $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2); $lonTo = deg2rad($lon2);
        $latDelta = $latTo - $latFrom; $lonDelta = $lonTo - $lonFrom;
        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
        return $angle * $earthRadius;
    }

    public function checkOut($id, $data) {
        $attendance = $this->show($id);
        if (!$attendance) { jsonError('سجل الحضور غير موجود', 404); return; }

        $source = $data['source'] ?? 'manual';
        
        if ($source === 'mobile_app') {
            $time = date('H:i:s');
        } else {
            $time = $data['time'] ?? $data['check_out_time'] ?? date('H:i:s');
        }

        $employeeId = $attendance['employee_id'];

        $stmt = $this->db->prepare("
            SELECT l.name, l.latitude, l.longitude, l.radius_meters, l.use_coordinates
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            WHERE e.id = :id
        ");
        $stmt->execute([':id' => $employeeId]);
        $location = $stmt->fetch();

        $locationName = $location['name'] ?? '';
        $isRemote = (stripos($locationName, 'Remote') !== false || stripos($locationName, 'عن بعد') !== false);

        $locationData = $data['check_out_location'] ?? $data['location'] ?? null;
        if (is_string($locationData)) $locationData = json_decode($locationData, true);
        $userLat = $locationData['latitude'] ?? null;
        $userLon = $locationData['longitude'] ?? null;

        if ($source === 'mobile_app' && $location && !$isRemote && $location['use_coordinates'] && $location['radius_meters'] > 0) {
            if (!$userLat || !$userLon) {
                 jsonError('إحداثيات الموقع مطلوبة لتسجيل الانصراف عبر التطبيق', 400); return;
            }
            if ($userLat && $userLon && $location['latitude'] && $location['longitude']) {
                $distance = $this->calculateDistance($userLat, $userLon, $location['latitude'], $location['longitude']);
                if ($distance > $location['radius_meters']) {
                    jsonError("أنت خارج النطاق المسموح لتسجيل الانصراف. المسافة: " . round($distance) . " متر.", 400); return;
                }
            }
        }

        // Recalculate using the unified helper
        $checkInDate = $attendance['date'];
        $checkInTime = $attendance['check_in_time'];
        
        // Construct employee info for helper (minimal needed)
        $empInfo = $location; // Contains schedule info
        
        $metrics = $this->calculateAttendanceMetrics($employeeId, $checkInDate, $checkInTime, $time);

        return parent::update($id, [
            'check_out_time' => $time,
            'check_out_location' => isset($locationData) ? json_encode($locationData) : null,
            'working_hours' => $metrics['working_hours'],
            'overtime_hours' => $metrics['overtime_hours'],
            'updated_at' => date('Y-m-d H:i:s')
        ]);
    }

    public function getSummary($employeeId, $params = []) {
        $month = $params['month'] ?? date('n');
        $year = $params['year'] ?? date('Y');

        $stmt = $this->db->prepare("
            SELECT
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN is_late = 1 THEN 1 ELSE 0 END) as late_days,
                SUM(late_minutes) as total_late_minutes,
                SUM(working_hours) as total_working_hours,
                SUM(overtime_hours) as total_overtime_hours
            FROM attendance
            WHERE employee_id = :employee_id
            AND MONTH(date) = :month AND YEAR(date) = :year
        ");
        $stmt->execute([
            ':employee_id' => $employeeId,
            ':month' => $month,
            ':year' => $year
        ]);

        return $stmt->fetch();
    }

    public function getScheduleInfo($employeeId) {
        $stmt = $this->db->prepare("
            SELECT l.latitude, l.longitude, l.radius_meters, l.use_coordinates, l.name as location_name
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            WHERE e.id = ?
        ");
        $stmt->execute([$employeeId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        $date = date('Y-m-d');
        $schedule = $this->attendanceService->getScheduleForDate($employeeId, $date);

        return [
            'start_time' => $schedule['start_time'] ?? '08:00:00', 
            'end_time'   => $schedule['end_time'] ?? '16:00:00',   
            'grace_period' => $schedule['grace_period'] ?? 15,
            'use_coords' => $data['use_coordinates'] ?? 0,
            'radius' => $data['radius_meters'] ?? 0,
            'lat' => $data['latitude'] ?? null,
            'lon' => $data['longitude'] ?? null,
            'loc_name' => $data['location_name'] ?? ''
        ];
    }
}
