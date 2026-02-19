import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

    // استخراج البيانات من الملف
    let result;
    try {
      result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  "AC-No": { type: "string" },
                  "Name": { type: "string" },
                  "Department": { type: "string" },
                  "Date": { type: "string" },
                  "Time": { type: "string" }
                }
              }
            }
          }
        }
      });
    } catch (extractError) {
      console.error('Extract error:', extractError);
      return Response.json({ 
        error: 'فشل في قراءة الملف. تأكد من أن الملف بصيغة Excel صحيحة ويحتوي على الأعمدة المطلوبة',
        details: extractError.message 
      }, { status: 400 });
    }

    if (result.status !== "success" || !result.output?.data) {
      return Response.json({ 
        error: 'فشل في استخراج البيانات من الملف',
        details: result.details || 'تأكد من أن الملف يحتوي على الأعمدة: AC-No, Name, Department, Date, Time'
      }, { status: 400 });
    }

    const logs = result.output.data;
    const report = {
      total: logs.length,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // جلب جميع الموظفين مرة واحدة
    const employees = await base44.asServiceRole.entities.Employee.list();
    const employeeMap = new Map();
    employees.forEach(emp => {
      if (emp.employee_number) {
        employeeMap.set(emp.employee_number.toString(), emp);
      }
    });

    // معالجة كل سجل
    for (const log of logs) {
      try {
        const acNo = log["AC-No"]?.toString().trim();
        const rawDate = log["Date"]?.toString().trim();
        const rawTime = log["Time"]?.toString().trim();

        // تخطي الصفوف الفارغة
        if (!acNo || !rawDate) {
          report.skipped++;
          continue;
        }

        // البحث عن الموظف
        const employee = employeeMap.get(acNo);
        if (!employee) {
          report.errors.push(`Employee not found for AC-No: ${acNo} (${log["Name"]})`);
          report.skipped++;
          continue;
        }

        // تحويل التاريخ إلى تنسيق ISO
        const dateParts = rawDate.split('/');
        let formattedDate;
        
        if (dateParts.length === 3) {
          const month = dateParts[0].padStart(2, '0');
          const day = dateParts[1].padStart(2, '0');
          const year = dateParts[2];
          formattedDate = `${year}-${month}-${day}`;
        } else {
          report.errors.push(`Invalid date format for ${log["Name"]} on ${rawDate}`);
          report.skipped++;
          continue;
        }

        // تحليل الأوقات
        let checkInTime = null;
        let checkOutTime = null;

        if (rawTime) {
          const times = rawTime.split(' ')
            .map(t => t.trim())
            .filter(t => t && /^\d{1,2}:\d{2}/.test(t));

          if (times.length > 0) {
            // أصغر وقت = حضور
            checkInTime = times.reduce((min, time) => {
              return time < min ? time : min;
            }, times[0]);

            // أكبر وقت = انصراف (فقط إذا كان هناك أكثر من وقت)
            if (times.length > 1) {
              checkOutTime = times.reduce((max, time) => {
                return time > max ? time : max;
              }, times[0]);
            }
          }
        }

        // التحقق من وجود سجل سابق
        const existingRecords = await base44.asServiceRole.entities.Attendance.filter({
          employee_id: employee.id,
          date: formattedDate
        });

        const attendanceData = {
          employee_id: employee.id,
          date: formattedDate,
          check_in_time: checkInTime,
          check_out_time: checkOutTime,
          status: checkInTime ? "present" : "absent",
          source: "fingerprint_device"
        };

        if (existingRecords.length > 0) {
          // تحديث السجل الموجود
          await base44.asServiceRole.entities.Attendance.update(
            existingRecords[0].id,
            attendanceData
          );
          report.updated++;
        } else {
          // إنشاء سجل جديد
          await base44.asServiceRole.entities.Attendance.create(attendanceData);
          report.created++;
        }

        report.processed++;
      } catch (error) {
        report.errors.push(`Error processing record for ${log["Name"]}: ${error.message}`);
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