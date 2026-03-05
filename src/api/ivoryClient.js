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

    // Remove Content-Type if body is FormData (browser will set it with boundary)
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

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
    async list(sortOrFilters = '-created_at', limit = 100) {
        const params = new URLSearchParams();

        let sortField = sortOrFilters;
        let finalLimit = limit;

        if (typeof sortOrFilters === 'object' && sortOrFilters !== null) {
            Object.entries(sortOrFilters).forEach(([key, value]) => {
                if (key !== 'sort' && key !== 'limit') {
                    params.set(key, value);
                }
            });
            sortField = sortOrFilters.sort || '-created_at';
            finalLimit = sortOrFilters.limit || limit;
        }

        // Map common field differences between base44 and local DB
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
        params.set('limit', finalLimit);

        const result = await apiCall(`${this.endpoint}?${params.toString()}`);
        return result.data || result;
    }

    // Get single record
    async get(id) {
        return await apiCall(`${this.endpoint}/${id}`);
    }

    // Create record
    async create(data) {
        const isFormData = data instanceof FormData;
        return await apiCall(this.endpoint, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    // Update record
    async update(id, data) {
        const isFormData = data instanceof FormData;
        return await apiCall(`${this.endpoint}/${id}`, {
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data),
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
        const isFormData = data instanceof FormData;
        const result = await apiCall(url, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
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
            'processApproval': { endpoint: 'approvals', action: 'process' },
        };

        const mapping = functionMap[name];

        // Return structured response for custom logic
        const wrapResult = (res) => {
            if (res && res.error) return { data: { success: false, ...res } };
            return { data: { success: true, ...res } };
        };

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
        PayrollBatches: new Entity('payroll-batches'),
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
        CompanyProfile: new Entity('company-profile'),
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
        Approvals: new Entity('approvals'),
        Workflow: new Entity('workflow'),
        ViolationType: new Entity('violation-types'),
        PenaltyPolicy: new Entity('penalty-policies'),
        EmployeeViolation: new Entity('employee-violations'),
        // ATS - Applicant Tracking System
        JobPosting: new Entity('job-postings'),
        JobApplication: new Entity('job-applications'),
        InterviewTemplate: new Entity('interview-templates'),
        Interview: new Entity('interviews'),
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

    // Integrations namespace (matches base44 v2 structure)
    integrations: {
        Core: {
            // Upload file to local PHP backend
            UploadFile: async ({ file }) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch(`${API_BASE_URL}/upload.php`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Upload failed');
                }

                return await response.json();
            },

            // Real extraction for CSV files (used in Employees.jsx import)
            ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
                try {
                    // Fetch the file content
                    const response = await fetch(file_url);
                    if (!response.ok) throw new Error('Failed to fetch file for extraction');

                    const content = await response.text();
                    const isCsv = file_url.toLowerCase().endsWith('.csv') || content.includes(',');

                    if (isCsv) {
                        const lines = content.split(/\r?\n/).filter(line => line.trim());
                        if (lines.length < 2) return { status: 'success', output: { data: [] } };

                        const headers = lines[0].split(',').map(h => h.trim());
                        const data = [];

                        const headerMap = {
                            'رقم الموظف': 'employee_number',
                            'الاسم الكامل': 'full_name',
                            'رقم الهوية': 'id_number',
                            'رقم الجوال': 'phone',
                            'الجوال': 'phone',
                            'البريد الإلكتروني': 'email',
                            'المنصب': 'position',
                            'القسم': 'department',
                            'مكان العمل': 'location_type',
                            'تاريخ التعيين': 'hire_date',
                            'الجنسية': 'nationality',
                            'الجنس': 'gender',
                            'النوع': 'gender',
                            'الحالة': 'status'
                        };

                        const valueMap = {
                            gender: {
                                'ذكر': 'male',
                                'أنثى': 'female'
                            },
                            status: {
                                'نشط': 'active',
                                'غير نشط': 'inactive',
                                'مفسوخ': 'terminated',
                                'منتهي': 'expired'
                            }
                        };

                        for (let i = 1; i < lines.length; i++) {
                            const values = lines[i].split(',');
                            const entry = {};
                            headers.forEach((header, index) => {
                                const key = headerMap[header] || header;
                                let value = values[index]?.trim();

                                // Map values if needed
                                if (valueMap[key] && valueMap[key][value]) {
                                    value = valueMap[key][value];
                                }

                                entry[key] = value;
                            });
                            data.push(entry);
                        }

                        return {
                            status: 'success',
                            output: { data }
                        };
                    }

                    console.warn('[Mock] Non-CSV extraction not implemented.');
                    return { status: 'success', output: { data: [] } };

                } catch (error) {
                    console.error('Extraction error:', error);
                    return { status: 'error', error: error.message };
                }
            }
        }
    },

    // Alias for service role (same as regular in local)
    asServiceRole: null,
};

// Add specific functions requested for Overtime
ivoryClient.entities.Overtime.submitReport = async function (id, data) {
    return await this.action(id, 'submit-report', data);
};

// Set asServiceRole to reference the same entities
ivoryClient.asServiceRole = ivoryClient;

// Dashboard helper
ivoryClient.getDashboard = async function () {
    return await apiCall('dashboard');
};

export { ivoryClient as base44 };
export default ivoryClient;
