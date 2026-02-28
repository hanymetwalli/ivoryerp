import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Calculator,
  Send,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  History,
  ArrowRight,
  ShieldCheck,
  Zap,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import StatCard from "@/components/ui/StatCard";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [batches, setBatches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [overtime, setOvertime] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [insuranceSettings, setInsuranceSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [approvalChain, setApprovalChain] = useState([]);
  const [formData, setFormData] = useState({});
  const [calculateData, setCalculateData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [detailsSearch, setDetailsSearch] = useState("");
  const [detailsDept, setDetailsDept] = useState("all");
  const [detailsCurrency, setDetailsCurrency] = useState("all");
  const [companyProfile, setCompanyProfile] = useState(null);

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
  }, [filterMonth, authLoading, currentUser, userEmployee]);

  const loadData = async () => {
    if (authLoading) return;

    setLoading(true);
    try {
      const [
        payrollData,
        batchData,
        empData,
        contractData,
        attData,
        otData,
        allowanceData,
        deductionData,
        insData,
        compData,
      ] = await Promise.all([
        base44.entities.Payroll.list("-created_at", 2000),
        base44.entities.PayrollBatches.list("-created_at"),
        base44.entities.Employee.list(),
        base44.entities.Contract.list(),
        base44.entities.Attendance.list("-date", 1000),
        base44.entities.Overtime.list(),
        base44.entities.Allowance.list(),
        base44.entities.Deduction.list(),
        base44.entities.InsuranceSettings.list(),
        base44.entities.CompanyProfile.list(),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_ALL_PAYROLL);
      setFilteredEmployees(allowedEmployees);

      setPayrolls(payrollData);
      setFilteredPayrolls(payrollData);
      setBatches(batchData);
      setFilteredBatches(batchData);
      setEmployees(empData);
      setContracts(contractData);
      setAttendance(attData);
      setOvertime(otData);
      setAllowances(allowanceData);
      setDeductions(deductionData);
      setInsuranceSettings(insData);
      setCompanyProfile(Array.isArray(compData) ? compData[0] : (compData?.id ? compData : null));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const getActiveContract = (employeeId) => {
    return contracts.find(
      (c) => c.employee_id === employeeId && c.status === "active"
    );
  };

  const formatCurrency = (amount, currency = "SAR") => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const calculatePayrollForEmployee = async (employeeId, month, year) => {
    try {
      // استدعاء Backend function للحساب الآمن
      const response = await base44.functions.invoke('calculatePayroll', {
        employee_id: employeeId,
        month: Number(month),
        year: Number(year),
      });

      if (response.data.success) {
        return response.data.payroll;
      } else {
        return { error: response.data.error || "حدث خطأ في حساب الراتب" };
      }
    } catch (error) {
      console.error("Error calculating payroll:", error);
      return { error: error.message || "حدث خطأ في حساب الراتب" };
    }
  };

  const handleGenerateBatch = async () => {
    setSaving(true);
    try {
      const response = await base44.entities.Payroll.customAction(0, 'generate-batch', {
        month: Number(calculateData.month),
        year: Number(calculateData.year),
      });

      if (response && response.success) {
        toast.success(`تم توليد مسير الرواتب لعدد ${response.data.count} موظف بنجاح`);
        loadData();
        setShowCalculateModal(false);
      } else {
        toast.error(response.data?.error || "حدث خطأ في توليد مسير الرواتب");
      }
    } catch (error) {
      console.error("Error generating batch:", error);
      toast.error("حدث خطأ أثناء الاتصال بالنظام");
    }
    setSaving(false);
  };

  const handleOpenBatch = async (batch) => {
    setSelectedBatch(batch);
    setLoading(true);
    try {
      // 1. جلب مسار الاعتمادات إذا وجد
      if (batch.workflow_id) {
        const response = await base44.entities.Workflow.customAction(batch.workflow_id, 'get-chain', {
          user_id: currentUser?.id
        });
        if (response.success && Array.isArray(response.data)) {
          setApprovalChain(response.data);
        }
      } else {
        setApprovalChain([]);
      }

      setShowBatchDetails(true);
    } catch (error) {
      console.error("Error loading batch details:", error);
    }
    setLoading(false);
  };

  const performBatchAction = async (action, comments = "") => {
    if (!selectedBatch?.workflow_id) return;
    setSaving(true);
    try {
      const step = approvalChain.find(s => s.status === 'pending');
      if (!step) return;

      const response = await base44.entities.Approvals.customAction(step.id, 'submit', {
        action,
        comments,
        user_id: currentUser.id
      });

      if (response && response.success) {
        toast.success("تمت العملية بنجاح");
        // Reload batch to get updated status and chain
        const updatedBatches = await base44.entities.PayrollBatches.list("-created_at");
        const freshBatch = updatedBatches.find(b => b.id === selectedBatch.id);
        setBatches(updatedBatches);
        setFilteredBatches(updatedBatches);
        if (freshBatch) handleOpenBatch(freshBatch);
        else setShowBatchDetails(false);
      } else {
        toast.error(response.data?.message || "فشلت العملية");
      }
    } catch (error) {
      console.error("Error processing step:", error);
      toast.error("حدث خطأ تقني");
    }
    setSaving(false);
  };

  const handleExportCSV = (data) => {
    if (!data || data.length === 0) return;

    // Headers
    const headers = ["الموظف", "الراتب الأساسي", "البدلات/الإضافات", "الخصومات", "صافي الراتب", "العملة"];

    const rows = data.map(p => [
      getEmployeeName(p.employee_id),
      p.basic_salary,
      (Number(p.housing_allowance) || 0) + (Number(p.transport_allowance) || 0) + (Number(p.other_allowances) || 0) + (Number(p.additional_allowances) || 0) + (Number(p.bonuses_amount) || 0) + (Number(p.overtime_amount) || 0),
      p.total_deductions,
      p.net_salary,
      p.currency
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `payroll_batch_${selectedBatch?.month}_${selectedBatch?.year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const forceApproveBatch = async () => {
    if (!selectedBatch?.workflow_id) return;
    setSaving(true);
    try {
      const response = await base44.entities.Workflow.customAction(selectedBatch.id, 'force-approve', {
        user_id: currentUser.id
      });

      if (response && response.success) {
        toast.success("تم الاعتماد النهائي الاستثنائي بنجاح ⚡");
        loadData();
        setShowBatchDetails(false);
      } else {
        toast.error(response?.error || "فشلت العملية");
      }
    } catch (error) {
      console.error("Error force approving:", error);
      toast.error("حدث خطأ تقني");
    }
    setSaving(false);
  };

  const handleView = (payroll) => {
    setSelectedPayroll(payroll);
    setShowViewModal(true);
  };

  const handleEdit = (payroll) => {
    setSelectedPayroll(payroll);
    setFormData(payroll);
    setShowForm(true);
  };

  const handleDelete = (payroll) => {
    setSelectedPayroll(payroll);
    setSelectedBatch(null);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedBatch) {
        // ✅ تسجيل في Audit Log للحزمة
        await base44.functions.invoke('logAuditEvent', {
          action: 'delete',
          entity_name: 'PayrollBatches',
          record_id: selectedBatch.id,
          record_identifier: `${selectedBatch.month}/${selectedBatch.year}`,
          details: `حذف حزمة رواتب: ${selectedBatch.month}/${selectedBatch.year} - الإجمالي: ${formatCurrency(selectedBatch.total_amount)}`,
          changed_data: selectedBatch,
          severity: 'critical',
        });

        await base44.entities.PayrollBatches.delete(selectedBatch.id);
        toast.success("تم حذف حزمة الرواتب والرواتب المرتبطة بها بنجاح");
        loadData();
      } else if (selectedPayroll) {
        const empName = getEmployeeName(selectedPayroll.employee_id);

        // ✅ تسجيل في Audit Log
        await base44.functions.invoke('logAuditEvent', {
          action: 'delete',
          entity_name: 'Payroll',
          record_id: selectedPayroll.id,
          record_identifier: selectedPayroll.payroll_number || selectedPayroll.id,
          details: `حذف مسير راتب: ${empName} - ${selectedPayroll.month}/${selectedPayroll.year} - الصافي: ${formatCurrency(selectedPayroll.net_salary)}`,
          changed_data: {
            employee: empName,
            month: selectedPayroll.month,
            year: selectedPayroll.year,
            net_salary: selectedPayroll.net_salary,
            status: selectedPayroll.status,
          },
          severity: 'critical',
        });

        await base44.entities.Payroll.delete(selectedPayroll.id);

        // تحديث القوائم المحلية فوراً
        const updatedPayrolls = payrolls.filter((p) => p.id !== selectedPayroll.id);
        const updatedFiltered = filteredPayrolls.filter((p) => p.id !== selectedPayroll.id);
        setPayrolls(updatedPayrolls);
        setFilteredPayrolls(updatedFiltered);
        toast.success("تم حذف الراتب بنجاح");
      }

      setShowDeleteDialog(false);
      setSelectedBatch(null);
      setSelectedPayroll(null);
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        basic_salary: Number(formData.basic_salary) || 0,
        net_salary: Number(formData.net_salary) || 0,
      };

      if (selectedPayroll) {
        await base44.entities.Payroll.update(selectedPayroll.id, dataToSave);
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving payroll:", error);
    }
    setSaving(false);
  };

  const handleStatusChange = async (payroll, newStatus) => {
    try {
      await base44.entities.Payroll.update(payroll.id, { status: newStatus });
      loadData();
      toast.success("تم تحديث الحالة بنجاح");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleSendPayslip = async (payroll) => {
    const employee = employees.find((e) => e.id === payroll.employee_id);
    if (!employee?.email) {
      toast.error("لا يوجد بريد إلكتروني للموظف");
      return;
    }

    try {
      const monthName = format(new Date(payroll.year, payroll.month - 1), "MMMM yyyy", {
        locale: ar,
      });

      const body = `
        السلام عليكم ${employee.full_name}،
        
        مرفق قسيمة راتبك لشهر ${monthName}:
        
        الراتب الأساسي: ${formatCurrency(payroll.basic_salary, payroll.currency)}
        بدل السكن: ${formatCurrency(payroll.housing_allowance, payroll.currency)}
        بدل المواصلات: ${formatCurrency(payroll.transport_allowance, payroll.currency)}
        بدلات أخرى: ${formatCurrency(payroll.other_allowances, payroll.currency)}
        علاوات إضافية: ${formatCurrency(payroll.additional_allowances, payroll.currency)}
        المكافآت: ${formatCurrency(payroll.bonuses_amount, payroll.currency)}
        الساعات الإضافية: ${formatCurrency(payroll.overtime_amount, payroll.currency)}
        ـــــــــــــــــــــــــــــــــــــ
        إجمالي الراتب: ${formatCurrency(payroll.gross_salary, payroll.currency)}
        
        الخصومات:
        خصم التأمينات: ${formatCurrency(payroll.insurance_deduction, payroll.currency)}
        خصم التأخير: ${formatCurrency(payroll.late_deduction, payroll.currency)}
        خصم الغياب: ${formatCurrency(payroll.absence_deduction, payroll.currency)}
        خصومات أخرى: ${formatCurrency(payroll.other_deductions, payroll.currency)}
        ـــــــــــــــــــــــــــــــــــــ
        إجمالي الخصومات: ${formatCurrency(payroll.total_deductions, payroll.currency)}
        
        ═══════════════════════════════
        صافي الراتب: ${formatCurrency(payroll.net_salary, payroll.currency)}
        ═══════════════════════════════
        
        مع تحيات إدارة الموارد البشرية
      `;

      await base44.integrations.Core.SendEmail({
        to: employee.email,
        subject: `قسيمة راتب شهر ${monthName}`,
        body,
      });

      toast.success("تم إرسال قسيمة الراتب بنجاح");
    } catch (error) {
      console.error("Error sending payslip:", error);
      toast.error("حدث خطأ أثناء إرسال قسيمة الراتب");
    }
  };

  const stats = {
    totalPayroll: payrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0),
    employeeCount: payrolls.length,
    pending: payrolls.filter((p) => p.status === "draft" || p.status === "pending_review").length,
    approved: payrolls.filter((p) => p.status === "approved" || p.status === "paid").length,
  };

  const batchColumns = [
    {
      header: "الفترة",
      accessor: "month",
      cell: (row) => (
        <div className="font-bold flex items-center gap-2">
          <History className="w-4 h-4 text-gray-400" />
          {format(new Date(row.year, row.month - 1), "MMMM yyyy", { locale: ar })}
        </div>
      ),
    },
    {
      header: "إجمالي المبلغ",
      accessor: "total_amount",
      cell: (row) => (
        <div className="text-[#7c3238] font-bold">
          {formatCurrency(row.total_amount)}
        </div>
      ),
    },
    {
      header: "تاريخ الإنشاء",
      accessor: "created_at",
      cell: (row) => row.created_at ? format(parseISO(row.created_at), "dd/MM/yyyy HH:mm") : "-",
    },
    {
      header: "الحالة",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenBatch(row); }}>
            <Eye className="w-4 h-4 ml-1" />
            التفاصيل
          </Button>
          {(row.status === 'draft' || row.status === 'pending_approval') && hasPermission(PERMISSIONS.DELETE_PAYROLL) && (
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedBatch(row); setShowDeleteDialog(true); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const payrollColumns = [
    {
      header: "الموظف",
      accessor: "employee_id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7c3238]/10 text-[#7c3238] flex items-center justify-center font-bold text-xs uppercase">
            {getEmployeeName(row.employee_id).substring(0, 2)}
          </div>
          {getEmployeeName(row.employee_id)}
        </div>
      )
    },
    {
      header: "الراتب الأساسي",
      accessor: "basic_salary",
      cell: (row) => formatCurrency(row.basic_salary, row.currency),
    },
    {
      header: "البدلات/الإضافات",
      accessor: "total_allowances",
      cell: (row) => formatCurrency(
        (Number(row.housing_allowance) || 0) +
        (Number(row.transport_allowance) || 0) +
        (Number(row.other_allowances) || 0) +
        (Number(row.additional_allowances) || 0) +
        (Number(row.bonuses_amount) || 0) +
        (Number(row.overtime_amount) || 0)
      ),
    },
    {
      header: "الخصومات",
      accessor: "total_deductions",
      cell: (row) => (
        <span className="text-red-600">
          {formatCurrency(row.total_deductions, row.currency)}
        </span>
      ),
    },
    {
      header: "صافي الراتب",
      accessor: "net_salary",
      cell: (row) => (
        <span className="font-bold text-green-600">
          {formatCurrency(row.net_salary, row.currency)}
        </span>
      ),
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleView(row); }}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body * { visibility: hidden; }
          #printable-payroll, #printable-payroll * { visibility: visible; }
          #printable-payroll { position: absolute; left: 0; top: 0; width: 100%; direction: rtl; display: block !important; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; }
          th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
        }
      ` }} />
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">مسير الرواتب</h2>
            <p className="text-gray-500">إدارة وحساب رواتب الموظفين</p>
          </div>
          <div className="flex gap-2">
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-40"
            />
            {hasPermission(PERMISSIONS.CALCULATE_PAYROLL) && (
              <Button
                onClick={() => setShowCalculateModal(true)}
                className="bg-[#7c3238] hover:bg-[#5a252a]"
              >
                <Calculator className="w-4 h-4 ml-2" />
                حساب الرواتب
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي المسير"
            value={formatCurrency(stats.totalPayroll)}
            icon={DollarSign}
            color="primary"
          />
          <StatCard
            title="عدد الموظفين"
            value={stats.employeeCount}
            icon={FileText}
            color="accent"
          />
          <StatCard
            title="قيد المراجعة"
            value={stats.pending}
            icon={AlertCircle}
            color="orange"
          />
          <StatCard
            title="معتمد / مدفوع"
            value={stats.approved}
            icon={CheckCircle}
            color="green"
          />
        </div>

        <DataTable
          data={filteredBatches}
          columns={batchColumns}
          loading={loading || authLoading}
          showAdd={false}
          searchPlaceholder="بحث في الحزم..."
          emptyMessage="لا توجد حزم رواتب حالياً"
        />

        {/* Batch Details Modal */}
        <FormModal
          open={showBatchDetails}
          onClose={() => setShowBatchDetails(false)}
          title={`تفاصيل مسير الرواتب - ${selectedBatch ? format(new Date(selectedBatch.year, selectedBatch.month - 1), "MMMM yyyy", { locale: ar }) : ''}`}
          showFooter={false}
          size="full"
        >
          <div className="flex flex-col h-full gap-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Info Column */}
              <div className="lg:col-span-3 space-y-6 overflow-auto pr-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50/30 border-blue-100">
                    <CardContent className="p-4">
                      <p className="text-xs text-blue-600 mb-1">صافي الإجمالي</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(selectedBatch?.total_amount)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50/50 border-gray-100">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 mb-1">الحالة</p>
                      <StatusBadge status={selectedBatch?.status} />
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50/50 border-gray-100">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 mb-1">عدد الموظفين</p>
                      <p className="text-lg font-bold text-gray-700">
                        {payrolls.filter(p => p.batch_id === selectedBatch?.id).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50/50 border-gray-100">
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</p>
                      <p className="text-sm font-medium text-gray-700">
                        {selectedBatch?.created_at ? format(parseISO(selectedBatch.created_at), "dd/MM/yyyy") : '-'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-wrap gap-4 items-end print:hidden">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs mb-1.5 block">البحث عن موظف</Label>
                    <Input
                      placeholder="اسم الموظف..."
                      value={detailsSearch}
                      onChange={(e) => setDetailsSearch(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="w-40">
                    <Label className="text-xs mb-1.5 block">القسم</Label>
                    <Select value={detailsDept} onValueChange={setDetailsDept}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="الكل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الأقسام</SelectItem>
                        {[...new Set(payrolls.filter(p => p.batch_id === selectedBatch?.id).map(p => employees.find(e => e.id === p.employee_id)?.department))].filter(Boolean).map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Label className="text-xs mb-1.5 block">العملة</Label>
                    <Select value={detailsCurrency} onValueChange={setDetailsCurrency}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="الكل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل العملات</SelectItem>
                        {[...new Set(payrolls.filter(p => p.batch_id === selectedBatch?.id).map(p => p.currency))].map(curr => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExportCSV(payrolls.filter(p => {
                      if (p.batch_id !== selectedBatch?.id) return false;
                      const emp = employees.find(e => e.id === p.employee_id);
                      const matchesSearch = emp?.full_name.toLowerCase().includes(detailsSearch.toLowerCase());
                      const matchesDept = detailsDept === 'all' || emp?.department === detailsDept;
                      const matchesCurrency = detailsCurrency === 'all' || p.currency === detailsCurrency;
                      return matchesSearch && matchesDept && matchesCurrency;
                    }))} className="bg-white gap-2">
                      <Download className="w-4 h-4" />
                      تصدير CSV
                    </Button>
                    <Button variant="outline" onClick={handlePrint} className="bg-white gap-2">
                      <History className="w-4 h-4" />
                      طباعة
                    </Button>
                  </div>
                </div>

                <DataTable
                  data={payrolls.filter(p => {
                    if (p.batch_id !== selectedBatch?.id) return false;
                    const emp = employees.find(e => e.id === p.employee_id);
                    const matchesSearch = emp?.full_name.toLowerCase().includes(detailsSearch.toLowerCase());
                    const matchesDept = detailsDept === 'all' || emp?.department === detailsDept;
                    const matchesCurrency = detailsCurrency === 'all' || p.currency === detailsCurrency;
                    return matchesSearch && matchesDept && matchesCurrency;
                  })}
                  columns={payrollColumns}
                  showAdd={false}
                  searchable={false}
                />
              </div>

              {/* Workflow Column */}
              <div className="lg:col-span-1 border-r pr-6 space-y-6">
                <div className="bg-white p-4 rounded-xl border-2 border-[#7c3238]/10 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    إدارة الاعتماد
                  </h3>

                  {selectedBatch?.status === 'approved' ? (
                    <div className="p-8 text-center bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="font-bold text-green-800">تم الاعتماد النهائي</p>
                      <p className="text-xs text-green-600 mt-1">هذا المسير جاهز للصرف</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvalChain.find(s => s.status === 'pending') ? (
                        <>
                          <p className="text-xs text-gray-500">يتطلب هذا المسير اعتماداً من المسؤولين قبل الصرف النهائي.</p>
                          <div className="flex flex-col gap-2">
                            {(() => {
                              const step = approvalChain.find(s => s.status === 'pending');
                              // التحقق من أن المستخدم يمتلك الدور المطلوب للخطوة الحالية
                              const userRoles = currentUser?.roles?.map(r => r.id) || [];
                              const hasRequiredRole = step?.role_id && (userRoles.includes(step.role_id) || currentUser?.role_id === step.role_id);

                              // السماح للـ Admin دائماً أو الشخص صاحب الدور
                              const canApproveCurrent = hasRequiredRole || currentUser?.role === 'admin' || currentUser?.email?.includes('admin');

                              if (!canApproveCurrent) {
                                return <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 text-center">بانتظار اعتماد صاحب الصلاحية</p>;
                              }

                              return (
                                <>
                                  <Button
                                    className="w-full bg-green-600 hover:bg-green-700 gap-2"
                                    disabled={saving}
                                    onClick={() => performBatchAction('approved')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    اعتماد الطلب
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="w-full text-red-600 hover:bg-red-50 gap-2"
                                    disabled={saving}
                                    onClick={() => performBatchAction('rejected')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    رفض الطلب
                                  </Button>
                                </>
                              );
                            })()}
                          </div>
                        </>
                      ) : selectedBatch?.status === 'paid' ? (
                        <div className="p-8 text-center bg-blue-50 rounded-lg border border-blue-100">
                          <DollarSign className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                          <p className="font-bold text-blue-800">تم الصرف بنجاح</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">في انتظار بدء سلسلة الاعتمادات...</p>
                      )}

                      {hasPermission('force_approve') && selectedBatch?.status !== 'approved' && selectedBatch?.status !== 'paid' && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-amber-600 hover:bg-amber-50 gap-2"
                            disabled={saving}
                            onClick={forceApproveBatch}
                          >
                            <Zap className="w-4 h-4" />
                            اعتماد نهائي استثنائي ⚡
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ApprovalTimeline approvalChain={approvalChain} />
              </div>
            </div>
          </div>
        </FormModal>

        {/* Generate Modal */}
        <FormModal
          open={showCalculateModal}
          onClose={() => setShowCalculateModal(false)}
          title="توليد مسير رواتب جديد"
          onSubmit={handleGenerateBatch}
          loading={saving}
          submitLabel="توليد المسير"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              سيتم حساب رواتب جميع الموظفين النشطين للشهر المحدد. الموظفين الذين تم
              حساب رواتبهم مسبقاً سيتم تخطيهم.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الشهر</Label>
                <Select
                  value={String(calculateData.month)}
                  onValueChange={(v) =>
                    setCalculateData({ ...calculateData, month: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {format(new Date(2024, i), "MMMM", { locale: ar })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>السنة</Label>
                <Select
                  value={String(calculateData.year)}
                  onValueChange={(v) =>
                    setCalculateData({ ...calculateData, year: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </FormModal>

        {/* View Modal */}
        <FormModal
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="تفاصيل الراتب"
          showFooter={false}
          size="lg"
          onSubmit={() => { }} // Placeholder to fix required prop
        >
          {selectedPayroll && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {getEmployeeName(selectedPayroll.employee_id)}
                  </h3>
                  <p className="text-gray-500">
                    {format(
                      new Date(selectedPayroll.year, selectedPayroll.month - 1),
                      "MMMM yyyy",
                      { locale: ar }
                    )}
                  </p>
                </div>
                <StatusBadge status={selectedPayroll.status} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                    المستحقات
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الراتب الأساسي</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPayroll.basic_salary, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">بدل السكن</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPayroll.housing_allowance, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">بدل المواصلات</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPayroll.transport_allowance, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">بدلات أخرى</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPayroll.other_allowances, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">علاوات إضافية</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPayroll.additional_allowances, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المكافآت</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPayroll.bonuses_amount, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الساعات الإضافية</span>
                      <span className="font-medium">
                        {formatCurrency(selectedPayroll.overtime_amount, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>إجمالي الراتب</span>
                      <span className="text-green-600">
                        {formatCurrency(selectedPayroll.gross_salary, selectedPayroll.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">
                    الخصومات
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">خصم التأمينات</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(selectedPayroll.insurance_deduction, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">خصم التأخير ({selectedPayroll.late_minutes} دقيقة)</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(selectedPayroll.late_deduction, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">خصم الغياب ({selectedPayroll.absent_days} يوم)</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(selectedPayroll.absence_deduction, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">خصومات أخرى</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(selectedPayroll.other_deductions, selectedPayroll.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>إجمالي الخصومات</span>
                      <span className="text-red-600">
                        {formatCurrency(selectedPayroll.total_deductions, selectedPayroll.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#7c3238]/5 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">صافي الراتب</span>
                  <span className="text-2xl font-bold text-[#7c3238]">
                    {formatCurrency(selectedPayroll.net_salary, selectedPayroll.currency)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSendPayslip(selectedPayroll)}
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال قسيمة الراتب
                </Button>
              </div>
            </div>
          )}
        </FormModal>

        {/* Edit Form Modal */}
        <FormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          title="تعديل الراتب"
          onSubmit={handleSubmit}
          loading={saving}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الراتب الأساسي</Label>
                <Input
                  type="number"
                  value={formData.basic_salary || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, basic_salary: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>صافي الراتب</Label>
                <Input
                  type="number"
                  value={formData.net_salary || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, net_salary: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </FormModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="حذف الراتب"
          description="هل أنت متأكد من حذف هذا الراتب؟"
        />
      </div>

      {/* Formal Print Layout (Hidden on screen) */}
      <div id="printable-payroll" className="print-only hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:bg-white print:z-50 print:p-8 text-right font-sans" dir="rtl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex border-b-2 border-gray-900 pb-6 items-center">
            <div className="flex-1 space-y-1">
              <h1 className="text-3xl font-black">{companyProfile?.company_name || 'ايفوري للتدريب والاستشارات'}</h1>
              <p className="text-sm">{companyProfile?.address || 'الرياض ، المرسلات طريق ابو بكر الصديق'}</p>
              <div className="flex gap-4 text-xs font-bold mt-2">
                <span>الهاتف: {companyProfile?.phones ? (Array.isArray(companyProfile.phones) ? companyProfile.phones[0] : companyProfile.phones) : '+966 533 993 220'}</span>
                <span>البريد: {companyProfile?.email || 'info@ivorytraining.com'}</span>
              </div>
            </div>
            <div className="w-32 h-32 flex items-center justify-center">
              <img src={companyProfile?.logo_path || '/images/ivory.png'} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-4 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-bold">
              مسير رواتب شهر {selectedBatch ? format(new Date(selectedBatch.year, selectedBatch.month - 1), "MMMM", { locale: ar }) : format(parseISO(filterMonth + "-01"), "MMMM", { locale: ar })} لسنة {selectedBatch?.year || filterMonth.split('-')[0]}
            </h2>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-gray-900">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-900 p-2 text-center text-sm">(م)</th>
                <th className="border border-gray-900 p-2 text-right">اسم الموظف</th>
                <th className="border border-gray-900 p-2 text-center">الأساسي</th>
                <th className="border border-gray-900 p-2 text-center">بدل السكن</th>
                <th className="border border-gray-900 p-2 text-center">بدل النقل</th>
                <th className="border border-gray-900 p-2 text-center">بدلات أخرى</th>
                <th className="border border-gray-900 p-2 text-center">العمل الإضافي</th>
                <th className="border border-gray-900 p-2 text-center">المكافآت</th>
                <th className="border border-gray-900 p-2 text-center">إجمالي الخصومات</th>
                <th className="border border-gray-900 p-2 text-center text-green-800">الصافي</th>
                <th className="border border-gray-900 p-2 text-center">العملة</th>
                <th className="border border-gray-900 p-2 text-center">التوقيع</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.filter(p => {
                if (selectedBatch && p.batch_id !== selectedBatch.id) return false;
                if (!selectedBatch && p.month !== Number(filterMonth.split('-')[1])) return false;

                const emp = employees.find(e => e.id === p.employee_id);
                const matchesSearch = emp?.full_name.toLowerCase().includes(detailsSearch.toLowerCase());
                const matchesDept = detailsDept === 'all' || emp?.department === detailsDept;
                const matchesCurrency = detailsCurrency === 'all' || p.currency === detailsCurrency;
                return matchesSearch && matchesDept && matchesCurrency;
              }).map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50 text-[11px]">
                  <td className="border border-gray-900 p-2 text-center">{idx + 1}</td>
                  <td className="border border-gray-900 p-2 font-bold">{getEmployeeName(p.employee_id)}</td>
                  <td className="border border-gray-900 p-2 text-center">{(Number(p.basic_salary) || 0).toLocaleString()}</td>
                  <td className="border border-gray-900 p-2 text-center">{(Number(p.housing_allowance) || 0).toLocaleString()}</td>
                  <td className="border border-gray-900 p-2 text-center">{(Number(p.transport_allowance) || 0).toLocaleString()}</td>
                  <td className="border border-gray-900 p-2 text-center">
                    {(Number(p.other_allowances || 0) + Number(p.additional_allowances || 0)).toLocaleString()}
                  </td>
                  <td className="border border-gray-900 p-2 text-center">{(Number(p.overtime_amount) || 0).toLocaleString()}</td>
                  <td className="border border-gray-900 p-2 text-center">{(Number(p.bonuses_amount) || 0).toLocaleString()}</td>
                  <td className="border border-gray-900 p-2 text-center text-red-700">{(Number(p.total_deductions) || 0).toLocaleString()}</td>
                  <td className="border border-gray-900 p-2 text-center font-black text-green-900">{(Number(p.net_salary) || 0).toLocaleString()}</td>
                  <td className="border border-gray-900 p-2 text-center">{p.currency}</td>
                  <td className="border border-gray-900 p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer / Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-12">
            <div className="text-center space-y-12">
              <p className="font-bold border-b border-gray-400 pb-2">المدير المالي</p>
              <div className="h-20 border-b border-dotted border-gray-400"></div>
            </div>
            <div className="text-center space-y-12">
              <p className="font-bold border-b border-gray-400 pb-2">مدير الموارد البشرية</p>
              <div className="h-20 border-b border-dotted border-gray-400"></div>
            </div>
            <div className="text-center space-y-12">
              <p className="font-bold border-b border-gray-400 pb-2">المدير العام</p>
              <p className="text-lg font-black">{companyProfile?.manager_name}</p>
              <div className="h-2 border-b border-dotted border-gray-400"></div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-left text-[10px] text-gray-400 border-t pt-2">
            تاريخ الطباعة: {new Date().toLocaleString('ar-SA')} | نظام ايفوري لإدارة الموارد البشرية
          </div>
        </div>
      </div>
    </div>
  );
}