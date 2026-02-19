import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Shield,
  Search,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  Plus,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/ui/StatCard";
import { format, parseISO, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("7"); // آخر 7 أيام
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { currentUser, hasPermission, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadLogs();
    }
  }, [authLoading, filterDateRange]);

  const loadLogs = async () => {
    if (authLoading) return;
    
    // التحقق من الصلاحية
    if (!hasPermission(PERMISSIONS.MANAGE_ROLES)) {
      toast.error("غير مصرح لك بعرض سجل التدقيق");
      return;
    }

    setLoading(true);
    try {
      const allLogs = await base44.entities.AuditLog.list("-created_at", 1000);
      
      // التحقق من تاريخ الإنشاء (created_at أو created_date)
      const getLogDate = (log) => new Date(log.created_at || log.created_date);

      // تصفية حسب النطاق الزمني
      const daysAgo = parseInt(filterDateRange);
      const cutoffDate = subDays(new Date(), daysAgo);
      
      const filtered = allLogs.filter(log => {
        const logDate = getLogDate(log);
        return logDate >= cutoffDate;
      });

      setLogs(filtered);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast.error("حدث خطأ أثناء تحميل السجلات");
    }
    setLoading(false);
  };

  const getActionLabel = (action) => {
    const labels = {
      delete: "حذف",
      approve: "اعتماد",
      reject: "رفض",
      update: "تعديل",
      create: "إنشاء",
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entityName) => {
    const labels = {
      employees: "الموظفين",
      payroll: "الرواتب",
      leave_requests: "طلبات الإجازة",
      attendance: "الحضور والانصراف",
      contracts: "العقود",
      bonuses: "المكافآت",
      overtime: "الساعات الإضافية",
      resignations: "الاستقالات",
      roles: "الأدوار",
      user_roles: "صلاحيات المستخدمين",
      departments: "الأقسام",
      users: "المستخدمين",
      settings: "الإعدادات",
    };
    return labels[entityName] || entityName;
  };

  const getSeverityBadge = (action) => {
    const config = {
      delete: { label: "حرج", className: "bg-red-100 text-red-800" },
      reject: { label: "عالي", className: "bg-orange-100 text-orange-800" },
      update: { label: "متوسط", className: "bg-blue-100 text-blue-800" },
      approve: { label: "منخفض", className: "bg-green-100 text-green-800" },
      create: { label: "منخفض", className: "bg-emerald-100 text-emerald-800" },
    };
    const { label, className } = config[action] || { label: "متوسط", className: "bg-gray-100 text-gray-800" };
    return <Badge className={className}>{label}</Badge>;
  };

  const getActionBadge = (action) => {
    const config = {
      delete: { label: "حذف", className: "bg-red-100 text-red-800" },
      approve: { label: "اعتماد", className: "bg-green-100 text-green-800" },
      reject: { label: "رفض", className: "bg-orange-100 text-orange-800" },
      update: { label: "تعديل", className: "bg-blue-100 text-blue-800" },
      create: { label: "إضافة", className: "bg-emerald-100 text-emerald-800" },
    };
    const { label, className } = config[action] || { label: action, className: "bg-gray-100 text-gray-800" };
    return <Badge className={className}>{label}</Badge>;
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const exportToCSV = () => {
    const headers = ["التاريخ", "المستخدم", "العملية", "الجدول", "السجل", "IP"];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at || log.created_date), "dd/MM/yyyy HH:mm:ss", { locale: ar }),
      log.user_name || "النظام",
      getActionLabel(log.action),
      getEntityLabel(log.entity_type || log.entity_name),
      log.entity_id || log.record_id || "-",
      log.ip_address || "",
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // تصفية السجلات
  const filteredLogs = logs.filter((log) => {
    const actionMatch = filterAction === "all" || log.action === filterAction;
    const entityMatch = filterEntity === "all" || (log.entity_type || log.entity_name) === filterEntity;
    const searchMatch =
      searchTerm === "" ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());

    return actionMatch && entityMatch && searchMatch;
  });

  // الإحصائيات
  const stats = {
    total: logs.length,
    deletes: logs.filter((l) => l.action === "delete").length,
    approvals: logs.filter((l) => l.action === "approve").length,
    updates: logs.filter((l) => l.action === "update").length,
  };

  const columns = [
    {
      header: "التاريخ والوقت",
      accessor: "created_at",
      cell: (row) =>
        format(new Date(row.created_at || row.created_date), "dd/MM/yyyy HH:mm:ss", { locale: ar }),
    },
    {
      header: "المستخدم",
      accessor: "user_name",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.user_name || <span className="text-gray-400 italic">النظام</span>}</p>
          <p className="text-xs text-gray-500">{row.user_email}</p>
        </div>
      ),
    },
    {
      header: "العملية",
      accessor: "action",
      cell: (row) => getActionBadge(row.action),
    },
    {
      header: "الجدول",
      accessor: "entity_type",
      cell: (row) => getEntityLabel(row.entity_type || row.entity_name),
    },
    {
      header: "معرف السجل",
      accessor: "entity_id",
      cell: (row) => <span className="font-mono text-xs">{row.entity_id || row.record_id || "-"}</span>,
    },
    {
      header: "IP",
      accessor: "ip_address",
      cell: (row) => <span className="text-xs">{row.ip_address || "-"}</span>,
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleViewDetails(row)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  // الجداول المتاحة للتصفية
  const entities = [...new Set(logs.map((l) => l.entity_type || l.entity_name))];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">سجل الرقابة الإدارية</h2>
          <p className="text-gray-500">تتبع جميع العمليات داخل النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي العمليات"
          value={stats.total}
          icon={Shield}
          color="blue"
        />
        <StatCard
          title="عمليات الحذف"
          value={stats.deletes}
          icon={Trash2}
          color="primary"
        />
        <StatCard
          title="الاعتمادات"
          value={stats.approvals}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="عمليات التعديل"
          value={stats.updates}
          icon={Edit}
          color="orange"
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">تصفية:</span>
            </div>
            
            <div className="relative flex-1 min-w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="بحث باسم المستخدم أو الجدول..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">آخر يوم</SelectItem>
                <SelectItem value="7">آخر 7 أيام</SelectItem>
                <SelectItem value="30">آخر 30 يوم</SelectItem>
                <SelectItem value="90">آخر 90 يوم</SelectItem>
                <SelectItem value="365">آخر سنة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="العملية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل العمليات</SelectItem>
                <SelectItem value="delete">حذف</SelectItem>
                <SelectItem value="approve">اعتماد</SelectItem>
                <SelectItem value="reject">رفض</SelectItem>
                <SelectItem value="update">تعديل</SelectItem>
                <SelectItem value="create">إضافة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الجدول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الجداول</SelectItem>
                {entities.filter(e => e).map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    {getEntityLabel(entity)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={filteredLogs}
        columns={columns}
        loading={loading || authLoading}
        showAdd={false}
        searchPlaceholder="بحث..."
        emptyMessage="لا توجد سجلات"
      />

      <FormModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="تفاصيل العملية"
        description="عرض تفاصيل التعديلات والبيانات القديمة والجديدة للسجل المختار"
        showFooter={false}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">التاريخ والوقت</p>
                <p className="font-medium">
                  {format(new Date(selectedLog.created_at || selectedLog.created_date), "dd/MM/yyyy HH:mm:ss", { locale: ar })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">المستخدم</p>
                <p className="font-medium">{selectedLog.user_name || "النظام"}</p>
                <p className="text-xs text-gray-500">{selectedLog.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">العملية</p>
                <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">الجدول المتأثر</p>
                <p className="font-medium">{getEntityLabel(selectedLog.entity_type || selectedLog.entity_name)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">معرف السجل</p>
                <p className="font-medium font-mono text-xs">
                  {selectedLog.entity_id || selectedLog.record_id || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">عنوان IP</p>
                <p className="font-medium font-mono text-xs">{selectedLog.ip_address || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">متصفح المستخدم</p>
                <p className="text-xs bg-gray-50 p-2 rounded border truncate" title={selectedLog.user_agent}>
                  {selectedLog.user_agent || "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">القيم القديمة</p>
                <div className="max-h-64 overflow-y-auto">
                  <pre className="text-[10px] bg-gray-50 p-2 rounded border">
                    {selectedLog.old_values ? 
                      (typeof selectedLog.old_values === 'string' ? 
                        JSON.stringify(JSON.parse(selectedLog.old_values), null, 2) : 
                        JSON.stringify(selectedLog.old_values, null, 2)) 
                      : "لا يوجد بيانات"}
                  </pre>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-2 border-b border-blue-100 pb-1">القيم الجديدة</p>
                <div className="max-h-64 overflow-y-auto">
                  <pre className="text-[10px] bg-blue-50 p-2 rounded border border-blue-100">
                    {selectedLog.new_values ? 
                      (typeof selectedLog.new_values === 'string' ? 
                        JSON.stringify(JSON.parse(selectedLog.new_values), null, 2) : 
                        JSON.stringify(selectedLog.new_values, null, 2)) 
                      : "لا يوجد بيانات"}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}