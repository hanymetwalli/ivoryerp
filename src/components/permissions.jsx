// نظام الصلاحيات والأدوار
export const ROLES = {
  HR_ADMIN: 'hr_admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const PERMISSIONS = {
  // إدارة الموظفين
  VIEW_ALL_EMPLOYEES: 'view_employees',
  ADD_EMPLOYEE: 'add_employees',
  EDIT_EMPLOYEE: 'edit_employees',
  DELETE_EMPLOYEE: 'delete_employees',

  // إدارة العقود
  VIEW_ALL_CONTRACTS: 'view_contracts',
  ADD_CONTRACT: 'add_contracts',
  EDIT_CONTRACT: 'edit_contracts',
  DELETE_CONTRACT: 'delete_contracts',
  APPROVE_CONTRACT_MANAGER: 'approve_contract_manager',
  APPROVE_CONTRACT_UPPER_MANAGERS: 'approve_contract_upper_managers', // NEW
  APPROVE_CONTRACT_GM: 'approve_contract_gm',
  APPROVE_CONTRACT_HR: 'approve_contract_hr',
  APPROVE_CONTRACT_FINANCE: 'approve_contract_finance',

  // إدارة الحضور
  VIEW_ALL_ATTENDANCE: 'view_attendance',
  ADD_ATTENDANCE: 'add_attendance',
  EDIT_ATTENDANCE: 'edit_attendance',
  DELETE_ATTENDANCE: 'delete_attendance',

  // إدارة الإجازات
  VIEW_ALL_LEAVES: 'view_leaves',
  ADD_LEAVES: 'add_leaves',
  EDIT_LEAVES: 'edit_leaves',
  DELETE_LEAVES: 'delete_leaves',
  APPROVE_LEAVE_MANAGER: 'approve_leave_department_manager',
  APPROVE_LEAVE_UPPER_MANAGERS: 'approve_leave_upper_managers', // NEW
  APPROVE_LEAVE_GM: 'approve_leave_gm',
  APPROVE_LEAVE_HR: 'approve_leave_hr',
  APPROVE_LEAVE_FINANCE: 'approve_leave_finance', // NEW

  // إدارة الرواتب
  VIEW_ALL_PAYROLL: 'view_payroll',
  ADD_PAYROLL: 'add_payroll',
  EDIT_PAYROLL: 'edit_payroll',
  DELETE_PAYROLL: 'delete_payroll',
  CALCULATE_PAYROLL: 'calculate_payroll',
  APPROVE_PAYROLL: 'approve_payroll',

  // إدارة المكافآت
  VIEW_ALL_BONUSES: 'view_bonuses',
  ADD_BONUS: 'add_bonuses',
  EDIT_BONUS: 'edit_bonuses',
  DELETE_BONUS: 'delete_bonuses',
  APPROVE_BONUS_MANAGER: 'approve_bonus_department_manager',
  APPROVE_BONUS_UPPER_MANAGERS: 'approve_bonus_upper_managers', // NEW
  APPROVE_BONUS_GM: 'approve_bonus_gm',
  APPROVE_BONUS_HR: 'approve_bonus_hr',
  APPROVE_BONUS_FINANCE: 'approve_bonus_finance', // NEW

  // إدارة التدريب
  VIEW_ALL_TRAININGS: 'view_trainings',
  ADD_TRAINING: 'add_trainings',
  EDIT_TRAINING: 'edit_trainings',
  DELETE_TRAINING: 'delete_trainings',
  APPROVE_TRAINING_MANAGER: 'approve_training_manager',
  APPROVE_TRAINING_UPPER_MANAGERS: 'approve_training_upper_managers', // NEW
  APPROVE_TRAINING_GM: 'approve_training_gm',
  APPROVE_TRAINING_HR: 'approve_training_hr',
  APPROVE_TRAINING_FINANCE: 'approve_training_finance', // NEW

  // الساعات الإضافية
  VIEW_OVERTIME: 'view_overtime',
  ADD_OVERTIME: 'add_overtime',
  EDIT_OVERTIME: 'edit_overtime',
  DELETE_OVERTIME: 'delete_overtime',
  APPROVE_OVERTIME_MANAGER: 'approve_overtime_department_manager',
  APPROVE_OVERTIME_UPPER_MANAGERS: 'approve_overtime_upper_managers', // NEW
  APPROVE_OVERTIME_GM: 'approve_overtime_gm',
  APPROVE_OVERTIME_HR: 'approve_overtime_hr',
  APPROVE_OVERTIME_FINANCE: 'approve_overtime_finance', // NEW

  // الاستقالات
  VIEW_RESIGNATIONS: 'view_resignations',
  ADD_RESIGNATION: 'add_resignations',
  EDIT_RESIGNATION: 'edit_resignations',
  DELETE_RESIGNATION: 'delete_resignations',
  APPROVE_RESIGNATION_MANAGER: 'approve_resignation_department_manager',
  APPROVE_RESIGNATION_UPPER_MANAGERS: 'approve_resignation_upper_managers', // NEW
  APPROVE_RESIGNATION_GM: 'approve_resignation_gm',
  APPROVE_RESIGNATION_HR: 'approve_resignation_hr',
  APPROVE_RESIGNATION_FINANCE: 'approve_resignation_finance', // NEW

  // التقارير
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_DATA: 'export_data',

  // الإعدادات
  MANAGE_SETTINGS: 'manage_settings',
  EDIT_SETTINGS: 'edit_settings',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',

  // إدارة التقييمات
  VIEW_ALL_EVALUATIONS: 'view_evaluations',
  CREATE_EVALUATION: 'create_evaluation',
  EDIT_EVALUATION: 'edit_evaluation',
  DELETE_EVALUATION: 'delete_evaluation',
  APPROVE_EVALUATION_MANAGER: 'approve_evaluation_manager',
  APPROVE_EVALUATION_UPPER_MANAGERS: 'approve_evaluation_upper_managers', // NEW
  APPROVE_EVALUATION_GM: 'approve_evaluation_gm',
  APPROVE_EVALUATION_HR: 'approve_evaluation_hr',
  APPROVE_EVALUATION_FINANCE: 'approve_evaluation_finance', // NEW
  MANAGE_EVALUATION_TEMPLATES: 'view_evaluation_templates',
  ADD_EVALUATION_TEMPLATE: 'add_evaluation_template',
  EDIT_EVALUATION_TEMPLATE: 'edit_evaluation_template',
  DELETE_EVALUATION_TEMPLATE: 'delete_evaluation_template',

  // إدارة الأوصاف الوظيفية
  VIEW_JOB_DESCRIPTIONS: 'view_job_descriptions',
  ADD_JOB_DESCRIPTION: 'add_job_description',
  EDIT_JOB_DESCRIPTION: 'edit_job_description',
  DELETE_JOB_DESCRIPTION: 'delete_job_description',
  ADD_EMPLOYEE_NOTES: 'add_employee_notes',

  // الهيكل التنظيمي
  VIEW_ORGANIZATIONAL_STRUCTURE: 'view_organizational_structure',
  ADD_ORGANIZATIONAL_STRUCTURE: 'add_organizational_structure',
  EDIT_ORGANIZATIONAL_STRUCTURE: 'edit_organizational_structure',
  DELETE_ORGANIZATIONAL_STRUCTURE: 'delete_organizational_structure',

  // مواقع العمل
  VIEW_WORK_LOCATIONS: 'view_work_locations',
  ADD_WORK_LOCATIONS: 'add_work_locations',
  EDIT_WORK_LOCATIONS: 'edit_work_locations',
  DELETE_WORK_LOCATIONS: 'delete_work_locations',

  // الاستئذانات
  VIEW_PERMISSION_REQUESTS: 'view_permission_requests',
  ADD_PERMISSION_REQUEST: 'add_permission_requests',
  EDIT_PERMISSION_REQUEST: 'edit_permission_requests',
  DELETE_PERMISSION_REQUEST: 'delete_permission_requests',
  APPROVE_PERMISSION_REQUEST_MANAGER: 'approve_permission_requests_manager',
  APPROVE_PERMISSION_REQUEST_UPPER_MANAGERS: 'approve_permission_requests_upper_managers',
  APPROVE_PERMISSION_REQUEST_GM: 'approve_permission_requests_gm',
  APPROVE_PERMISSION_REQUEST_HR: 'approve_permission_requests_hr',
  APPROVE_PERMISSION_REQUEST_FINANCE: 'approve_permission_requests_finance',

  // أخرى
  CHECKIN_CHECKOUT: 'checkin_checkout',
  VIEW_DASHBOARD: 'view_dashboard',
};

