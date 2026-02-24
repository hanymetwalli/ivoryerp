import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { MoreVertical, CheckCircle, Eye, Edit, Trash2, Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function PerformanceEvaluations() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
  const [forceApproveLoading, setForceApproveLoading] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const queryClient = useQueryClient();

  const {
    currentUser: authUser,
    hasPermission: checkPermission,
    loading: authLoading
  } = useAuth();

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ["performanceEvaluations"],
    queryFn: () => base44.entities.PerformanceEvaluation.list("-created_date"),
  });

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadData = async () => {
    try {
      const [emps, temps] = await Promise.all([
        base44.entities.Employee.list(),
        base44.entities.EvaluationTemplate.filter({ status: "active" }),
      ]);
      setEmployees(emps);
      setTemplates(temps);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PerformanceEvaluation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceEvaluations"] });
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم حفظ التقييم بنجاح");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerformanceEvaluation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceEvaluations"] });
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم تحديث التقييم بنجاح");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PerformanceEvaluation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performanceEvaluations"] });
      toast.success("تم حذف التقييم بنجاح");
    },
  });

  const handleSubmit = async () => {
    const formData = editingItem;

    if (!formData.employee_id || !formData.template_id || !formData.period_start || !formData.period_end) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }

    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      // Generate evaluation number
      const evalNumber = `EVAL-${Date.now()}`;
      createMutation.mutate({
        ...formData,
        evaluation_number: evalNumber,
        evaluator_id: authUser?.id,
        status: "draft"
      });
    }
  };

  const handleForceApprove = async () => {
    console.log("⚡ Starting Force Approve Diagnostic for Evaluation...");
    console.log("Selected Record:", selectedEvaluation);

    if (!selectedEvaluation || !selectedEvaluation.workflow_id) {
      console.error("❌ Diagnostic: Missing workflow_id", selectedEvaluation);
      toast.error("لم يتم العثور على سجل سير عمل لهذا التقييم");
      return;
    }

    setForceApproveLoading(true);
    try {
      console.log(`📡 Sending customAction 'force-approve' to Workflow ID: ${selectedEvaluation.workflow_id}`);
      console.log(`👤 User ID: ${authUser?.id}`);

      const response = await base44.entities.Workflow.customAction(selectedEvaluation.workflow_id, 'force-approve', {
        user_id: authUser?.id
      });

      console.log("✅ Diagnostic Response:", response);
      toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
      setShowForceApproveDialog(false);

      console.log("🔄 Invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["performanceEvaluations"] });

      console.log("🔃 Calling loadData()...");
      loadData();
    } catch (error) {
      console.error("❌ Force approve diagnostic error:", error);
      toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
    }
    setForceApproveLoading(false);
  };

  const handleDelete = (id) => {
    if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
      deleteMutation.mutate(id);
    }
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    return emp?.full_name || "غير معروف";
  };

  const getTemplateName = (tempId) => {
    const temp = templates.find((t) => t.id === tempId);
    return temp?.name || "غير معروف";
  };

  const columns = [
    {
      header: "رقم التقييم",
      accessor: "evaluation_number",
    },
    {
      header: "الموظف",
      cell: (row) => getEmployeeName(row.employee_id),
    },
    {
      header: "القالب",
      cell: (row) => getTemplateName(row.template_id),
    },
    {
      header: "الفترة",
      cell: (row) => `${row.period_start} - ${row.period_end}`,
    },
    {
      header: "الدرجة الإجمالية",
      cell: (row) => row.overall_score ? `${row.overall_score}%` : "-",
    },
    {
      header: "الحالة",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={row.status} />
          {row.workflow_status && row.workflow_status !== row.status && (
            <span className="text-[10px] text-gray-500">{row.workflow_status}</span>
          )}
        </div>
      ),
    },
    {
      header: "الإجراءات",
      cell: (row) => {
        const canForceApprove = checkPermission(PERMISSIONS.FORCE_APPROVE);
        const isPending = row.status === 'pending' || row.workflow_status === 'pending';

        return (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to={`${createPageUrl("EvaluationForm")}?id=${row.id}`}>
                    <div className="flex items-center w-full">
                      <Eye className="w-4 h-4 ml-2" />
                      عرض التفاصيل
                    </div>
                  </Link>
                </DropdownMenuItem>

                {row.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف
                  </DropdownMenuItem>
                )}

                {canForceApprove && isPending && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        console.log("⚡ Menu Item Clicked: Force Approve for Evaluation", row.evaluation_number || row.id);
                        setSelectedEvaluation(row);
                        setShowForceApproveDialog(true);
                      }}
                      className="text-blue-600 font-bold"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      الاعتماد النهائي الاستثنائي ⚡
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute permission={PERMISSIONS.VIEW_ALL_EVALUATIONS} fallback={null}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقييم الأداء الوظيفي</h1>
            <p className="text-gray-600 mt-1">إدارة تقييمات أداء الموظفين</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("EvaluationTemplates")}>
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                قوالب التقييم
              </Button>
            </Link>
            {currentUser && (
              <Button
                onClick={() => {
                  setEditingItem({});
                  setShowModal(true);
                }}
                className="gap-2 bg-[#7c3238] hover:bg-[#5a252a]"
              >
                <Plus className="w-4 h-4" />
                تقييم جديد
              </Button>
            )}
          </div>
        </div>

        <DataTable
          data={evaluations}
          columns={columns}
          loading={isLoading}
          searchPlaceholder="بحث في التقييمات..."
          emptyMessage="لا توجد تقييمات"
          showAdd={false}
        />

        <FormModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          title={editingItem?.id ? "تعديل التقييم" : "تقييم جديد"}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">الموظف</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={editingItem?.employee_id || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, employee_id: e.target.value })
                }
              >
                <option value="">اختر موظف</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">قالب التقييم</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={editingItem?.template_id || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, template_id: e.target.value })
                }
              >
                <option value="">اختر قالب</option>
                {templates.map((temp) => (
                  <option key={temp.id} value={temp.id}>
                    {temp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">بداية الفترة</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingItem?.period_start || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, period_start: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نهاية الفترة</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingItem?.period_end || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, period_end: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </FormModal>

        <ConfirmDialog
          open={showForceApproveDialog}
          onClose={() => setShowForceApproveDialog(false)}
          onConfirm={handleForceApprove}
          title="تأكيد الاعتماد النهائي الاستثنائي"
          description="هل أنت متأكد من الاعتماد المباشر لهذا التقييم؟ سيتم تخطي الخطوات المتبقية واعتماده باسمك كمدير للنظام."
          confirmLabel="تأكيد الاعتماد ⚡"
          cancelLabel="إلغاء"
          variant="destructive"
          loading={forceApproveLoading}
        />
      </div>
    </ProtectedRoute >
  );
}