<?php
/**
 * Attendance Controller
 */

require_once __DIR__ . '/BaseController.php';

class AttendanceController extends BaseController {
    protected $table = 'attendance';

    protected $fillable = [
        'id', 'employee_id', 'date', 'check_in_time', 'check_in_location',
        'check_out_time', 'check_out_location', 'status', 'notes',
        'is_late', 'late_minutes', 'working_hours', 'overtime_hours', 'source'
    ];

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

    /**
     * Check-in
     */
    public function customAction($id, $action, $data = null) {
        switch ($action) {
            case 'check-in':
                return $this->checkIn($data);
            case 'check-out':
                return $this->checkOut($id, $data);
            case 'summary':
                return $this->getSummary($id, $data);
            case 'import-fingerprint':
                return $this->importFingerprint($data, 'fingerprint');
            case 'import-bitrix':
                return $this->importFingerprint($data, 'bitrix24');
            default:
                return parent::customAction($id, $action, $data);
        }
    }

    /**
     * Unified Import method for Fingerprint and Bitrix
     */
    private function importFingerprint($data, $source = 'fingerprint') {
        set_time_limit(300);
        ini_set('memory_limit', '512M');

        $filePath = $data['file_path'] ?? null;
        
        // Handle Base64 file data from Frontend
        if (isset($data['file_data'])) {
            $base64Data = explode(',', $data['file_data']);
            $content = base64_decode(end($base64Data));
            $fileName = $data['file_name'] ?? 'upload_' . time() . '.xlsx';
            $uploadDir = __DIR__ . '/../api/uploads/';
            if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
            $filePath = $uploadDir . $fileName;
            file_put_contents($filePath, $content);
        }

        if (!$filePath || !file_exists($filePath)) {
            jsonError('مسار الملف غير صالح أو غير موجود', 400);
        }

        require_once __DIR__ . '/../helpers/xlsx_reader.php';
        $rows = SimpleXLSXReader::parse($filePath);

        if (!$rows || count($rows) < 2) {
            jsonError('الملف فارغ أو غير صالح (صيغة غير مدعومة)', 400);
        }

        $report = ['total' => 0, 'processed' => 0, 'created' => 0, 'updated' => 0, 'errors' => []];
        $headers = $rows[0];
        
        // Dynamic Header Mapping
        $idxNo = -1; $idxName = -1; $idxDate = -1; $idxTime = -1;
        foreach ($headers as $i => $h) {
            $h = trim((string)$h);
            if (empty($h)) continue;
            if (preg_match('/(AC.No|No|ID|رقم|الكود)/i', $h)) $idxNo = $i;
            if (preg_match('/(Name|الاسم|الموظف)/i', $h)) $idxName = $i;
            if (preg_match('/(Date|التاريخ)/i', $h)) $idxDate = $i;
            if (preg_match('/(Time|الوقت|الحضور)/i', $h)) $idxTime = $i;
        }

        // Fallbacks for Bitrix/Excel if no AC-No
        if ($idxNo === -1 && $idxName !== -1) $idxNo = $idxName; // Use Name as lookup if No is missing
        if ($idxNo === -1) $idxNo = 0; 
        if ($idxDate === -1) $idxDate = ($source === 'bitrix24') ? 1 : 3;
        if ($idxTime === -1) $idxTime = ($source === 'bitrix24') ? 2 : 4;

        $logsByEmployee = [];

        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            $empIdentifier = trim((string)($row[$idxNo] ?? ""));
            $rawDate = trim((string)($row[$idxDate] ?? ""));
            $rawTime = trim((string)($row[$idxTime] ?? ""));

            if (empty($empIdentifier) || empty($rawDate)) continue;

            $dateTimestamp = strtotime(str_replace('/', '-', $rawDate));
            if (!$dateTimestamp) continue;
            $date = date('Y-m-d', $dateTimestamp);
            
            $timeStrings = preg_split('/[\s,;]+/', $rawTime);
            
            $key = $empIdentifier . '_' . $date;
            if (!isset($logsByEmployee[$key])) {
                $logsByEmployee[$key] = ['identifier' => $empIdentifier, 'date' => $date, 'times' => []];
            }
            
            foreach ($timeStrings as $ts) {
                if (empty($ts)) continue;
                $t = date('H:i:s', strtotime($ts));
                if ($t) $logsByEmployee[$key]['times'][] = $t;
            }
        }

