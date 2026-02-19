import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Plus, Edit, Trash2, Users, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function OrganizationalStructure() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const { hasPermission, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptData, empData] = await Promise.all([
        base44.entities.Department.list("-created_date"),
        base44.entities.Employee.list(),
      ]);
      setDepartments(deptData);
      setEmployees(empData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.id === empId);
    return emp?.full_name || "-";
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || "-";
  };

  const getSubDepartments = (parentId) => {
    return departments.filter(d => d.parent_department_id === parentId);
  };

  const getEmployeesInDepartment = (deptName) => {
    return employees.filter(e => e.department === deptName && e.status === 'active');
  };

  const handleAddDept = (parentId = null) => {
    setSelectedDept(null);
    setFormData({ parent_department_id: parentId, status: "active" });
    setShowDeptForm(true);
  };

  const handleEditDept = (dept) => {
    setSelectedDept(dept);
    setFormData(dept);
    setShowDeptForm(true);
  };

  const handleDeleteDept = (dept) => {
    setSelectedDept(dept);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.Department.delete(selectedDept.id);
      loadData();
      setShowDeleteDialog(false);
      toast.success("تم حذف القسم بنجاح");
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleSubmitDept = async () => {
    if (!formData.name) {
      toast.error("يرجى إدخال اسم القسم");
      return;
    }

    setSaving(true);
    try {
      if (selectedDept) {
        await base44.entities.Department.update(selectedDept.id, formData);
        toast.success("تم تحديث القسم");
      } else {
        await base44.entities.Department.create(formData);
        toast.success("تمت إضافة القسم");
      }
      loadData();
      setShowDeptForm(false);
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  const renderDepartmentCard = (dept, level = 0) => {
    const subDepts = getSubDepartments(dept.id);
    const deptEmployees = getEmployeesInDepartment(dept.name);

    return (
      <div key={dept.id} className="mb-4">
        <Card className={`border-r-4 ${level === 0 ? 'border-r-[#7c3238]' : level === 1 ? 'border-r-blue-500' : 'border-r-green-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className={`w-5 h-5 ${level === 0 ? 'text-[#7c3238]' : level === 1 ? 'text-blue-600' : 'text-green-600'}`} />
                  <h3 className="text-lg font-bold text-gray-800">{dept.name}</h3>
                  {dept.code && <span className="text-sm text-gray-500">({dept.code})</span>}
                  <StatusBadge status={dept.status} />
                </div>

                <div className="space-y-1 text-sm">
                  {dept.parent_department_id && (
                    <p className="text-gray-600">
                      القسم الرئيسي: {getDepartmentName(dept.parent_department_id)}
                    </p>
                  )}
                  {dept.manager_id && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">المدير: {getEmployeeName(dept.manager_id)}</span>
                    </div>
                  )}
                  {dept.description && (
                    <p className="text-gray-600 mt-2">{dept.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>عدد الموظفين: {deptEmployees.length}</span>
                    {subDepts.length > 0 && <span>الأقسام الفرعية: {subDepts.length}</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {level < 2 && hasPermission(PERMISSIONS.ADD_ORGANIZATIONAL_STRUCTURE) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddDept(dept.id)}
                    title="إضافة قسم فرعي"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
                {hasPermission(PERMISSIONS.EDIT_ORGANIZATIONAL_STRUCTURE) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDept(dept)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {hasPermission(PERMISSIONS.DELETE_ORGANIZATIONAL_STRUCTURE) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDept(dept)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {subDepts.length > 0 && (
          <div className="mr-8 mt-3 space-y-3 border-r-2 border-gray-200 pr-4">
            {subDepts.map(subDept => renderDepartmentCard(subDept, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootDepartments = departments.filter(d => !d.parent_department_id);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">الهيكل الإداري</h2>
          <p className="text-gray-500">إدارة التسلسل الهرمي للأقسام والموظفين</p>
        </div>
        {hasPermission(PERMISSIONS.ADD_ORGANIZATIONAL_STRUCTURE) && (
          <Button
            onClick={() => handleAddDept()}
            className="bg-[#7c3238] hover:bg-[#5a252a]"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة قسم رئيسي
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3238]" />
        </div>
      ) : rootDepartments.length > 0 ? (
        <div className="space-y-4">
          {rootDepartments.map(dept => renderDepartmentCard(dept, 0))}
        </div>
      ) : (
        <Card className="p-12 text-center text-gray-500">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">لا توجد أقسام بعد</p>
          <p className="text-sm mt-2">ابدأ بإضافة القسم الرئيسي الأول للشركة</p>
        </Card>
      )}

      <FormModal
        open={showDeptForm}
        onClose={() => setShowDeptForm(false)}
        title={selectedDept ? "تعديل القسم" : formData.parent_department_id ? "إضافة قسم فرعي" : "إضافة قسم رئيسي"}
        onSubmit={handleSubmitDept}
        loading={saving}
      >
        <div className="space-y-4" dir="rtl">
          <div>
            <Label>اسم القسم *</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: قسم تقنية المعلومات، الموارد البشرية..."
            />
          </div>
          <div>
            <Label>الرمز</Label>
            <Input
              value={formData.code || ""}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="مثال: IT، HR..."
            />
          </div>
          {!formData.parent_department_id && !selectedDept?.parent_department_id && (
            <div>
              <Label>القسم الرئيسي (اختياري)</Label>
              <Select
                value={formData.parent_department_id || "none"}
                onValueChange={(v) => setFormData({ ...formData, parent_department_id: v === "none" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="قسم رئيسي مستقل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">قسم رئيسي مستقل</SelectItem>
                  {departments.filter(d => d.id !== selectedDept?.id && d.status === 'active').map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>مدير القسم *</Label>
            <Select
              value={formData.manager_id || ""}
              onValueChange={(v) => setFormData({ ...formData, manager_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مدير القسم" />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(e => e.status === 'active').map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="وصف القسم ومسؤولياته..."
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف القسم"
        description={`هل أنت متأكد من حذف قسم "${selectedDept?.name}"؟ سيتم حذف جميع الأقسام الفرعية التابعة له.`}
      />
    </div>
  );
}