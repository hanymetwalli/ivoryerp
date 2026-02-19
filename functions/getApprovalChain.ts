import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// ✅ دالة تطبيع الأسماء العربية (عدوانية - Aggressive Normalization)
function normalizeArabicText(text) {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/أ|إ|آ|ٱ/g, 'ا')      // توحيد جميع أنواع الألف
    .replace(/ة|ه/g, 'ه')          // توحيد التاء المربوطة والهاء
    .replace(/ى/g, 'ي')            // توحيد الياء المقصورة
    .replace(/\s+/g, ' ')          // إزالة المسافات المتعددة
    .replace(/[ًٌٍَُِّْ]/g, '');   // إزالة التشكيل
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { employeeId, requiresFinanceApproval, entity } = await req.json();

    // جلب بيانات الموظف
    const employees = await base44.asServiceRole.entities.Employee.filter({ id: employeeId });
    if (employees.length === 0) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }
    const employee = employees[0];

    // جلب الأقسام
    const departments = await base44.asServiceRole.entities.Department.list();
    
    // ✅ بناء سلسلة الاعتماد الذكية مع التخطي التلقائي والمخرجات المفصلة
    const approvalChain = [];
    const trace = []; // سجل التتبع التشريحي
    let currentDeptName = employee.department;
    
    trace.push(`[START] 🚀 Employee: ${employee.full_name} (${employee.employee_number}), Department: ${currentDeptName}, Entity: ${entity}`);
    
    // البحث عن القسم ومديره (مع تطبيع عدواني للأسماء)
    while (currentDeptName) {
      const normalizedCurrentDept = normalizeArabicText(currentDeptName);
      const dept = departments.find(d => normalizeArabicText(d.name) === normalizedCurrentDept);
      
      trace.push(`[SEARCH] 🔍 Looking for: "${currentDeptName}" (normalized: "${normalizedCurrentDept}")`);
      
      if (!dept) {
        trace.push(`[ERROR] ❌ Department not found! Available departments: ${departments.map(d => `"${d.name}"`).join(', ')}`);
        trace.push(`[ERROR] ❌ Normalized search failed. Current normalized: "${normalizedCurrentDept}"`);
        trace.push(`[ERROR] ❌ Available normalized: ${departments.map(d => `"${normalizeArabicText(d.name)}"`).join(', ')}`);
        break;
      }
      
      trace.push(`[FOUND] ✅ Department: ${dept.name} (ID: ${dept.id}, Code: ${dept.code})`);
      
      // ✅ إضافة مدير القسم إلى السلسلة (مع تخطي صاحب الطلب)
      if (dept.manager_id) {
        const managerEmployees = await base44.asServiceRole.entities.Employee.filter({ id: dept.manager_id });
        if (managerEmployees.length > 0) {
          const manager = managerEmployees[0];
          
          // ✅ تخطي صاحب الطلب إذا كان هو مدير القسم
          if (manager.id === employeeId) {
            trace.push(`[SKIP] ⚠️ Manager "${manager.full_name}" (${manager.employee_number}) is the requester himself → Auto-Skip to parent department`);
          } else {
            approvalChain.push({
              level: `department_manager_${dept.id}`,
              level_name: `مدير ${dept.name}`,
              approver_id: dept.manager_id,
              approver_name: manager.full_name,
              approver_employee_number: manager.employee_number,
              approver_position: manager.position,
              approver_email: manager.email,
              department_id: dept.id,
              department_name: dept.name,
              approval_status: 'pending',
            });
            trace.push(`[ADDED] ✅ Level ${approvalChain.length}: ${dept.name} Manager → "${manager.full_name}" (${manager.employee_number}) | Position: ${manager.position}`);
          }
        } else {
          trace.push(`[WARNING] ⚠️ Manager ID ${dept.manager_id} not found in Employee table!`);
        }
      } else {
        trace.push(`[INFO] ℹ️ Department "${dept.name}" has no manager assigned, skipping`);
      }
      
      // الانتقال للقسم الأعلى
      if (dept.parent_department_id) {
        const parentDept = departments.find(d => d.id === dept.parent_department_id);
        currentDeptName = parentDept ? parentDept.name : null;
        if (currentDeptName) {
          trace.push(`[MOVE UP] ⬆️ Moving to parent department: "${currentDeptName}"`);
        } else {
          trace.push(`[ERROR] ❌ Parent department ID ${dept.parent_department_id} not found!`);
        }
      } else {
        trace.push(`[END] 🏁 Reached top of organizational hierarchy`);
        currentDeptName = null;
      }
    }

    // ✅ إضافة الموارد البشرية والمحاسبة مع تفاصيل المسؤولين
    if (entity === 'Resignation') {
      // HR Manager
      const hrManagers = await base44.asServiceRole.entities.UserRole.filter({ status: 'active' });
      const hrManager = hrManagers.find(ur => {
        const roleIds = ['6971480cb448d6210ad85a7f']; // HR Manager Role ID
        return roleIds.includes(ur.role_id);
      });
      
      if (hrManager && hrManager.employee_id) {
        const hrEmp = await base44.asServiceRole.entities.Employee.filter({ id: hrManager.employee_id }).then(r => r[0]);
        if (hrEmp) {
          approvalChain.push({
            level: 'hr_manager',
            level_name: 'الموارد البشرية',
            role_required: 'hr_manager',
            approver_name: hrEmp.full_name,
            approver_employee_number: hrEmp.employee_number,
            approver_position: hrEmp.position,
            approval_status: 'pending',
          });
          trace.push(`[ADDED] ✅ Level ${approvalChain.length}: HR Manager → "${hrEmp.full_name}" (${hrEmp.employee_number})`);
        }
      }
      
      // Finance Manager
      const financeManager = hrManagers.find(ur => {
        const roleIds = ['69728a022e4f3be048771c58']; // Ac_Manager Role ID
        return roleIds.includes(ur.role_id);
      });
      
      if (financeManager && financeManager.employee_id) {
        const finEmp = await base44.asServiceRole.entities.Employee.filter({ id: financeManager.employee_id }).then(r => r[0]);
        if (finEmp) {
          approvalChain.push({
            level: 'finance_manager',
            level_name: 'المحاسب العام',
            role_required: 'finance_manager',
            approver_name: finEmp.full_name,
            approver_employee_number: finEmp.employee_number,
            approver_position: finEmp.position,
            approval_status: 'pending',
          });
          trace.push(`[ADDED] ✅ Level ${approvalChain.length}: Finance Manager → "${finEmp.full_name}" (${finEmp.employee_number})`);
        }
      }
      
      trace.push(`[FINAL] 🎯 Resignation approval chain: Departments → HR → Finance`);
    } else if (requiresFinanceApproval) {
      // جلب مدير الحسابات الفعلي
      const financeManagers = await base44.asServiceRole.entities.UserRole.filter({ status: 'active' });
      const financeManager = financeManagers.find(ur => {
        const roleIds = ['69728a022e4f3be048771c58']; // Ac_Manager Role ID
        return roleIds.includes(ur.role_id);
      });
      
      if (financeManager && financeManager.employee_id) {
        const finEmp = await base44.asServiceRole.entities.Employee.filter({ id: financeManager.employee_id }).then(r => r[0]);
        if (finEmp) {
          approvalChain.push({
            level: 'finance_manager',
            level_name: 'مدير الحسابات',
            role_required: 'finance_manager',
            approver_name: finEmp.full_name,
            approver_employee_number: finEmp.employee_number,
            approver_position: finEmp.position,
            approval_status: 'pending',
          });
          trace.push(`[ADDED] ✅ Level ${approvalChain.length}: Finance Manager → "${finEmp.full_name}" (${finEmp.employee_number})`);
        }
      }
      
      trace.push(`[FINAL] 🎯 Financial approval required`);
    } else {
      // جلب مدير الموارد البشرية الفعلي
      const hrManagers = await base44.asServiceRole.entities.UserRole.filter({ status: 'active' });
      const hrManager = hrManagers.find(ur => {
        const roleIds = ['6971480cb448d6210ad85a7f']; // HR Manager Role ID
        return roleIds.includes(ur.role_id);
      });
      
      if (hrManager && hrManager.employee_id) {
        const hrEmp = await base44.asServiceRole.entities.Employee.filter({ id: hrManager.employee_id }).then(r => r[0]);
        if (hrEmp) {
          approvalChain.push({
            level: 'hr_manager',
            level_name: 'الموارد البشرية',
            role_required: 'hr_manager',
            approver_name: hrEmp.full_name,
            approver_employee_number: hrEmp.employee_number,
            approver_position: hrEmp.position,
            approval_status: 'pending',
          });
          trace.push(`[ADDED] ✅ Level ${approvalChain.length}: HR Manager → "${hrEmp.full_name}" (${hrEmp.employee_number})`);
        }
      }
      
      trace.push(`[FINAL] 🎯 Standard approval: Departments → HR`);
    }

    trace.push(`[COMPLETE] ✅ Total approval levels built: ${approvalChain.length}`);
    trace.push(`[CHAIN] 📋 Full chain: ${approvalChain.map((l, i) => `${i+1}. ${l.level_name}${l.approver_name ? ` (${l.approver_name})` : ''}`).join(' → ')}`);

    return Response.json({
      success: true,
      approvalChain,
      totalLevels: approvalChain.length,
      trace, // ✅ سجل التتبع التشريحي الكامل
      employee_info: {
        name: employee.full_name,
        number: employee.employee_number,
        department: employee.department,
      },
    });
  } catch (error) {
    console.error('[getApprovalChain] ERROR:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});