import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Plus, Edit, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/components/permissions";
import { toast } from "sonner";

const ALL_PERMISSIONS = [
  { code: "view_dashboard", name: "عرض لوحة التحكم", category: "dashboard", scope: false },

  { code: "view_employees", name: "عرض الموظفين", category: "employees", scope: true },
  { code: "add_employees", name: "إضافة موظفين", category: "employees", scope: false },
  { code: "edit_employees", name: "تعديل موظفين", category: "employees", scope: true },
  { code: "delete_employees", name: "حذف موظفين", category: "employees", scope: true },

  { code: "view_contracts", name: "عرض العقود", category: "contracts", scope: true },
  { code: "add_contracts", name: "إضافة عقود", category: "contracts", scope: false },
  { code: "edit_contracts", name: "تعديل عقود", category: "contracts", scope: true },
  { code: "delete_contracts", name: "حذف عقود", category: "contracts", scope: true },
  { code: "approve_contract_manager", name: "اعتماد العقد - المدير المباشر", category: "contracts", scope: false },
  { code: "approve_contract_upper_managers", name: "اعتماد العقد - مدراء الأقسام الأعلى", category: "contracts", scope: false },
  { code: "approve_contract_gm", name: "اعتماد العقد - المدير العام", category: "contracts", scope: false },
  { code: "approve_contract_hr", name: "اعتماد العقد - الموارد البشرية", category: "contracts", scope: false },
  { code: "approve_contract_finance", name: "اعتماد العقد - المحاسب العام", category: "contracts", scope: false },

  { code: "view_trainings", name: "عرض التدريب", category: "trainings", scope: true },
  { code: "add_trainings", name: "إضافة تدريب", category: "trainings", scope: false },
  { code: "edit_trainings", name: "تعديل تدريب", category: "trainings", scope: true },
  { code: "delete_trainings", name: "حذف تدريب", category: "trainings", scope: true },
  { code: "approve_training_manager", name: "اعتماد التدريب - المدير المباشر", category: "trainings", scope: false },
  { code: "approve_training_upper_managers", name: "اعتماد التدريب - مدراء الأقسام الأعلى", category: "trainings", scope: false },
  { code: "approve_training_gm", name: "اعتماد التدريب - المدير العام", category: "trainings", scope: false },
  { code: "approve_training_hr", name: "اعتماد التدريب - الموارد البشرية", category: "trainings", scope: false },
  { code: "approve_training_finance", name: "اعتماد التدريب - المحاسب العام", category: "trainings", scope: false },

  { code: "view_resignations", name: "عرض طلبات الاستقالة", category: "resignations", scope: true },
  { code: "add_resignation", name: "تقديم طلب استقالة", category: "resignations", scope: false },
  { code: "edit_resignation", name: "تعديل طلب استقالة", category: "resignations", scope: true },
  { code: "delete_resignation", name: "حذف طلب استقالة", category: "resignations", scope: true },
  { code: "approve_resignation_department_manager", name: "اعتماد الاستقالة - مدير القسم", category: "resignations", scope: false },
  { code: "approve_resignation_upper_managers", name: "اعتماد الاستقالة - مدراء الأقسام الأعلى", category: "resignations", scope: false },
  { code: "approve_resignation_gm", name: "اعتماد الاستقالة - المدير العام", category: "resignations", scope: false },
  { code: "approve_resignation_hr", name: "اعتماد الاستقالة - الموارد البشرية", category: "resignations", scope: false },
  { code: "approve_resignation_finance", name: "اعتماد الاستقالة - المحاسب العام", category: "resignations", scope: false },

  { code: "view_organizational_structure", name: "عرض الهيكل الإداري", category: "organizational_structure", scope: false },
  { code: "add_organizational_structure", name: "إضافة في الهيكل الإداري", category: "organizational_structure", scope: false },
  { code: "edit_organizational_structure", name: "تعديل الهيكل الإداري", category: "organizational_structure", scope: false },
  { code: "delete_organizational_structure", name: "حذف من الهيكل الإداري", category: "organizational_structure", scope: false },

  { code: "view_work_locations", name: "عرض أماكن العمل", category: "work_locations", scope: false },
  { code: "add_work_locations", name: "إضافة أماكن العمل", category: "work_locations", scope: false },
  { code: "edit_work_locations", name: "تعديل أماكن العمل", category: "work_locations", scope: false },
  { code: "delete_work_locations", name: "حذف أماكن العمل", category: "work_locations", scope: false },

  { code: "checkin_checkout", name: "تسجيل الحضور والانصراف", category: "checkin", scope: false },

  { code: "view_attendance", name: "عرض سجل الحضور", category: "attendance", scope: true },
  { code: "add_attendance", name: "إضافة حضور", category: "attendance", scope: false },
  { code: "edit_attendance", name: "تعديل حضور", category: "attendance", scope: true },
  { code: "delete_attendance", name: "حذف حضور", category: "attendance", scope: true },

  { code: "view_leaves", name: "عرض الإجازات", category: "leaves", scope: true },
  { code: "add_leaves", name: "إضافة إجازة", category: "leaves", scope: false },
  { code: "edit_leaves", name: "تعديل إجازة", category: "leaves", scope: true },
  { code: "delete_leaves", name: "حذف إجازة", category: "leaves", scope: true },
  { code: "approve_leave_department_manager", name: "اعتماد الإجازة - مدير القسم", category: "leaves", scope: false },
  { code: "approve_leave_upper_managers", name: "اعتماد الإجازة - مدراء الأقسام الأعلى", category: "leaves", scope: false },
  { code: "approve_leave_gm", name: "اعتماد الإجازة - المدير العام", category: "leaves", scope: false },
  { code: "approve_leave_hr", name: "اعتماد الإجازة - الموارد البشرية", category: "leaves", scope: false },
  { code: "approve_leave_finance", name: "اعتماد الإجازة - المحاسب العام", category: "leaves", scope: false },

  { code: "view_payroll", name: "عرض الرواتب", category: "payroll", scope: true },
  { code: "add_payroll", name: "إضافة رواتب", category: "payroll", scope: false },
  { code: "edit_payroll", name: "تعديل رواتب", category: "payroll", scope: true },
  { code: "delete_payroll", name: "حذف رواتب", category: "payroll", scope: true },

  { code: "view_bonuses", name: "عرض المكافآت", category: "bonuses", scope: true },
  { code: "add_bonuses", name: "إضافة مكافآت", category: "bonuses", scope: false },
  { code: "edit_bonuses", name: "تعديل مكافآت", category: "bonuses", scope: true },
  { code: "delete_bonuses", name: "حذف مكافآت", category: "bonuses", scope: true },
  { code: "approve_bonus_department_manager", name: "اعتماد المكافأة - مدير القسم", category: "bonuses", scope: false },
  { code: "approve_bonus_upper_managers", name: "اعتماد المكافأة - مدراء الأقسام الأعلى", category: "bonuses", scope: false },
  { code: "approve_bonus_gm", name: "اعتماد المكافأة - المدير العام", category: "bonuses", scope: false },
  { code: "approve_bonus_hr", name: "اعتماد المكافأة - الموارد البشرية", category: "bonuses", scope: false },
  { code: "approve_bonus_finance", name: "اعتماد المكافأة - المحاسب العام", category: "bonuses", scope: false },

  { code: "view_overtime", name: "عرض الساعات الإضافية", category: "overtime", scope: true },
  { code: "add_overtime", name: "إضافة ساعات إضافية", category: "overtime", scope: false },
  { code: "edit_overtime", name: "تعديل ساعات إضافية", category: "overtime", scope: true },
  { code: "delete_overtime", name: "حذف ساعات إضافية", category: "overtime", scope: true },
  { code: "approve_overtime_department_manager", name: "اعتماد الساعات - مدير القسم", category: "overtime", scope: false },
  { code: "approve_overtime_upper_managers", name: "اعتماد الساعات - مدراء الأقسام الأعلى", category: "overtime", scope: false },
  { code: "approve_overtime_gm", name: "اعتماد الساعات - المدير العام", category: "overtime", scope: false },
  { code: "approve_overtime_hr", name: "اعتماد الساعات - الموارد البشرية", category: "overtime", scope: false },
  { code: "approve_overtime_finance", name: "اعتماد الساعات - المحاسب العام", category: "overtime", scope: false },

  { code: "view_permission_requests", name: "عرض الاستئذانات", category: "permission_requests", scope: true },
  { code: "add_permission_requests", name: "إضافة استئذان", category: "permission_requests", scope: false },
  { code: "edit_permission_requests", name: "تعديل استئذان", category: "permission_requests", scope: true },
  { code: "delete_permission_requests", name: "حذف استئذان", category: "permission_requests", scope: true },
  { code: "approve_permission_requests_manager", name: "اعتماد الاستئذان - المدير المباشر", category: "permission_requests", scope: false },
  { code: "approve_permission_requests_upper_managers", name: "اعتماد الاستئذان - مدراء الأقسام الأعلى", category: "permission_requests", scope: false },
  { code: "approve_permission_requests_gm", name: "اعتماد الاستئذان - المدير العام", category: "permission_requests", scope: false },
  { code: "approve_permission_requests_hr", name: "اعتماد الاستئذان - الموارد البشرية", category: "permission_requests", scope: false },
  { code: "approve_permission_requests_finance", name: "اعتماد الاستئذان - المحاسب العام", category: "permission_requests", scope: false },

  { code: "view_evaluations", name: "عرض التقييمات", category: "evaluations", scope: true },
  { code: "create_evaluation", name: "إجراء تقييم للموظف", category: "evaluations", scope: false },
  { code: "edit_evaluation", name: "تعديل تقييم", category: "evaluations", scope: true },
  { code: "delete_evaluation", name: "حذف تقييم", category: "evaluations", scope: true },
  { code: "approve_evaluation_manager", name: "اعتماد التقييم - المدير المباشر", category: "evaluations", scope: false },
  { code: "approve_evaluation_upper_managers", name: "اعتماد التقييم - مدراء الأقسام الأعلى", category: "evaluations", scope: false },
  { code: "approve_evaluation_gm", name: "اعتماد التقييم - المدير العام", category: "evaluations", scope: false },
  { code: "approve_evaluation_hr", name: "اعتماد التقييم - الموارد البشرية", category: "evaluations", scope: false },
  { code: "approve_evaluation_finance", name: "اعتماد التقييم - المحاسب العام", category: "evaluations", scope: false },

  { code: "view_evaluation_templates", name: "عرض قوالب التقييم", category: "evaluation_templates", scope: false },
  { code: "add_evaluation_template", name: "إضافة قالب تقييم", category: "evaluation_templates", scope: false },
  { code: "edit_evaluation_template", name: "تعديل قالب تقييم", category: "evaluation_templates", scope: false },
  { code: "delete_evaluation_template", name: "حذف قالب تقييم", category: "evaluation_templates", scope: false },

  { code: "view_reports", name: "عرض التقارير", category: "reports", scope: false },
  { code: "generate_reports", name: "إنشاء تقارير", category: "reports", scope: false },

  { code: "view_settings", name: "عرض الإعدادات", category: "settings", scope: false },
  { code: "edit_settings", name: "تعديل الإعدادات", category: "settings", scope: false },

  { code: "manage_roles", name: "إدارة الأدوار والصلاحيات", category: "system", scope: false },
  { code: "manage_users", name: "إدارة المستخدمين", category: "system", scope: false },

  { code: "view_job_descriptions", name: "عرض الأوصاف الوظيفية", category: "job_descriptions", scope: true },
  { code: "add_job_description", name: "إضافة وصف وظيفي", category: "job_descriptions", scope: false },
  { code: "edit_job_description", name: "تعديل وصف وظيفي", category: "job_descriptions", scope: true },
  { code: "delete_job_description", name: "حذف وصف وظيفي", category: "job_descriptions", scope: true },
  { code: "add_employee_notes", name: "إضافة ملاحظات للموظفين", category: "job_descriptions", scope: false },

  { code: "manage_penalty_settings", name: "إدارة لائحة الجزاءات", category: "violations", scope: false },
  { code: "view_all_violations", name: "عرض جميع المخالفات", category: "violations", scope: true },
  { code: "view_department_violations", name: "عرض مخالفات القسم", category: "violations", scope: true },
  { code: "view_violations", name: "عرض مخالفاتي الشخصية", category: "violations", scope: true },
  { code: "create_violation", name: "تسجيل مخالفة", category: "violations", scope: false },
  { code: "update_violation", name: "تعديل مخالفة", category: "violations", scope: true },
  { code: "delete_violation", name: "حذف مخالفة", category: "violations", scope: true },

  { code: "force_approve", name: "الاعتماد النهائي الاستثنائي", category: "approvals", scope: false },
];

