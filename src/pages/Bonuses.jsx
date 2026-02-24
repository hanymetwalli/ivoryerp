import React, { useState, useEffect } from "react";
import { base44 } from "@/api/ivoryClient";
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  DollarSign,
  Clock,
  RotateCcw,
  AlertCircle,
  Users,
} from "lucide-react";
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
import ApprovalTimeline, { getCurrentPendingStep } from "@/components/ApprovalTimeline";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PERMISSIONS } from "@/components/permissions";
import { useQueryClient } from "@tanstack/react-query";

export default function Bonuses() {
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: "SAR",
    date: format(new Date(), "yyyy-MM-dd"),
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [filteredBonuses, setFilteredBonuses] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showApprovalForm, setShowApprovalForm] = useState(null);
  const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
  const [forceApproveLoading, setForceApproveLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalProcessing, setApprovalProcessing] = useState(false);

  const {
    currentUser,
    userEmployee,
    hasPermission,
    filterEmployees,
    filterEmployeeRelatedData,
    loading: authLoading,
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
      const [bonusData, empData] = await Promise.all([
        base44.entities.Bonus.list("-created_date", 200),
        base44.entities.Employee.list(),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_ALL_BONUSES);
      setFilteredEmployees(allowedEmployees);

      const filteredData = filterEmployeeRelatedData(bonusData, allowedEmployees, (item) => item.employee_id);

      setBonuses(bonusData);
      setFilteredBonuses(filteredData);
      setEmployees(empData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const handleAdd = () => {
    setSelectedBonus(null);
    setSelectedEmployees([]);
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      currency: "SAR",
    });
    setShowForm(true);
  };

  const handleEdit = (bonus) => {
    setSelectedBonus(bonus);
    setSelectedEmployees([bonus.employee_id]);
    setFormData(bonus);
    setShowForm(true);
  };

  const handleView = (bonus) => {
    setSelectedBonus(bonus);
    setApprovalNotes("");
    setShowApprovalForm(null);
    setShowViewModal(true);
  };

  const handleDelete = (bonus) => {
    setSelectedBonus(bonus);
    setShowDeleteDialog(true);
  };

  const handleForceApprove = async () => {
    if (!selectedBonus || !selectedBonus.workflow_id) {
      toast.error("لم يتم العثور على سجل سير عمل لهذا الطلب");
      return;
    }

    setForceApproveLoading(true);
    try {
      await base44.entities.Workflow.customAction(selectedBonus.workflow_id, 'force-approve', {
        user_id: currentUser.id
      });

      toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
      setShowForceApproveDialog(false);
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      loadData();
    } catch (error) {
      console.error("Force approve error:", error);
      toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
    }
    setForceApproveLoading(false);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.Bonus.delete(selectedBonus.id);
      setBonuses(bonuses.filter((b) => b.id !== selectedBonus.id));
      setShowDeleteDialog(false);
      toast.success("تم حذف المكافأة بنجاح");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0 || !formData.date || !formData.amount || !formData.title) {
      toast.error("يرجى ملء الحقول المطلوبة واختيار الموظفين");
      return;
    }

    setSaving(true);
    try {
      if (selectedBonus) {
        // تحديث طلب موجود
        await base44.entities.Bonus.update(selectedBonus.id, {
          title: formData.title,
          amount: Number(formData.amount),
          currency: formData.currency || "SAR",
          date: formData.date,
          reason: formData.reason || "",
        });

        // إعادة تقديم إذا كان مرتجعاً
        if (selectedBonus.status === "returned" || selectedBonus.workflow_status === "returned") {
          await base44.entities.Bonus.action(selectedBonus.id, "resubmit");
          toast.success("تم تعديل وإعادة تقديم الطلب بنجاح");
        } else {
          toast.success("تم تحديث الطلب بنجاح");
        }
      } else {
        // إنشاء سجلات جديدة لكل موظف
        for (const empId of selectedEmployees) {
          await base44.entities.Bonus.create({
            employee_id: empId,
            title: formData.title,
            amount: Number(formData.amount),
            currency: formData.currency || "SAR",
            date: formData.date,
            reason: formData.reason || "",
            status: "pending",
          });
        }

        toast.success(`تم إضافة ${selectedEmployees.length} مكافأة بنجاح`);
      }

      loadData();
      setShowForm(false);
      setSelectedEmployees([]);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  // ===== إجراءات الاعتماد المباشرة =====
  const handleApprovalAction = async (action) => {
    if (!pendingStep?.id) return;
    setApprovalProcessing(true);
    try {
      const actionMap = { approve: "approved", reject: "rejected", return: "returned" };
      await base44.entities.Approvals.action(pendingStep.id, "submit", {
        action: actionMap[action] || action,
        comments: approvalNotes,
        user_id: currentUser?.id,
      });
      toast.success(action === "approve" ? "تم الاعتماد بنجاح" : action === "return" ? "تم إرجاع الطلب" : "تم الرفض");
      setShowViewModal(false);
      loadData();
    } catch (error) {
      console.error("Approval action error:", error);
      toast.error("حدث خطأ أثناء تنفيذ الإجراء");
    }
    setApprovalProcessing(false);
  };

  const exportToCSV = () => {
    const headers = ["رقم الطلب", "الموظف", "عنوان المكافأة", "المبلغ", "العملة", "التاريخ", "الحالة"];
    const rows = bonuses.map((b) => [
      b.request_number || "",
      getEmployeeName(b.employee_id),
      b.title || "",
      b.amount || 0,
      b.currency || "SAR",
      b.date || "",
      b.status || "",
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bonuses_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: bonuses.length,
    pending: bonuses.filter((b) => b.status === "pending").length,
    approved: bonuses.filter((b) => b.status === "approved").length,
    totalAmount: bonuses.filter((b) => b.status === "approved").reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
  };

  const columns = [
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
      header: "عنوان المكافأة",
      accessor: "title",
    },
    {
      header: "المبلغ",
      accessor: "amount",
      cell: (row) =>
        `${Number(row.amount)?.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0} ${row.currency || "ر.س"}`,
    },
    {
      header: "التاريخ",
      accessor: "date",
      cell: (row) => (row.date ? format(parseISO(row.date), "dd/MM/yyyy", { locale: ar }) : "-"),
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
        const canEditRow = hasPermission(PERMISSIONS.EDIT_BONUS);
        const canDeleteRow = hasPermission(PERMISSIONS.DELETE_BONUS);
        const isOwner = row.employee_id === currentUser?.employee_id;
        const isPending = row.status === "pending";
        const isReturned = row.status === "returned";
        const allowEdit = canEditRow || (isOwner && (isPending || isReturned));
        const allowDelete = canDeleteRow || (isOwner && isPending);

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
                عرض التفاصيل
              </DropdownMenuItem>
              {allowEdit && (isPending || isReturned) && (
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  {isReturned ? "تعديل وإعادة تقديم" : "تعديل"}
                </DropdownMenuItem>
              )}
              {allowDelete && isPending && (
                <DropdownMenuItem onClick={() => handleDelete(row)} className="text-red-600">
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              )}
              {hasPermission(PERMISSIONS.FORCE_APPROVE) && (row.status === 'pending' || row.workflow_status === 'pending') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedBonus(row);
                      setShowForceApproveDialog(true);
                    }}
                    className="text-blue-600 font-bold"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    الاعتماد النهائي ⚡
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const toggleEmployee = (empId) => {
    setSelectedEmployees((prev) => (prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]));
  };

  const toggleAll = () => {
    if (selectedEmployees.length === filteredEmployees.filter((e) => e.status === "active").length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.filter((e) => e.status === "active").map((e) => e.id));
    }
  };

  // ===== حساب بيانات المعتمد الحالي =====
  const pendingStep = selectedBonus?.approval_steps ? getCurrentPendingStep(selectedBonus.approval_steps) : null;
  const isCurrentApprover = pendingStep && pendingStep.approver_user_id === currentUser?.id;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">المكافآت</h2>
          <p className="text-gray-500">إدارة المكافآت ونظام الاعتمادات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="إجمالي المكافآت" value={stats.total} icon={Gift} color="primary" />
        <StatCard title="قيد الانتظار" value={stats.pending} icon={Clock} color="orange" />
        <StatCard title="معتمدة" value={stats.approved} icon={CheckCircle} color="green" />
        <StatCard
          title="إجمالي المبالغ المعتمدة"
          value={`${stats.totalAmount.toLocaleString()} ر.س`}
          icon={DollarSign}
          color="blue"
        />
      </div>

      <DataTable
        data={filteredBonuses}
        columns={columns}
        loading={loading || authLoading}
        onAdd={hasPermission(PERMISSIONS.ADD_BONUS) ? handleAdd : undefined}
        addButtonText="إضافة مكافأة"
        searchPlaceholder="بحث..."
        emptyMessage="لا توجد مكافآت"
        showAdd={hasPermission(PERMISSIONS.ADD_BONUS)}
      />

      {/* ===== نموذج الإضافة/التعديل ===== */}
      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedBonus ? "تعديل المكافأة" : "إضافة مكافأة"}
        onSubmit={handleSubmit}
        loading={saving}
        size="lg"
      >
        <div className="space-y-4" dir="rtl">
          {!selectedBonus && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>اختيار الموظفين * ({selectedEmployees.length} محدد)</Label>
                <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                  {selectedEmployees.length === filteredEmployees.filter((e) => e.status === "active").length
                    ? "إلغاء الكل"
                    : "تحديد الكل"}
                </Button>
              </div>
              <Input
                placeholder="بحث عن موظف..."
                className="mb-2"
                onChange={(e) => {
                  const search = e.target.value.toLowerCase();
                  const filtered = filteredEmployees.filter(
                    (emp) =>
                      emp.status === "active" &&
                      (emp.full_name?.toLowerCase().includes(search) ||
                        emp.position?.toLowerCase().includes(search) ||
                        emp.department?.toLowerCase().includes(search))
                  );
                  setFormData({ ...formData, filteredEmployees: filtered });
                }}
              />
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                {(formData.filteredEmployees || filteredEmployees.filter((e) => e.status === "active")).map((emp) => (
                  <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <Checkbox checked={selectedEmployees.includes(emp.id)} onCheckedChange={() => toggleEmployee(emp.id)} />
                    <div className="flex-1">
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {emp.position} - {emp.department}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedBonus && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{getEmployeeName(selectedBonus.employee_id)}</p>
              <p className="text-sm text-gray-500">تعديل طلب: {selectedBonus.request_number}</p>
            </div>
          )}

          <div>
            <Label>عنوان المكافأة *</Label>
            <Input
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: مكافأة أداء - مكافأة مشروع..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>المبلغ *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label>العملة</Label>
              <Select value={formData.currency || "SAR"} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>التاريخ *</Label>
            <Input type="date" value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </div>

          <div>
            <Label>سبب المكافأة</Label>
            <Textarea
              value={formData.reason || ""}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              placeholder="سبب منح المكافأة..."
            />
          </div>

          {selectedEmployees.length > 0 && formData.amount && !selectedBonus && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <h4 className="font-semibold text-blue-900">ملخص</h4>
              <p className="text-sm text-gray-700">سيتم إنشاء {selectedEmployees.length} مكافأة بمبلغ {Number(formData.amount).toLocaleString()} {formData.currency || "SAR"} لكل موظف</p>
              <p className="text-sm font-bold text-blue-800">
                الإجمالي: {(Number(formData.amount) * selectedEmployees.length).toLocaleString()} {formData.currency || "SAR"}
              </p>
            </div>
          )}
        </div>
      </FormModal>

      {/* ===== نافذة العرض التفصيلي مع مسار الاعتمادات ===== */}
      <FormModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="تفاصيل المكافأة"
        showFooter={false}
        size="lg"
      >
        {selectedBonus && (
          <div className="space-y-5" dir="rtl">
            {/* ===== رأس الطلب ===== */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">رقم الطلب</p>
                <p className="font-bold text-lg">{selectedBonus.request_number || "-"}</p>
                <p className="text-sm text-gray-600 mt-1">{getEmployeeName(selectedBonus.employee_id)}</p>
              </div>
              <StatusBadge status={selectedBonus.status} />
            </div>

            {/* ===== بطاقة المبلغ البارزة ===== */}
            <div className="p-4 rounded-xl bg-gradient-to-l from-green-50 to-emerald-100 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-800">تفاصيل المكافأة</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">عنوان المكافأة</p>
                  <p className="font-bold text-lg text-green-900">{selectedBonus.title || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">المبلغ</p>
                  <p className="font-bold text-2xl text-green-600">
                    {Number(selectedBonus.amount)?.toLocaleString("ar-SA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || 0}{" "}
                    {selectedBonus.currency || "ر.س"}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== تفاصيل إضافية ===== */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">التاريخ</p>
                <p className="font-medium">
                  {selectedBonus.date ? format(parseISO(selectedBonus.date), "dd/MM/yyyy", { locale: ar }) : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">العملة</p>
                <p className="font-medium">{selectedBonus.currency || "SAR"}</p>
              </div>
            </div>

            {selectedBonus.reason && (
              <div className="space-y-1 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">سبب المكافأة</p>
                <p className="font-medium">{selectedBonus.reason}</p>
              </div>
            )}

            {/* ===== شارة المعتمد الحالي ===== */}
            {pendingStep && selectedBonus.status === "pending" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  بانتظار اعتماد: <strong>{pendingStep.approver_job_title || pendingStep.role_name}</strong>
                  {pendingStep.is_name_visible && pendingStep.approver_name ? ` (${pendingStep.approver_name})` : ""}
                </span>
              </div>
            )}

            {/* ===== مسار الاعتمادات ===== */}
            {selectedBonus.approval_steps?.length > 0 && (
              <div className="border-t pt-4">
                <ApprovalTimeline approvalChain={selectedBonus.approval_steps} />
              </div>
            )}

            {/* ===== أزرار الاعتماد المباشرة ===== */}
            {isCurrentApprover && selectedBonus.status === "pending" && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-gray-700">إجراء الاعتماد</h4>

                {showApprovalForm && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="أضف ملاحظاتك (اختياري)..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!showApprovalForm) {
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
                      if (!showApprovalForm) {
                        setShowApprovalForm("return");
                        return;
                      }
                      handleApprovalAction("return");
                    }}
                    disabled={approvalProcessing}
                    variant="outline"
                    className="border-amber-500 text-amber-700 hover:bg-amber-50 flex-1"
                  >
                    <RotateCcw className="w-4 h-4 ml-2" />
                    إرجاع
                  </Button>
                  <Button
                    onClick={() => {
                      if (!showApprovalForm) {
                        setShowApprovalForm("reject");
                        return;
                      }
                      handleApprovalAction("reject");
                    }}
                    disabled={approvalProcessing}
                    variant="outline"
                    className="border-red-500 text-red-700 hover:bg-red-50 flex-1"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </div>

                {showApprovalForm && (
                  <p className="text-xs text-center text-gray-400">
                    المبلغ: {Number(selectedBonus.amount)?.toFixed(2)} {selectedBonus.currency || "ر.س"} • {selectedBonus.title}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </FormModal>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف المكافأة"
        description="هل أنت متأكد من حذف هذه المكافأة؟"
      />

      <ConfirmDialog
        open={showForceApproveDialog}
        onClose={() => setShowForceApproveDialog(false)}
        onConfirm={handleForceApprove}
        title="الاعتماد النهائي الاستثنائي ⚡"
        description={`هل أنت متأكد من رغبتك في استخدام صلاحية الاعتماد الاستثنائي لهذا الطلب؟ سيتم تجاهل بقية خطوات سير العمل واعتماد الطلب فوراً.`}
        confirmLabel="تأكيد الاعتماد ⚡"
        variant="primary"
        loading={forceApproveLoading}
      />
    </div>
  );
}