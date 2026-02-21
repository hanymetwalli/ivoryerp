/**
 * Ivory HR - API Client
 * Local PHP Backend Client (replaces base44)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api-local';

// Generic API call function
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}/${endpoint}`;

    const token = localStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || data.error || 'API Error');
            error.details = data.details || data; // Attach details for frontend usage
            throw error;
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Entity class to mimic base44 SDK
class Entity {
    constructor(name) {
        this.name = name;
        this.endpoint = name.toLowerCase()
            .replace(/([A-Z])/g, '-$1')
            .replace(/^-/, '')
            .replace('_', '-');
    }

    // List all records
    async list(sort = '-created_at', limit = 100) {
        const params = new URLSearchParams();

        // Map common field differences between base44 and local DB
        let sortField = sort;
        if (sortField.startsWith('-')) {
            sortField = sortField.substring(1);
            params.set('order', 'DESC');
        } else {
            params.set('order', 'ASC');
        }

        // Mapping created_date to created_at
        if (sortField === 'created_date') {
            sortField = 'created_at';
        }

        params.set('sort', sortField);
        params.set('limit', limit);

        const result = await apiCall(`${this.endpoint}?${params.toString()}`);
        return result.data || result;
    }

    // Get single record
    async get(id) {
        return await apiCall(`${this.endpoint}/${id}`);
    }

    // Create record
    async create(data) {
        return await apiCall(this.endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Update record
    async update(id, data) {
        return await apiCall(`${this.endpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Delete record
    async delete(id) {
        return await apiCall(`${this.endpoint}/${id}`, {
            method: 'DELETE',
        });
    }

    // Filter records
    async filter(filters) {
        return await apiCall(`${this.endpoint}/filter`, {
            method: 'POST',
            body: JSON.stringify(filters),
        });
    }

    // Custom action (Explicitly named for compatibility)
    async customAction(id, action, data = {}) {
        return this.action(id, action, data);
    }

    // Generic action handler
    async action(id, action, data = {}) {
        const url = `${this.endpoint}/${id}/${action}`;
        const result = await apiCall(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        // Normalize response to always have 'success' and 'data'
        if (result && result.error) {
            return { success: false, error: result.message || result.error, data: result };
        }
        return { success: true, data: result };
    }
}

// Functions class
class Functions {
    async invoke(name, params = {}) {
        // Map function names to API endpoints
        const functionMap = {
            'calculatePayroll': { endpoint: 'payroll', action: 'calculate' },
            'calculateAllPayroll': { endpoint: 'payroll', action: 'calculate-all' },
            'generateRequestNumber': { endpoint: 'settings', action: 'generate-number' },
            'logAuditEvent': { endpoint: 'audit-logs', action: 'log' },
            'getApprovalChain': { endpoint: 'workflow', action: 'chain' }, // Will fail if endpoint missing
            'importFingerprintLogsSimple': { endpoint: 'attendance', action: 'import-fingerprint' },
            'createUserDirectly': { endpoint: 'users', action: 'create-directly' },
            'generateEngineeringPDF': { endpoint: 'development-logs', action: 'generate-pdf' },
        };

        const mapping = functionMap[name];

        // Return structured response for custom logic
        const wrapResult = (res) => {
            if (res && res.error) return { data: { success: false, ...res } };
            return { data: { success: true, ...res } };
        };

        // ---------------------------------------------------------------------
        // MOCK: getApprovalChain (Dynamic Generator - ROBUST VERSION)
        // ---------------------------------------------------------------------
        if (name === 'getApprovalChain') {
            console.group('🔗 Generating Approval Chain');
            console.log('Parameters:', params);

            try {
                // 1. Fetch necessary data from backend
                const [employee, allDepts, allEmployees, allUsers, allRoles] = await Promise.all([
                    ivoryClient.entities.Employee.get(params.employeeId),
                    ivoryClient.entities.Department.list('-created_at', 1000), // Increase limit
                    ivoryClient.entities.Employee.list('-created_at', 1000),
                    ivoryClient.entities.User.list('-created_at', 1000),
                    ivoryClient.entities.Role.list('-created_at', 1000)
                ]);

                console.log('Employee:', employee);
                console.log('Departments Count:', allDepts.length);

                if (!employee) throw new Error("Employee not found");

                const chain = [];

                // --- Helpers ---
                const findEmp = (id) => {
                    if (!id) return null;
                    return allEmployees.find(e => e.id === id);
                };
                const findDept = (identifier) => {
                    if (!identifier) return null;
                    // Try exact ID match
                    const byId = allDepts.find(d => d.id === identifier);
                    if (byId) return byId;

                    // Try Name match (exact or loose)
                    return allDepts.find(d => d.name === identifier || d.name.toLowerCase() === String(identifier).toLowerCase());
                };

                // Current Department
                // Fallback: If department_id is missing, try 'department' field (which might contain the name or ID)
                let deptIdentifier = employee.department_id || employee.department;
                let currentDept = findDept(deptIdentifier);

                console.log('Current Dept Identifier:', deptIdentifier);
                console.log('Current Dept Resolved:', currentDept);

                // =================================================================
                // 1. OPERATIONAL HIERARCHY
                // =================================================================

                // --- A. Direct Manager ---
                if (currentDept && currentDept.manager_id) {
                    // Check if employee is the manager
                    if (currentDept.manager_id !== employee.id) {
                        const manager = findEmp(currentDept.manager_id);
                        chain.push({
                            level: 'direct_manager',
                            level_name: 'المدير المباشر',
                            role_required: 'Direct Manager',
                            approver_id: currentDept.manager_id,
                            approver_name: manager ? manager.full_name : 'غير محدد',
                            status: 'pending'
                        });
                        console.log('✅ Added Direct Manager:', manager?.full_name);
                    } else {
                        console.log('ℹ️ Employee is the Direct Manager, skipping step.');
                    }
                } else {
                    console.warn('⚠️ No Direct Manager found (Dept missing or no manager_id)');
                }

                // --- B. Higher Managers (Loop up to Root) ---
                let traversalDept = currentDept;
                let rootDept = null;
                let loopCount = 0;

                while (traversalDept && traversalDept.parent_department_id && loopCount < 10) {
                    loopCount++;
                    const parentDept = findDept(traversalDept.parent_department_id);

                    if (!parentDept) {
                        console.warn('⚠️ Parent Dept ID found but Dept object missing:', traversalDept.parent_department_id);
                        break;
                    }

                    // Check if this parent is the Root
                    const isRoot = !parentDept.parent_department_id;

                    if (!isRoot) {
                        // It's an intermediate department (Higher Manager)
                        if (parentDept.manager_id && parentDept.manager_id !== traversalDept.manager_id && parentDept.manager_id !== employee.id) {
                            const higherManager = findEmp(parentDept.manager_id);

                            // Prevent duplicates
                            const isAlreadyInChain = chain.some(s => s.approver_id === parentDept.manager_id);

                            if (!isAlreadyInChain) {
                                chain.push({
                                    level: 'higher_manager',
                                    level_name: 'مدير القسم الأعلى',
                                    role_required: 'Department Head',
                                    approver_id: parentDept.manager_id,
                                    approver_name: higherManager ? higherManager.full_name : 'غير محدد',
                                    status: 'pending'
                                });
                                console.log('✅ Added Higher Manager:', higherManager?.full_name);
                            }
                        }
                    } else {
                        rootDept = parentDept; // Found the root
                    }

                    traversalDept = parentDept;
                }

                // Fallback: If we didn't find root via loop (e.g. currentDept IS root or 1 level below)
                if (!rootDept) {
                    if (currentDept && !currentDept.parent_department_id) {
                        rootDept = currentDept;
                    } else if (traversalDept && !traversalDept.parent_department_id) {
                        rootDept = traversalDept;
                    }
                }

                // --- C. General Manager (Root) ---
                if (rootDept && rootDept.manager_id) {
                    const gm = findEmp(rootDept.manager_id);
                    const isGmInChain = chain.some(s => s.approver_id === rootDept.manager_id);

                    if (!isGmInChain && rootDept.manager_id !== employee.id) {
                        chain.push({
                            level: 'gm',
                            level_name: 'المدير العام',
                            role_required: 'General Manager',
                            approver_id: rootDept.manager_id,
                            approver_name: gm ? gm.full_name : 'المدير العام',
                            status: 'pending'
                        });
                        console.log('✅ Added General Manager:', gm?.full_name);
                    }
                } else {
                    console.log('ℹ️ No General Manager added (Root Dept missing or no manager)');
                }

                // =================================================================
                // 2. FUNCTIONAL ROLES
                // =================================================================

                // Helper to find approver by role/dept
                const findFunctionalApprover = (roleKeys, deptKeys, title) => {
                    // 1. Search by Role
                    const targetRoles = allRoles.filter(r => r.name && roleKeys.some(k => r.name.toLowerCase().includes(k.toLowerCase())));
                    const targetRoleIds = targetRoles.map(r => r.id);

                    const user = allUsers.find(u => {
                        if (u.role_id && targetRoleIds.includes(u.role_id)) return true;
                        if (u.role && typeof u.role === 'string' && roleKeys.some(k => u.role.toLowerCase().includes(k.toLowerCase()))) return true;
                        return false;
                    });

                    if (user && user.employee_id) return findEmp(user.employee_id);

                    // 2. Search by Dept Manager
                    const dept = allDepts.find(d => deptKeys.some(k => d.code === k || d.name.includes(k)));
                    if (dept && dept.manager_id) return findEmp(dept.manager_id);

                    return null;
                };

                // =================================================================
                // 3. APPLY RULES (PERMISSION BASED)
                // =================================================================
                // Control approvals strictly via the Roles & Permissions system

                const entityName = params.entity || 'LeaveRequest';

                // Map Entity Name to Permission Prefix (e.g. 'approve_leave')
                const permMap = {
                    'LeaveRequest': 'approve_leave',
                    'EmployeeTraining': 'approve_training',
                    'Training': 'approve_training',
                    'Bonus': 'approve_bonus',
                    'Overtime': 'approve_overtime',
                    'Contract': 'approve_contract',
                    'Resignation': 'approve_resignation',
                    'PerformanceEvaluation': 'approve_evaluation',
                    'Evaluation': 'approve_evaluation'
                };

                const permPrefix = permMap[entityName];

                // Helper to find approver by specific permission
                const findApproverByPermission = (permissionCode) => {
                    // 1. Find all Roles that have this permission
                    const eligibleRoles = allRoles.filter(r =>
                        r.permissions &&
                        (typeof r.permissions === 'string' ? r.permissions.includes(permissionCode) : r.permissions.includes(permissionCode))
                    );

                    if (eligibleRoles.length === 0) return null;

                    const eligibleRoleIds = eligibleRoles.map(r => r.id);

                    // 2. Find an active User who has one of these roles
                    const user = allUsers.find(u => eligibleRoleIds.includes(u.role_id) && u.status === 'active');

                    if (user && user.employee_id) {
                        return findEmp(user.employee_id);
                    }
                    return null;
                };

                if (permPrefix) {
                    // --- HR Manager Step ---
                    // Check if 'approve_{entity}_hr' exists in any role
                    const hrEmp = findApproverByPermission(`${permPrefix}_hr`);
                    if (hrEmp && hrEmp.id !== employee.id) {
                        chain.push({
                            level: 'hr',
                            level_name: 'مدير الموارد البشرية',
                            role_required: 'HR Manager',
                            approver_id: hrEmp.id,
                            approver_name: hrEmp.full_name,
                            status: 'pending'
                        });
                        console.log(`✅ Added HR Manager (Permission: ${permPrefix}_hr):`, hrEmp.full_name);
                    }

                    // --- Finance Manager Step ---
                    // Check if 'approve_{entity}_finance' exists in any role
                    const finEmp = findApproverByPermission(`${permPrefix}_finance`);
                    if (finEmp && finEmp.id !== employee.id) {
                        chain.push({
                            level: 'finance',
                            level_name: 'مدير الحسابات',
                            role_required: 'Finance Manager',
                            approver_id: finEmp.id,
                            approver_name: finEmp.full_name,
                            status: 'pending'
                        });
                        console.log(`✅ Added Finance Manager (Permission: ${permPrefix}_finance):`, finEmp.full_name);
                    } else {
                        console.log(`ℹ️ Finance Step Skipped (No active user has permission: ${permPrefix}_finance)`);
                    }
                } else {
                    console.warn('Unknown Entity Type for Permissions:', entityName);
                }

                console.groupEnd();
                return { data: { approvalChain: chain } };

            } catch (error) {
                console.error("Error generating chain:", error);
                console.groupEnd();
                // Fallback
                return {
                    data: {
                        approvalChain: [
                            { level: 'manager', level_name: 'المدير المباشر', role_required: 'Direct Manager', status: 'pending' },
                            { level: 'hr', level_name: 'مدير الموارد البشرية', role_required: 'HR Manager', status: 'pending' }
                        ]
                    }
                };
            }
        }

        // Mock processApproval locally
        if (name === 'processApproval') {
            console.log('Intercepting processApproval in JS Client', params);

            // ROUTE TO BACKEND: Instead of mocking JS logic, call the Entity API
            // Because the PHP backend now has the sophisticated ApprovalService logic.

            try {
                // Normalize entity name to PascalCase for mapping lookup
                let entityKey = params.entity || params.entity_name;

                // Map common variations
                const entityMap = {
                    'resignation': 'Resignation',
                    'Resignation': 'Resignation',
                    'bonus': 'Bonus',
                    'Bonus': 'Bonus',
                    'overtime': 'Overtime',
                    'Overtime': 'Overtime',
                    'performanceevaluation': 'PerformanceEvaluation',
                    'PerformanceEvaluation': 'PerformanceEvaluation',
                    'evaluation': 'PerformanceEvaluation',
                    'Evaluation': 'PerformanceEvaluation',
                    'leaverequest': 'LeaveRequest',
                    'LeaveRequest': 'LeaveRequest',
                    'employeetraining': 'EmployeeTraining',
                    'EmployeeTraining': 'EmployeeTraining'
                };

                const mappedKey = entityMap[entityKey] || entityKey;
                const entity = ivoryClient.entities[mappedKey];

                if (!entity) {
                    throw new Error(`Entity ${entityKey} (mapped to ${mappedKey}) not found in client`);
                }

                console.log(`Forwarding approval to backend entity: ${entity.name}`);

                // Call customAction 'approve' or 'reject' on the entity
                const result = await entity.customAction(params.record_id || params.entity_id || params.id, params.action, {
                    notes: params.notes,
                    approver_id: params.approver_id,
                    approver_name: params.approver_name,
                    force_final: params.force_final // Support force approve
                });

                // Check for various success indicators from backend (API inconsistency handling)
                const isSuccess = result.success || result.status === 'success' || (result.data && result.data.success);

                if (!isSuccess && result.error) {
                    return { data: { success: false, message: result.message || result.error, error: result.message || result.error } };
                }

                return {
                    data: {
                        success: true,
                        message: result.message || (params.action === 'approve' ? 'تم الاعتماد بنجاح' : 'تم الرفض'),
                        data: result.data || result
                    }
                };

            } catch (e) {
                console.error('Approval Error:', e);
                return { data: { success: false, message: e.message, error: e.message } };
            }
        }

        if (!mapping) {
            // Silently fail for unimplemented logs to prevent app crashes
            if (name.includes('Log')) {
                console.warn(`Function ${name} not implemented, skipping.`);
                return { data: { success: true } };
            }
            throw new Error(`Function ${name} not implemented`);
        }

        try {
            const result = await apiCall(`${mapping.endpoint}/0/${mapping.action}`, {
                method: 'POST',
                body: JSON.stringify(params),
            });
            return wrapResult(result);
        } catch (error) {
            console.error(`Error invoking function ${name}:`, error);
            // Don't crash for audit logs
            if (name === 'logAuditEvent') return { data: { success: true } };
            throw error;
        }
    }
}

// Auth class
class Auth {
    async me() {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;

        try {
            const userId = atob(token).split(':')[0];
            const user = await apiCall(`users/${userId}`);

            // Handle local admin override
            if (user && user.email === 'admin@ivory.com') {
                user.role = 'admin';
            }
            return user;
        } catch {
            return null;
        }
    }

    async login(email, password) {
        const result = await apiCall('users/0/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (result.token) {
            localStorage.setItem('auth_token', result.token);
        }

        return result;
    }

    logout(redirectUrl = null) {
        localStorage.removeItem('auth_token');
        if (redirectUrl) {
            window.location.href = '/login';
        }
    }

    redirectToLogin(redirectUrl = null) {
        window.location.href = '/login';
    }
}

// Main client object (replaces base44)
const ivoryClient = {
    entities: {
        Employee: new Entity('employees'),
        Department: new Entity('departments'),
        Position: new Entity('positions'),
        Contract: new Entity('contracts'),
        Attendance: new Entity('attendance'),
        LeaveRequest: new Entity('leaves'),
        LeaveType: new Entity('leave-types'),
        Overtime: new Entity('overtime'),
        Allowance: new Entity('allowances'),
        Deduction: new Entity('deductions'),
        Bonus: new Entity('bonuses'),
        Payroll: new Entity('payroll'),
        WorkLocation: new Entity('work-locations'),
        WorkSchedule: new Entity('work-schedules'),
        Role: new Entity('roles'),
        User: new Entity('users'),
        UserRole: new Entity('user-roles'),
        Training: new Entity('trainings'),
        PerformanceEvaluation: new Entity('evaluations'),
        Resignation: new Entity('resignations'),
        SystemSettings: new Entity('settings'),
        AuditLog: new Entity('audit-logs'),
        // Lookup tables
        Nationality: new Entity('nationalities'),
        BankName: new Entity('bank-names'),
        ContractType: new Entity('contract-types'),
        AllowanceType: new Entity('allowance-types'),
        DeductionType: new Entity('deduction-types'),
        AttendanceStatus: new Entity('attendance-statuses'),
        TrainingStatus: new Entity('training-statuses'),
        EmployeeLeaveBalance: new Entity('employee-leave-balances'),
        EmployeeTraining: new Entity('employee-trainings'),
        EvaluationTemplate: new Entity('evaluation-templates'),
        TemplateKPI: new Entity('template-kpis'),
        KPIResult: new Entity('kpi-results'),
        Competency: new Entity('competencies'),
        CompetencyRating: new Entity('competency-ratings'),
        JobDescription: new Entity('job-descriptions'),
        BusinessTask: new Entity('business-tasks'),
        DevelopmentLog: new Entity('development-logs'),
        InsuranceSettings: new Entity('insurance-settings'),
        PermissionRequest: new Entity('permission-requests'),
        WorkflowSettings: new Entity('workflow-settings'),
    },

    functions: new Functions(),
    auth: new Auth(),

    // Mock users object for management
    users: {
        inviteUser: async (email, role) => {
            console.log(`[Mock] Inviting user: ${email} with role: ${role}`);
            return { success: true };
        },
        listUsers: async () => {
            return await ivoryClient.entities.User.list();
        }
    },

    // Mock appLogs to prevent crashes
    appLogs: {
        logUserInApp: async (page) => {
            return { success: true };
        }
    },

    // Alias for service role (same as regular in local)
    asServiceRole: null,
};

// Set asServiceRole to reference the same entities
ivoryClient.asServiceRole = ivoryClient;

// Dashboard helper
ivoryClient.getDashboard = async function () {
    return await apiCall('dashboard');
};

export { ivoryClient as base44 };
export default ivoryClient;