const CATEGORIES = {
  dashboard: "لوحة التحكم",
  employees: "الموظفين",
  contracts: "العقود",
  trainings: "التدريب",
  resignations: "طلبات الاستقالة",
  organizational_structure: "الهيكل الإداري",
  work_locations: "أماكن العمل",
  checkin: "تسجيل الحضور",
  attendance: "سجل الحضور",
  leaves: "الإجازات",
  payroll: "الرواتب",
  bonuses: "المكافآت",
  overtime: "الساعات الإضافية",
  permission_requests: "الاستئذان",
  evaluations: "تقييمات الأداء",
  evaluation_templates: "قوالب التقييم",
  reports: "التقارير",
  settings: "الإعدادات",
  system: "إدارة النظام",
  job_descriptions: "الأوصاف الوظيفية",
  violations: "المخالفات والجزاءات",
  approvals: "الاعتمادات الاستثنائية",
};

export default function RolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ permissions: [], data_scopes: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const rolesData = await base44.entities.Role.list("-created_date");
      setRoles(rolesData);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setSelectedRole(null);
    setFormData({ permissions: [], data_scopes: {}, status: "active" });
    setShowForm(true);
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setFormData(role);
    setShowForm(true);
  };

  const handleDelete = (role) => {
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.Role.delete(selectedRole.id);
      setRoles(roles.filter((r) => r.id !== selectedRole.id));
      setShowDeleteDialog(false);
      toast.success("تم حذف الدور بنجاح");
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    setSaving(true);
    try {
      if (selectedRole) {
        await base44.entities.Role.update(selectedRole.id, formData);
        toast.success("تم تحديث الدور");
      } else {
        await base44.entities.Role.create(formData);
        toast.success("تمت إضافة الدور");
      }
      loadRoles();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  const togglePermission = (permissionCode) => {
    const current = formData.permissions || [];
    if (current.includes(permissionCode)) {
      setFormData({
        ...formData,
        permissions: current.filter((p) => p !== permissionCode),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...current, permissionCode],
      });
    }
  };

  const toggleAllCategory = (category) => {
    const categoryPerms = ALL_PERMISSIONS.filter((p) => p.category === category).map(
      (p) => p.code
    );
    const current = formData.permissions || [];
    const allSelected = categoryPerms.every((p) => current.includes(p));

    if (allSelected) {
      setFormData({
        ...formData,
        permissions: current.filter((p) => !categoryPerms.includes(p)),
      });
    } else {
      const newPerms = [...new Set([...current, ...categoryPerms])];
      setFormData({ ...formData, permissions: newPerms });
    }
  };

  const handleDataScopeChange = (permCode, scope) => {
    setFormData({
      ...formData,
      data_scopes: {
        ...(formData.data_scopes || {}),
        [permCode]: scope,
      },
    });
  };

  const exportToCSV = () => {
    // بناء العناوين: اسم الدور، الرمز، ثم كل الصلاحيات
    const headers = ["اسم الدور", "الرمز", ...ALL_PERMISSIONS.map(p => p.name)];

    // بناء الصفوف: لكل دور، نضع نعم أو لا لكل صلاحية
    const rows = roles.map((role) => {
      const row = [
        role.name || "",
        role.code || "",
      ];

      // إضافة نعم/لا لكل صلاحية
      ALL_PERMISSIONS.forEach(perm => {
        const hasPermission = (role.permissions || []).includes(perm.code);
        row.push(hasPermission ? "نعم" : "لا");
      });

      return row;
    });

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roles_permissions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { header: "اسم الدور", accessor: "name" },
    { header: "الرمز", accessor: "code" },
    { header: "الوصف", accessor: "description", cell: (row) => row.description || "-" },
    {
      header: "عدد الصلاحيات",
      accessor: "permissions",
      cell: (row) => (row.permissions || []).length,
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
            <Edit className="w-4 h-4 ml-1" />
            تعديل
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 ml-1" />
            حذف
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute permission={PERMISSIONS.MANAGE_ROLES}>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">الأدوار والصلاحيات</h2>
            <p className="text-gray-500">إدارة الأدوار وتعيين الصلاحيات ونطاق البيانات</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>

        <DataTable
          data={roles}
          columns={columns}
          loading={loading}
          onAdd={handleAdd}
          addButtonText="إضافة دور جديد"
          searchPlaceholder="بحث..."
          emptyMessage="لا توجد أدوار"
        />

        <FormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          title={selectedRole ? "تعديل الدور" : "إضافة دور جديد"}
          onSubmit={handleSubmit}
          loading={saving}
          size="xl"
        >
          <div className="space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم الدور *</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: مدير الموارد البشرية"
                />
              </div>
              <div>
                <Label>رمز الدور *</Label>
                <Input
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toLowerCase() })
                  }
                  placeholder="مثال: hr_manager"
                />
              </div>
            </div>

            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">الصلاحيات ونطاق البيانات</Label>
              <p className="text-sm text-gray-600 mb-3">
                حدد الصلاحيات لكل قسم، ونطاق البيانات للصلاحيات التي تدعمه
              </p>
              <div className="border rounded-lg p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {Object.entries(CATEGORIES).map(([categoryKey, categoryName]) => {
                  const categoryPerms = ALL_PERMISSIONS.filter(
                    (p) => p.category === categoryKey
                  );
                  const allSelected = categoryPerms.every((p) =>
                    (formData.permissions || []).includes(p.code)
                  );

                  return (
                    <div key={categoryKey} className="space-y-2 pb-3 border-b last:border-b-0">
                      <div className="flex items-center gap-2 pb-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => toggleAllCategory(categoryKey)}
                        />
                        <span className="font-semibold text-gray-700">{categoryName}</span>
                      </div>
                      <div className="mr-6 space-y-2">
                        {categoryPerms.map((perm) => {
                          const isChecked = (formData.permissions || []).includes(perm.code);
                          const currentScope = formData.data_scopes?.[perm.code] || "own";

                          return (
                            <div key={perm.code} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => togglePermission(perm.code)}
                                />
                                <span className="text-sm">{perm.name}</span>
                              </label>
                              {perm.scope && isChecked && (
                                <Select
                                  value={currentScope}
                                  onValueChange={(v) => handleDataScopeChange(perm.code, v)}
                                >
                                  <SelectTrigger className="w-48 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="own">بياناتي فقط</SelectItem>
                                    <SelectItem value="department">بيانات القسم</SelectItem>
                                    <SelectItem value="all">جميع البيانات</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </FormModal>

        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="حذف الدور"
          description="هل أنت متأكد من حذف هذا الدور؟ سيتم إزالة الدور من جميع المستخدمين المرتبطين به."
        />
      </div>
    </ProtectedRoute>
  );
}