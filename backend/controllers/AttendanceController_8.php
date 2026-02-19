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
     * Unified Import method for Fingerprint and Bitrix
     */

    public function importSmartCSV($data) {
        set_time_limit(600);
        ini_set('memory_limit', '512M');
        ini_set('display_errors', 0); // لمنع ظهور أخطاء تفسد الـ JSON

        try {
            if (!isset($data['file_data'])) return ['success' => false, 'error' => 'لا توجد بيانات للملف'];

            // 1. تنظيف وفك التشفير
            $base64 = $data['file_data'];
            if (strpos($base64, ',') !== false) $base64 = explode(',', $base64)[1];
            $content = base64_decode($base64);

            if (!$content) return ['success' => false, 'error' => 'فشل قراءة محتوى الملف'];

            // 2. حماية من ملفات الإكسل (لمنع الانهيار)
            if (substr($content, 0, 2) === 'PK') {
                return ['success' => false, 'error' => 'عذراً، يجب تحويل ملف Excel (.xlsx) إلى CSV أولاً.'];
            }

            // 3. الحفظ المؤقت
            $tempFile = tempnam(sys_get_temp_dir(), 'imp_');
            file_put_contents($tempFile, $content);

            // 4. القراءة
            $rows = [];
            if (($handle = fopen($tempFile, "r")) !== FALSE) {
                $bom = fread($handle, 3);
                if ($bom != "\xEF\xBB\xBF") rewind($handle);
                
                $line1 = fgets($handle);
                $delimiter = (substr_count($line1, ';') > substr_count($line1, ',')) ? ';' : ',';
                rewind($handle);
                if ($bom != "\xEF\xBB\xBF") rewind($handle);

                while (($r = fgetcsv($handle, 10000, $delimiter)) !== FALSE) {
                    if (array_filter($r)) $rows[] = $r;
                }
                fclose($handle);
            }
            @unlink($tempFile);

            if (count($rows) < 2) return ['success' => false, 'error' => 'الملف فارغ أو لا يحتوي على بيانات'];

            // 5. تحليل الأعمدة
            $headers = array_map(function($h) { 
                return trim(str_replace(['"', "'", "\xEF\xBB\xBF"], '', $h)); 
            }, $rows[0]);

            $idxID = -1; $idxDate = -1; $idxTime = -1;

            foreach ($headers as $i => $h) {
                if (stripos($h, 'AC-No') !== false || stripos($h, 'User ID') !== false || stripos($h, 'ID') !== false) $idxID = $i;
                if (stripos($h, 'Date') !== false || stripos($h, 'DateTime') !== false) $idxDate = $i;
                if (stripos($h, 'Time') !== false || stripos($h, 'CheckTime') !== false) $idxTime = $i;
            }
            if ($idxTime == -1) $idxTime = $idxDate;

            if ($idxID == -1 || $idxDate == -1) {
                return ['success' => false, 'error' => 'الأعمدة المطلوبة (ID, Date) مفقودة'];
            }

            // 6. التنفيذ
            $this->db->beginTransaction();
            
            // خريطة الموظفين
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

            $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0];
$checkStmt = $this->db->prepare("SELECT id, check_in_time, check_out_time FROM attendance WHERE employee_id=? AND date=?");
            // التصحيح هنا: استخدام 'fingerprint_device' بدلاً من 'import' ليوافق الـ ENUM في قاعدة البيانات
            $insertStmt = $this->db->prepare("INSERT INTO attendance (id, employee_id, date, check_in_time, check_out_time, status, source, created_at) VALUES (UUID(), ?, ?, ?, ?, 'present', 'fingerprint_device', NOW())");
            $updateStmt = $this->db->prepare("UPDATE attendance SET check_in_time=?, check_out_time=?, updated_at=NOW() WHERE id=?");
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                if (!isset($row[$idxID])) continue;

                $acNo = trim($row[$idxID]);
                $rawD = isset($row[$idxDate]) ? trim($row[$idxDate]) : '';
                $rawT = isset($row[$idxTime]) ? trim($row[$idxTime]) : '';

                if ($acNo === '' || $rawD === '') { $stats['skipped']++; continue; }

                $empId = $empMap[$acNo] ?? $empMap[(int)$acNo] ?? null;
                if (!$empId) { $stats['skipped']++; continue; }

                // معالجة التاريخ
                $dateYMD = null;
                $cleanD = preg_replace('/[^\x20-\x7E]/', '', $rawD);
                if (strpos($cleanD, '/') !== false) {
                    $p = explode('/', $cleanD);
                    if (count($p) == 3) $dateYMD = date('Y-m-d', mktime(0,0,0, $p[0], $p[1], $p[2]));
                }
                if (!$dateYMD) {
                    $ts = strtotime($cleanD);
                    if ($ts) $dateYMD = date('Y-m-d', $ts);
                }
                if (!$dateYMD) { $stats['skipped']++; continue; }

                // معالجة الوقت
                $times = [];
                if (preg_match_all('/(\d{1,2}:\d{2}(?::\d{2})?)/', "$rawT $rawD", $matches)) {
                    foreach($matches[1] as $t) $times[] = date('H:i:s', strtotime($t));
                }
                if (empty($times)) { $stats['skipped']++; continue; }

                sort($times);
                $in = $times[0];
                $out = (count($times) > 1) ? end($times) : null;

                $checkStmt->execute([$empId, $dateYMD]);
                $exist = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($exist) {
                    $uIn = $exist['check_in_time']; $uOut = $exist['check_out_time']; $chg = false;
                    if ($in < $uIn) { $uIn = $in; $chg = true; }
                    if ($out && (!$uOut || $out > $uOut)) {
                        if (strtotime($out) - strtotime($uIn) > 60) { $uOut = $out; $chg = true; }
                    }
                    if ($chg) { $updateStmt->execute([$uIn, $uOut, $exist['id']]); $stats['updated']++; }
                    else { $stats['updated']++; }
                } else {
                    $insertStmt->execute([$empId, $dateYMD, $in, $out]);
                    $stats['created']++;
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
        // السماح للمصدر 'manual' بالمرور لدالة المعالجة المخصصة
        if (isset($data['source']) && in_array($data['source'], ['mobile_app', 'web', 'manual'])) {
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
        $source = $data['source'] ?? 'manual';

        if (!$employeeId) { jsonError('employee_id مطلوب', 400); return; }

        // 1. جلب بيانات الموظف والموقع (من الكود الطويل - ضروري للحسابات)
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

        if (!$employee) { jsonError('الموظف غير موجود', 404); return; }

        // 2. التحقق من الموقع الجغرافي (Geofencing - فقط إذا لم يكن عن بعد)
        $locationName = $employee['location_name'] ?? '';
        $isRemote = (stripos($locationName, 'Remote') !== false || stripos($locationName, 'عن بعد') !== false);

        // نتحقق من الموقع فقط إذا جاءت احداثيات من التطبيق أو المتصفح
        if (!$isRemote && $employee['use_coordinates'] && $employee['radius_meters'] > 0 && isset($data['check_in_location'])) {
            $locationData = $data['check_in_location'];
            if (is_string($locationData)) $locationData = json_decode($locationData, true);

            $userLat = $locationData['latitude'] ?? null;
            $userLon = $locationData['longitude'] ?? null;

            if ($userLat && $userLon && $employee['latitude'] && $employee['longitude']) {
                $distance = $this->calculateDistance(
                    $userLat, $userLon,
                    $employee['latitude'], $employee['longitude']
                );

                if ($distance > $employee['radius_meters']) {
                    jsonError("خارج النطاق. المسافة: " . round($distance) . "م (المسموح: {$employee['radius_meters']}م)", 400); 
                    return;
                }
            }
        }

        // 3. التحقق من أيام العمل (Working Days)
        if ($employee['working_days']) {
            $dayOfWeek = date('l', strtotime($date)); // اسم اليوم بالانجليزي
            $workingDays = json_decode($employee['working_days'], true);
            if (!is_array($workingDays)) $workingDays = explode(',', $employee['working_days']);
            
            // تحقق بسيط (يمكن تحسينه لدعم العربية)
            if (!in_array($dayOfWeek, $workingDays) && !empty($workingDays)) {
                // تحذير فقط أو منع حسب سياسة الشركة، هنا سنسمح به ولكن نسجله
                // jsonError("اليوم ليس يوم عمل", 400); return; 
            }
        }

        // 4. منع التكرار (Duplicate Check)
        $stmt = $this->db->prepare("SELECT id FROM attendance WHERE employee_id = :eid AND date = :date");
        $stmt->execute([':eid' => $employeeId, ':date' => $date]);
        if ($stmt->fetch()) { jsonError('الموظف مسجل حضور بالفعل اليوم', 400); return; }

        // 5. حساب التأخير (Lateness Logic)
        $isLate = 0;
        $lateMinutes = 0;
        $scheduledStart = $employee['start_time'] ?: '08:00:00';
        $grace = $employee['grace_period_minutes'] ?: 0;
        $withGrace = date('H:i:s', strtotime($scheduledStart . " + $grace minutes"));

        if ($time > $withGrace) {
            $isLate = 1;
            $startObj = new DateTime($scheduledStart);
            $actualObj = new DateTime($time);
            $diff = $startObj->diff($actualObj);
            $lateMinutes = ($diff->h * 60) + $diff->i;
        }

        // 6. الحفظ (باستخدام الطريقة المباشرة المضمونة - Short Code Style)
        try {
            $sql = "INSERT INTO attendance 
                    (id, employee_id, date, check_in_time, status, source, is_late, late_minutes, check_in_location, created_at) 
                    VALUES 
                    (UUID(), ?, ?, ?, 'present', ?, ?, ?, ?, NOW())";
            
            $locJson = isset($data['check_in_location']) ? (is_string($data['check_in_location']) ? $data['check_in_location'] : json_encode($data['check_in_location'])) : null;

            $stmt = $this->db->prepare($sql);
            $stmt->execute([$employeeId, $date, $time, $source, $isLate, $lateMinutes, $locJson]);

            return ['success' => true];
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    
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
