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

    
    // --- المحرك الذكي للاستيراد (مع الحسابات الكاملة) ---
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
            if (substr($content, 0, 2) === 'PK') return ['success' => false, 'error' => 'ملفات Excel (.xlsx) غير مدعومة مباشرة، يرجى التحويل إلى CSV.'];

            // 2. الحفظ المؤقت
            $tempFile = tempnam(sys_get_temp_dir(), 'imp_');
            file_put_contents($tempFile, $content);

            // 3. القراءة
            $rows = [];
            if (($handle = fopen($tempFile, "r")) !== FALSE) {
                $bom = fread($handle, 3);
                if ($bom != "\xEF\xBB\xBF") rewind($handle);
                $line1 = fgets($handle);
                $delimiter = (substr_count($line1, ';') > substr_count($line1, ',')) ? ';' : ',';
                rewind($handle);
                if ($bom != "\xEF\xBB\xBF") rewind($handle);
                while (($r = fgetcsv($handle, 10000, $delimiter)) !== FALSE) { if (array_filter($r)) $rows[] = $r; }
                fclose($handle);
            }
            @unlink($tempFile);

            if (count($rows) < 2) return ['success' => false, 'error' => 'الملف فارغ'];

            // 4. تحليل الأعمدة
            $headers = array_map(function($h) { return trim(str_replace(['"', "'", "\xEF\xBB\xBF"], '', $h)); }, $rows[0]);
            $idxID = -1; $idxDate = -1; $idxTime = -1;

            foreach ($headers as $i => $h) {
                if (stripos($h, 'AC-No') !== false || stripos($h, 'User ID') !== false || stripos($h, 'EnNo') !== false || stripos($h, 'ID') !== false) $idxID = $i;
                if (stripos($h, 'Date') !== false || stripos($h, 'DateTime') !== false) $idxDate = $i;
                if (stripos($h, 'Time') !== false || stripos($h, 'CheckTime') !== false || stripos($h, 'Clock') !== false) $idxTime = $i;
            }
            if ($idxTime == -1) $idxTime = $idxDate;

            if ($idxID == -1 || $idxDate == -1) return ['success' => false, 'error' => 'الأعمدة المطلوبة (ID, Date) مفقودة'];

            // 5. التنفيذ
            $this->db->beginTransaction();
            
            // خريطة الموظفين
            $stmt = $this->db->query("SELECT id, employee_number FROM employees");
            $empMap = [];
            while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $n = trim($r['employee_number']);
                $empMap[$n] = $r['id'];
                $digits = preg_replace('/[^0-9]/', '', $n);
                if ($digits !== '') { $empMap[(int)$digits] = $r['id']; $empMap[(string)$digits] = $r['id']; }
            }

            $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];
            
            // تجهيز الاستعلامات
            $checkStmt = $this->db->prepare("SELECT id, check_in_time, check_out_time FROM attendance WHERE employee_id=? AND date=?");
            
            $insertStmt = $this->db->prepare("
                INSERT INTO attendance 
                (id, employee_id, date, check_in_time, check_out_time, working_hours, overtime_hours, status, source, is_late, late_minutes, created_at) 
                VALUES 
                (UUID(), ?, ?, ?, ?, ?, ?, 'present', 'fingerprint_device', ?, ?, NOW())
            ");
            
            $updateStmt = $this->db->prepare("
                UPDATE attendance 
                SET check_in_time=?, check_out_time=?, working_hours=?, overtime_hours=?, is_late=?, late_minutes=?, updated_at=NOW() 
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
                    if(count($stats['errors']) < 5) $stats['errors'][] = "سطر $i: الموظف $acNo غير موجود";
                    $stats['skipped']++; continue; 
                }

                // معالجة التاريخ
                $dateYMD = null;
                $cleanD = preg_replace('/[^\x20-\x7E]/', '', $rawD);
                if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $cleanD)) $dateYMD = $cleanD;
                elseif (strpos($cleanD, '/') !== false) {
                    $p = explode('/', $cleanD);
                    if (count($p) == 3) $dateYMD = date('Y-m-d', mktime(0,0,0, $p[0], $p[1], $p[2]));
                }
                if (!$dateYMD) { $ts = strtotime($cleanD); if($ts) $dateYMD = date('Y-m-d', $ts); }
                if (!$dateYMD) { $stats['skipped']++; continue; }

                // معالجة الوقت
                $times = [];
                if (preg_match_all('/(\d{1,2}:\d{2}(?::\d{2})?)/', "$rawT $rawD", $matches)) {
                    foreach($matches[1] as $t) $times[] = date('H:i:s', strtotime($t));
                }
                if (empty($times)) { $stats['skipped']++; continue; }

                sort($times);
                $fileIn = $times[0]; 
                $fileOut = (count($times) > 1) ? end($times) : null; 

                // فحص السجل الموجود
                $checkStmt->execute([$empId, $dateYMD]);
                $exist = $checkStmt->fetch(PDO::FETCH_ASSOC);

                $finalIn = $fileIn;
                $finalOut = $fileOut;
                $isUpdate = false;

                if ($exist) {
                    $dbIn = $exist['check_in_time'];
                    $dbOut = $exist['check_out_time'];
                    
                    if ($dbIn && $dbIn < $finalIn) $finalIn = $dbIn;
                    
                    if ($dbOut && (!$finalOut || $dbOut > $finalOut)) $finalOut = $dbOut;
                    else if (!$finalOut && $dbOut) $finalOut = $dbOut;

                    $isUpdate = true;
                }

                // ==========================================
                //  الحسابات (Lateness Fix Here)
                // ==========================================
                
                // 1. جلب جدول الموظف
                $info = $this->getScheduleInfo($empId);

                // 2. حساب التأخير (Lateness) - التصحيح الجذري
                $isLate = 0;
                $lateMinutes = 0;
                
                // نستخدم التاريخ الفعلي لتوحيد الأساس الزمني
                $schedStartTs = strtotime("$dateYMD " . $info['start_time']);
                $actualInTs = strtotime("$dateYMD " . $finalIn);
                
                // حساب نهاية فترة السماح
                $graceLimitTs = $schedStartTs + ($info['grace_period'] * 60);

                // إذا كان وقت الدخول الفعلي أكبر من (وقت البدء + السماح)
                if ($actualInTs > $graceLimitTs) {
                    $isLate = 1;
                    // التأخير يحسب: وقت الدخول الفعلي - وقت البدء الرسمي (وليس وقت السماح)
                    // مثال: البدء 8:00، السماح 15د. حضر 8:20. التأخير = 20 دقيقة (وليس 5).
                    $lateMinutes = floor(($actualInTs - $schedStartTs) / 60);
                }

                // 3. حساب العمل والإضافي
                $workHours = 0.00;
                $overHours = 0.00;

                if ($finalOut) {
                    $inTs = strtotime("$dateYMD $finalIn");
                    $outTs = strtotime("$dateYMD $finalOut");
                    
                    // إذا الخروج أصغر من الدخول، معناه اليوم التالي
                    if ($outTs < $inTs) $outTs += 86400; 

                    // شرط: يجب أن يكون الفرق أكثر من دقيقة لحساب العمل
                    if (($outTs - $inTs) > 60) {
                        $workHours = round(($outTs - $inTs) / 3600, 2);

                        // حساب طول الشفت الرسمي
                        $sStart = strtotime("$dateYMD " . $info['start_time']);
                        $sEnd = strtotime("$dateYMD " . $info['end_time']);
                        if ($sEnd < $sStart) $sEnd += 86400;
                        
                        $shiftDur = ($sEnd - $sStart) / 3600;
                        if ($shiftDur <= 0) $shiftDur = 8; 

                        $overHours = max(0, $workHours - $shiftDur);
                    } else {
                        // خروج وهمي (نفس وقت الدخول)
                        $finalOut = null;
                        $workHours = 0;
                    }
                }

                // ==========================================
                //  الحفظ
                // ==========================================

                if ($isUpdate) {
                    $updateStmt->execute([
                        $finalIn, 
                        $finalOut, 
                        $workHours, 
                        $overHours, 
                        $isLate, 
                        $lateMinutes, 
                        $exist['id']
                    ]);
                    $stats['updated']++;
                } else {
                    $insertStmt->execute([
                        $empId, 
                        $dateYMD, 
                        $finalIn, 
                        $finalOut, 
                        $workHours, 
                        $overHours, 
                        $isLate, 
                        $lateMinutes
                    ]);
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
    
    public function checkIn($data) {
        // 1. استقبال البيانات وتجهيز المتغيرات
        $employeeId = $data['employee_id'] ?? null;
        if (!$employeeId) { return ['success' => false, 'error' => 'مطلوب employee_id']; }

        $date = $data['date'] ?? date('Y-m-d');
        // في التسجيل اليدوي، نستخدم الأسماء القادمة من الفورم
        $inTimeStr = $data['check_in_time'] ?? $data['time'] ?? date('H:i:s');
        $outTimeStr = $data['check_out_time'] ?? null; // قد يكون null
        $source = $data['source'] ?? 'manual';

        // 2. جلب بيانات الموظف والجدول (للحسابات الدقيقة)
        // نحتاج start_time و end_time لحساب طول الشفت الفعلي
        $stmt = $this->db->prepare("
            SELECT e.*, l.name as location_name, l.latitude, l.longitude, l.radius_meters, l.use_coordinates,
                   s.start_time, s.end_time, s.working_days, s.grace_period_minutes
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            LEFT JOIN work_schedules s ON l.id = s.work_location_id
            WHERE e.id = :id
        ");
        $stmt->execute([':id' => $employeeId]);
        $employee = $stmt->fetch();

        if (!$employee) { return ['success' => false, 'error' => 'الموظف غير موجود']; }

        // 3. التحقق من الموقع الجغرافي (Geofencing) - يتم تخطيه للمصدر اليدوي
        $locationName = $employee['location_name'] ?? '';
        $isRemote = (stripos($locationName, 'Remote') !== false || stripos($locationName, 'عن بعد') !== false);

        if ($source !== 'manual' && !$isRemote && $employee['use_coordinates'] && $employee['radius_meters'] > 0) {
            $locationData = $data['check_in_location'] ?? null;
            if (is_string($locationData)) $locationData = json_decode($locationData, true);

            $userLat = $locationData['latitude'] ?? null;
            $userLon = $locationData['longitude'] ?? null;

            if ($userLat && $userLon && $employee['latitude'] && $employee['longitude']) {
                $distance = $this->calculateDistance($userLat, $userLon, $employee['latitude'], $employee['longitude']);
                if ($distance > $employee['radius_meters']) {
                    return ['success' => false, 'error' => "خارج النطاق. المسافة: " . round($distance) . "م"];
                }
            }
        }

        // 4. التحقق من التكرار
        $stmt = $this->db->prepare("SELECT id FROM attendance WHERE employee_id = ? AND date = ?");
        $stmt->execute([$employeeId, $date]);
        if ($stmt->fetch()) { return ['success' => false, 'error' => 'مسجل مسبقاً لهذا اليوم']; }

        // 5. الحسابات الدقيقة (التأخير + ساعات العمل + الإضافي)
        
        // أ) حساب التأخير (Lateness)
        $isLate = 0;
        $lateMinutes = 0;
        
        if (!empty($employee['start_time'])) {
            $scheduledStart = $employee['start_time']; 
            $grace = $employee['grace_period_minutes'] ?: 0;
            
            // تحويل التواقيت لـ Timestamp للمقارنة الصحيحة
            $scheduledStartTs = strtotime("$date $scheduledStart");
            $actualInTs = strtotime("$date $inTimeStr");
            $limitTs = $scheduledStartTs + ($grace * 60);

            if ($actualInTs > $limitTs) {
                $isLate = 1;
                // التأخير يحسب من وقت البداية الأصلي، ليس من نهاية فترة السماح
                $lateMinutes = floor(($actualInTs - $scheduledStartTs) / 60);
            }
        }

        // ب) حساب ساعات العمل والإضافي (فقط إذا وجد وقت انصراف)
        $workingHours = 0.00;
        $overtimeHours = 0.00;

        if (!empty($outTimeStr)) {
            $inTs = strtotime("$date $inTimeStr");
            $outTs = strtotime("$date $outTimeStr");
            
            // معالجة الشفت الليلي (إذا كان الخروج في اليوم التالي)
            if ($outTs < $inTs) {
                $outTs += 24 * 60 * 60; // إضافة 24 ساعة
            }
            
            // ساعات العمل الفعلية
            $workingHours = round(($outTs - $inTs) / 3600, 2);
            
            // حساب ساعات العمل الرسمية (Shift Duration) من الجدول
            $shiftDuration = 8; // افتراضي
            if (!empty($employee['start_time']) && !empty($employee['end_time'])) {
                $shiftStartTs = strtotime("$date " . $employee['start_time']);
                $shiftEndTs = strtotime("$date " . $employee['end_time']);
                
                if ($shiftEndTs < $shiftStartTs) {
                    $shiftEndTs += 24 * 60 * 60; // شفت ليلي للجدول
                }
                
                $calculatedShift = ($shiftEndTs - $shiftStartTs) / 3600;
                if ($calculatedShift > 0) {
                    $shiftDuration = $calculatedShift;
                }
            }
            
            // حساب الإضافي: (ساعات العمل الفعلية - ساعات الجدول الرسمية)
            if ($workingHours > $shiftDuration) {
                $overtimeHours = $workingHours - $shiftDuration;
            }
        }

        // 6. الحفظ في قاعدة البيانات
        try {
            $locJson = null;
            if (isset($data['check_in_location'])) {
                $locJson = is_string($data['check_in_location']) ? $data['check_in_location'] : json_encode($data['check_in_location']);
            }

            $sql = "INSERT INTO attendance 
                    (id, employee_id, date, check_in_time, check_out_time, working_hours, overtime_hours, status, source, is_late, late_minutes, check_in_location, created_at) 
                    VALUES 
                    (UUID(), ?, ?, ?, ?, ?, ?, 'present', ?, ?, ?, ?, NOW())";
            
            $stmt = $this->db->prepare($sql);
            $success = $stmt->execute([
                $employeeId, 
                $date, 
                $inTimeStr, 
                $outTimeStr ?: null, 
                $workingHours, 
                $overtimeHours, 
                $source, 
                $isLate, 
                $lateMinutes, 
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


    /**
     * Calculate distance between two points in meters
     */
    public function calculateDistance($lat1, $lon1, $lat2, $lon2) {
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
    public function checkOut($id, $data) {
        // 1. جلب سجل الحضور الحالي
        $attendance = $this->show($id);
        if (!$attendance) {
            jsonError('سجل الحضور غير موجود', 404);
            return;
        }

        $time = $data['time'] ?? date('H:i:s');
        $employeeId = $attendance['employee_id'];

        // 2. جلب بيانات الموظف والموقع (لغرض Geofencing) وجدول العمل (لحساب الإضافي)
        $stmt = $this->db->prepare("
            SELECT l.name, l.latitude, l.longitude, l.radius_meters, l.use_coordinates,
                   s.start_time, s.end_time
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            LEFT JOIN work_schedules s ON l.id = s.work_location_id
            WHERE e.id = :id
        ");
        $stmt->execute([':id' => $employeeId]);
        $location = $stmt->fetch();

        // 3. التحقق من الموقع الجغرافي (Geofencing Validation)
        $locationName = $location['name'] ?? '';
        $isRemote = (stripos($locationName, 'Remote') !== false || stripos($locationName, 'عن بعد') !== false);

        // نقوم بالتحقق فقط إذا لم يكن العمل عن بعد، وكان الموقع مفعلاً، وتوجد إحداثيات مرسلة
        if ($location && !$isRemote && $location['use_coordinates'] && $location['radius_meters'] > 0) {
            $locationData = $data['check_out_location'] ?? $data['location'] ?? null;
            
            // معالجة JSON إذا وصل كنص
            if (is_string($locationData)) {
                $locationData = json_decode($locationData, true);
            }

            $userLat = $locationData['latitude'] ?? null;
            $userLon = $locationData['longitude'] ?? null;

            // إذا كان التسجيل يتطلب موقعاً ولم يرسل المستخدم إحداثيات
            if (!$userLat || !$userLon) {
                // ملاحظة: في حالة التعديل اليدوي من الإدارة قد لا تتوفر إحداثيات، يمكن تجاوز ذلك بالتحقق من المصدر
                if (($data['source'] ?? '') !== 'manual_edit') {
                    jsonError('إحداثيات الموقع مطلوبة لتسجيل الانصراف', 400);
                    return;
                }
            }

            // حساب المسافة
            if ($userLat && $userLon && $location['latitude'] && $location['longitude']) {
                $distance = $this->calculateDistance(
                    $userLat, $userLon, 
                    $location['latitude'], $location['longitude']
                );

                $radius = $location['radius_meters'];
                if ($distance > $radius) {
                    jsonError("أنت خارج النطاق المسموح لتسجيل الانصراف. المسافة: " . round($distance) . " متر.", 400);
                    return;
                }
            }
        }

        // 4. حساب ساعات العمل (Working Hours Calculation)
        $checkInDate = $attendance['date']; // استخدام تاريخ السجل لضمان الدقة
        $checkInTime = $attendance['check_in_time'];
        
        $inTimestamp = strtotime("$checkInDate $checkInTime");
        $outTimestamp = strtotime("$checkInDate $time");

        // معالجة الحالة التي يكون فيها الانصراف في اليوم التالي (بعد منتصف الليل)
        if ($outTimestamp < $inTimestamp) {
            $outTimestamp += 24 * 60 * 60; // إضافة يوم
        }

        $workingHours = round(($outTimestamp - $inTimestamp) / 3600, 2);

        // 5. حساب الساعات الإضافية (Overtime Calculation) - التصحيح هنا
        $overtimeHours = 0.00;
        
        // حساب مدة الشفت الرسمية بناءً على الجدول
        $shiftStart = $location['start_time'] ?? '08:00:00';
        $shiftEnd = $location['end_time'] ?? '16:00:00';
        
        $shiftStartTs = strtotime("$checkInDate $shiftStart");
        $shiftEndTs = strtotime("$checkInDate $shiftEnd");
        
        if ($shiftEndTs < $shiftStartTs) {
             $shiftEndTs += 24 * 60 * 60; // شفت ليلي
        }
        
        $standardShiftHours = ($shiftEndTs - $shiftStartTs) / 3600;
        
        // إذا لم يتم العثور على جدول، نعتمد الافتراضي 8 ساعات
        if ($standardShiftHours <= 0) {
            $standardShiftHours = 8;
        }

        // الإضافي هو الفرق بين الساعات الفعلية وساعات الشفت الرسمية
        $overtimeHours = max(0, $workingHours - $standardShiftHours);

        // 6. الحفظ والتحديث (Update Record)
        return parent::update($id, [
            'check_out_time' => $time,
            'check_out_location' => isset($locationData) ? json_encode($locationData) : null,
            'working_hours' => round($workingHours, 2),
            'overtime_hours' => round($overtimeHours, 2),
            'updated_at' => date('Y-m-d H:i:s') // تحديث وقت التعديل
        ]);
    }

    /**
     * Get attendance summary for employee
     */
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


    // --- دالة مساعدة جديدة: لجلب تفاصيل الشفت والوقت المسموح ---
    public function getScheduleInfo($employeeId) {
        $stmt = $this->db->prepare("
            SELECT s.start_time, s.end_time, s.grace_period_minutes, 
                   l.latitude, l.longitude, l.radius_meters, l.use_coordinates, l.name as location_name
            FROM employees e
            LEFT JOIN work_locations l ON e.work_location_id = l.id
            LEFT JOIN work_schedules s ON l.id = s.work_location_id
            WHERE e.id = ?
        ");
        $stmt->execute([$employeeId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return [
            'start_time' => $data['start_time'] ?? '08:00:00', // وقت البدء الافتراضي
            'end_time'   => $data['end_time'] ?? '16:00:00',   // وقت النهاية الافتراضي
            'grace_period' => $data['grace_period_minutes'] ?? 15,
            'use_coords' => $data['use_coordinates'] ?? 0,
            'radius' => $data['radius_meters'] ?? 0,
            'lat' => $data['latitude'] ?? null,
            'lon' => $data['longitude'] ?? null,
            'loc_name' => $data['location_name'] ?? ''
        ];
    }
}