        foreach ($logsByEmployee as $log) {
            $report['total']++;
            $times = array_filter($log['times']);
            if (empty($times)) { $report['processed']++; continue; }
            
            sort($times);
            $checkIn = $times[0];
            $checkOut = count($times) > 1 ? end($times) : null;

            // Lookup by ID or Name
            $sql = "SELECT id FROM employees WHERE employee_number = :val1 OR full_name = :val2 LIMIT 1";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':val1' => $log['identifier'], ':val2' => $log['identifier']]);
            $employee = $stmt->fetch();

            if (!$employee) {
                $report['errors'][] = "الموظف ({$log['identifier']}) غير موجود";
                continue;
            }

            $empId = $employee['id'];
            $date = $log['date'];

            $stmt = $this->db->prepare("SELECT id FROM attendance WHERE employee_id = :eid AND date = :date");
            $stmt->execute([':eid' => $empId, ':date' => $date]);
            $existing = $stmt->fetch();

            $dataToSave = [
                'employee_id' => $empId,
                'date' => $date,
                'check_in_time' => $checkIn,
                'check_out_time' => $checkOut,
                'status' => 'present',
                'source' => $source
            ];

            if ($existing) {
                parent::update($existing['id'], $dataToSave);
                $report['updated']++;
            } else {
                parent::store($dataToSave);
                $report['created']++;
            }
            $report['processed']++;
        }

        return ['success' => true, 'report' => $report];
    }

    /**
     * Override store to handle direct entity creation with validation
     */
    public function store($data) {
        // If it's a direct check-in from mobile/web (source is mobile_app or manual with location)
        // and it's not an admin-like override (or we want to enforce it for everyone)
        if (isset($data['source']) && ($data['source'] === 'mobile_app' || $data['source'] === 'web')) {
            // We can just route to checkIn logic if it's a new record
            return $this->checkIn($data);
        }
        return parent::store($data);
    }

    /**
     * Override update to handle check-out validation
     */
    public function update($id, $data) {
        // If updating an existing record with a check-out time and it's from a self-service source
        if (isset($data['check_out_time']) && !empty($data['check_out_time']) &&
            isset($data['source']) && ($data['source'] === 'mobile_app' || $data['source'] === 'web')) {
            return $this->checkOut($id, $data);
        }
        return parent::update($id, $data);
    }

    /**
     * Employee check-in
     */
    private function checkIn($data) {
        $employeeId = $data['employee_id'] ?? null;
        $date = $data['date'] ?? date('Y-m-d');
        $time = $data['time'] ?? date('H:i:s');

        if (!$employeeId) {
            jsonError('employee_id مطلوب', 400);
        }

        // 1. Get Employee, Work Location and Schedule
        $stmt = $this->db->prepare("
            SELECT e.*, l.name as location_name, l.latitude, l.longitude, l.radius_meters, l.use_coordinates,
                   s.start_time, s.working_days, s.grace_period_minutes
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            LEFT JOIN work_schedules s ON l.id = s.work_location_id
            WHERE e.id = :id
        ");
        $stmt->execute([':id' => $employeeId]);
        $employee = $stmt->fetch();

        if (!$employee) {
            jsonError('الموظف غير موجود', 404);
        }

        // 2. Validate Geofencing
        $locationName = $employee['location_name'] ?? '';
        $isRemote = (stripos($locationName, 'Remote') !== false || stripos($locationName, 'عن بعد') !== false);

        if (!$isRemote && $employee['use_coordinates'] && $employee['radius_meters'] > 0) {
            $locationData = $data['check_in_location'] ?? $data['location'] ?? null;

            // If location is a string (JSON), decode it
            if (is_string($locationData)) {
                $locationData = json_decode($locationData, true);
            }

            $userLat = $locationData['latitude'] ?? null;
            $userLon = $locationData['longitude'] ?? null;

            if (!$userLat || !$userLon) {
                jsonError('إحداثيات الموقع مطلوبة لتسجيل الحضور في هذا المكان', 400);
            }

            if ($employee['latitude'] && $employee['longitude']) {
                $distance = $this->calculateDistance(
                    $userLat, $userLon,
                    $employee['latitude'], $employee['longitude']
                );

                $radius = $employee['radius_meters'];
                if ($distance > $radius) {
                    jsonError("أنت خارج النطاق المسموح. المسافة: " . round($distance) . " متر. الحد المسموح: $radius متر.", 400);
                }
            }
        }

        // 3. Validate Working Day
        if ($employee['working_days']) {
            $dayOfWeek = date('l', strtotime($date)); // e.g., "Monday"
            $workingDays = json_decode($employee['working_days'], true);
            if (!is_array($workingDays)) {
                $workingDays = explode(',', $employee['working_days']);
            }

            // Map Arabic/Common names if necessary, but assume English "Monday" etc.
            if (!in_array($dayOfWeek, $workingDays)) {
                jsonError("اليوم ليس من أيام العمل المحددة لهذا الموقع ($dayOfWeek)", 400);
            }
        }

        // 4. Check for existing attendance
        $stmt = $this->db->prepare("SELECT id FROM attendance WHERE employee_id = :eid AND date = :date");
        $stmt->execute([':eid' => $employeeId, ':date' => $date]);
        $existing = $stmt->fetch();

        if ($existing) {
            jsonError('الموظف مسجل حضور بالفعل اليوم', 400);
        }

        // 5. Calculate metrics (Lateness)
        $isLate = false;
        $lateMinutes = 0;
        $scheduledStart = $employee['start_time'] ?: '08:00:00';
        $gracePeriod = $employee['grace_period_minutes'] ?: 0;

        $scheduledWithGrace = date('H:i:s', strtotime($scheduledStart . " + $gracePeriod minutes"));

        if ($time > $scheduledWithGrace) {
            $isLate = true;
            $start = new DateTime($scheduledStart);
            $actual = new DateTime($time);
            $diff = $start->diff($actual);
            $lateMinutes = ($diff->h * 60) + $diff->i;
        }

        return parent::store([
            'employee_id' => $employeeId,
            'date' => $date,
            'check_in_time' => $time,
            'check_in_location' => isset($locationData) ? json_encode($locationData) : null,
            'status' => 'present',
            'is_late' => $isLate,
            'late_minutes' => $lateMinutes,
            'source' => $data['source'] ?? 'manual'
        ]);
    }

    /**
     * Calculate distance between two points in meters
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2) {
        $earthRadius = 6371000; // meters

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return $angle * $earthRadius;
    }

    /**
     * Employee check-out
     */
    private function checkOut($id, $data) {
        $attendance = $this->show($id);
        if (!$attendance) {
            jsonError('سجل الحضور غير موجود', 404);
        }

        $time = $data['time'] ?? date('H:i:s');
        $employeeId = $attendance['employee_id'];

        // 1. Get Employee and Work Location for Geofencing
        $stmt = $this->db->prepare("
            SELECT l.name, l.latitude, l.longitude, l.radius_meters, l.use_coordinates
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            WHERE e.id = :id
        ");
        $stmt->execute([':id' => $employeeId]);
        $location = $stmt->fetch();

        // 2. Validate Geofencing
        $locationName = $location['name'] ?? '';
        $isRemote = (stripos($locationName, 'Remote') !== false || stripos($locationName, 'عن بعد') !== false);

        if ($location && !$isRemote && $location['use_coordinates'] && $location['radius_meters'] > 0) {
            $locationData = $data['check_out_location'] ?? $data['location'] ?? null;
            
            // If location is a string (JSON), decode it
            if (is_string($locationData)) {
                $locationData = json_decode($locationData, true);
            }

            $userLat = $locationData['latitude'] ?? null;
            $userLon = $locationData['longitude'] ?? null;

            if (!$userLat || !$userLon) {
                jsonError('إحداثيات الموقع مطلوبة لتسجيل الانصراف في هذا المكان', 400);
            }

            if ($location['latitude'] && $location['longitude']) {
                $distance = $this->calculateDistance(
                    $userLat, $userLon, 
                    $location['latitude'], $location['longitude']
                );

                $radius = $location['radius_meters'];
                if ($distance > $radius) {
                    jsonError("أنت خارج النطاق المسموح لتسجيل الانصراف. المسافة: " . round($distance) . " متر.", 400);
                }
            }
        }

        // Calculate working hours
        $checkIn = new DateTime($attendance['check_in_time']);
        $checkOut = new DateTime($time);
        $diff = $checkIn->diff($checkOut);
        $workingHours = $diff->h + ($diff->i / 60);

        // Calculate overtime (assuming 8 hour workday)
        $overtimeHours = max(0, $workingHours - 8);

        return parent::update($id, [
            'check_out_time' => $time,
            'check_out_location' => isset($locationData) ? json_encode($locationData) : null,
            'working_hours' => round($workingHours, 2),
            'overtime_hours' => round($overtimeHours, 2)
        ]);
    }

    /**
     * Get attendance summary for employee
     */
    private function getSummary($employeeId, $params = []) {
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
}
