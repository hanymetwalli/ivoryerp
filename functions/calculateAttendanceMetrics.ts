import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { employee_id, date, check_in_time, check_out_time } = await req.json();
    
    // Validation
    if (!employee_id || !date || !check_in_time) {
      return Response.json({ 
        error: 'Missing required parameters (employee_id, date, check_in_time)' 
      }, { status: 400 });
    }

    // جلب بيانات الموظف
    const employees = await base44.asServiceRole.entities.Employee.filter({ id: employee_id });
    if (employees.length === 0) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }
    const employee = employees[0];

    // جلب جدول العمل الخاص بالموظف
    const workSchedules = await base44.asServiceRole.entities.WorkSchedule.filter({
      work_location_id: employee.work_location_id,
      status: 'active',
    });
    
    const schedule = workSchedules.length > 0 ? workSchedules[0] : null;

    // المتغيرات الافتراضية
    let working_hours = 0;
    let late_minutes = 0;
    let is_late = false;
    let overtime_hours = 0;

    // 1. حساب ساعات العمل الفعلية
    if (check_in_time && check_out_time) {
      const [inH, inM, inS] = check_in_time.split(':').map(Number);
      const [outH, outM, outS] = check_out_time.split(':').map(Number);
      
      let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      
      // معالجة حالة الانصراف في اليوم التالي (العمل الليلي)
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
      }
      
      // تحويل لساعات (مع رقمين عشريين)
      working_hours = totalMinutes > 0 ? parseFloat((totalMinutes / 60).toFixed(2)) : 0;
    }

    // 2. حساب التأخير (فقط إذا كان هناك جدول عمل)
    if (check_in_time && schedule && schedule.start_time) {
      const [scheduleH, scheduleM] = schedule.start_time.split(':').map(Number);
      const [checkInH, checkInM] = check_in_time.split(':').map(Number);
      
      const gracePeriod = Number(schedule.grace_period_minutes) || 0;
      const scheduledStartMinutes = scheduleH * 60 + scheduleM + gracePeriod;
      const actualCheckInMinutes = checkInH * 60 + checkInM;
      
      if (actualCheckInMinutes > scheduledStartMinutes) {
        late_minutes = actualCheckInMinutes - scheduledStartMinutes;
        is_late = true;
      }
    }

    // 3. حساب الساعات الإضافية (الفرق بين ساعات العمل الفعلية والمجدولة)
    if (schedule && schedule.start_time && schedule.end_time && working_hours > 0) {
      const [startH, startM] = schedule.start_time.split(':').map(Number);
      const [endH, endM] = schedule.end_time.split(':').map(Number);
      
      let scheduledMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      
      // معالجة حالة الدوام الليلي
      if (scheduledMinutes < 0) {
        scheduledMinutes += 24 * 60;
      }
      
      const scheduledHours = scheduledMinutes / 60;
      const actualHours = working_hours;
      
      // الساعات الإضافية = الفعلية - المجدولة (فقط إذا كانت موجبة)
      if (actualHours > scheduledHours) {
        overtime_hours = parseFloat((actualHours - scheduledHours).toFixed(2));
      }
    }

    // إرجاع النتائج
    return Response.json({
      success: true,
      metrics: {
        late_minutes: Number(late_minutes) || 0,
        is_late: Boolean(is_late),
        working_hours: Number(working_hours) || 0,
        overtime_hours: Number(overtime_hours) || 0,
      },
    });
  } catch (error) {
    console.error('Error in calculateAttendanceMetrics:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});