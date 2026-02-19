import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ 
        error: 'لم يتم توفير رابط الملف' 
      }, { status: 400 });
    }

    // تحميل الملف
    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) {
      return Response.json({ 
        error: 'فشل في تحميل الملف' 
      }, { status: 400 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    
    // قراءة ملف Excel
    let workbook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'array' });
    } catch (error) {
      return Response.json({ 
        error: 'فشل في قراءة ملف Excel',
        details: error.message
      }, { status: 400 });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return Response.json({ 
        error: 'الملف فارغ أو لا يحتوي على بيانات',
      }, { status: 400 });
    }

    const report = {
      total: jsonData.length,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // جلب جميع الموظفين وجداول العمل وسجلات الحضور الموجودة
    const employees = await base44.asServiceRole.entities.Employee.list();
    const workSchedules = await base44.asServiceRole.entities.WorkSchedule.list();
    const existingAttendance = await base44.asServiceRole.entities.Attendance.list('-created_date', 10000);
    
    const employeeMap = new Map();
    employees.forEach(emp => {
      if (emp.employee_number) {
        employeeMap.set(emp.employee_number.toString().trim(), emp);
      }
    });

    // إنشاء خريطة للسجلات الموجودة لسرعة البحث
    const attendanceMap = new Map();
    existingAttendance.forEach(att => {
      const key = `${att.employee_id}_${att.date}`;
      attendanceMap.set(key, att);
    });

    // دالة للتحقق من أن اليوم هو يوم عمل
    const isWorkingDay = (dateString, schedule) => {
      if (!schedule || !schedule.working_days || schedule.working_days.length === 0) {
        return true; // إذا لم يكن هناك جدول، نعتبر كل الأيام أيام عمل
      }
      
      const date = new Date(dateString);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      return schedule.working_days.includes(dayName);
    };

    // معالجة كل سجل
    for (const row of jsonData) {
      try {
        const acNo = row['AC-No']?.toString().trim();
        const rawDate = row['Date']?.toString().trim();
        const rawTime = row['Time']?.toString().trim();

        if (!acNo || !rawDate) {
          report.skipped++;
          continue;
        }

        // البحث عن الموظف
        const employee = employeeMap.get(acNo);
        if (!employee) {
          report.errors.push(`موظف غير موجود: ${acNo} (${row['Name']})`);
          report.skipped++;
          continue;
        }

        // تحويل التاريخ
        let formattedDate;
        try {
          // التعامل مع تنسيقات التاريخ المختلفة
          if (typeof rawDate === 'number') {
            // Excel date serial number
            const excelDate = XLSX.SSF.parse_date_code(rawDate);
            formattedDate = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
          } else {
            // نص التاريخ M/D/YYYY
            const parts = rawDate.split('/');
            if (parts.length === 3) {
              const month = parts[0].padStart(2, '0');
              const day = parts[1].padStart(2, '0');
              const year = parts[2];
              formattedDate = `${year}-${month}-${day}`;
            } else {
              throw new Error('Invalid date format');
            }
          }
        } catch (error) {
          report.errors.push(`تنسيق تاريخ خاطئ: ${rawDate} للموظف ${row['Name']}`);
          report.skipped++;
          continue;
        }

        // تحليل الأوقات - استخراج جميع الأوقات وأخذ الأول والأخير
        let checkInTime = null;
        let checkOutTime = null;

        if (rawTime) {
          const times = rawTime.toString()
            .split(/[\s,]+/)
            .map(t => t.trim())
            .filter(t => t && /^\d{1,2}:\d{2}(:\d{2})?$/.test(t))
            .map(t => {
              // تحويل إلى صيغة HH:MM فقط
              const parts = t.split(':');
              return `${parts[0].padStart(2, '0')}:${parts[1]}`;
            });

          if (times.length > 0) {
            checkInTime = times[0]; // أول وقت في اليوم
            checkOutTime = times[times.length - 1]; // آخر وقت في اليوم
            
            // إذا كانوا نفس الوقت، نعتبر أن هناك حضور فقط
            if (checkInTime === checkOutTime && times.length === 1) {
              checkOutTime = null;
            }
          }
        }

        // البحث عن جدول العمل للموظف
        const schedule = workSchedules.find(
          s => s.work_location_id === employee.work_location_id
        );

        // التحقق من أن اليوم هو يوم عمل
        if (!checkInTime && schedule) {
          const isWorking = isWorkingDay(formattedDate, schedule);
          if (!isWorking) {
            // تخطي هذا اليوم لأنه ليس يوم عمل
            report.skipped++;
            continue;
          }
        }

        // حساب المقاييس من Backend (موحد)
        let metrics = {
          late_minutes: 0,
          is_late: false,
          working_hours: 0,
          overtime_hours: 0,
        };

        if (checkInTime) {
          try {
            const metricsResponse = await base44.asServiceRole.functions.invoke('calculateAttendanceMetrics', {
              employee_id: employee.id,
              date: formattedDate,
              check_in_time: checkInTime,
              check_out_time: checkOutTime || null,
            });

            if (metricsResponse.data.success) {
              metrics = metricsResponse.data.metrics;
            }
          } catch (error) {
            console.error('Error calculating metrics:', error);
            // في حالة الفشل، نستخدم القيم الافتراضية (0)
          }
        }

        // التحقق من السجل الموجود باستخدام الخريطة المحلية
        const key = `${employee.id}_${formattedDate}`;
        const existingRecord = attendanceMap.get(key);

        const attendanceData = {
          employee_id: employee.id,
          date: formattedDate,
          check_in_time: checkInTime || null,
          check_out_time: checkOutTime || null,
          working_hours: metrics.working_hours,
          overtime_hours: metrics.overtime_hours,
          late_minutes: metrics.late_minutes,
          is_late: metrics.is_late,
          status: checkInTime ? "present" : "absent",
          source: "fingerprint_device"
        };

        // تحديث فقط إذا كانت البيانات مختلفة لتقليل العمليات
        if (existingRecord) {
          const needsUpdate = 
            existingRecord.check_in_time !== checkInTime ||
            existingRecord.check_out_time !== checkOutTime ||
            existingRecord.working_hours !== workingHours ||
            existingRecord.overtime_hours !== overtimeHours ||
            existingRecord.late_minutes !== lateMinutes;
          
          if (needsUpdate) {
            await base44.asServiceRole.entities.Attendance.update(
              existingRecord.id,
              attendanceData
            );
            report.updated++;
            report.processed++;
          } else {
            report.skipped++;
          }
        } else {
          const newRecord = await base44.asServiceRole.entities.Attendance.create(attendanceData);
          attendanceMap.set(key, newRecord);
          report.created++;
          report.processed++;
        }
      } catch (error) {
        report.errors.push(`خطأ في معالجة سجل ${row['Name']}: ${error.message}`);
        report.skipped++;
      }
    }

    return Response.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});