import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Download,
  AlertCircle,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ApprovalTimeline, { getCurrentPendingStep } from "@/components/ApprovalTimeline";
import * as XLSX from "xlsx";
import { format, differenceInDays, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function Leaves() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    status: "pending",
  });
  const [assignData, setAssignData] = useState({});
  const [saving, setSaving] = useState(false);
  const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
  const [forceApproveLoading, setForceApproveLoading] = useState(false);
  const [approvalProcessing, setApprovalProcessing] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(null); // 'approve' | 'reject' | 'return' | null
  const [activeTab, setActiveTab] = useState("requests");
  const [showImportModal, setShowImportModal] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filteredBalances, setFilteredBalances] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const {
    currentUser,
    userEmployee,
    hasPermission,
    filterEmployees,
    filterEmployeeRelatedData,
    loading: authLoading
  } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, currentUser, userEmployee]);

  const loadData = async () => {
    if (authLoading) return;

    setLoading(true);
    try {
      const [requests, balances, empData, typeData] = await Promise.all([
        base44.entities.LeaveRequest.list("-created_date", 200),
        base44.entities.EmployeeLeaveBalance.list("-created_date", 500),
        base44.entities.Employee.list(),
        base44.entities.LeaveType.list(),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_ALL_LEAVES);
      setFilteredEmployees(allowedEmployees);

      const filteredReqs = filterEmployeeRelatedData(requests, allowedEmployees, (item) => item.employee_id);
      const filteredBals = filterEmployeeRelatedData(balances, allowedEmployees, (item) => item.employee_id);

      setLeaveRequests(requests);
      setLeaveBalances(balances);
      setFilteredRequests(filteredReqs);
      setFilteredBalances(filteredBals);
      setEmployees(empData);
      setLeaveTypes(typeData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const getLeaveTypeName = (leaveTypeId) => {
    const type = leaveTypes.find((t) => t.id === leaveTypeId);
    return type?.name || "-";
  };

  const getEmployeeBalance = (employeeId, leaveTypeId) => {
    const currentYear = new Date().getFullYear();
    const balance = leaveBalances.find(
      (b) => b.employee_id === employeeId && b.leave_type_id === leaveTypeId && b.year === currentYear
    );

    if (balance) return balance;

    // Fallback to default balance from Leave Type
    const leaveType = leaveTypes.find(t => t.id === leaveTypeId);
    if (leaveType) {
      return {
        total_balance: leaveType.default_balance,
        used_balance: 0,
        remaining_balance: leaveType.default_balance
      };
    }

    return { total_balance: 0, used_balance: 0, remaining_balance: 0 };
  };

  const handleAdd = () => {
    setSelectedRequest(null);
    setFormData({ status: "pending" });
    setShowForm(true);
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setFormData(request);
    setShowForm(true);
  };

  const handleView = async (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleForceApprove = async () => {
    if (!selectedRequest || !selectedRequest.workflow_id) {
      toast.error("لم يتم العثور على سجل سير عمل لهذا الطلب");
      return;
    }

    setForceApproveLoading(true);
    try {
      await base44.entities.Workflow.customAction(selectedRequest.workflow_id, 'force-approve', {
        user_id: currentUser.id
      });

      toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
      setShowForceApproveDialog(false);
      loadData();
    } catch (error) {
      console.error("Force approve error:", error);
      toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
    }
    setForceApproveLoading(false);
  };

  const handleDelete = (request) => {
    setSelectedRequest(request);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const empName = getEmployeeName(selectedRequest.employee_id);
      const leaveTypeName = getLeaveTypeName(selectedRequest.leave_type_id);

      // ✅ استرداد الرصيد إذا كان الطلب معتمداً
      let recoveredDays = 0;
      if (selectedRequest.status === "approved") {
        const currentYear = new Date().getFullYear();
        const balance = leaveBalances.find(
          (b) =>
            b.employee_id === selectedRequest.employee_id &&
            b.leave_type_id === selectedRequest.leave_type_id &&
            b.year === currentYear
        );

        if (balance) {
          const newUsed = Math.max(0, (balance.used_balance || 0) - selectedRequest.days_count);
          const newRemaining = balance.total_balance - newUsed;

          await base44.entities.EmployeeLeaveBalance.update(balance.id, {
            used_balance: newUsed,
            remaining_balance: newRemaining,
          });

          recoveredDays = selectedRequest.days_count;
          toast.success(`✅ تم استرداد ${selectedRequest.days_count} يوم إلى رصيد الموظف`);
        }
      }

      // ✅ تسجيل في Audit Log
      await base44.functions.invoke('logAuditEvent', {
        action: 'delete',
        entity_name: 'LeaveRequest',
        record_id: selectedRequest.id,
        record_identifier: selectedRequest.request_number || selectedRequest.id,
        details: `حذف طلب إجازة: ${empName} - ${leaveTypeName} - ${selectedRequest.days_count} يوم${recoveredDays > 0 ? ` (تم استرداد ${recoveredDays} يوم)` : ''}`,
        changed_data: {
          employee: empName,
          leave_type: leaveTypeName,
          days: selectedRequest.days_count,
          status: selectedRequest.status,
          recovered_days: recoveredDays,
        },
        severity: selectedRequest.status === 'approved' ? 'critical' : 'high',
      });

      await base44.entities.LeaveRequest.delete(selectedRequest.id);

      // تحديث القوائم المحلية فوراً
      const updatedRequests = leaveRequests.filter((r) => r.id !== selectedRequest.id);
      const updatedFiltered = filteredRequests.filter((r) => r.id !== selectedRequest.id);
      setLeaveRequests(updatedRequests);
      setFilteredRequests(updatedFiltered);

      setShowDeleteDialog(false);
      toast.success("تم حذف الطلب بنجاح");

      // إعادة تحميل البيانات لتحديث الأرصدة
      loadData();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };


  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.leave_type_id || !formData.start_date || !formData.end_date) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const startDate = parseISO(formData.start_date);
    const endDate = parseISO(formData.end_date);
    const daysCount = differenceInDays(endDate, startDate) + 1;

    const leaveType = leaveTypes.find(t => t.id === formData.leave_type_id);
    if (leaveType?.min_days && daysCount < leaveType.min_days) {
      toast.error(`الحد الأدنى لهذا النوع من الإجازات هو ${leaveType.min_days} أيام`);
      return;
    }

    // ✅ Frontend Validation: منع تجاوز الرصيد المتاح
    const balance = getEmployeeBalance(formData.employee_id, formData.leave_type_id);
    if (!balance || balance.remaining_balance <= 0) {
      toast.error(`⚠️ لا يوجد رصيد متاح لهذا النوع من الإجازات`);
      return;
    }

    if (daysCount > balance.remaining_balance) {
      toast.error(
        `⚠️ الرصيد المتبقي غير كافٍ!\n` +
        `المطلوب: ${daysCount} يوم | المتاح: ${balance.remaining_balance} يوم\n` +
        `يرجى تقليل عدد الأيام أو اختيار نوع إجازة آخر.`
      );
      return;
    }

    // تحذير إذا كان الطلب سيستنفذ الرصيد بالكامل
    if (daysCount === balance.remaining_balance) {
      toast.warning(`⚠️ تنبيه: هذا الطلب سيستنفذ رصيدك بالكامل (${balance.remaining_balance} يوم)`);
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        days_count: daysCount
      };

      if (selectedRequest) {
        // If the request was returned, update and re-submit to restart the workflow
        if (selectedRequest.status === 'returned') {
          dataToSave.status = 'pending';
          await base44.entities.LeaveRequest.update(selectedRequest.id, dataToSave);
          // Re-submit: trigger new approval workflow
          await base44.entities.LeaveRequest.action(selectedRequest.id, 'resubmit', {});
          toast.success("تم إعادة تقديم الطلب بنجاح");
        } else {
          await base44.entities.LeaveRequest.update(selectedRequest.id, dataToSave);
          toast.success("تم تحديث الطلب");
        }
      } else {
        await base44.entities.LeaveRequest.create(dataToSave);
        toast.success("تم إضافة الطلب");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  const handleAssignLeaveType = async () => {
    if (!assignData.leave_type_id || !assignData.employee_ids || assignData.employee_ids.length === 0) {
      toast.error("يرجى اختيار نوع الإجازة والموظفين");
      return;
    }

    setSaving(true);
    try {
      const leaveType = leaveTypes.find((t) => t.id === assignData.leave_type_id);
      const currentYear = new Date().getFullYear();

      for (const employeeId of assignData.employee_ids) {
        const existing = leaveBalances.find(
          (b) =>
            b.employee_id === employeeId &&
            b.leave_type_id === assignData.leave_type_id &&
            b.year === currentYear
        );

        if (!existing) {
          await base44.entities.EmployeeLeaveBalance.create({
            employee_id: employeeId,
            leave_type_id: assignData.leave_type_id,
            year: currentYear,
            total_balance: assignData.balance || leaveType?.default_balance || 0,
            used_balance: 0,
            remaining_balance: assignData.balance || leaveType?.default_balance || 0,
          });
        }
      }
      loadData();
      setShowAssignModal(false);
      setAssignData({});
      toast.success("تم تعيين نوع الإجازة بنجاح");
    } catch (error) {
      console.error("Error assigning leave type:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  const exportToExcel = () => {
    const data = leaveRequests.map((req) => ({
      الموظف: getEmployeeName(req.employee_id),
      "نوع الإجازة": getLeaveTypeName(req.leave_type_id),
      من: req.start_date,
      إلى: req.end_date,
      "عدد الأيام": req.days_count,
      السبب: req.reason || "",
      الحالة: req.status === "pending" ? "قيد الانتظار" :
        req.status === "manager_approved" ? "موافقة المدير" :
          req.status === "gm_approved" ? "موافقة المدير العام" :
            req.status === "hr_approved" ? "معتمد" : "مرفوض",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "طلبات الإجازات");
    XLSX.writeFile(wb, `leaves_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const requestColumns = [
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
      header: "نوع الإجازة",
      accessor: "leave_type_id",
      cell: (row) => getLeaveTypeName(row.leave_type_id),
    },
    {
      header: "من",
      accessor: "start_date",
      cell: (row) =>
        row.start_date ? format(parseISO(row.start_date), "dd/MM/yyyy", { locale: ar }) : "-",
    },
    {
      header: "إلى",
      accessor: "end_date",
      cell: (row) =>
        row.end_date ? format(parseISO(row.end_date), "dd/MM/yyyy", { locale: ar }) : "-",
    },
    {
      header: "عدد الأيام",
      accessor: "days_count",
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
        const canEdit = hasPermission(PERMISSIONS.EDIT_LEAVES);
        const canDelete = hasPermission(PERMISSIONS.DELETE_LEAVES);

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
              {canEdit && (row.status === 'pending' || row.status === 'returned') && (
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  {row.status === 'returned' ? 'تعديل وإعادة تقديم' : 'تعديل'}
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem onClick={() => handleDelete(row)} className="text-red-600">
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              )}
              {hasPermission(PERMISSIONS.FORCE_APPROVE) && row.status === 'pending' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedRequest(row);
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

  const balanceColumns = [
    {
      header: "الموظف",
      accessor: "employee_id",
      cell: (row) => getEmployeeName(row.employee_id),
    },
    {
      header: "نوع الإجازة",
      accessor: "leave_type_id",
      cell: (row) => getLeaveTypeName(row.leave_type_id),
    },
    {
      header: "السنة",
      accessor: "year",
    },
    {
      header: "الرصيد الإجمالي",
      accessor: "total_balance",
      cell: (row) => `${row.total_balance} يوم`,
    },
    {
      header: "المستخدم",
      accessor: "used_balance",
      cell: (row) => `${row.used_balance || 0} يوم`,
    },
    {
      header: "المتبقي",
      accessor: "remaining_balance",
      cell: (row) => (
        <span className={row.remaining_balance > 5 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {row.remaining_balance} يوم
        </span>
      ),
    },
  ];

  const exportRequestsToCSV = () => {
    const headers = ["الموظف", "نوع الإجازة", "من", "إلى", "عدد الأيام", "الحالة"];
    const rows = leaveRequests.map((req) => [
      getEmployeeName(req.employee_id),
      getLeaveTypeName(req.leave_type_id),
      req.start_date || "",
      req.end_date || "",
      req.days_count || 0,
      req.status || "",
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave_requests_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBalancesToCSV = () => {
    const headers = ["الموظف", "نوع الإجازة", "السنة", "الرصيد الإجمالي", "المستخدم", "المتبقي"];
    const rows = leaveBalances.map((bal) => [
      getEmployeeName(bal.employee_id),
      getLeaveTypeName(bal.leave_type_id),
      bal.year || "",
      bal.total_balance || 0,
      bal.used_balance || 0,
      bal.remaining_balance || 0,
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave_balances_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الإجازات</h2>
          <p className="text-gray-500">إدارة طلبات الإجازات وأرصدة الموظفين</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={activeTab === "requests" ? exportRequestsToCSV : exportBalancesToCSV}
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">طلبات الإجازات</TabsTrigger>
          <TabsTrigger value="balances">أرصدة الإجازات</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <DataTable
            data={filteredRequests}
            columns={requestColumns}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.ADD_LEAVES) ? handleAdd : undefined}
            addButtonText="طلب إجازة جديد"
            searchPlaceholder="بحث..."
            emptyMessage="لا توجد طلبات"
            showAdd={hasPermission(PERMISSIONS.ADD_LEAVES)}
          />
        </TabsContent>

        <TabsContent value="balances" className="mt-4">
          {hasPermission(PERMISSIONS.MANAGE_SETTINGS) && (
            <div className="mb-4">
              <Button onClick={() => setShowAssignModal(true)} className="bg-[#7c3238] hover:bg-[#5a252a]">
                <Users className="w-4 h-4 ml-2" />
                تعيين نوع إجازة للموظفين
              </Button>
            </div>
          )}
          <DataTable
            data={filteredBalances}
            columns={balanceColumns}
            loading={loading || authLoading}
            showAdd={false}
            searchPlaceholder="بحث..."
            emptyMessage="لا توجد أرصدة"
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showForceApproveDialog}
        onClose={() => setShowForceApproveDialog(false)}
        onConfirm={handleForceApprove}
        title="تأكيد الاعتماد النهائي الاستثنائي"
        description="هل أنت متأكد من الاعتماد المباشر؟ سيتم تخطي الخطوات المتبقية واعتمادها باسمك كمدير للنظام مع الاحتفاظ بأي اعتمادات سابقة تمت على الطلب."
        confirmText="تأكيد الاعتماد ⚡"
        cancelText="إلغاء"
        variant="destructive"
        loading={approvalProcessing}
      />

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedRequest ? "تعديل طلب الإجازة" : "طلب إجازة جديد"}
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
                {filteredEmployees
                  .filter((e) => e.status === "active")
                  .map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>نوع الإجازة *</Label>
            <Select
              value={formData.leave_type_id || ""}
              onValueChange={(v) => setFormData({ ...formData, leave_type_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes
                  .filter((t) => t.status === "active")
                  .map((type) => {
                    const balance = formData.employee_id
                      ? getEmployeeBalance(formData.employee_id, type.id)
                      : null;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                        {balance && <span className="text-gray-500 mr-2">(المتبقي: {balance.remaining_balance} يوم)</span>}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>من تاريخ *</Label>
              <Input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>إلى تاريخ *</Label>
              <Input
                type="date"
                value={formData.end_date || ""}
                min={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          {formData.start_date && formData.end_date && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                عدد الأيام: {differenceInDays(parseISO(formData.end_date), parseISO(formData.start_date)) + 1} يوم
              </p>
            </div>
          )}
          <div>
            <Label>السبب</Label>
            <Textarea
              value={formData.reason || ""}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="تفاصيل طلب الإجازة"
        showFooter={false}
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4" dir="rtl">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">رقم الطلب</p>
                  <p className="font-bold text-lg">{selectedRequest.request_number || "-"}</p>
                  <h3 className="font-bold text-gray-800 mt-2">{getEmployeeName(selectedRequest.employee_id)}</h3>
                  <p className="text-gray-500">{getLeaveTypeName(selectedRequest.leave_type_id)}</p>
                </div>
                <StatusBadge status={selectedRequest.status} />
              </div>

              {/* Dynamic Pending Approver Badge */}
              {(() => {
                const pendingStep = getCurrentPendingStep(selectedRequest.approval_steps);
                if (!pendingStep || selectedRequest.status === 'approved' || selectedRequest.status === 'rejected') return null;
                const label = pendingStep.approver_job_title || pendingStep.role_name || 'غير محدد';
                const name = pendingStep.is_name_visible && pendingStep.approver_name ? ` - ${pendingStep.approver_name}` : '';
                return (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-indigo-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">📍 جاري الاعتماد من</h4>
                        <p className="text-sm text-gray-800 font-medium">
                          {label}{name}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">رصيد الإجازات</h4>
              <div className="grid grid-cols-3 gap-4">
                {(() => {
                  const balance = getEmployeeBalance(selectedRequest.employee_id, selectedRequest.leave_type_id);
                  return (
                    <>
                      <div>
                        <p className="text-xs text-gray-600">الرصيد الإجمالي</p>
                        <p className="font-bold text-lg">{balance.total_balance} يوم</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">المستخدم</p>
                        <p className="font-bold text-lg text-orange-600">{balance.used_balance} يوم</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">المتبقي</p>
                        <p className="font-bold text-lg text-green-600">{balance.remaining_balance} يوم</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">من تاريخ</p>
                <p className="font-medium">
                  {selectedRequest.start_date
                    ? format(parseISO(selectedRequest.start_date), "dd/MM/yyyy", { locale: ar })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">إلى تاريخ</p>
                <p className="font-medium">
                  {selectedRequest.end_date
                    ? format(parseISO(selectedRequest.end_date), "dd/MM/yyyy", { locale: ar })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">عدد الأيام</p>
                <p className="font-medium">{selectedRequest.days_count} يوم</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">السبب</p>
                <p className="font-medium">{selectedRequest.reason || "-"}</p>
              </div>
            </div>

            {selectedRequest.approval_steps && selectedRequest.approval_steps.length > 0 && (
              <div className="border-t pt-4">
                <ApprovalTimeline
                  approvalChain={selectedRequest.approval_steps}
                />
              </div>
            )}

            {/* Inline Approval Actions */}
            {(() => {
              const pendingStep = getCurrentPendingStep(selectedRequest.approval_steps);
              if (!pendingStep || !currentUser) return null;
              const isMyTurn = pendingStep.approver_user_id === currentUser.id;
              if (!isMyTurn) return null;

              const handleApprovalAction = async (action) => {
                setApprovalProcessing(true);
                try {
                  await base44.entities.Approvals.action(pendingStep.id, 'submit', {
                    user_id: currentUser.id,
                    action: action,
                    comments: approvalNotes
                  });
                  toast.success(action === 'approved' ? 'تم الاعتماد بنجاح' : action === 'rejected' ? 'تم الرفض' : 'تم الإرجاع');
                  setShowApprovalForm(null);
                  setApprovalNotes("");
                  setShowViewModal(false);
                  loadData();
                } catch (error) {
                  console.error('Approval action error:', error);
                  toast.error('حدث خطأ أثناء تنفيذ الإجراء');
                }
                setApprovalProcessing(false);
              };

              return (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-gray-700">اتخاذ إجراء</h4>
                  {!showApprovalForm ? (
                    <div className="flex gap-3">
                      <Button onClick={() => setShowApprovalForm('approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 ml-2" />
                        اعتماد
                      </Button>
                      <Button onClick={() => setShowApprovalForm('return')} variant="outline" className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50">
                        إرجاع
                      </Button>
                      <Button onClick={() => setShowApprovalForm('reject')} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4 ml-2" />
                        رفض
                      </Button>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-lg border ${showApprovalForm === 'approve' ? 'bg-green-50 border-green-100' :
                      showApprovalForm === 'return' ? 'bg-orange-50 border-orange-100' :
                        'bg-red-50 border-red-100'
                      }`}>
                      <Textarea
                        placeholder="ملاحظات (اختياري)..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        className="bg-white mb-3 min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprovalAction(
                            showApprovalForm === 'approve' ? 'approved' :
                              showApprovalForm === 'return' ? 'returned' : 'rejected'
                          )}
                          disabled={approvalProcessing}
                          className={`flex-1 text-white ${showApprovalForm === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                            showApprovalForm === 'return' ? 'bg-orange-600 hover:bg-orange-700' :
                              'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                          {approvalProcessing ? 'جاري التنفيذ...' : 'تأكيد'}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowApprovalForm(null); setApprovalNotes(""); }} className="flex-1">
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </FormModal>

      <FormModal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setAssignData({});
        }}
        title="تعيين نوع إجازة للموظفين"
        onSubmit={handleAssignLeaveType}
        loading={saving}
        size="md"
      >
        <div className="space-y-4" dir="rtl">
          <div>
            <Label>نوع الإجازة *</Label>
            <Select
              value={assignData.leave_type_id || ""}
              onValueChange={(v) => setAssignData({ ...assignData, leave_type_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الإجازة" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes
                  .filter((t) => t.status === "active")
                  .map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.default_balance} يوم)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>الرصيد (اختياري - سيتم استخدام الرصيد الافتراضي إذا ترك فارغاً)</Label>
            <Input
              type="number"
              placeholder="استخدم الرصيد الافتراضي"
              value={assignData.balance || ""}
              onChange={(e) => setAssignData({ ...assignData, balance: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>الموظفين *</Label>
            <div className="border rounded-lg max-h-60 overflow-y-auto p-2 space-y-2">
              {employees
                .filter((e) => e.status === "active")
                .map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(assignData.employee_ids || []).includes(emp.id)}
                      onChange={(e) => {
                        const ids = assignData.employee_ids || [];
                        if (e.target.checked) {
                          setAssignData({ ...assignData, employee_ids: [...ids, emp.id] });
                        } else {
                          setAssignData({
                            ...assignData,
                            employee_ids: ids.filter((id) => id !== emp.id),
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{emp.full_name}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      </FormModal>

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

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف طلب الإجازة"
        description="هل أنت متأكد من حذف هذا الطلب؟"
      />
    </div>
  );
}