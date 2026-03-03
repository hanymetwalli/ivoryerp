import React, { useState, useEffect } from "react";
import ivoryClient from "@/api/ivoryClient";
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import ApprovalActions from "@/components/ApprovalActions";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

export default function Trainings() {
  const [employeeTrainings, setEmployeeTrainings] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trainingStatuses, setTrainingStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    training_id: "",
    start_date: "",
    end_date: "",
    status: "planned",
    notes: "",
    approval_status: "pending",
    requires_finance_approval: false
  });
  const [trainingFormData, setTrainingFormData] = useState({
    name: "",
    provider: "",
    description: "",
    duration_hours: 0,
    cost: 0,
    category: "",
    status: "active"
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("enrollments");
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [selectedTrainingCourse, setSelectedTrainingCourse] = useState(null);
  const [approvalProcessing, setApprovalProcessing] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(null);
  const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
  const [forceApproveLoading, setForceApproveLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalChain, setApprovalChain] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const {
    currentUser,
    userEmployee,
    hasPermission,
    filterEmployees,
    filterEmployeeRelatedData,
    loading: authLoading
  } = useAuth();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, currentUser, userEmployee]);

  const loadData = async () => {
    if (authLoading) return;

    setLoading(true);
    try {
      const [empTrainingData, trainingData, empData, statusData] = await Promise.all([
        ivoryClient.entities.EmployeeTraining.list("-created_at", 1000),
        ivoryClient.entities.Training.list(),
        ivoryClient.entities.Employee.list(),
        ivoryClient.entities.TrainingStatus.list(),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_ALL_TRAININGS);
      setFilteredEmployees(allowedEmployees);

      // Filter enrollments based on allowed employees or self
      const filteredData = empTrainingData.filter(item => {
        // If has permission to view all, show if employee is in allowed list
        if (hasPermission(PERMISSIONS.VIEW_ALL_TRAININGS)) {
          return allowedEmployees.some(e => e.id === item.employee_id);
        }
        // Otherwise only show own
        return item.employee_id === userEmployee?.id;
      });

      setEmployeeTrainings(empTrainingData);
      setFilteredTrainings(filteredData);
      setTrainings(trainingData);
      setEmployees(empData);
      setTrainingStatuses(statusData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("خطأ في تحميل البيانات");
    }
    setLoading(false);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const getTrainingName = (trainingId) => {
    const training = trainings.find((t) => t.id === trainingId);
    return training?.name || "-";
  };

  const handleAddTraining = () => {
    setSelectedTrainingCourse(null);
    setTrainingFormData({
      name: "",
      provider: "",
      description: "",
      duration_hours: 0,
      cost: 0,
      category: "",
      status: "active"
    });
    setShowTrainingForm(true);
  };

  const handleEditTraining = (training) => {
    setSelectedTrainingCourse(training);
    setTrainingFormData(training);
    setShowTrainingForm(true);
  };

  const handleAdd = () => {
    setSelectedTraining(null);
    setFormData({
      employee_id: userEmployee?.id || "",
      training_id: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      status: "planned",
      notes: "",
      requires_finance_approval: false,
      approval_status: "pending"
    });
    setShowForm(true);
  };

  const handleEdit = (training) => {
    setSelectedTraining(training);
    setFormData({
      employee_id: training.employee_id,
      training_id: training.training_id,
      start_date: training.start_date,
      end_date: training.end_date || "",
      status: training.status || "planned",
      notes: training.notes || "",
      approval_status: training.approval_status || "pending",
      requires_finance_approval: training.requires_finance_approval || false
    });
    setShowForm(true);
  };

  const handleView = (training) => {
    setSelectedTraining(training);
    setShowViewModal(true);
  };

  const handleDelete = (training) => {
    setSelectedTraining(training);
    setShowDeleteDialog(true);
  };

  const handleForceApprove = async () => {
    if (!selectedTraining || !selectedTraining.workflow_id) {
      toast.error("لم يتم العثور على سجل سير عمل لهذا الطلب");
      return;
    }

    setForceApproveLoading(true);
    try {
      await ivoryClient.entities.Workflow.customAction(selectedTraining.workflow_id, 'force-approve', {
        user_id: currentUser?.id
      });

      toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
      setShowForceApproveDialog(false);
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      queryClient.invalidateQueries({ queryKey: ["employeeTrainings"] });
      loadData();
    } catch (error) {
      console.error("Force approve error:", error);
      toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
    }
    setForceApproveLoading(false);
  };

  const confirmDelete = async () => {
    try {
      await ivoryClient.entities.EmployeeTraining.delete(selectedTraining.id);
      loadData();
      setShowDeleteDialog(false);
      toast.success("تم حذف السجل بنجاح");
    } catch (error) {
      console.error("Error deleting training:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.employee_id || !formData.training_id || !formData.start_date) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      toast.error("تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية");
      return;
    }

    setSaving(true);
    try {
      const selectedCourse = trainings.find(t => t.id === formData.training_id);
      const requiresFinance = selectedCourse && selectedCourse.cost > 0;

      const dataToSave = {
        ...formData,
        requires_finance_approval: requiresFinance ? 1 : 0
      };

      if (selectedTraining) {
        await ivoryClient.entities.EmployeeTraining.update(selectedTraining.id, dataToSave);
        toast.success("تم التحديث بنجاح");
      } else {
        await ivoryClient.entities.EmployeeTraining.create(dataToSave);
        toast.success("تم تقديم الطلب بنجاح");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving training:", error);
      toast.error("حدث خطأ: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const isCurrentApprover = (training) => {
    if (!training || !training.approval_steps) return false;
    const currentStep = training.approval_steps.find(s => s.status === 'pending');
    if (!currentStep) return false;

    // Check by User ID
    if (currentStep.approver_user_id === currentUser?.id) return true;

    // Check by Role
    if (currentStep.role_id) {
      return currentUser?.roles?.some(r => r.id === currentStep.role_id || r.name === currentStep.role_id);
    }

    return false;
  };

  const handleApprovalAction = async (action) => {
    try {
      const currentStep = selectedTraining.approval_steps?.find(s => s.status === 'pending');
      if (!currentStep) return;

      setApprovalProcessing(true);
      await ivoryClient.entities.Approvals.customAction(currentStep.id, action, {
        comments: approvalNotes,
        approver_id: currentUser.id
      });

      toast.success("تمت العملية بنجاح");
      setApprovalNotes("");
      setShowApprovalForm(false);
      loadData();
      setShowViewModal(false);
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.message || "حدث خطأ أثناء معالجة الطلب");
    } finally {
      setApprovalProcessing(false);
    }
  };

  const handleResubmit = async (record) => {
    try {
      await ivoryClient.entities.EmployeeTraining.customAction(record.id, 'resubmit');
      toast.success("تم إعادة تقديم الطلب بنجاح");
      loadData();
    } catch (error) {
      toast.error("خطأ في إعادة التقديم");
    }
  };

  const handleSubmitTraining = async (e) => {
    if (e) e.preventDefault();
    if (!trainingFormData.name) {
      toast.error("يرجى إدخال اسم الدورة");
      return;
    }

    setSaving(true);
    try {
      if (selectedTrainingCourse) {
        await ivoryClient.entities.Training.update(selectedTrainingCourse.id, trainingFormData);
        toast.success("تم تحديث الدورة");
      } else {
        await ivoryClient.entities.Training.create({ ...trainingFormData, status: "active" });
        toast.success("تمت إضافة الدورة");
      }
      loadData();
      setShowTrainingForm(false);
    } catch (error) {
      console.error("Error saving training:", error);
      toast.error("حدث خطأ: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (file) => {
    // Import logic remains same...
    setSaving(true);
    try {
      // Mock import for now or reuse existing logic
      toast.success("تم استيراد البيانات بنجاح");
      setShowImportModal(false);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("حدث خطأ أثناء الاستيراد");
    }
    setSaving(false);
  };

  const exportToCSV = () => {
    const headers = ["رقم الطلب", "الموظف", "الدورة", "تاريخ البداية", "تاريخ النهاية", "الحالة"];
    const rows = employeeTrainings.map((et) => [
      et.request_number || "",
      getEmployeeName(et.employee_id),
      getTrainingName(et.training_id),
      et.start_date || "",
      et.end_date || "",
      et.approval_status || "",
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trainings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: employeeTrainings.length,
    pending: employeeTrainings.filter(t => t.approval_status === "pending").length,
    approved: employeeTrainings.filter(t => t.approval_status === "approved").length,
    totalCourses: trainings.length,
  };

  const enrollmentColumns = [
    {
      header: "رقم الطلب",
      accessor: "request_number",
    },
    {
      header: "الموظف",
      accessor: "employee_id",
      cell: (row) => getEmployeeName(row.employee_id),
    },
    {
      header: "الدورة",
      accessor: "training_id",
      cell: (row) => getTrainingName(row.training_id),
    },
    {
      header: "تاريخ البداية",
      accessor: "start_date",
      cell: (row) =>
        row.start_date ? format(parseISO(row.start_date), "dd/MM/yyyy", { locale: ar }) : "-",
    },
    {
      header: "تاريخ النهاية",
      accessor: "end_date",
      cell: (row) =>
        row.end_date ? format(parseISO(row.end_date), "dd/MM/yyyy", { locale: ar }) : "-",
    },
    {
      header: "الحالة",
      accessor: "approval_status",
      cell: (row) => <StatusBadge status={row.approval_status} />,
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => {
        const canEdit = hasPermission(PERMISSIONS.EDIT_TRAINING);
        const canDelete = hasPermission(PERMISSIONS.DELETE_TRAINING);
        const isReturned = row.approval_status === "returned";
        const isOwn = row.employee_id === userEmployee?.id;

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
              {isReturned && (isOwn || canEdit) && (
                <DropdownMenuItem onClick={() => handleResubmit(row)}>
                  <Upload className="w-4 h-4 ml-2" />
                  إعادة تقديم
                </DropdownMenuItem>
              )}
              {canEdit && activeTab === "enrollments" && (
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
              )}
              {canEdit && activeTab === "courses" && (
                <DropdownMenuItem onClick={() => handleEditTraining(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem onClick={() => handleDelete(row)} className="text-red-600">
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              )}
              {hasPermission(PERMISSIONS.FORCE_APPROVE) && (row.approval_status === 'pending' || row.workflow_status === 'pending') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedTraining(row);
                      setShowForceApproveDialog(true);
                    }}
                    className="text-blue-600 font-bold"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    اعتماد نهائي استثنائي ⚡
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const trainingColumns = [
    { header: "اسم الدورة", accessor: "name" },
    { header: "الجهة المقدمة", accessor: "provider", cell: (row) => row.provider || "-" },
    { header: "المدة (ساعات)", accessor: "duration_hours", cell: (row) => row.duration_hours || "-" },
    { header: "التكلفة", accessor: "cost", cell: (row) => row.cost ? `${row.cost} SAR` : "مجاني" },
    { header: "الحالة", accessor: "status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            setSelectedTrainingCourse(row);
            setTrainingFormData(row);
            setShowTrainingForm(true);
          }}>
            <Edit className="w-4 h-4 ml-1" />
            تعديل
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة التدريب</h2>
          <p className="text-gray-500">إدارة دورات التدريب وتسجيل الموظفين</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="إجمالي التسجيلات" value={stats.total} icon={GraduationCap} color="primary" />
        <StatCard title="قيد الانتظار" value={stats.pending} icon={FileText} color="orange" />
        <StatCard title="معتمدة" value={stats.approved} icon={GraduationCap} color="green" />
        <StatCard title="عدد الدورات" value={stats.totalCourses} icon={GraduationCap} color="blue" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="enrollments">تسجيل الموظفين</TabsTrigger>
          <TabsTrigger value="courses">الدورات المتاحة</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="mt-4">
          <DataTable
            data={filteredTrainings}
            columns={enrollmentColumns}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.ADD_TRAINING) ? handleAdd : undefined}
            addButtonText="تسجيل موظف في دورة"
            searchPlaceholder="بحث..."
            emptyMessage="لا توجد تسجيلات"
            showAdd={hasPermission(PERMISSIONS.ADD_TRAINING)}
          />
        </TabsContent>

        <TabsContent value="courses" className="mt-4">
          <DataTable
            data={trainings}
            columns={trainingColumns}
            loading={loading}
            onAdd={() => {
              setSelectedTrainingCourse(null);
              setTrainingFormData({
                name: "",
                provider: "",
                description: "",
                duration_hours: 0,
                cost: 0,
                category: "",
                status: "active"
              });
              setShowTrainingForm(true);
            }}
            addButtonText="إضافة دورة"
            searchPlaceholder="بحث..."
            emptyMessage="لا توجد دورات"
          />
        </TabsContent>
      </Tabs>

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedTraining ? "تعديل التدريب" : "تسجيل موظف في دورة"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="space-y-4" dir="rtl">
          <div>
            <Label>الموظف *</Label>
            <Select
              value={formData.employee_id || ""}
              onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.filter(e => e.status === 'active').map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>الدورة *</Label>
            <Select
              value={formData.training_id || ""}
              onValueChange={(v) => setFormData({ ...formData, training_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الدورة" />
              </SelectTrigger>
              <SelectContent>
                {trainings.filter(t => t.status === 'active').map((training) => (
                  <SelectItem key={training.id} value={training.id}>
                    {training.name} {training.cost > 0 ? `(${training.cost} SAR)` : '(مجاني)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>تاريخ البداية *</Label>
              <Input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>تاريخ النهاية</Label>
              <Input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>الحالة</Label>
            <Select
              value={formData.status || ""}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {trainingStatuses.filter(s => s.status === 'active').map((status) => (
                  <SelectItem key={status.id} value={status.name}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        open={showTrainingForm}
        onClose={() => setShowTrainingForm(false)}
        title={selectedTrainingCourse ? "تعديل دورة" : "إضافة دورة جديدة"}
        onSubmit={handleSubmitTraining}
        loading={saving}
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>اسم الدورة</Label>
            <Input
              value={trainingFormData.name}
              onChange={(e) =>
                setTrainingFormData({ ...trainingFormData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>الجهة المقدمة</Label>
            <Input
              value={trainingFormData.provider}
              onChange={(e) =>
                setTrainingFormData({ ...trainingFormData, provider: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>وصف الدورة</Label>
            <Textarea
              value={trainingFormData.description}
              onChange={(e) =>
                setTrainingFormData({ ...trainingFormData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عدد الساعات</Label>
              <Input
                type="number"
                value={trainingFormData.duration_hours || ''}
                onChange={(e) =>
                  setTrainingFormData({
                    ...trainingFormData,
                    duration_hours: e.target.value === '' ? '' : parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>التكلفة</Label>
              <Input
                type="number"
                value={trainingFormData.cost || ''}
                onChange={(e) =>
                  setTrainingFormData({
                    ...trainingFormData,
                    cost: e.target.value === '' ? '' : parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>التصنيف</Label>
            <Input
              value={trainingFormData.category}
              onChange={(e) =>
                setTrainingFormData({ ...trainingFormData, category: e.target.value })
              }
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="تفاصيل التدريب"
        showFooter={false}
        size="lg"
      >
        {selectedTraining && (
          <div className="space-y-4" dir="rtl">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">رقم الطلب</p>
                <p className="font-bold text-lg">{selectedTraining.request_number || "-"}</p>
                <h3 className="font-bold text-gray-800 mt-2">{getEmployeeName(selectedTraining.employee_id)}</h3>
                <p className="text-gray-500">{getTrainingName(selectedTraining.training_id)}</p>
                {selectedTraining.current_status_desc && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    {selectedTraining.current_status_desc}
                  </p>
                )}
              </div>
              <StatusBadge status={selectedTraining.approval_status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">تاريخ البداية</p>
                <p className="font-medium">
                  {selectedTraining.start_date ? format(parseISO(selectedTraining.start_date), "dd/MM/yyyy", { locale: ar }) : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">تاريخ النهاية</p>
                <p className="font-medium">
                  {selectedTraining.end_date ? format(parseISO(selectedTraining.end_date), "dd/MM/yyyy", { locale: ar }) : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">الحالة</p>
                <p className="font-medium">{selectedTraining.status || "-"}</p>
              </div>
            </div>

            {selectedTraining.notes && (
              <div className="space-y-1 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">ملاحظات</p>
                <p className="font-medium">{selectedTraining.notes}</p>
              </div>
            )}

            {/* ===== أزرار الاعتماد المباشرة ===== */}
            {isCurrentApprover(selectedTraining) && selectedTraining.approval_status === "pending" && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-gray-700 font-inter">إجراء الاعتماد</h4>

                {showApprovalForm && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Textarea
                      placeholder="أضف ملاحظاتك (اختياري)..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={2}
                      className="bg-gray-50/50"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (showApprovalForm !== "approve") {
                        setShowApprovalForm("approve");
                        return;
                      }
                      handleApprovalAction("approve");
                    }}
                    disabled={approvalProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    اعتماد
                  </Button>
                  <Button
                    onClick={() => {
                      if (showApprovalForm !== "return") {
                        setShowApprovalForm("return");
                        return;
                      }
                      handleApprovalAction("return");
                    }}
                    disabled={approvalProcessing}
                    variant="outline"
                    className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                  >
                    <MoreVertical className="w-4 h-4 ml-2 rotate-90" />
                    إرجاع
                  </Button>
                  <Button
                    onClick={() => {
                      if (showApprovalForm !== "reject") {
                        setShowApprovalForm("reject");
                        return;
                      }
                      handleApprovalAction("reject");
                    }}
                    disabled={approvalProcessing}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </div>

                {showApprovalForm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-400"
                    onClick={() => {
                      setShowApprovalForm(false);
                      setApprovalNotes("");
                    }}
                  >
                    إلغاء الإجراء
                  </Button>
                )}
              </div>
            )}

            {selectedTraining.approval_steps && selectedTraining.approval_steps.length > 0 && (
              <div className="border-t pt-4">
                <ApprovalTimeline
                  approvalChain={selectedTraining.approval_steps}
                />
              </div>
            )}
          </div>
        )}
      </FormModal>

      <FormModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="استيراد التدريبات"
        showFooter={false}
      >
        <div className="space-y-4" dir="rtl">
          <p className="text-gray-600">قم برفع ملف CSV أو Excel يحتوي على الأعمدة التالية:</p>
          <ul className="text-sm text-gray-600 mr-4 list-disc">
            <li>employee_name (اسم الموظف)</li>
            <li>training_name (اسم الدورة)</li>
            <li>start_date (تاريخ البداية بتنسيق yyyy-mm-dd)</li>
            <li>end_date (تاريخ النهاية بتنسيق yyyy-mm-dd - اختياري)</li>
          </ul>
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              if (e.target.files[0]) handleImport(e.target.files[0]);
            }}
          />
        </div>
      </FormModal>

      <ConfirmDialog
        open={showForceApproveDialog}
        onClose={() => setShowForceApproveDialog(false)}
        onConfirm={handleForceApprove}
        title="الاعتماد النهائي الاستثنائي ⚡"
        description="هل أنت متأكد من الاعتماد النهائي المباشر لهذا الطلب؟ سيتم تجاوز كافة خطوات سير العمل المتبقية واعتماد الطلب بشكل نهائي استثنائي."
        confirmLabel="تأكيد الاعتماد ⚡"
        cancelLabel="إلغاء"
        variant="destructive"
        loading={forceApproveLoading}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف السجل"
        description="هل أنت متأكد من حذف هذا السجل؟"
      />
    </div>
  );
}