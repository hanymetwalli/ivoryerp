import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  FileText,
  Phone,
  Mail,
  MapPin,
  Building2,
  MoreVertical,
  Paperclip,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

const LOCATION_LABELS = {
  saudi_madd: "منصة مدد - السعودية",
  egypt: "مصر",
  remote: "عمل عن بُعد",
};

const GENDER_LABELS = {
  male: "ذكر",
  female: "أنثى",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // استخدام نظام الصلاحيات المركزي
  const {
    currentUser,
    userEmployee,
    hasPermission,
    getDataScope,
    loading: authLoading
  } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, currentUser, userEmployee]);

  const loadData = async () => {
    if (authLoading) return; // انتظر تحميل بيانات المستخدم

    setLoading(true);
    try {
      const [empData, deptData, posData, bankData, natData, locData, schData] = await Promise.all([
        base44.entities.Employee.list("-created_date", 200),
        base44.entities.Department.list(),
        base44.entities.Position.list(),
        base44.entities.BankName.list(),
        base44.entities.Nationality.list(),
        base44.entities.WorkLocation.list(),
        base44.entities.WorkSchedule.list(),
      ]);

      setEmployees(empData);
      setDepartments(deptData);
      setPositions(posData);
      setBanks(bankData);
      setNationalities(natData);
      setWorkLocations(locData);
      setWorkSchedules(schData);

      // تطبيق نطاق البيانات
      const viewPermission = PERMISSIONS.VIEW_ALL_EMPLOYEES;
      const dataScope = getDataScope(viewPermission);

      let filtered = empData;

      if (dataScope === 'own') {
        // الموظف يرى بياناته فقط
        if (!userEmployee) {
          filtered = [];
        } else {
          filtered = empData.filter(emp => emp.id === userEmployee.id);
        }
      } else if (dataScope === 'department') {
        // مدير القسم يرى موظفي قسمه فقط
        if (!userEmployee) {
          filtered = [];
        } else {
          const userDept = userEmployee.department;
          filtered = empData.filter(emp => emp.department === userDept);
        }
      }
      // else: dataScope === 'all' - المدير العام يرى الكل

      setFilteredEmployees(filtered);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const generateEmployeeNumber = () => {
    const maxNumber = employees.reduce((max, emp) => {
      const match = emp.employee_number?.match(/EMP-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `EMP-${String(maxNumber + 1).padStart(4, "0")}`;
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setFormData({
      status: "active",
      gender: "male",
      employee_number: generateEmployeeNumber(),
      documents: [],
    });
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      ...employee,
      documents: employee.documents || [],
    });
    setShowForm(true);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleDelete = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      // ✅ تسجيل في Audit Log
      await base44.functions.invoke('logAuditEvent', {
        action: 'delete',
        entity_name: 'Employee',
        record_id: selectedEmployee.id,
        record_identifier: selectedEmployee.employee_number,
        details: `حذف موظف: ${selectedEmployee.full_name} - ${selectedEmployee.position}`,
        changed_data: {
          employee_name: selectedEmployee.full_name,
          employee_number: selectedEmployee.employee_number,
          position: selectedEmployee.position,
          department: selectedEmployee.department,
          status: selectedEmployee.status,
        },
        severity: 'critical',
      });

      await base44.entities.Employee.delete(selectedEmployee.id);
      setEmployees(employees.filter((e) => e.id !== selectedEmployee.id));
      setShowDeleteDialog(false);
      toast.success("تم حذف الموظف بنجاح");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newDoc = {
        name: file.name,
        url: file_url,
        type: file.type,
        upload_date: new Date().toISOString(),
      };
      setFormData({
        ...formData,
        documents: [...(formData.documents || []), newDoc],
      });
      toast.success("تم رفع المستند بنجاح");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("حدث خطأ أثناء رفع المستند");
    }
    setUploadingDoc(false);
  };

  const removeDocument = (index) => {
    const docs = [...(formData.documents || [])];
    docs.splice(index, 1);
    setFormData({ ...formData, documents: docs });
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email || !formData.position || !formData.department) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    setSaving(true);
    try {
      if (selectedEmployee) {
        // ✅ تسجيل التعديل في Audit Log
        await base44.functions.invoke('logAuditEvent', {
          action: 'update',
          entity_name: 'Employee',
          record_id: selectedEmployee.id,
          record_identifier: formData.employee_number || selectedEmployee.employee_number,
          details: `تعديل بيانات الموظف: ${formData.full_name}`,
          changed_data: {
            employee_name: formData.full_name,
            position: formData.position,
            department: formData.department,
          },
          severity: 'medium',
        });

        await base44.entities.Employee.update(selectedEmployee.id, formData);
        toast.success("تم تحديث بيانات الموظف");
      } else {
        await base44.entities.Employee.create(formData);

        // ✅ تسجيل الإضافة في Audit Log
        await base44.functions.invoke('logAuditEvent', {
          action: 'create',
          entity_name: 'Employee',
          record_identifier: formData.employee_number,
          details: `إضافة موظف جديد: ${formData.full_name} - ${formData.position}`,
          changed_data: {
            employee_name: formData.full_name,
            employee_number: formData.employee_number,
            position: formData.position,
            department: formData.department,
          },
          severity: 'high',
        });

        toast.success("تمت إضافة الموظف بنجاح");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  const getWorkLocationName = (locId) => {
    const loc = workLocations.find(l => l.id === locId);
    return loc?.name || "";
  };

  const exportToCSV = () => {
    const headers = ["رقم الموظف", "الاسم الكامل", "رقم الهوية", "الجوال", "البريد الإلكتروني", "المنصب", "القسم", "مكان العمل", "تاريخ التعيين", "الجنسية", "الجنس", "الحالة"];
    const rows = employees.map((emp) => [
      emp.employee_number || "",
      emp.full_name || "",
      emp.id_number || "",
      emp.phone || "",
      emp.email || "",
      emp.position || "",
      emp.department || "",
      getWorkLocationName(emp.work_location_id),
      emp.date_of_joining || "",
      emp.nationality || "",
      GENDER_LABELS[emp.gender] || "",
      ({
        active: "نشط",
        inactive: "غير نشط",
        terminated: "مفسوخ",
        expired: "منتهي"
      }[emp.status] || emp.status),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // التحقق من صلاحيات التعديل والحذف لكل موظف
  const canEditEmployee = (employee) => {
    if (!hasPermission(PERMISSIONS.EDIT_EMPLOYEE)) return false;

    const scope = getDataScope(PERMISSIONS.EDIT_EMPLOYEE);
    if (scope === 'all') return true;
    if (scope === 'own') return userEmployee?.id === employee.id;
    if (scope === 'department') return userEmployee?.department === employee.department;

    return false;
  };

  const canDeleteEmployee = (employee) => {
    if (!hasPermission(PERMISSIONS.DELETE_EMPLOYEE)) return false;

    const scope = getDataScope(PERMISSIONS.DELETE_EMPLOYEE);
    if (scope === 'all') return true;
    if (scope === 'own') return userEmployee?.id === employee.id;
    if (scope === 'department') return userEmployee?.department === employee.department;

    return false;
  };

  const columns = [
    {
      header: "الموظف",
      accessor: "full_name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7c3238] flex items-center justify-center text-white font-semibold">
            {row.full_name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.full_name}</p>
            <p className="text-sm text-gray-500">{row.employee_number}</p>
          </div>
        </div>
      ),
    },
    {
      header: "المنصب",
      accessor: "position",
    },
    {
      header: "القسم",
      accessor: "department",
    },
    {
      header: "مكان العمل",
      accessor: "work_location_id",
      cell: (row) => {
        const loc = workLocations.find(l => l.id === row.work_location_id);
        return loc?.name || "-";
      },
    },
    {
      header: "جدول العمل",
      accessor: "work_schedule_id",
      cell: (row) => {
        const sch = workSchedules.find(s => s.id === row.work_schedule_id);
        return sch?.name || "-";
      },
    },
    {
      header: "الحالة",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => {
        const canEdit = canEditEmployee(row);
        const canDelete = canDeleteEmployee(row);

        // إذا لم يكن هناك أي صلاحية، لا نعرض القائمة
        if (!canEdit && !canDelete) {
          return (
            <Button variant="ghost" size="sm" onClick={() => handleView(row)}>
              <Eye className="w-4 h-4 ml-1" />
              عرض
            </Button>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleView(row)}>
                <Eye className="w-4 h-4 ml-2" />
                عرض
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => handleDelete(row)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const downloadTemplate = () => {
    const template = "رقم الموظف,الاسم الكامل,رقم الهوية,رقم الجوال,البريد الإلكتروني,المنصب,القسم,مكان العمل (saudi_madd/egypt/remote),تاريخ التعيين,الجنس (male/female)\n";
    const blob = new Blob(["\ufeff" + template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees_template.csv";
    a.click();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الموظفين</h2>
          <p className="text-gray-500">إدارة بيانات الموظفين والمعلومات التعريفية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 ml-2" />
            قالب الاستيراد
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredEmployees}
        columns={columns}
        loading={loading || authLoading}
        onAdd={hasPermission(PERMISSIONS.ADD_EMPLOYEE) ? handleAdd : undefined}
        addButtonText="إضافة موظف"
        searchPlaceholder="بحث عن موظف..."
        emptyMessage="لا يوجد موظفين"
        showExport={false}
        showAdd={hasPermission(PERMISSIONS.ADD_EMPLOYEE)}
      />

      {/* Add/Edit Form Modal */}
      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
        onSubmit={handleSubmit}
        loading={saving}
        size="xl"
      >
        <div dir="rtl">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">البيانات الشخصية</TabsTrigger>
              <TabsTrigger value="work">البيانات الوظيفية</TabsTrigger>
              <TabsTrigger value="bank">البيانات البنكية</TabsTrigger>
              <TabsTrigger value="documents">الوثائق</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>رقم الموظف *</Label>
                  <Input
                    value={formData.employee_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_number: e.target.value })
                    }
                    placeholder="EMP-0001"
                    disabled={!!selectedEmployee}
                  />
                </div>
                <div>
                  <Label>الاسم الكامل *</Label>
                  <Input
                    value={formData.full_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>رقم الهوية / الإقامة</Label>
                  <Input
                    value={formData.id_number || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, id_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>الجنس</Label>
                  <Select
                    value={formData.gender || "male"}
                    onValueChange={(v) => setFormData({ ...formData, gender: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ الميلاد</Label>
                  <Input
                    type="date"
                    value={formData.birth_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>الجنسية *</Label>
                  <Select
                    value={formData.nationality || ""}
                    onValueChange={(v) => setFormData({ ...formData, nationality: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنسية" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.filter(n => n.status === 'active').map((nat) => (
                        <SelectItem key={nat.id} value={nat.name}>
                          {nat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>رقم الجوال</Label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>البريد الإلكتروني *</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="work" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>المنصب الوظيفي *</Label>
                  <Select
                    value={formData.position || ""}
                    onValueChange={(v) => setFormData({ ...formData, position: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنصب" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.filter((p) => p.status === "active").map((pos) => (
                        <SelectItem key={pos.id} value={pos.name}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>القسم *</Label>
                  <Select
                    value={formData.department || ""}
                    onValueChange={(v) => {
                      const dept = departments.find(d => d.name === v);
                      setFormData({
                        ...formData,
                        department: v,
                        general_manager: dept?.general_manager_id || formData.general_manager
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.filter((d) => d.status === "active").map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>مكان العمل *</Label>
                  <Select
                    value={formData.work_location_id || ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, work_location_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مكان العمل" />
                    </SelectTrigger>
                    <SelectContent>
                      {workLocations.filter(l => l.status === 'active').map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>جدول العمل *</Label>
                  <Select
                    value={formData.work_schedule_id || ""}
                    onValueChange={(v) =>
                      setFormData({ ...formData, work_schedule_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر جدول العمل" />
                    </SelectTrigger>
                    <SelectContent>
                      {workSchedules
                        .filter((s) => s.status === "active" && s.work_location_id === formData.work_location_id)
                        .map((sch) => (
                          <SelectItem key={sch.id} value={sch.id}>
                            {sch.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ التعيين *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date_of_joining || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, date_of_joining: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select
                    value={formData.status || "active"}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="terminated">مفسوخ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


            </TabsContent>

            <TabsContent value="bank" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>اسم البنك</Label>
                  <Select
                    value={formData.bank_name || ""}
                    onValueChange={(v) => setFormData({ ...formData, bank_name: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر البنك" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.filter(b => b.status === 'active').map((bank) => (
                        <SelectItem key={bank.id} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>رقم الحساب</Label>
                  <Input
                    value={formData.bank_account || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_account: e.target.value })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>رقم الآيبان (IBAN)</Label>
                  <Input
                    value={formData.iban || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <div>
                <Label>رفع وثيقة جديدة</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="file"
                    onChange={handleDocumentUpload}
                    disabled={uploadingDoc}
                  />
                  {uploadingDoc && <span className="text-sm text-gray-500">جاري الرفع...</span>}
                </div>
              </div>

              <div className="space-y-2">
                {(formData.documents || []).map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.upload_date).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7c3238] hover:underline text-sm"
                      >
                        عرض
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!formData.documents || formData.documents.length === 0) && (
                  <p className="text-gray-500 text-center py-4">لا توجد وثائق</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </FormModal>

      {/* View Modal */}
      <FormModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="تفاصيل الموظف"
        showFooter={false}
        size="xl"
      >
        {selectedEmployee && (
          <div className="space-y-6" dir="rtl">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-[#7c3238] flex items-center justify-center text-white text-2xl font-bold">
                {selectedEmployee.full_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedEmployee.full_name}
                </h3>
                <p className="text-gray-500">{selectedEmployee.position}</p>
                <StatusBadge status={selectedEmployee.status} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">رقم الموظف</p>
                <p className="font-medium">{selectedEmployee.employee_number || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">رقم الهوية</p>
                <p className="font-medium">{selectedEmployee.id_number || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">القسم</p>
                <p className="font-medium">{selectedEmployee.department || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">مكان العمل</p>
                <p className="font-medium">
                  {workLocations.find(l => l.id === selectedEmployee.work_location_id)?.name || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">الجنسية</p>
                <p className="font-medium">{selectedEmployee.nationality || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">الجنس</p>
                <p className="font-medium">{GENDER_LABELS[selectedEmployee.gender] || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">تاريخ الميلاد</p>
                <p className="font-medium">
                  {selectedEmployee.birth_date ? new Date(selectedEmployee.birth_date).toLocaleDateString("ar-SA") : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">تاريخ التعيين</p>
                <p className="font-medium">
                  {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString("ar-SA") : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">الهاتف</p>
                <p className="font-medium">{selectedEmployee.phone || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium">{selectedEmployee.email || "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">البنك</p>
                <p className="font-medium">{selectedEmployee.bank_name || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">رقم الحساب</p>
                <p className="font-medium">{selectedEmployee.bank_account || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">الآيبان</p>
                <p className="font-medium">{selectedEmployee.iban || "-"}</p>
              </div>
            </div>



            {selectedEmployee.documents && selectedEmployee.documents.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">الوثائق المرفقة</h4>
                <div className="space-y-2">
                  {selectedEmployee.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.upload_date).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#7c3238] hover:underline text-sm"
                      >
                        عرض
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Link to={createPageUrl(`Contracts?employee=${selectedEmployee.id}`)}>
                <Button variant="outline">
                  <FileText className="w-4 h-4 ml-2" />
                  العقود
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedEmployee);
                }}
                className="bg-[#7c3238] hover:bg-[#5a252a]"
              >
                <Edit className="w-4 h-4 ml-2" />
                تعديل
              </Button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف الموظف"
        description={`هل أنت متأكد من حذف الموظف "${selectedEmployee?.full_name}"؟ سيتم حذف جميع البيانات المرتبطة به.`}
      />

      {/* Import Modal */}
      <FormModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="استيراد الموظفين"
        showFooter={false}
        size="md"
      >
        <div className="space-y-4" dir="rtl">
          <p className="text-gray-600">
            يمكنك استيراد بيانات الموظفين من ملف CSV. قم بتحميل القالب أولاً وملء البيانات.
          </p>
          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="w-4 h-4 ml-2" />
            تحميل قالب CSV
          </Button>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">اسحب الملف هنا أو انقر للاختيار</p>
            <Input
              type="file"
              accept=".csv"
              className="mt-2"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                  const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
                    file_url,
                    json_schema: {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              employee_number: { type: "string" },
                              full_name: { type: "string" },
                              id_number: { type: "string" },
                              phone: { type: "string" },
                              email: { type: "string" },
                              position: { type: "string" },
                              department: { type: "string" },
                              location_type: { type: "string" },
                              hire_date: { type: "string" },
                              gender: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  });
                  if (result.status === "success" && result.output?.data) {
                    for (const emp of result.output.data) {
                      await base44.entities.Employee.create({
                        ...emp,
                        status: "active",
                      });
                    }
                    loadData();
                    setShowImportModal(false);
                    toast.success("تم استيراد الموظفين بنجاح");
                  }
                }
              }}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}