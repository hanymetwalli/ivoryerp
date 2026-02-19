import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Clock,
  Upload,
  Download,
  Calendar,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  MapPin,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFingerprintImportModal, setShowFingerprintImportModal] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterMonth, setFilterMonth] = useState(format(new Date(), "yyyy-MM"));
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  const { 
    currentUser, 
    userEmployee,
    hasPermission, 
    getDataScope,
    filterEmployees,
    filterEmployeeRelatedData,
    loading: authLoading 
  } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, filterMonth, filterEmployee, currentUser, userEmployee]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.log("Location error:", error)
      );
    }
  }, []);

  const loadData = async () => {
    if (authLoading) return;
    
    setLoading(true);
    try {
      const [attData, empData, scheduleData, locData, statusData] = await Promise.all([
        base44.entities.Attendance.list("-date", 500),
        base44.entities.Employee.list(),
        base44.entities.WorkSchedule.list(),
        base44.entities.WorkLocation.list(),
        base44.entities.AttendanceStatus.list(),
      ]);

      // فلترة الموظفين حسب الصلاحيات
      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_ALL_ATTENDANCE);
      setFilteredEmployees(allowedEmployees);

      const monthStart = startOfMonth(parseISO(filterMonth + "-01"));
      const monthEnd = endOfMonth(monthStart);

      let filtered = attData.filter((a) => {
        const date = parseISO(a.date);
        return date >= monthStart && date <= monthEnd;
      });

      if (filterEmployee !== "all") {
        filtered = filtered.filter((a) => a.employee_id === filterEmployee);
      }

      // فلترة البيانات حسب الموظفين المسموح بهم
      const filteredData = filterEmployeeRelatedData(
        filtered, 
        allowedEmployees, 
        (item) => item.employee_id
      );

      setAttendance(attData);
      setEmployees(empData);
      setWorkSchedules(scheduleData);
      setWorkLocations(locData);
      setAttendanceStatuses(statusData);
      setFilteredAttendance(filteredData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const checkLocationValidity = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee?.work_location_id || !userLocation) {
      return { valid: true, message: "" };
    }

    const workLocation = workLocations.find((l) => l.id === employee.work_location_id);
    if (!workLocation?.latitude) {
      return { valid: true, message: "" };
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      workLocation.latitude,
      workLocation.longitude
    );

    const allowedRadius = workLocation.radius_meters || 100;
    if (distance > allowedRadius) {
      return {
        valid: false,
        message: `الموقع الحالي يبعد ${Math.round(distance)} متر عن مكان العمل المحدد. الحد الأقصى المسموح ${allowedRadius} متر.`,
      };
    }

    return { valid: true, message: "" };
  };

  const handleAdd = () => {
    setSelectedRecord(null);
    setFormData({
      date: format(new Date(), "yyyy-MM-dd"),
      status: "present",
    });
    setShowForm(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData(record);
    setShowForm(true);
  };

  const handleDelete = (record) => {
    setSelectedRecord(record);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const empName = getEmployeeName(selectedRecord.employee_id);
      
      // ✅ تسجيل في Audit Log
      await base44.functions.invoke('logAuditEvent', {
        action: 'delete',
        entity_name: 'Attendance',
        record_id: selectedRecord.id,
        record_identifier: `${empName} - ${selectedRecord.date}`,
        details: `حذف سجل حضور: ${empName} بتاريخ ${selectedRecord.date}`,
        severity: 'high',
      });
      
      await base44.entities.Attendance.delete(selectedRecord.id);
      
      // تحديث القوائم المحلية فوراً
      const updatedAttendance = attendance.filter((a) => a.id !== selectedRecord.id);
      const updatedFiltered = filteredAttendance.filter((a) => a.id !== selectedRecord.id);
      setAttendance(updatedAttendance);
      setFilteredAttendance(updatedFiltered);
      
      setShowDeleteDialog(false);
      toast.success("تم حذف السجل بنجاح");
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const confirmDeleteAll = async () => {
    if (currentUser?.role !== 'admin') {
      toast.error("غير مصرح لك بهذا الإجراء");
      setShowDeleteAllDialog(false);
      return;
    }
    
    setSaving(true);
    try {
      // جلب جميع السجلات بدفعات كبيرة
      const allRecords = await base44.entities.Attendance.list('-created_date', 10000);
      
      if (allRecords.length === 0) {
        toast.info("لا توجد سجلات لحذفها");
        setShowDeleteAllDialog(false);
        setSaving(false);
        return;
      }
      
      let deletedCount = 0;
      const batchSize = 50; // حذف 50 سجل في المرة الواحدة
      
      for (let i = 0; i < allRecords.length; i += batchSize) {
        const batch = allRecords.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (record) => {
            try {
              await base44.entities.Attendance.delete(record.id);
              deletedCount++;
            } catch (err) {
              console.error(`Error deleting record ${record.id}:`, err);
            }
          })
        );
        
        // إظهار التقدم
        if (i + batchSize < allRecords.length) {
          toast.loading(`جاري الحذف... ${deletedCount}/${allRecords.length}`);
        }
      }
      
      setShowDeleteAllDialog(false);
      toast.success(`تم حذف ${deletedCount} سجل بنجاح من أصل ${allRecords.length}`);
      await loadData();
    } catch (error) {
      console.error("Error deleting all records:", error);
      toast.error("حدث خطأ أثناء حذف السجلات: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.date) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    const locationCheck = checkLocationValidity(formData.employee_id);
    if (!locationCheck.valid) {
      toast.error(locationCheck.message);
      return;
    }

    setSaving(true);
    try {
      // استدعاء Backend لحساب المقاييس
      let metrics = {
        late_minutes: 0,
        is_late: false,
        working_hours: 0,
        overtime_hours: 0,
      };

      if (formData.check_in_time) {
        try {
          const metricsResponse = await base44.functions.invoke('calculateAttendanceMetrics', {
            employee_id: formData.employee_id,
            date: formData.date,
            check_in_time: formData.check_in_time,
            check_out_time: formData.check_out_time || null,
          });

          if (metricsResponse.data.success) {
            metrics = metricsResponse.data.metrics;
          }
        } catch (error) {
          console.error("Error calculating metrics:", error);
          toast.error("تحذير: فشل حساب المقاييس - سيتم الحفظ بدون حساب تلقائي");
        }
      }

      const dataToSave = {
        employee_id: formData.employee_id,
        date: formData.date,
        check_in_time: formData.check_in_time || null,
        check_out_time: formData.check_out_time || null,
        status: formData.status || "present",
        notes: formData.notes || "",
        late_minutes: metrics.late_minutes,
        is_late: metrics.is_late,
        working_hours: metrics.working_hours,
        overtime_hours: metrics.overtime_hours,
        source: "manual",
      };

      if (selectedRecord) {
        await base44.entities.Attendance.update(selectedRecord.id, dataToSave);
        toast.success("تم تحديث السجل بنجاح");
      } else {
        await base44.entities.Attendance.create(dataToSave);
        toast.success("تمت إضافة السجل بنجاح");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  const downloadTemplate = () => {
    const template = "رقم الموظف,التاريخ (YYYY-MM-DD),وقت الحضور (HH:MM),وقت الانصراف (HH:MM),الحالة\n";
    const blob = new Blob(["\ufeff" + template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ["الموظف", "التاريخ", "الحضور", "الانصراف", "ساعات العمل", "التأخير (دقيقة)", "الحالة", "ملاحظات"];
    const rows = attendance.map((att) => [
      getEmployeeName(att.employee_id),
      att.date || "",
      att.check_in_time || "",
      att.check_out_time || "",
      att.working_hours || "",
      att.late_minutes || 0,
      attendanceStatuses.find(s => s.code === att.status)?.name || att.status,
      att.notes || "",
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    totalPresent: attendance.filter((a) => a.status === "present").length,
    totalAbsent: attendance.filter((a) => a.status === "absent").length,
    totalLate: attendance.filter((a) => (a.late_minutes || 0) > 0).length,
    totalLeave: attendance.filter((a) => a.status === "leave").length,
  };

  const columns = [
    {
      header: "الموظف",
      accessor: "employee_id",
      cell: (row) => getEmployeeName(row.employee_id),
    },
    {
      header: "التاريخ",
      accessor: "date",
      cell: (row) =>
        row.date ? format(parseISO(row.date), "EEEE, d MMM yyyy", { locale: ar }) : "-",
    },
    {
      header: "الحضور",
      accessor: "check_in_time",
      cell: (row) => row.check_in_time || "-",
    },
    {
      header: "الانصراف",
      accessor: "check_out_time",
      cell: (row) => row.check_out_time || "-",
    },
    {
      header: "ساعات العمل",
      accessor: "working_hours",
      cell: (row) => (row.working_hours ? `${row.working_hours.toFixed(2)} ساعة` : "-"),
    },
    {
      header: "ساعات إضافية",
      accessor: "overtime_hours",
      cell: (row) => row.overtime_hours > 0 ? (
        <span className="text-green-600 font-semibold">{row.overtime_hours.toFixed(2)} ساعة</span>
      ) : "-",
    },
    {
      header: "التأخير",
      accessor: "late_minutes",
      cell: (row) =>
        row.late_minutes > 0 ? (
          <span className="text-red-600">{row.late_minutes} دقيقة</span>
        ) : (
          <span className="text-green-600">0</span>
        ),
    },
    {
      header: "الحالة",
      accessor: "status",
      cell: (row) => {
        const statusObj = attendanceStatuses.find(s => s.code === row.status);
        return <StatusBadge status={row.status} customLabel={statusObj?.name} />;
      },
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => {
        const canEditRow = hasPermission(PERMISSIONS.EDIT_ATTENDANCE);
        const canDeleteRow = hasPermission(PERMISSIONS.DELETE_ATTENDANCE);

        if (!canEditRow && !canDeleteRow) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {canEditRow && (
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
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
          <h2 className="text-2xl font-bold text-gray-800">الحضور والانصراف</h2>
          <p className="text-gray-500">إدارة سجلات الحضور والانصراف للموظفين</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFingerprintImportModal(true)}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد من البصمة
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد عادي
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
          {currentUser?.role === 'admin' && (
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteAllDialog(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف الكل
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="الحضور" value={stats.totalPresent} icon={CheckCircle} color="green" />
        <StatCard title="الغياب" value={stats.totalAbsent} icon={AlertCircle} color="primary" />
        <StatCard title="التأخير" value={stats.totalLate} icon={Clock} color="orange" />
        <StatCard title="الإجازات" value={stats.totalLeave} icon={Calendar} color="blue" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">تصفية:</span>
            </div>
            <div>
              <Input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="جميع الموظفين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموظفين</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      <DataTable
        data={filteredAttendance}
        columns={columns}
        loading={loading || authLoading}
        onAdd={hasPermission(PERMISSIONS.ADD_ATTENDANCE) ? handleAdd : undefined}
        addButtonText="إضافة سجل"
        searchPlaceholder="بحث..."
        emptyMessage="لا توجد سجلات"
        showAdd={hasPermission(PERMISSIONS.ADD_ATTENDANCE)}
      />

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedRecord ? "تعديل سجل الحضور" : "إضافة سجل حضور"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="space-y-4" dir="rtl">
          <div>
            <Label>الموظف *</Label>
            <Select
              value={formData.employee_id || ""}
              onValueChange={(v) => setFormData({ ...formData, employee_id: v })}
              disabled={!!selectedRecord}
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
            <Label>التاريخ *</Label>
            <Input
              type="date"
              value={formData.date || ""}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              disabled={!!selectedRecord}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>وقت الحضور</Label>
              <Input
                type="time"
                value={formData.check_in_time || ""}
                onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
              />
            </div>
            <div>
              <Label>وقت الانصراف</Label>
              <Input
                type="time"
                value={formData.check_out_time || ""}
                onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>الحالة</Label>
            <Select
              value={formData.status || "present"}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {attendanceStatuses.filter(s => s.status === 'active').map((status) => (
                  <SelectItem key={status.id} value={status.code}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Input
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          {formData.employee_id && (() => {
            const employee = employees.find(e => e.id === formData.employee_id);
            const workLocation = workLocations.find(l => l.id === employee?.work_location_id);
            
            return (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    {workLocation?.latitude ? (
                      userLocation ? (
                        <p className="text-blue-800">
                          ✓ تم التحقق من الموقع. المسافة:{" "}
                          {Math.round(
                            calculateDistance(
                              userLocation.latitude,
                              userLocation.longitude,
                              workLocation.latitude,
                              workLocation.longitude
                            )
                          )}{" "}
                          متر من {workLocation.name}
                        </p>
                      ) : (
                        <p className="text-blue-800">جاري تحديد موقعك...</p>
                      )
                    ) : (
                      <p className="text-blue-800">لا يوجد موقع عمل محدد لهذا الموظف</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </FormModal>

      <FormModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="استيراد سجلات الحضور"
        showFooter={false}
      >
        <div className="space-y-4" dir="rtl">
          <p className="text-gray-600">
            يمكنك استيراد سجلات الحضور من ملف Excel أو CSV. قم بتحميل القالب أولاً وملء البيانات.
          </p>
          <Button variant="outline" onClick={downloadTemplate} className="w-full">
            <Download className="w-4 h-4 ml-2" />
            تحميل قالب CSV
          </Button>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">اسحب الملف هنا أو انقر للاختيار</p>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="mt-2"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
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
                                employee_number: { type: "string" },
                                date: { type: "string" },
                                check_in_time: { type: "string" },
                                check_out_time: { type: "string" },
                                status: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    });
                    if (result.status === "success" && result.output?.data) {
                      let successCount = 0;
                      for (const record of result.output.data) {
                        const emp = employees.find((e) => e.employee_number === record.employee_number);
                        if (emp) {
                          await base44.entities.Attendance.create({
                            employee_id: emp.id,
                            date: record.date,
                            check_in_time: record.check_in_time,
                            check_out_time: record.check_out_time,
                            status: record.status || "present",
                          });
                          successCount++;
                        }
                      }
                      loadData();
                      setShowImportModal(false);
                      toast.success(`تم استيراد ${successCount} سجل بنجاح`);
                    }
                  } catch (error) {
                    console.error("Import error:", error);
                    toast.error("حدث خطأ أثناء الاستيراد");
                  }
                }
              }}
            />
          </div>
        </div>
      </FormModal>

      <FormModal
        open={showFingerprintImportModal}
        onClose={() => {
          setShowFingerprintImportModal(false);
          setImportReport(null);
        }}
        title="استيراد سجلات أجهزة البصمة"
        showFooter={false}
        size="lg"
      >
        <div className="space-y-4" dir="rtl">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">تعليمات الاستيراد</h4>
            <ul className="text-sm text-blue-800 space-y-1 mr-4 list-disc">
              <li>قم برفع ملف Excel من جهاز البصمة</li>
              <li>يجب أن يحتوي الملف على الأعمدة: AC-No, Name, Department, Date, Time</li>
              <li>سيتم مطابقة AC-No مع الرقم الوظيفي للموظف</li>
              <li>سيتم تحليل عمود Time لاستخراج وقت الحضور والانصراف تلقائياً</li>
              <li>إذا كان السجل موجود مسبقاً، سيتم تحديثه بدلاً من إنشاء جديد</li>
            </ul>
          </div>

          <div>
            <Label>اختر ملف Excel</Label>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSaving(true);
                  setImportReport(null);
                  try {
                    // تحويل الملف لـ Base64 لإرساله عبر الـ API المحلي بسهولة
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = async () => {
                      try {
                        const base64File = reader.result;
                        
                        const response = await base44.functions.invoke('importFingerprintLogsSimple', {
                          file_name: file.name,
                          file_data: base64File
                        });

                        if (response?.data?.success) {
                          setImportReport(response.data.report);
                          toast.success(`تم معالجة ${response.data.report.processed} سجل بنجاح`);
                          await loadData();
                        } else {
                          const errorMsg = response?.data?.error || "تعذر معالجة الملف. تأكد من صيغة البيانات.";
                          toast.error(errorMsg);
                          setImportReport({ 
                            total: 0, processed: 0, created: 0, updated: 0, skipped: 0, 
                            errors: [errorMsg] 
                          });
                        }
                      } catch (err) {
                        console.error("Internal import error:", err);
                        toast.error("حدث خطأ تقني أثناء معالجة الملف");
                      } finally {
                        setSaving(false);
                      }
                    };
                  } catch (error) {
                    console.error("Fingerprint import error:", error);
                    const errorMessage = error.response?.data?.error || error.message || "حدث خطأ أثناء استيراد سجلات البصمة";
                    toast.error(errorMessage);
                    setSaving(false);
                  }
                }
              }}
              disabled={saving}
            />
          </div>

          {saving && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c3238]"></div>
              <span className="mr-3 text-gray-600">جاري معالجة البيانات...</span>
            </div>
          )}

          {importReport && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-lg">تقرير الاستيراد</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">إجمالي السجلات</p>
                  <p className="text-2xl font-bold text-blue-600">{importReport.total}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">تمت معالجتها</p>
                  <p className="text-2xl font-bold text-green-600">{importReport.processed}</p>
                </div>
                
                <div className="bg-emerald-50 p-3 rounded">
                  <p className="text-sm text-gray-600">سجلات جديدة</p>
                  <p className="text-2xl font-bold text-emerald-600">{importReport.created}</p>
                </div>
                
                <div className="bg-amber-50 p-3 rounded">
                  <p className="text-sm text-gray-600">سجلات محدثة</p>
                  <p className="text-2xl font-bold text-amber-600">{importReport.updated}</p>
                </div>
                
                {importReport.skipped > 0 && (
                  <div className="bg-red-50 p-3 rounded col-span-2">
                    <p className="text-sm text-gray-600">تم تخطيها</p>
                    <p className="text-2xl font-bold text-red-600">{importReport.skipped}</p>
                  </div>
                )}
              </div>

              {importReport.errors && importReport.errors.length > 0 && (
                <div className="border-t pt-3">
                  <h5 className="font-semibold text-red-600 mb-2">الأخطاء ({importReport.errors.length})</h5>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importReport.errors.map((error, idx) => (
                      <p key={idx} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => {
                  setShowFingerprintImportModal(false);
                  setImportReport(null);
                }}
                className="w-full"
              >
                إغلاق
              </Button>
            </div>
          )}
        </div>
      </FormModal>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف سجل الحضور"
        description="هل أنت متأكد من حذف هذا السجل؟"
      />

      <ConfirmDialog
        open={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        onConfirm={confirmDeleteAll}
        title="حذف جميع سجلات الحضور"
        description="⚠️ تحذير: هذا الإجراء سيحذف جميع سجلات الحضور بشكل دائم ولا يمكن التراجع عنه. هل أنت متأكد؟"
        loading={saving}
        destructive
      />
    </div>
  );
}