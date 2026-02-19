import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Download,
  Upload,
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
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import ApprovalActions from "@/components/ApprovalActions";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function Bonuses() {
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [approvalChain, setApprovalChain] = useState([]);
  const [filteredBonuses, setFilteredBonuses] = useState([]);
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
    const now = new Date();
    setFormData({
      currency: "SAR",
      date: format(now, "yyyy-MM-dd"),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    setShowForm(true);
  };

  const handleEdit = (bonus) => {
    setSelectedBonus(bonus);
    setFormData(bonus);
    setShowForm(true);
  };

  const handleView = async (bonus) => {
    // Generate chain if missing
    if (!bonus.approval_chain || bonus.approval_chain.length === 0) {
        try {
            const chainResponse = await base44.functions.invoke('getApprovalChain', {
                employeeId: bonus.employee_id,
                entity: 'Bonus',
                requiresFinanceApproval: bonus.requires_finance_approval !== false,
            });
            // Update local state
            setSelectedBonus({
                ...bonus,
                approval_chain: chainResponse.data.approvalChain || []
            });
        } catch (error) {
            console.error('Error loading approval chain:', error);
            setSelectedBonus(bonus);
        }
    } else {
        setSelectedBonus(bonus);
    }
    
    setShowViewModal(true);
  };

  const handleDelete = (bonus) => {
    setSelectedBonus(bonus);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.Bonus.delete(selectedBonus.id);
      setBonuses(bonuses.filter((b) => b.id !== selectedBonus.id));
      setShowDeleteDialog(false);
      toast.success("تم حذف المكافأة بنجاح");
    } catch (error) {
      console.error("Error deleting bonus:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleSubmit = async () => {
    if (selectedEmployees.length === 0 || !formData.title || !formData.amount) {
      toast.error("يرجى ملء الحقول المطلوبة واختيار الموظفين");
      return;
    }

    setSaving(true);
    try {
      for (const empId of selectedEmployees) {
        const requestNumberResponse = await base44.functions.invoke('generateRequestNumber', {
          entityName: 'Bonus',
          prefix: 'BON',
        });

        const chainResponse = await base44.functions.invoke('getApprovalChain', {
          employeeId: empId,
          entity: 'Bonus',
          requiresFinanceApproval: true,
        });

        const chain = chainResponse.data.approvalChain || [];

        const dataToSave = {
          request_number: requestNumberResponse.data.requestNumber,
          employee_id: empId,
          title: formData.title,
          amount: Number(formData.amount),
          currency: formData.currency || "SAR",
          date: formData.date,
          month: formData.month,
          year: formData.year,
          reason: formData.reason || "",
          status: "pending",
          requires_finance_approval: true,
          approval_chain: chain,
          current_approval_level: chain[0]?.level,
          current_level_idx: 0,
          current_status_desc: chain[0] 
            ? `جارى الاعتماد من: ${chain[0].level_name}` 
            : 'قيد الانتظار'
        };

        await base44.entities.Bonus.create(dataToSave);
      }

      toast.success(`تم إضافة ${selectedEmployees.length} مكافأة بنجاح`);
      loadData();
      setShowForm(false);
      setSelectedEmployees([]);
    } catch (error) {
      console.error("Error saving bonus:", error);
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
                  title: { type: "string" },
                  amount: { type: "number" },
                  date: { type: "string" },
                  reason: { type: "string" }
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
            const requestNumberResponse = await base44.functions.invoke('generateRequestNumber', {
              entityName: 'Bonus',
              prefix: 'BON',
            });

            const date = new Date(row.date);
            await base44.entities.Bonus.create({
              request_number: requestNumberResponse.data.requestNumber,
              employee_id: emp.id,
              title: row.title,
              amount: row.amount,
              currency: "SAR",
              date: row.date,
              month: date.getMonth() + 1,
              year: date.getFullYear(),
              reason: row.reason || "",
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

  const formatCurrency = (amount, currency = "SAR") => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const exportToCSV = () => {
    const headers = ["رقم الطلب", "الموظف", "العنوان", "المبلغ", "العملة", "التاريخ", "السبب", "الحالة"];
    const rows = bonuses.map((bonus) => [
      bonus.request_number || "",
      getEmployeeName(bonus.employee_id),
      bonus.title || "",
      bonus.amount || 0,
      bonus.currency || "SAR",
      bonus.date || "",
      bonus.reason || "",
      bonus.status || "",
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bonuses_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      header: "العنوان",
      accessor: "title",
    },
    {
      header: "المبلغ",
      accessor: "amount",
      cell: (row) => formatCurrency(row.amount, row.currency),
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
        const canEdit = hasPermission(PERMISSIONS.EDIT_BONUS);
        const canDelete = hasPermission(PERMISSIONS.DELETE_BONUS);

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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة المكافآت</h2>
          <p className="text-gray-500">إدارة مكافآت الموظفين ونظام الاعتمادات</p>
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

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedBonus ? "تعديل المكافأة" : "إضافة مكافأة جديدة"}
        onSubmit={handleSubmit}
        loading={saving}
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
              {(formData.filteredEmployees || filteredEmployees.filter(e => e.status === 'active')).map((emp) => (
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
                    <p className="text-sm text-gray-500">{emp.position} - {emp.department}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>العنوان *</Label>
            <Input
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: مكافأة تميز، مكافأة أداء..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>المبلغ *</Label>
              <Input
                type="number"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
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
                  <SelectItem value="SAR">ريال سعودي</SelectItem>
                  <SelectItem value="EGP">جنيه مصري</SelectItem>
                  <SelectItem value="USD">دولار أمريكي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>التاريخ</Label>
            <Input
              type="date"
              value={formData.date || ""}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFormData({
                  ...formData,
                  date: e.target.value,
                  month: date.getMonth() + 1,
                  year: date.getFullYear(),
                });
              }}
            />
          </div>
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
        title="تفاصيل المكافأة"
        showFooter={false}
        size="lg"
      >
        {selectedBonus && (
          <div className="space-y-4" dir="rtl">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">رقم الطلب</p>
                <p className="font-bold text-lg">{selectedBonus.request_number || "-"}</p>
                <h3 className="font-bold text-gray-800 mt-2">{selectedBonus.title}</h3>
                <p className="text-gray-500">{getEmployeeName(selectedBonus.employee_id)}</p>
              </div>
              <StatusBadge status={selectedBonus.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">المبلغ</p>
                <p className="font-bold text-2xl text-green-600">
                  {formatCurrency(selectedBonus.amount, selectedBonus.currency)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">التاريخ</p>
                <p className="font-medium">
                  {selectedBonus.date ? format(parseISO(selectedBonus.date), "dd/MM/yyyy", { locale: ar }) : "-"}
                </p>
              </div>
            </div>

            {selectedBonus.reason && (
              <div className="space-y-1 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-500">السبب</p>
                <p className="font-medium">{selectedBonus.reason}</p>
              </div>
            )}

            {selectedBonus.status === "pending" && (
              <ApprovalActions
                entityName="Bonus"
                recordId={selectedBonus.id}
                onApproved={() => {
                  loadData();
                  setShowViewModal(false);
                }}
              />
            )}

            {(selectedBonus.approval_chain?.length > 0 || selectedBonus.approval_history?.length > 0) && (
              <div className="border-t pt-4">
                <ApprovalTimeline
                  approvalHistory={selectedBonus.approval_history}
                  approvalChain={selectedBonus.approval_chain}
                  currentLevel={selectedBonus.current_approval_level}
                  status={selectedBonus.status}
                />
              </div>
            )}
          </div>
        )}
      </FormModal>

      <FormModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="استيراد المكافآت"
        showFooter={false}
      >
        <div className="space-y-4" dir="rtl">
          <p className="text-gray-600">قم برفع ملف CSV أو Excel يحتوي على الأعمدة التالية:</p>
          <ul className="text-sm text-gray-600 mr-4 list-disc">
            <li>employee_name (اسم الموظف)</li>
            <li>title (عنوان المكافأة)</li>
            <li>amount (المبلغ)</li>
            <li>date (التاريخ بتنسيق yyyy-mm-dd)</li>
            <li>reason (السبب - اختياري)</li>
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
        title="حذف المكافأة"
        description="هل أنت متأكد من حذف هذه المكافأة؟"
      />
    </div>
  );
}