// تعيين الصلاحيات لكل دور
export const ROLE_PERMISSIONS = {
  [ROLES.HR_ADMIN]: [
    // جميع الصلاحيات
    ...Object.values(PERMISSIONS),
  ],

  [ROLES.MANAGER]: [
    // عرض الموظفين
    PERMISSIONS.VIEW_ALL_EMPLOYEES,

    // عرض العقود
    PERMISSIONS.VIEW_ALL_CONTRACTS,

    // إدارة الحضور لفريقه
    PERMISSIONS.VIEW_ALL_ATTENDANCE,
    PERMISSIONS.ADD_ATTENDANCE,
    PERMISSIONS.EDIT_ATTENDANCE,

    // الموافقة على الإجازات
    PERMISSIONS.VIEW_ALL_LEAVES,
    PERMISSIONS.APPROVE_LEAVE_MANAGER,

    // عرض الرواتب
    PERMISSIONS.VIEW_ALL_PAYROLL,

    // الموافقة على المكافآت
    PERMISSIONS.VIEW_ALL_BONUSES,
    PERMISSIONS.ADD_BONUS,
    PERMISSIONS.APPROVE_BONUS_MANAGER,

    // التدريب
    PERMISSIONS.VIEW_ALL_TRAININGS,
    PERMISSIONS.ADD_TRAINING,

    // التقييمات
    PERMISSIONS.VIEW_ALL_EVALUATIONS,
    PERMISSIONS.CREATE_EVALUATION,
    PERMISSIONS.EDIT_EVALUATION,
    PERMISSIONS.APPROVE_EVALUATION_MANAGER,

    // التقارير
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
  ],

  [ROLES.EMPLOYEE]: [
    // لا يوجد صلاحيات خاصة - يمكنه فقط عرض بياناته
  ],
};

