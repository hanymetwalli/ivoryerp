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
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
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
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [formData, setFormData] = useState({});
  const [calculateData, setCalculateData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
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
  }, [filterMonth, authLoading, currentUser, userEmployee]);

  const loadData = async () => {
    if (authLoading) return;
    
    setLoading(true);
    try {
      const [
        payrollData,
        empData,
        contractData,
        attData,
        otData,
        allowanceData,
        deductionData,
        insData,
      ] = await Promise.all([
        base44.entities.Payroll.list("-created_date", 500),
        base44.entities.Employee.list(),
        base44.entities.Contract.list(),
        base44.entities.Attendance.list("-date", 1000),
        base44.entities.Overtime.list(),
        base44.entities.Allowance.list(),
        base44.entities.Deduction.list(),
        base44.entities.InsuranceSettings.list(),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_ALL_PAYROLL);
      setFilteredEmployees(allowedEmployees);

      const [year, month] = filterMonth.split("-").map(Number);
      const filtered = payrollData.filter(
        (p) => p.year === year && p.month === month
      );

      const filteredData = filterEmployeeRelatedData(filtered, allowedEmployees, (item) => item.employee_id);

      setPayrolls(filtered);
      setFilteredPayrolls(filteredData);
      setEmployees(empData);
      setContracts(contractData);
      setAttendance(attData);
      setOvertime(otData);
      setAllowances(allowanceData);
      setDeductions(deductionData);
      setInsuranceSettings(insData);
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

  const handleCalculatePayroll = async () => {
    setSaving(true);
    try {
      const activeEmployees = filteredEmployees.filter((e) => e.status === "active");
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (const emp of activeEmployees) {
        const result = await calculatePayrollForEmployee(
          emp.id,
          calculateData.month,
          calculateData.year
        );
        if (result && !result.error) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`${emp.full_name}: ${result?.error || 'خطأ غير معروف'}`);
        }
      }

      if (successCount > 0) {
        toast.success(`تم حساب رواتب ${successCount} موظف بنجاح${errorCount > 0 ? ` (${errorCount} فشل)` : ''}`);
      }
      
      if (errorCount > 0 && errors.length <= 5) {
        errors.forEach(err => toast.error(err, { duration: 5000 }));
      } else if (errorCount > 5) {
        toast.error(`فشل حساب ${errorCount} رواتب. يرجى مراجعة بيانات الموظفين.`);
      }
      
      loadData();
      setShowCalculateModal(false);
    } catch (error) {
      console.error("Error calculating payroll:", error);
      toast.error("حدث خطأ أثناء حساب الرواتب");
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
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
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
      
      setShowDeleteDialog(false);
      toast.success("تم حذف الراتب بنجاح");
    } catch (error) {
      console.error("Error deleting payroll:", error);
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

  const columns = [
    {
      header: "الموظف",
      accessor: "employee_id",
      cell: (row) => getEmployeeName(row.employee_id),
    },
    {
      header: "الشهر",
      accessor: "month",
      cell: (row) =>
        format(new Date(row.year, row.month - 1), "MMMM yyyy", { locale: ar }),
    },
    {
      header: "إجمالي الراتب",
      accessor: "gross_salary",
      cell: (row) => formatCurrency(row.gross_salary, row.currency),
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
      header: "تاريخ الإصدار",
      accessor: "issue_date",
      cell: (row) =>
        row.issue_date
          ? format(parseISO(row.issue_date), "dd/MM/yyyy", { locale: ar })
          : "-",
    },
    {
      header: "رقم المسير",
      accessor: "payroll_number",
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
        const canEdit = hasPermission(PERMISSIONS.EDIT_PAYROLL);
        const canDelete = hasPermission(PERMISSIONS.DELETE_PAYROLL);
        const canApprove = hasPermission(PERMISSIONS.APPROVE_PAYROLL);

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
              <DropdownMenuItem onClick={() => handleSendPayslip(row)}>
                <Send className="w-4 h-4 ml-2" />
                إرسال قسيمة الراتب
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canApprove && row.status === "draft" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(row, "pending_review")}
                >
                  <CheckCircle className="w-4 h-4 ml-2 text-blue-600" />
                  إرسال للمراجعة
                </DropdownMenuItem>
              )}
              {canApprove && row.status === "pending_review" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(row, "approved")}
                >
                  <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                  اعتماد
                </DropdownMenuItem>
              )}
              {canApprove && row.status === "approved" && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(row, "paid")}
                >
                  <DollarSign className="w-4 h-4 ml-2 text-green-600" />
                  تأكيد الدفع
                </DropdownMenuItem>
              )}
              {(canEdit || canDelete) && <DropdownMenuSeparator />}
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

  return (
    <div className="space-y-6">
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
        data={filteredPayrolls}
        columns={columns}
        loading={loading || authLoading}
        showAdd={false}
        searchPlaceholder="بحث..."
        emptyMessage="لا توجد رواتب"
      />

      {/* Calculate Modal */}
      <FormModal
        open={showCalculateModal}
        onClose={() => setShowCalculateModal(false)}
        title="حساب الرواتب الشهرية"
        onSubmit={handleCalculatePayroll}
        loading={saving}
        submitLabel="حساب الرواتب"
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
  );
}