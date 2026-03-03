import React, { useState, useEffect } from "react";
import { base44 } from "@/api/ivoryClient";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Calendar,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Ban,
  RefreshCw,
  Download
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
import ApprovalTimeline from "@/components/ApprovalTimeline";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { hasPermission as hasPermissionAsync, PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

const CURRENCY_LABELS = {
  SAR: "ريال سعودي",
  EGP: "جنيه مصري",
  USD: "دولار أمريكي",
};

export default function Contracts() {
  const queryClient = useQueryClient();
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
  const [forceApproveLoading, setForceApproveLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const {
    currentUser,
    userEmployee,
    hasPermission,
    filterEmployees,
    filterEmployeeRelatedData,
    loading: authLoading
  } = useAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const employeeFilter = urlParams.get("employee");

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, currentUser, userEmployee]);

  const loadData = async () => {
    if (authLoading) return;

    setLoading(true);
    try {
      const [contractData, empData, typeData] = await Promise.all([
        base44.entities.Contract.list("-created_at", 200),
        base44.entities.Employee.list(),
        base44.entities.ContractType.list(),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_ALL_CONTRACTS);
      setFilteredEmployees(allowedEmployees);

      let filtered = filterEmployeeRelatedData(
        contractData,
        allowedEmployees,
        (item) => item.employee_id
      );

      if (employeeFilter) {
        filtered = filtered.filter((c) => c.employee_id === employeeFilter);
      }

      setContracts(contractData);
      setFilteredContracts(filtered);
      setEmployees(empData);
      setContractTypes(typeData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const generateContractNumber = () => {
    const maxNumber = contracts.reduce((max, contract) => {
      const match = contract.contract_number?.match(/CON-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return `CON-${String(maxNumber + 1).padStart(4, "0")}`;
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const calculateGrossSalary = () => {
    const basic = Number(formData.basic_salary) || 0;
    const housing = Number(formData.housing_allowance) || 0;
    const transport = Number(formData.transport_allowance) || 0;
    const other = Number(formData.other_allowances) || 0;
    return basic + housing + transport + other;
  };

  useEffect(() => {
    if (formData.basic_salary || formData.housing_allowance || formData.transport_allowance || formData.other_allowances) {
      setFormData(prev => ({
        ...prev,
        gross_salary: calculateGrossSalary()
      }));
    }
  }, [formData.basic_salary, formData.housing_allowance, formData.transport_allowance, formData.other_allowances]);

  const handleAdd = () => {
    setSelectedContract(null);
    setFormData({
      status: "draft",
      approval_status: "pending",
      currency: "SAR",
      employee_id: employeeFilter || "",
      contract_number: generateContractNumber(),
      basic_salary: 0,
      housing_allowance: 0,
      transport_allowance: 0,
      other_allowances: 0,
      gross_salary: 0,
    });
    setShowForm(true);
  };

  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setFormData(contract);
    setShowForm(true);
  };

  const handleView = (contract) => {
    setSelectedContract(contract);
    setShowViewModal(true);
  };

  const handleDelete = (contract) => {
    setSelectedContract(contract);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const empName = getEmployeeName(selectedContract.employee_id);

      await base44.entities.AuditLog.create({
        action: 'delete',
        entity_name: 'Contract',
        record_id: selectedContract.id,
        record_identifier: selectedContract.contract_number,
        details: `حذف عقد: ${empName} - رقم العقد: ${selectedContract.contract_number}`,
        severity: 'critical',
      });

      await base44.entities.Contract.delete(selectedContract.id);
      loadData();
      setShowDeleteDialog(false);
      toast.success("تم حذف العقد بنجاح");
    } catch (error) {
      console.error("Error deleting contract:", error);
    }
  };

  const handleForceApprove = async () => {
    if (!selectedContract?.workflow_id) return;
    setForceApproveLoading(true);
    try {
      await base44.entities.Workflow.customAction(selectedContract.workflow_id, 'force-approve', {
        user_id: currentUser.id
      });
      toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
      loadData();
      setShowViewModal(false);
      setShowForceApproveDialog(false);
    } catch (error) {
      console.error("Error force approving:", error);
      toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
    }
    setForceApproveLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.start_date || !formData.gross_salary) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    if (formData.end_date && formData.end_date <= formData.start_date) {
      toast.error("تاريخ النهاية يجب أن يكون أكبر من تاريخ البداية");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        gross_salary: calculateGrossSalary(),
        basic_salary: Number(formData.basic_salary) || 0,
        housing_allowance: Number(formData.housing_allowance) || 0,
        transport_allowance: Number(formData.transport_allowance) || 0,
        other_allowances: Number(formData.other_allowances) || 0,
      };

      if (selectedContract) {
        await base44.entities.Contract.update(selectedContract.id, dataToSave);
        toast.success("تم تحديث العقد بنجاح");
      } else {
        await base44.entities.Contract.create(dataToSave);
        toast.success("تم تقديم العقد للمراجعة");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error("حدث خطأ أثناء الحفظ: " + error.message);
    }
    setSaving(false);
  };

  const handleResubmit = async (contract) => {
    try {
      await base44.entities.Contract.customAction(contract.id, 'resubmit');
      toast.success("تم إعادة تقديم العقد بنجاح");
      loadData();
    } catch (error) {
      toast.error("فشل إعادة التقديم");
    }
  };

  const formatCurrency = (amount, currency = "SAR") => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const exportToCSV = () => {
    const headers = ["رقم العقد", "الموظف", "نوع العقد", "تاريخ البداية", "تاريخ النهاية", "الراتب الأساسي", "بدل السكن", "بدل المواصلات", "بدلات أخرى", "الراتب الإجمالي", "العملة", "الحالة"];
    const rows = contracts.map((contract) => [
      contract.contract_number || "",
      getEmployeeName(contract.employee_id),
      contract.contract_type || "",
      contract.start_date || "",
      contract.end_date || "",
      contract.basic_salary || 0,
      contract.housing_allowance || 0,
      contract.transport_allowance || 0,
      contract.other_allowances || 0,
      contract.gross_salary || 0,
      contract.currency || "SAR",
      ({
        active: "نشط",
        inactive: "غير نشط",
        terminated: "مفسوخ",
        expired: "منتهي",
        draft: "مسودة",
        planned: "مستقبلي"
      }[contract.status] || contract.status),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contracts_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "الموظف",
      accessor: "employee_id",
      cell: (row) => getEmployeeName(row.employee_id),
    },
    {
      header: "رقم العقد",
      accessor: "contract_number",
    },
    {
      header: "نوع العقد",
      accessor: "contract_type",
    },
    {
      header: "تاريخ البداية",
      accessor: "start_date",
      cell: (row) =>
        row.start_date ? format(new Date(row.start_date), "dd/MM/yyyy", { locale: ar }) : "-",
    },
    {
      header: "تاريخ النهاية",
      accessor: "end_date",
      cell: (row) =>
        row.end_date ? format(new Date(row.end_date), "dd/MM/yyyy", { locale: ar }) : "-",
    },
    {
      header: "الراتب الإجمالي",
      accessor: "gross_salary",
      cell: (row) => formatCurrency(row.gross_salary, row.currency),
    },
    {
      header: "الحالة",
      accessor: "status",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={
            (row.approval_status === 'approved' || !row.approval_status)
              ? row.status
              : row.approval_status
          } />
          {row.approval_status === 'returned' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleResubmit(row)}
              className="h-7 text-xs text-blue-600 hover:text-blue-800"
            >
              إعادة تقديم
            </Button>
          )}
        </div>
      ),
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => {
        const canEditRow = hasPermission(PERMISSIONS.EDIT_CONTRACT);
        const canDeleteRow = hasPermission(PERMISSIONS.DELETE_CONTRACT);

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
              {canEditRow && (
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
              )}
              {hasPermission(PERMISSIONS.FORCE_APPROVE) && row.approval_status === 'pending' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedContract(row);
                      setShowForceApproveDialog(true);
                    }}
                    className="text-blue-600 font-bold"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    اعتماد نهائي استثنائي ⚡
                  </DropdownMenuItem>
                </>
              )}
              {canDeleteRow && (
                <DropdownMenuItem onClick={() => handleDelete(row)} className="text-red-600">
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
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة العقود</h2>
          <p className="text-gray-500">
            {employeeFilter
              ? `عقود الموظف: ${getEmployeeName(employeeFilter)}`
              : "إدارة عقود الموظفين والبيانات المالية"}
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 ml-2" />
          تصدير CSV
        </Button>
      </div>

      <DataTable
        data={filteredContracts}
        columns={columns}
        loading={loading || authLoading}
        onAdd={hasPermission(PERMISSIONS.ADD_CONTRACT) ? handleAdd : undefined}
        addButtonText="إضافة عقد"
        searchPlaceholder="بحث عن عقد..."
        emptyMessage="لا توجد عقود"
        showAdd={hasPermission(PERMISSIONS.ADD_CONTRACT)}
      />

      {/* Add/Edit Form Modal */}
      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedContract ? "تعديل العقد" : "إضافة عقد جديد"}
        onSubmit={handleSubmit}
        loading={saving}
        size="lg"
      >
        <div className="space-y-4" dir="rtl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label>رقم العقد *</Label>
              <Input
                value={formData.contract_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contract_number: e.target.value })
                }
                disabled={!!selectedContract}
              />
            </div>
            <div>
              <Label>نوع العقد</Label>
              <Select
                value={formData.contract_type || ""}
                onValueChange={(v) => setFormData({ ...formData, contract_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع العقد" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes
                    .filter((t) => t.status === "active")
                    .map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>العملة</Label>
              <Select
                value={formData.currency || "SAR"}
                onValueChange={(v) => setFormData({ ...formData, currency: v })}
              >
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
                min={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
              {formData.start_date && formData.end_date && formData.end_date <= formData.start_date && (
                <p className="text-xs text-red-600 mt-1">تاريخ النهاية يجب أن يكون بعد تاريخ البداية</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-gray-700 mb-3">تفاصيل الراتب</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>الراتب الأساسي *</Label>
                <Input
                  type="number"
                  value={formData.basic_salary || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, basic_salary: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>بدل السكن</Label>
                <Input
                  type="number"
                  value={formData.housing_allowance || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, housing_allowance: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>بدل المواصلات</Label>
                <Input
                  type="number"
                  value={formData.transport_allowance || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, transport_allowance: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>بدلات أخرى</Label>
                <Input
                  type="number"
                  value={formData.other_allowances || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, other_allowances: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>الراتب الإجمالي (محسوب تلقائياً)</Label>
                <Input
                  type="number"
                  value={calculateGrossSalary()}
                  disabled
                  className="bg-gray-50 font-bold"
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
                    <SelectItem value="expired">منتهي</SelectItem>
                    <SelectItem value="terminated">مفسوخ</SelectItem>
                    <SelectItem value="planned">مستقبلي</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {selectedContract && (
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                مسار الاعتمادات
              </h3>

              <ApprovalTimeline
                approvalChain={selectedContract.approval_steps}
              />
            </div>
          )}
        </div>
      </FormModal>

      <ConfirmDialog
        open={showForceApproveDialog}
        onClose={() => setShowForceApproveDialog(false)}
        onConfirm={handleForceApprove}
        title="الاعتماد النهائي الاستثنائي ⚡"
        description="هل أنت متأكد من الاعتماد النهائي المباشر لهذا الطلب؟ سيتم تجاوز كافة خطوات سير العمل المتبقية واعتماد الطلب بشكل نهائي استثنائي."
        confirmLabel="تأكيد الاعتماد ⚡"
        cancelLabel="تراجع"
        variant="destructive"
        loading={forceApproveLoading}
      />

      {/* View Modal */}
      <FormModal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="تفاصيل العقد"
        showFooter={false}
        size="lg"
        onSubmit={() => { }}
      >
        {selectedContract && (
          <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {getEmployeeName(selectedContract.employee_id)}
                </h3>
                <p className="text-gray-500">عقد رقم: {selectedContract.contract_number || "-"}</p>
                {selectedContract.current_status_desc && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    {selectedContract.current_status_desc}
                  </p>
                )}
              </div>
              <StatusBadge status={selectedContract.approval_status || selectedContract.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">نوع العقد</p>
                <p className="font-medium">{selectedContract.contract_type || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">العملة</p>
                <p className="font-medium">
                  {CURRENCY_LABELS[selectedContract.currency] || selectedContract.currency}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">تاريخ البداية</p>
                <p className="font-medium">
                  {selectedContract.start_date
                    ? format(new Date(selectedContract.start_date), "dd/MM/yyyy", { locale: ar })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">تاريخ النهاية</p>
                <p className="font-medium">
                  {selectedContract.end_date
                    ? format(new Date(selectedContract.end_date), "dd/MM/yyyy", { locale: ar })
                    : "-"}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-700 mb-3">تفاصيل الراتب</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">الراتب الأساسي</p>
                  <p className="font-medium">
                    {formatCurrency(selectedContract.basic_salary, selectedContract.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">بدل السكن</p>
                  <p className="font-medium">
                    {formatCurrency(selectedContract.housing_allowance, selectedContract.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">بدل المواصلات</p>
                  <p className="font-medium">
                    {formatCurrency(selectedContract.transport_allowance, selectedContract.currency)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">بدلات أخرى</p>
                  <p className="font-medium">
                    {formatCurrency(selectedContract.other_allowances, selectedContract.currency)}
                  </p>
                </div>
                <div className="space-y-1 col-span-2 p-3 bg-[#7c3238]/5 rounded-lg">
                  <p className="text-sm text-gray-500">الراتب الإجمالي</p>
                  <p className="font-bold text-xl text-[#7c3238]">
                    {formatCurrency(selectedContract.gross_salary, selectedContract.currency)}
                  </p>
                </div>
              </div>
            </div>


            {selectedContract.approval_steps?.length > 0 && (
              <div className="border-t pt-4">
                <ApprovalTimeline approvalChain={selectedContract.approval_steps} />
              </div>
            )}

            {selectedContract.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">ملاحظات</p>
                <p className="font-medium mt-1">{selectedContract.notes}</p>
              </div>
            )}
          </div>
        )}
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف العقد"
        description="هل أنت متأكد من حذف هذا العقد؟"
      />
    </div >
  );
}