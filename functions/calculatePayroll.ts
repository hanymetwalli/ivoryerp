import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employee_id, month, year } = await req.json();
    
    // Validation
    if (!employee_id || !month || !year) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    if (month < 1 || month > 12) {
      return Response.json({ error: 'Invalid month (1-12)' }, { status: 400 });
    }

    // جلب بيانات الموظف
    const employees = await base44.asServiceRole.entities.Employee.filter({ id: employee_id });
    if (employees.length === 0) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }
    const employee = employees[0];

    // التحقق من وجود راتب سابق
    const existingPayrolls = await base44.asServiceRole.entities.Payroll.filter({
      employee_id,
      month: Number(month),
      year: Number(year),
    });
    
    if (existingPayrolls.length > 0) {
      return Response.json({ 
        error: 'الراتب محسوب مسبقاً لهذا الشهر',
        existing_payroll_id: existingPayrolls[0].id
      }, { status: 400 });
    }

    // جلب العقد النشط
    const contracts = await base44.asServiceRole.entities.Contract.filter({
      employee_id,
      status: 'active',
    });
    
    if (contracts.length === 0) {
      return Response.json({ error: 'لا يوجد عقد نشط للموظف' }, { status: 404 });
    }
    const contract = contracts[0];

    // الحصول على تاريخ بداية ونهاية الشهر
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const monthStartISO = monthStart.toISOString().split('T')[0];
    const monthEndISO = monthEnd.toISOString().split('T')[0];

    // جلب الحضور للشهر
    const allAttendance = await base44.asServiceRole.entities.Attendance.list('-date', 2000);
    const employeeAttendance = allAttendance.filter((a) => {
      if (a.employee_id !== employee_id) return false;
      return a.date >= monthStartISO && a.date <= monthEndISO;
    });

    // حساب الغياب والتأخير
    let totalLateMinutes = 0;
    let absentDays = 0;
    employeeAttendance.forEach((a) => {
      if (a.status === 'absent') {
        absentDays++;
      } else if (a.status === 'present' && a.late_minutes) {
        totalLateMinutes += Number(a.late_minutes) || 0;
      }
    });

    // جلب الساعات الإضافية المعتمدة
    const allOvertime = await base44.asServiceRole.entities.Overtime.list();
    const employeeOvertime = allOvertime.filter((o) => {
      if (o.employee_id !== employee_id || o.status !== 'approved') return false;
      if (!o.date) return false;
      return o.date >= monthStartISO && o.date <= monthEndISO;
    });
    const totalOvertimeHours = employeeOvertime.reduce((sum, o) => sum + (Number(o.hours) || 0), 0);

    // حساب مبلغ الساعات الإضافية
    const hourlyRate = (Number(contract.basic_salary) || 0) / 30 / 8;
    const overtimeRate = employeeOvertime.length > 0 ? (Number(employeeOvertime[0].overtime_rate) || 1.5) : 1.5;
    const overtimeAmount = totalOvertimeHours * hourlyRate * overtimeRate;

    // جلب العلاوات النشطة
    const allAllowances = await base44.asServiceRole.entities.Allowance.list();
    const employeeAllowances = allAllowances.filter((a) => {
      if (a.employee_id !== employee_id || a.status !== 'active') return false;
      const startDate = a.start_date || '1900-01-01';
      const endDate = a.end_date || '2099-12-31';
      return startDate <= monthEndISO && endDate >= monthStartISO;
    });
    const additionalAllowances = employeeAllowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

    // جلب الخصومات المعتمدة للشهر
    const allDeductions = await base44.asServiceRole.entities.Deduction.list();
    const employeeDeductions = allDeductions.filter((d) => {
      return d.employee_id === employee_id &&
             Number(d.month) === Number(month) &&
             Number(d.year) === Number(year) &&
             d.status === 'approved';
    });
    const otherDeductions = employeeDeductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    // جلب المكافآت المعتمدة للشهر
    const allBonuses = await base44.asServiceRole.entities.Bonus.list();
    const employeeBonuses = allBonuses.filter((b) => {
      return b.employee_id === employee_id &&
             Number(b.month) === Number(month) &&
             Number(b.year) === Number(year) &&
             b.status === 'approved';
    });
    const bonusesAmount = employeeBonuses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

    // جلب إعدادات التأمين
    const allInsurance = await base44.asServiceRole.entities.InsuranceSettings.list();
    const insurance = allInsurance.find((i) =>
      i.location_type === employee.location_type &&
      Number(i.year) === Number(year) &&
      i.status === 'active'
    );
    const insurancePercentage = Number(insurance?.employee_percentage) || 0;
    const maxInsurableSalary = Number(insurance?.max_insurable_salary) || 999999999;

    // حساب خصم التأمينات
    const basicSalary = Number(contract.basic_salary) || 0;
    const insurableBase = basicSalary > maxInsurableSalary ? maxInsurableSalary : basicSalary;
    const insuranceDeduction = (insurableBase * insurancePercentage) / 100;

    // حساب خصومات الغياب والتأخير
    const dailyRate = basicSalary / 30;
    const minuteRate = dailyRate / 8 / 60;
    const lateDeduction = totalLateMinutes * minuteRate;
    const absenceDeduction = absentDays * dailyRate;

    // حساب الإجماليات (مع التأكد من أن جميع القيم أرقام)
    const housingAllowance = Number(contract.housing_allowance) || 0;
    const transportAllowance = Number(contract.transport_allowance) || 0;
    const otherAllowances = Number(contract.other_allowances) || 0;

    const grossSalary = 
      basicSalary +
      housingAllowance +
      transportAllowance +
      otherAllowances +
      additionalAllowances +
      bonusesAmount +
      overtimeAmount;

    const totalDeductions = 
      insuranceDeduction + 
      lateDeduction + 
      absenceDeduction + 
      otherDeductions;

    const netSalary = grossSalary - totalDeductions;

    // توليد رقم مسير
    const requestNumberResponse = await base44.asServiceRole.functions.invoke('generateRequestNumber', {
      entityName: 'Payroll',
      prefix: 'PAY',
    });
    const payrollNumber = requestNumberResponse.data.requestNumber;

    // بناء كائن الراتب مع breakdown تفصيلي
    const payrollData = {
      payroll_number: payrollNumber,
      payroll_date: new Date().toISOString().split('T')[0],
      employee_id,
      month: Number(month),
      year: Number(year),
      basic_salary: parseFloat(basicSalary.toFixed(2)),
      housing_allowance: parseFloat(housingAllowance.toFixed(2)),
      transport_allowance: parseFloat(transportAllowance.toFixed(2)),
      other_allowances: parseFloat(otherAllowances.toFixed(2)),
      additional_allowances: parseFloat(additionalAllowances.toFixed(2)),
      bonuses_amount: parseFloat(bonusesAmount.toFixed(2)),
      overtime_amount: parseFloat(overtimeAmount.toFixed(2)),
      gross_salary: parseFloat(grossSalary.toFixed(2)),
      insurance_deduction: parseFloat(insuranceDeduction.toFixed(2)),
      late_deduction: parseFloat(lateDeduction.toFixed(2)),
      absence_deduction: parseFloat(absenceDeduction.toFixed(2)),
      other_deductions: parseFloat(otherDeductions.toFixed(2)),
      total_deductions: parseFloat(totalDeductions.toFixed(2)),
      net_salary: parseFloat(netSalary.toFixed(2)),
      currency: contract.currency || 'SAR',
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      working_days: 30 - absentDays,
      absent_days: absentDays,
      late_minutes: totalLateMinutes,
      overtime_hours: parseFloat(totalOvertimeHours.toFixed(2)),
      // تفصيل العلاوات (breakdown)
      allowances_breakdown: employeeAllowances.map(a => ({
        type: a.type,
        amount: Number(a.amount) || 0,
      })),
      // تفصيل الخصومات (breakdown)
      deductions_breakdown: employeeDeductions.map(d => ({
        type: d.type,
        amount: Number(d.amount) || 0,
      })),
      // تفصيل المكافآت (breakdown)
      bonuses_breakdown: employeeBonuses.map(b => ({
        title: b.title,
        amount: Number(b.amount) || 0,
      })),
    };

    // إنشاء سجل الراتب
    const createdPayroll = await base44.asServiceRole.entities.Payroll.create(payrollData);

    return Response.json({
      success: true,
      payroll: createdPayroll,
      message: 'تم حساب الراتب بنجاح',
    });
  } catch (error) {
    console.error('Error in calculatePayroll:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});