// التحقق من الصلاحيات (ديناميكياً من قاعدة البيانات)
export const hasPermission = async (user, permission, employeeData = null) => {
  if (!user) return false;

  // المدير العام (admin) له جميع الصلاحيات
  if (user.role === 'admin') return true;

  // محاولة استخدام النظام الديناميكي
  try {
    const { base44 } = await import('@/api/base44Client');
    const userRoles = await base44.entities.UserRole.filter({ user_id: user.id, status: 'active' });

    if (userRoles && userRoles.length > 0) {
      const userRole = userRoles[0];
      const roles = await base44.entities.Role.filter({ id: userRole.role_id, status: 'active' });

      if (roles && roles.length > 0) {
        const role = roles[0];
        const hasPermissionFlag = (role.permissions || []).includes(permission);

        if (!hasPermissionFlag) return false;

        // التحقق من نطاق البيانات
        const dataScope = role.data_scopes?.[permission] || 'all';

        if (dataScope === 'all') return true;
        if (dataScope === 'own' && employeeData) {
          // التحقق إذا كان الموظف المستخدم هو نفسه
          return userRole.employee_id === employeeData.id || employeeData.employee_id === userRole.employee_id;
        }
        if (dataScope === 'department' && employeeData && userRole.employee_id) {
          // التحقق إذا كان في نفس القسم
          const userEmployee = await base44.entities.Employee.filter({ id: userRole.employee_id }).then(r => r[0]);
          const targetEmployee = employeeData.department_id ?
            await base44.entities.Employee.filter({ id: employeeData.employee_id || employeeData.id }).then(r => r[0]) :
            employeeData;

          return userEmployee?.department === targetEmployee?.department;
        }

        return true;
      }
    }
  } catch (e) {
    console.log('Using fallback permissions', e);
  }

  // Fallback للنظام القديم
  const hrRole = user.hr_role || ROLES.EMPLOYEE;
  const rolePermissions = ROLE_PERMISSIONS[hrRole] || [];

  return rolePermissions.includes(permission);
};

// نسخة متزامنة للاستخدام في الواجهة
export const hasPermissionSync = (user, permission, userRoleData = null, employeeData = null) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  // إذا تم تمرير بيانات الدور
  if (userRoleData) {
    const role = userRoleData.role || userRoleData;
    const hasPermissionFlag = (role.permissions || []).includes(permission);

    if (!hasPermissionFlag) return false;

    // التحقق من نطاق البيانات
    const dataScope = role.data_scopes?.[permission] || 'all';

    if (dataScope === 'all') return true;
    if (dataScope === 'own' && employeeData && userRoleData.employee_id) {
      return userRoleData.employee_id === employeeData.id || employeeData.employee_id === userRoleData.employee_id;
    }
    if (dataScope === 'department' && employeeData && userRoleData.employee_id) {
      // يحتاج تحميل بيانات إضافية - نرجع true مؤقتاً
      return true;
    }

    return true;
  }

  // Fallback
  const hrRole = user.hr_role || ROLES.EMPLOYEE;
  const rolePermissions = ROLE_PERMISSIONS[hrRole] || [];
  return rolePermissions.includes(permission);
};

// التحقق من الدور
export const hasRole = (user, role) => {
  if (!user) return false;

  // المدير العام له جميع الأدوار
  if (user.role === 'admin') return true;

  return user.hr_role === role;
};

// الحصول على اسم الدور بالعربية
export const getRoleLabel = (hrRole) => {
  const labels = {
    [ROLES.HR_ADMIN]: 'مسؤول الموارد البشرية',
    [ROLES.MANAGER]: 'مدير',
    [ROLES.EMPLOYEE]: 'موظف',
  };
  return labels[hrRole] || 'غير محدد';
};

// التحقق من إمكانية عرض البيانات (بناءً على القسم)
export const canViewEmployeeData = (user, employeeData) => {
  if (!user || !employeeData) return false;

  // المدير العام ومسؤول الموارد البشرية يمكنهم رؤية كل شيء
  if (user.role === 'admin' || user.hr_role === ROLES.HR_ADMIN) return true;

  // المدير يمكنه رؤية موظفي قسمه
  if (user.hr_role === ROLES.MANAGER) {
    const managedDepts = user.managed_departments || [];
    return managedDepts.includes(employeeData.department);
  }

  // الموظف يمكنه رؤية بياناته فقط
  return user.employee_id === employeeData.id;
};
