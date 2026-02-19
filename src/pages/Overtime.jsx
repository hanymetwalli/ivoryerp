import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Download,
  Users,
  AlertCircle,
  Upload,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import ApprovalActions from "@/components/ApprovalActions";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function Overtime() {
  const [overtimes, setOvertimes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedOvertime, setSelectedOvertime] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [approvalChain, setApprovalChain] = useState([]);
  const [filteredOvertimes, setFilteredOvertimes] = useState([]);
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
      const [overtimeData, empData, contractData] = await Promise.all([
        base44.entities.Overtime.list("-created_date", 200),
        base44.entities.Employee.list(),
        base44.entities.Contract.list(),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_OVERTIME);
      setFilteredEmployees(allowedEmployees);

      const filteredData = filterEmployeeRelatedData(overtimeData, allowedEmployees, (item) => item.employee_id);

      setOvertimes(overtimeData);
      setFilteredOvertimes(filteredData);
      setEmployees(empData);
      setContracts(contractData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getEmployeeContract = (employeeId) => {
    return contracts.find(c => c.employee_id === employeeId && c.status === 'active');
  };

  const calculateOvertimeRate = (employeeId) => {
    const contract = getEmployeeContract(employeeId);
    if (!contract || !contract.basic_salary) return { hourlyRate: 0, overtimeRate: 0 };
    
    const hourlyRate = contract.basic_salary / 30 / 8;
    const overtimeRate = hourlyRate * 1.5;
    
    return { hourlyRate, overtimeRate };
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const handleAdd = () => {
    setSelectedOvertime(null);
    setSelectedEmployees([]);
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setShowForm(true);
  };

  const handleEdit = (overtime) => {
    setSelectedOvertime(overtime);
    setFormData(overtime);
    setShowForm(true);
  };

  const handleView = async (overtime) => {
    setSelectedOvertime(overtime);
    
    // Use saved chain if available (New System)
    if (overtime.approval_chain && overtime.approval_chain.length > 0) {
        setApprovalChain(overtime.approval_chain);
        setShowViewModal(true);
        return;
    }

    // جلب سلسلة الاعتماد
    try {
      const response = await base44.functions.invoke('getApprovalChain', {
        employeeId: overtime.employee_id,
        entity: 'Overtime',
        requiresFinanceApproval: overtime.requires_finance_approval !== false,
      });
      setApprovalChain(response.data.approvalChain || []);
    } catch (error) {
      console.error('Error loading approval chain:', error);
    }
    
    setShowViewModal(true);
  };

  const handleDelete = (overtime) => {
    setSelectedOvertime(overtime);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.Overtime.delete(selectedOvertime.id);
      setOvertimes(overtimes.filter((o) => o.id !== selectedOvertime.id));
      setShowDeleteDialog(false);
      toast.success("تم حذف السجل بنجاح");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0 || !formData.date || !formData.hours) {
      toast.error("يرجى ملء الحقول المطلوبة واختيار الموظفين");
      return;
    }

    setSaving(true);
    try {
      // إنشاء سجل منفصل لكل موظف
      for (const empId of selectedEmployees) {
        const { hourlyRate, overtimeRate } = calculateOvertimeRate(empId);
        const totalAmount = overtimeRate * Number(formData.hours);

        // توليد رقم طلب تلقائي
        const requestNumberResponse = await base44.functions.invoke('generateRequestNumber', {
          entityName: 'Overtime',
          prefix: 'OT',
        });

        const dataToSave = {
          request_number: requestNumberResponse.data.requestNumber,
          employee_id: empId,
          date: formData.date,
          hours: Number(formData.hours),
          hourly_rate: hourlyRate,
          overtime_rate: overtimeRate,
          total_amount: totalAmount,
          notes: formData.notes || "",
          status: "pending",
          requires_finance_approval: true,
        };

        // جلب سلسلة الاعتماد
        const chainResponse = await base44.functions.invoke('getApprovalChain', {
          employeeId: empId,
          entity: 'Overtime',
          requiresFinanceApproval: true,
        });
        
        const chain = chainResponse.data.approvalChain || [];
        if (chain.length > 0) {
          dataToSave.current_approval_level = chain[0].level;
          dataToSave.current_level_idx = 0;
          dataToSave.approval_chain = chain;
          
          // تحديث وصف الحالة الأولية
          const firstStep = chain[0];
          dataToSave.current_status_desc = `جارى الاعتماد من: ${firstStep.level_name}` + 
            (firstStep.approver_name ? ` (${firstStep.approver_name})` : "");
        }

        await base44.entities.Overtime.create(dataToSave);
      }

      toast.success(`تم إضافة ${selectedEmployees.length} سجل ساعات إضافية بنجاح`);
      loadData();
      setShowForm(false);
      setSelectedEmployees([]);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  const handleImport = async (file) => {
    setSaving(true);
    try {
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
                  employee_name: { type: "string" },
                  date: { type: "string" },
                  hours: { type: "number" },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.status === "success" && result.output?.data) {
        for (const row of result.output.data) {
          const emp = employees.find(e => e.full_name === row.employee_name);
          if (emp) {
            const { hourlyRate, overtimeRate } = calculateOvertimeRate(emp.id);
            const requestNumberResponse = await base44.functions.invoke('generateRequestNumber', {
              entityName: 'Overtime',
              prefix: 'OT',
            });

            await base44.entities.Overtime.create({
              request_number: requestNumberResponse.data.requestNumber,
              employee_id: emp.id,
              date: row.date,
              hours: row.hours,
              hourly_rate: hourlyRate,
              overtime_rate: overtimeRate,
              total_amount: overtimeRate * row.hours,
              notes: row.notes || "",
              status: "pending",
              requires_finance_approval: true,
            });
          }
        }
        toast.success("تم استيراد البيانات بنجاح");
        loadData();
        setShowImportModal(false);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("حدث خطأ أثناء الاستيراد");
    }
    setSaving(false);
  };

  const exportToCSV = () => {
    const headers = ["رقم الطلب", "الموظف", "التاريخ", "الساعات", "سعر الساعة الإضافية", "المبلغ الإجمالي", "الحالة"];
    const rows = overtimes.map((ot) => [
      ot.request_number || "",
      getEmployeeName(ot.employee_id),
      ot.date || "",
      ot.hours || 0,
      ot.overtime_rate || 0,
      ot.total_amount || 0,
      ot.status || "",
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `overtime_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: overtimes.length,
    pending: overtimes.filter(o => o.status === "pending").length,
    approved: overtimes.filter(o => o.status === "approved").length,
    totalAmount: overtimes.filter(o => o.status === "approved").reduce((sum, o) => sum + (o.total_amount || 0), 0),
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
      header: "التاريخ",
      accessor: "date",
      cell: (row) => (row.date ? format(parseISO(row.date), "dd/MM/yyyy", { locale: ar }) : "-"),
    },
    {
      header: "الساعات",
      accessor: "hours",
      cell: (row) => `${row.hours || 0} ساعة`,
    },
    {
      header: "المبلغ",
      accessor: "total_amount",
      cell: (row) => `${row.total_amount?.toLocaleString('ar-SA', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 0} ر.س`,
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
        const canEdit = hasPermission(PERMISSIONS.EDIT_OVERTIME);
        const canDelete = hasPermission(PERMISSIONS.DELETE_OVERTIME);

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

  const toggleEmployee = (empId) => {
    setSelectedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const toggleAll = () => {
    if (selectedEmployees.length === filteredEmployees.filter(e => e.status === 'active').length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.filter(e => e.status === 'active').map(e => e.id));
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">الساعات الإضافية</h2>
          <p className="text-gray-500">إدارة ساعات العمل الإضافية ونظام الاعتمادات</p>
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
        <StatCard title="إجمالي السجلات" value={stats.total} icon={Clock} color="primary" />
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
        data={filteredOvertimes}
        columns={columns}
        loading={loading || authLoading}
        onAdd={hasPermission(PERMISSIONS.ADD_OVERTIME) ? handleAdd : undefined}
        addButtonText="إضافة ساعات إضافية"
        searchPlaceholder="بحث..."
        emptyMessage="لا توجد سجلات"
        showAdd={hasPermission(PERMISSIONS.ADD_OVERTIME)}
      />

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedOvertime ? "تعديل الساعات الإضافية" : "إضافة ساعات إضافية"}
        onSubmit={handleSubmit}
        loading={saving}
        size="lg"
      >
        <div className="space-y-4" dir="rtl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>اختيار الموظفين * ({selectedEmployees.length} محدد)</Label>
              <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                {selectedEmployees.length === filteredEmployees.filter(e => e.status === 'active').length ? "إلغاء الكل" : "تحديد الكل"}
              </Button>
            </div>
            <Input
              placeholder="بحث عن موظف..."
              className="mb-2"
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                const filtered = filteredEmployees.filter(emp => 
                  emp.status === 'active' && 
                  (emp.full_name?.toLowerCase().includes(search) ||
                   emp.position?.toLowerCase().includes(search) ||
                   emp.department?.toLowerCase().includes(search))
                );
                setFormData({ ...formData, filteredEmployees: filtered });
              }}
            />
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {(formData.filteredEmployees || filteredEmployees.filter(e => e.status === 'active')).map((emp) => {
                const { overtimeRate } = calculateOvertimeRate(emp.id);
                
                return (
                  <label
                    key={emp.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedEmployees.includes(emp.id)}
                      onCheckedChange={() => toggleEmployee(emp.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{emp.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {emp.position} - {emp.department}
                        {overtimeRate > 0 && (
                          <span className="text-blue-600 mr-2">
                            • سعر الساعة الإضافية: {overtimeRate.toFixed(2)} ر.س
                          </span>
                        )}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <Label>التاريخ *</Label>
            <Input
              type="date"
              value={formData.date || ""}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label>عدد الساعات *</Label>
            <Input
              type="number"
              step="0.5"
              value={formData.hours || ""}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
            />
          </div>

          {selectedEmployees.length > 0 && formData.hours && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <h4 className="font-semibold text-blue-900">ملخص الحساب</h4>
              <p className="text-sm text-gray-700">سيتم إنشاء {selectedEmployees.length} سجل منفصل</p>
              {selectedEmployees.slice(0, 3).map(empId => {
                const emp = employees.find(e => e.id === empId);
                const { overtimeRate } = calculateOvertimeRate(empId);
                const amount = overtimeRate * Number(formData.hours);
                
                return (
                  <div key={empId} className="text-sm border-t border-blue-200 pt-2">
                    <p className="font-medium text-gray-800">{emp?.full_name}</p>
                    <p className="text-gray-600">
                      {formData.hours} ساعة × {overtimeRate.toFixed(2)} ر.س = {amount.toFixed(2)} ر.س
                    </p>
                  </div>
                );
              })}
              {selectedEmployees.length > 3 && (
                <p className="text-sm text-gray-600">... و {selectedEmployees.length - 3} موظف آخر</p>
              )}
            </div>
          )}

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
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="تفاصيل الساعات الإضافية"
        showFooter={false}
        size="lg"
      >
        {selectedOvertime && (
          <div className="space-y-4" dir="rtl">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">رقم الطلب</p>
                <p className="font-bold text-lg">{selectedOvertime.request_number || "-"}</p>
                <p className="text-sm text-gray-600 mt-1">{getEmployeeName(selectedOvertime.employee_id)}</p>
              </div>
              <StatusBadge status={selectedOvertime.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">التاريخ</p>
                <p className="font-medium">
                  {selectedOvertime.date ? format(parseISO(selectedOvertime.date), "dd/MM/yyyy", { locale: ar }) : "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">عدد الساعات</p>
                <p className="font-bold text-xl text-[#7c3238]">{selectedOvertime.hours || 0} ساعة</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">سعر الساعة العادي</p>
                <p className="font-medium">{selectedOvertime.hourly_rate?.toFixed(2)} ر.س</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">سعر الساعة الإضافية (×1.5)</p>
                <p className="font-medium text-blue-600">{selectedOvertime.overtime_rate?.toFixed(2)} ر.س</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-gray-500">المبلغ الإجمالي</p>
                <p className="font-bold text-2xl text-green-600">
                  {selectedOvertime.total_amount?.toLocaleString('ar-SA', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 0} ر.س
                </p>
              </div>
            </div>

            {selectedOvertime.notes && (
              <div className="space-y-1 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">ملاحظات</p>
                <p className="font-medium">{selectedOvertime.notes}</p>
              </div>
            )}

            {(selectedOvertime.status === "pending" || selectedOvertime.current_approval_level) && (
              <ApprovalActions
                entityName="Overtime"
                recordId={selectedOvertime.id}
                onApproved={() => {
                  loadData();
                  setShowViewModal(false);
                }}
              />
            )}

            {(approvalChain?.length > 0 || selectedOvertime.approval_history?.length > 0) && (
              <div className="border-t pt-4">
                <ApprovalTimeline
                  approvalHistory={selectedOvertime.approval_history}
                  approvalChain={approvalChain}
                  currentLevel={selectedOvertime.current_approval_level}
                  status={selectedOvertime.status}
                />
              </div>
            )}
          </div>
        )}
      </FormModal>

      <FormModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="استيراد الساعات الإضافية"
        showFooter={false}
      >
        <div className="space-y-4" dir="rtl">
          <p className="text-gray-600">قم برفع ملف CSV أو Excel يحتوي على الأعمدة التالية:</p>
          <ul className="text-sm text-gray-600 mr-4 list-disc">
            <li>employee_name (اسم الموظف)</li>
            <li>date (التاريخ بتنسيق yyyy-mm-dd)</li>
            <li>hours (عدد الساعات)</li>
            <li>notes (ملاحظات - اختياري)</li>
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
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف السجل"
        description="هل أنت متأكد من حذف هذا السجل؟"
      />
    </div>
  );
}