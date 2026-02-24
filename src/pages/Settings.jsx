import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Settings as SettingsIcon,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  DollarSign,
  Clock,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Globe,
  MapPin,
  CheckSquare,
  Award,
  Landmark,
  Users,
  GitBranch,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

const LOCATION_LABELS = {
  saudi_madd: "منصة مدد - السعودية",
  egypt: "مصر",
  remote: "عمل عن بُعد",
};

export default function Settings() {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);
  const [insuranceSettings, setInsuranceSettings] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [trainings, setTrainings] = useState([]);

  const [systemSettings, setSystemSettings] = useState({});
  const [roles, setRoles] = useState([]);
  const [workflowBlueprints, setWorkflowBlueprints] = useState([]);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState("");
  const [currentWorkflowSteps, setCurrentWorkflowSteps] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("departments");

  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentEntity, setCurrentEntity] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const [banks, setBanks] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [attendanceStatuses, setAttendanceStatuses] = useState([]);
  const [trainingStatuses, setTrainingStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [workLocations, setWorkLocations] = useState([]);

  const { hasPermission, loading: authLoading } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        deptData,
        posData,
        leaveData,
        contractData,
        allowanceData,
        deductionData,
        insData,
        scheduleData,
        trainingData,
        bankData,
        natData,
        attStatusData,
        trainStatusData,
        empData,

        locData,
        sysData,
      ] = await Promise.all([
        base44.entities.Department.list("-created_date"),
        base44.entities.Position.list("-created_date"),
        base44.entities.LeaveType.list("-created_date"),
        base44.entities.ContractType.list("-created_date"),
        base44.entities.AllowanceType.list("-created_date"),
        base44.entities.DeductionType.list("-created_date"),
        base44.entities.InsuranceSettings.list("-year"),
        base44.entities.WorkSchedule.list("-created_date"),
        base44.entities.Training.list("-created_date"),
        base44.entities.BankName.list("-created_date"),
        base44.entities.Nationality.list("-created_date"),
        base44.entities.AttendanceStatus.list("-created_date"),
        base44.entities.TrainingStatus.list("-created_date"),
        base44.entities.Employee.list(),

        base44.entities.WorkLocation.list(),
        base44.entities.SystemSettings.list(),
      ]);
      setDepartments(deptData);
      setPositions(posData);
      setLeaveTypes(leaveData);
      setContractTypes(contractData);
      setAllowanceTypes(allowanceData);
      setDeductionTypes(deductionData);
      setInsuranceSettings(insData);
      setWorkSchedules(scheduleData);
      setTrainings(trainingData);
      setBanks(bankData);
      setNationalities(natData);
      setAttendanceStatuses(attStatusData);
      setTrainingStatuses(trainStatusData);
      setEmployees(empData);
      setWorkLocations(locData);
      setSystemSettings(sysData);

      // Fetch roles and workflows
      const [rolesData, workflowsData] = await Promise.all([
        base44.entities.Role.list(),
        base44.entities.WorkflowSettings.list()
      ]);
      setRoles(rolesData);
      setWorkflowBlueprints(workflowsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleAdd = (entity) => {
    setCurrentEntity(entity);
    setSelectedItem(null);
    setFormData({ status: "active" });
    setShowForm(true);
  };

  const handleEdit = (item, entity) => {
    setCurrentEntity(entity);
    setSelectedItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = (item, entity) => {
    setCurrentEntity(entity);
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const getEntitySDK = () => {
    switch (currentEntity) {
      case "Position": return base44.entities.Position;
      case "LeaveType": return base44.entities.LeaveType;
      case "ContractType": return base44.entities.ContractType;
      case "AllowanceType": return base44.entities.AllowanceType;
      case "DeductionType": return base44.entities.DeductionType;
      case "InsuranceSettings": return base44.entities.InsuranceSettings;
      case "WorkSchedule": return base44.entities.WorkSchedule;
      case "Training": return base44.entities.Training;
      case "BankName": return base44.entities.BankName;
      case "Nationality": return base44.entities.Nationality;
      case "AttendanceStatus": return base44.entities.AttendanceStatus;
      case "TrainingStatus": return base44.entities.TrainingStatus;
      default: return null;
    }
  };

  const confirmDelete = async () => {
    try {
      const sdk = getEntitySDK();
      await sdk.delete(selectedItem.id);
      loadData();
      setShowDeleteDialog(false);
      toast.success("تم الحذف بنجاح");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const sdk = getEntitySDK();
      if (selectedItem) {
        await sdk.update(selectedItem.id, formData);
      } else {
        await sdk.create(formData);
      }
      loadData();
      setShowForm(false);
      toast.success(selectedItem ? "تم التحديث بنجاح" : "تمت الإضافة بنجاح");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  const handleSaveSystemSetting = async (key, value, type = 'string') => {
    setSaving(true);
    try {
      await base44.entities.SystemSettings.create({
        setting_key: key,
        setting_value: value,
        setting_type: type
      });
      toast.success("تم تحديث الإعداد بنجاح");
      loadData(); // Reload to refresh
    } catch (error) {
      console.error("Error saving setting:", error);
      toast.error("فشل تحديث الإعداد");
    }
    setSaving(false);
  };

  const createColumns = (entity) => {
    const baseColumns = [
      {
        header: "الاسم",
        accessor: "name",
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
          const canEdit = hasPermission(PERMISSIONS.EDIT_SETTINGS);
          const canDelete = hasPermission(PERMISSIONS.EDIT_SETTINGS);

          if (!canEdit && !canDelete) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {canEdit && (
                  <DropdownMenuItem onClick={() => handleEdit(row, entity)}>
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => handleDelete(row, entity)}
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

    if (entity === "LeaveType") {
      return [
        baseColumns[0],
        {
          header: "الرصيد الافتراضي",
          accessor: "default_balance",
          cell: (row) => `${row.default_balance} يوم`,
        },
        {
          header: "مدفوعة",
          accessor: "is_paid",
          cell: (row) => (row.is_paid ? "نعم" : "لا"),
        },
        baseColumns[1],
        baseColumns[2],
      ];
    }

    if (entity === "InsuranceSettings") {
      return [
        {
          header: "السنة",
          accessor: "year",
        },
        {
          header: "الموقع",
          accessor: "location_type",
          cell: (row) => LOCATION_LABELS[row.location_type] || row.location_type,
        },
        {
          header: "نسبة الموظف",
          accessor: "employee_percentage",
          cell: (row) => `${row.employee_percentage}%`,
        },
        {
          header: "نسبة الشركة",
          accessor: "company_percentage",
          cell: (row) => `${row.company_percentage || 0}%`,
        },
        baseColumns[1],
        baseColumns[2],
      ];
    }

    if (entity === "WorkSchedule") {
      return [
        baseColumns[0],
        {
          header: "مكان العمل",
          accessor: "work_location_id",
          cell: (row) => {
            const loc = workLocations.find(l => l.id === row.work_location_id);
            return loc?.name || "-";
          },
        },
        {
          header: "النوع",
          accessor: "schedule_type",
          cell: (row) => row.schedule_type === 'flexible' ? "مرن" : "ثابت",
        },
        {
          header: "بداية الدوام",
          accessor: "start_time",
          cell: (row) => row.schedule_type === 'flexible' ? "-" : (row.start_time || "-")
        },
        {
          header: "نهاية الدوام",
          accessor: "end_time",
          cell: (row) => row.schedule_type === 'flexible' ? "-" : (row.end_time || "-")
        },
        {
          header: "الساعات المطلوبة",
          accessor: "total_hours",
          cell: (row) => row.schedule_type === 'flexible' ? `${row.total_hours || 8} س` : "-",
        },
        {
          header: "فترة السماح",
          accessor: "grace_period_minutes",
          cell: (row) => `${row.grace_period_minutes || 0} دقيقة`,
        },
        {
          header: "رمضان",
          accessor: "ramadan",
          cell: (row) => row.ramadan_start_date ? "✅ مفعل" : "❌ غير محدد",
        },
        baseColumns[1],
        baseColumns[2],
      ];
    }

    if (entity === "Training") {
      return [
        baseColumns[0],
        {
          header: "الجهة المقدمة",
          accessor: "provider",
        },
        {
          header: "المدة",
          accessor: "duration_hours",
          cell: (row) => row.duration_hours ? `${row.duration_hours} ساعة` : "-",
        },
        baseColumns[1],
        baseColumns[2],
      ];
    }

    return baseColumns;
  };

  const renderForm = () => {
    switch (currentEntity) {
      case "Position":
      case "ContractType":
      case "AllowanceType":
      case "DeductionType":
        return (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>الاسم *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>الرمز</Label>
              <Input
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "BankName":
      case "Nationality":
      case "AttendanceStatus":
      case "TrainingStatus":
        return (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>الاسم *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>الرمز</Label>
              <Input
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            {currentEntity === "AttendanceStatus" && (
              <div>
                <Label>اللون (Hex Code)</Label>
                <Input
                  value={formData.color || ""}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#22c55e"
                />
              </div>
            )}
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
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );



      case "LeaveType":
        return (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>اسم نوع الإجازة *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>الرمز</Label>
              <Input
                value={formData.code || ""}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الرصيد الافتراضي السنوي *</Label>
                <Input
                  type="number"
                  value={formData.default_balance || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, default_balance: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>الحد الأدنى لعدد الأيام</Label>
                <Input
                  type="number"
                  value={formData.min_days || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, min_days: Number(e.target.value) })
                  }
                  placeholder="1"
                />
              </div>
            </div>
            <div>
              <Label>الحد الأقصى للأيام المتتالية</Label>
              <Input
                type="number"
                value={formData.max_consecutive_days || ""}
                onChange={(e) =>
                  setFormData({ ...formData, max_consecutive_days: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>إجازة مدفوعة</Label>
              <Switch
                checked={formData.is_paid !== false}
                onCheckedChange={(v) => setFormData({ ...formData, is_paid: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>تتطلب مستند</Label>
              <Switch
                checked={formData.requires_document === true}
                onCheckedChange={(v) => setFormData({ ...formData, requires_document: v })}
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
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "InsuranceSettings":
        return (
          <div className="space-y-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>السنة *</Label>
                <Input
                  type="number"
                  value={formData.year || new Date().getFullYear()}
                  onChange={(e) =>
                    setFormData({ ...formData, year: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>الموقع *</Label>
                <Select
                  value={formData.location_type || ""}
                  onValueChange={(v) => setFormData({ ...formData, location_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saudi_madd">منصة مدد - السعودية</SelectItem>
                    <SelectItem value="egypt">مصر</SelectItem>
                    <SelectItem value="remote">عمل عن بُعد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نسبة خصم الموظف % *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.employee_percentage || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_percentage: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>نسبة الشركة %</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.company_percentage || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, company_percentage: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <Label>الحد الأقصى للراتب المؤمن عليه</Label>
              <Input
                type="number"
                value={formData.max_insurable_salary || ""}
                onChange={(e) =>
                  setFormData({ ...formData, max_insurable_salary: Number(e.target.value) })
                }
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
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "WorkSchedule":
        return (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>اسم جدول العمل *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>مكان العمل</Label>
              <Select
                value={formData.work_location_id || ""}
                onValueChange={(v) => setFormData({ ...formData, work_location_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مكان العمل" />
                </SelectTrigger>
                <SelectContent>
                  {workLocations.filter(l => l.status === 'active').map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع الدوام</Label>
              <Select
                value={formData.schedule_type || "fixed"}
                onValueChange={(v) => setFormData({ ...formData, schedule_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">دوام ثابت (بمواعيد حضور وانصراف)</SelectItem>
                  <SelectItem value="flexible">دوام مرن (ساعات محددة بدون وقت ثابت)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.schedule_type === 'flexible' && (
              <div>
                <Label>عدد ساعات العمل المطلوبة يومياً *</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.total_hours || 8}
                  onChange={(e) => setFormData({ ...formData, total_hours: Number(e.target.value) })}
                  placeholder="مثلاً: 8"
                />
              </div>
            )}
            {formData.schedule_type === "fixed" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>وقت الحضور *</Label>
                  <Input
                    type="time"
                    value={formData.start_time || ""}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>وقت الانصراف *</Label>
                  <Input
                    type="time"
                    value={formData.end_time || ""}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div>
              <Label>فترة السماح (بالدقائق)</Label>
              <Input
                type="number"
                value={formData.grace_period_minutes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, grace_period_minutes: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>أيام العمل في الأسبوع</Label>
              <div className="border rounded-lg p-3 space-y-2">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                  const arabicDays = {
                    Sunday: "الأحد",
                    Monday: "الاثنين",
                    Tuesday: "الثلاثاء",
                    Wednesday: "الأربعاء",
                    Thursday: "الخميس",
                    Friday: "الجمعة",
                    Saturday: "السبت",
                  };
                  return (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.working_days || []).includes(day)}
                        onChange={(e) => {
                          const days = formData.working_days || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, working_days: [...days, day] });
                          } else {
                            setFormData({
                              ...formData,
                              working_days: days.filter((d) => d !== day),
                            });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{arabicDays[day]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-xl">🌙</span> إعدادات شهر رمضان (مواعيد خاصة)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>تاريخ بداية رمضان</Label>
                  <Input
                    type="date"
                    value={formData.ramadan_start_date || ""}
                    onChange={(e) => setFormData({ ...formData, ramadan_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>تاريخ نهاية رمضان</Label>
                  <Input
                    type="date"
                    value={formData.ramadan_end_date || ""}
                    onChange={(e) => setFormData({ ...formData, ramadan_end_date: e.target.value })}
                  />
                </div>
              </div>

              {formData.schedule_type === "fixed" ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>بداية الدوام في رمضان</Label>
                    <Input
                      type="time"
                      value={formData.ramadan_start_time || ""}
                      onChange={(e) => setFormData({ ...formData, ramadan_start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>نهاية الدوام في رمضان</Label>
                    <Input
                      type="time"
                      value={formData.ramadan_end_time || ""}
                      onChange={(e) => setFormData({ ...formData, ramadan_end_time: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <Label>عدد ساعات العمل في رمضان</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.ramadan_total_hours || ""}
                    onChange={(e) => setFormData({ ...formData, ramadan_total_hours: e.target.value ? Number(e.target.value) : null })}
                    placeholder="مثلاً: 6"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    عدد الساعات المطلوبة يومياً خلال شهر رمضان.
                  </p>
                </div>
              )}
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
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "Training":
        return (
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>اسم الدورة *</Label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>الجهة المقدمة</Label>
              <Input
                value={formData.provider || ""}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label>المدة بالساعات</Label>
              <Input
                type="number"
                value={formData.duration_hours || ""}
                onChange={(e) =>
                  setFormData({ ...formData, duration_hours: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>التصنيف</Label>
              <Input
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getFormTitle = () => {
    const titles = {
      Position: selectedItem ? "تعديل المنصب" : "إضافة منصب جديد",
      LeaveType: selectedItem ? "تعديل نوع الإجازة" : "إضافة نوع إجازة جديد",
      ContractType: selectedItem ? "تعديل نوع العقد" : "إضافة نوع عقد جديد",
      AllowanceType: selectedItem ? "تعديل نوع العلاوة" : "إضافة نوع علاوة جديد",
      DeductionType: selectedItem ? "تعديل نوع الخصم" : "إضافة نوع خصم جديد",
      InsuranceSettings: selectedItem ? "تعديل إعدادات التأمين" : "إضافة إعدادات تأمين",
      WorkSchedule: selectedItem ? "تعديل جدول العمل" : "إضافة جدول عمل جديد",
      Training: selectedItem ? "تعديل الدورة" : "إضافة دورة جديدة",
      BankName: selectedItem ? "تعديل البنك" : "إضافة بنك جديد",
      Nationality: selectedItem ? "تعديل الجنسية" : "إضافة جنسية جديدة",
      AttendanceStatus: selectedItem ? "تعديل حالة الحضور" : "إضافة حالة حضور جديدة",
      TrainingStatus: selectedItem ? "تعديل حالة التدريب" : "إضافة حالة تدريب جديدة",
    };
    return titles[currentEntity] || "";
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">الإعدادات</h2>
        <p className="text-gray-500">إدارة إعدادات النظام والقوائم الديناميكية</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="departments" className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            الأقسام
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-1">
            <SettingsIcon className="w-4 h-4" />
            إعدادات عامة
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            المناصب
          </TabsTrigger>
          <TabsTrigger value="leaveTypes" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            أنواع الإجازات
          </TabsTrigger>
          <TabsTrigger value="contractTypes" className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            أنواع العقود
          </TabsTrigger>
          <TabsTrigger value="allowanceTypes" className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            أنواع العلاوات
          </TabsTrigger>
          <TabsTrigger value="deductionTypes" className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            أنواع الخصومات
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            التأمينات
          </TabsTrigger>
          <TabsTrigger value="workSchedules" className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            جداول العمل
          </TabsTrigger>
          <TabsTrigger value="trainings" className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            الدورات
          </TabsTrigger>
          <TabsTrigger value="banks" className="flex items-center gap-1">
            <Landmark className="w-4 h-4" />
            البنوك
          </TabsTrigger>
          <TabsTrigger value="nationalities" className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            الجنسيات
          </TabsTrigger>
          <TabsTrigger value="attendanceStatuses" className="flex items-center gap-1">
            <CheckSquare className="w-4 h-4" />
            حالات الحضور
          </TabsTrigger>
          <TabsTrigger value="trainingStatuses" className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            حالات التدريب
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            الأدوار والصلاحيات
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            إدارة المستخدمين
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-1">
            <GitBranch className="w-4 h-4" />
            مسارات الاعتماد
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الاستئذان</CardTitle>
              <CardDescription>تحكم في سياسات وآليات طلبات الاستئذان للموظفين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="monthly_limit">الحد الأقصى للاستئذان الشهري (بالدقائق)</Label>
                  <Input
                    id="monthly_limit"
                    type="number"
                    placeholder="مثال: 120"
                    defaultValue={systemSettings.monthly_permission_limit_minutes || 120}
                    onChange={(e) => setSystemSettings({ ...systemSettings, monthly_permission_limit_minutes: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    رصيد الدقائق المتاح للموظف خلال الشهر الواحد. القيمة الافتراضية 120 دقيقة.
                  </p>
                </div>
                <Button
                  onClick={() => handleSaveSystemSetting('monthly_permission_limit_minutes', systemSettings.monthly_permission_limit_minutes, 'number')}
                  disabled={saving}
                >
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center space-y-4">
            <Building2 className="w-16 h-16 mx-auto text-[#7c3238]" />
            <h3 className="text-xl font-bold">الهيكل الإداري</h3>
            <p className="text-gray-600">إدارة الأقسام الرئيسية والفرعية والهيكل التنظيمي</p>
            <Link to={createPageUrl("OrganizationalStructure")}>
              <Button className="bg-[#7c3238] hover:bg-[#5a252a]">
                انتقل إلى الهيكل الإداري
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="mt-4">
          <DataTable
            data={positions}
            columns={createColumns("Position")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("Position") : undefined}
            addButtonText="إضافة منصب"
            emptyMessage="لا توجد مناصب"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="leaveTypes" className="mt-4">
          <DataTable
            data={leaveTypes}
            columns={createColumns("LeaveType")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("LeaveType") : undefined}
            addButtonText="إضافة نوع إجازة"
            emptyMessage="لا توجد أنواع إجازات"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="contractTypes" className="mt-4">
          <DataTable
            data={contractTypes}
            columns={createColumns("ContractType")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("ContractType") : undefined}
            addButtonText="إضافة نوع عقد"
            emptyMessage="لا توجد أنواع عقود"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="allowanceTypes" className="mt-4">
          <DataTable
            data={allowanceTypes}
            columns={createColumns("AllowanceType")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("AllowanceType") : undefined}
            addButtonText="إضافة نوع علاوة"
            emptyMessage="لا توجد أنواع علاوات"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="deductionTypes" className="mt-4">
          <DataTable
            data={deductionTypes}
            columns={createColumns("DeductionType")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("DeductionType") : undefined}
            addButtonText="إضافة نوع خصم"
            emptyMessage="لا توجد أنواع خصومات"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="insurance" className="mt-4">
          <DataTable
            data={insuranceSettings}
            columns={createColumns("InsuranceSettings")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("InsuranceSettings") : undefined}
            addButtonText="إضافة إعدادات تأمين"
            emptyMessage="لا توجد إعدادات تأمين"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="workSchedules" className="mt-4">
          <DataTable
            data={workSchedules}
            columns={createColumns("WorkSchedule")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("WorkSchedule") : undefined}
            addButtonText="إضافة جدول عمل"
            emptyMessage="لا توجد جداول عمل"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="trainings" className="mt-4">
          <DataTable
            data={trainings}
            columns={createColumns("Training")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("Training") : undefined}
            addButtonText="إضافة دورة"
            emptyMessage="لا توجد دورات"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="banks" className="mt-4">
          <DataTable
            data={banks}
            columns={createColumns("BankName")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("BankName") : undefined}
            addButtonText="إضافة بنك"
            emptyMessage="لا توجد بنوك"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="nationalities" className="mt-4">
          <DataTable
            data={nationalities}
            columns={createColumns("Nationality")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("Nationality") : undefined}
            addButtonText="إضافة جنسية"
            emptyMessage="لا توجد جنسيات"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="attendanceStatuses" className="mt-4">
          <DataTable
            data={attendanceStatuses}
            columns={createColumns("AttendanceStatus")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("AttendanceStatus") : undefined}
            addButtonText="إضافة حالة"
            emptyMessage="لا توجد حالات"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="trainingStatuses" className="mt-4">
          <DataTable
            data={trainingStatuses}
            columns={createColumns("TrainingStatus")}
            loading={loading || authLoading}
            onAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS) ? () => handleAdd("TrainingStatus") : undefined}
            addButtonText="إضافة حالة"
            emptyMessage="لا توجد حالات"
            showAdd={hasPermission(PERMISSIONS.EDIT_SETTINGS)}
          />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center space-y-4">
            <Shield className="w-16 h-16 mx-auto text-[#7c3238]" />
            <h3 className="text-xl font-bold">إدارة الأدوار والصلاحيات</h3>
            <p className="text-gray-600">قم بإنشاء وإدارة الأدوار وتعيين الصلاحيات لكل دور</p>
            <Link to={createPageUrl("RolesPermissions")}>
              <Button className="bg-[#7c3238] hover:bg-[#5a252a]">
                انتقل إلى إدارة الأدوار
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>بناء مسارات الاعتماد</CardTitle>
                <CardDescription>قم بضبط خطوات الموافقة المتسلسلة لكل نوع من أنواع الطلبات</CardDescription>
              </div>
              <div className="w-64">
                <Select
                  value={selectedWorkflowType}
                  onValueChange={(val) => {
                    setSelectedWorkflowType(val);
                    const bp = workflowBlueprints.find(b => b.request_type === val);
                    if (bp) {
                      setCurrentWorkflowSteps(bp.steps.map(s => ({
                        id: s.id,
                        approver_type: s.approver_type || (s.is_direct_manager ? 'manager' : (s.is_dept_manager ? 'department_manager' : 'role')),
                        role_id: s.role_id,
                        show_approver_name: !!s.show_approver_name
                      })));
                    } else {
                      setCurrentWorkflowSteps([]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الطلب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LeaveRequest">طلب إجازة (LeaveRequest)</SelectItem>
                    <SelectItem value="PermissionRequest">طلب استئذان (PermissionRequest)</SelectItem>
                    <SelectItem value="OvertimeRequest">طلب عمل إضافي (Overtime)</SelectItem>
                    <SelectItem value="BonusRequest">طلب مكافأة (Bonus)</SelectItem>
                    <SelectItem value="TrainingRequest">طلب تدريب (TrainingRequest)</SelectItem>
                    <SelectItem value="ContractRequest">طلب عقد (ContractRequest)</SelectItem>
                    <SelectItem value="ResignationRequest">طلب استقالة (Resignation)</SelectItem>
                    <SelectItem value="PerformanceEvaluation">تقييم الأداء (PerformanceEvaluation)</SelectItem>
                    <SelectItem value="Payroll">مسير رواتب (Payroll)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedWorkflowType ? (
                <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                  <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>يرجى اختيار نوع طلب لعرض أو تعديل مسار الاعتماد الخاص به</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentWorkflowSteps.length === 0 && (
                      <p className="text-center py-4 text-gray-500 italic">لا يوجد مسار معرّف حالياً. سيتم الاعتماد مباشرة.</p>
                    )}
                    {currentWorkflowSteps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-white shadow-sm relative group">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7c3238] text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label>نوع المعتمد</Label>
                            <Select
                              value={step.approver_type}
                              onValueChange={(val) => {
                                const newSteps = [...currentWorkflowSteps];
                                newSteps[index].approver_type = val;
                                if (val !== 'role') newSteps[index].role_id = null;
                                setCurrentWorkflowSteps(newSteps);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">المدير المباشر</SelectItem>
                                <SelectItem value="department_manager">مدير القسم</SelectItem>
                                <SelectItem value="role">دور وظيفي محدد</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {step.approver_type === 'role' && (
                            <div className="space-y-1">
                              <Label>تحديد الدور</Label>
                              <Select
                                value={step.role_id || ""}
                                onValueChange={(val) => {
                                  const newSteps = [...currentWorkflowSteps];
                                  newSteps[index].role_id = val;
                                  setCurrentWorkflowSteps(newSteps);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الدور" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map(role => (
                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-8">
                            <Switch
                              checked={step.show_approver_name}
                              onCheckedChange={(val) => {
                                const newSteps = [...currentWorkflowSteps];
                                newSteps[index].show_approver_name = val;
                                setCurrentWorkflowSteps(newSteps);
                              }}
                            />
                            <Label>إظهار اسم المعتمد</Label>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setCurrentWorkflowSteps(currentWorkflowSteps.filter((_, i) => i !== index));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentWorkflowSteps([...currentWorkflowSteps, {
                          approver_type: 'manager',
                          role_id: null,
                          show_approver_name: true
                        }]);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة خطوة جديدة
                    </Button>
                    <Button
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await base44.entities.WorkflowSettings.customAction('0', 'save', {
                            request_type: selectedWorkflowType,
                            steps: currentWorkflowSteps
                          });
                          toast.success("تم حفظ مسار الاعتماد بنجاح");
                          // Refresh data
                          const workflowsData = await base44.entities.WorkflowSettings.list();
                          setWorkflowBlueprints(workflowsData);
                        } catch (error) {
                          console.error("Save workflow error:", error);
                          toast.error("فشل حفظ المسار");
                        }
                        setSaving(false);
                      }}
                      disabled={saving}
                      className="bg-[#7c3238] hover:bg-[#5a252a] flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "جاري الحفظ..." : "حفظ المسار"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center space-y-4">
            <Users className="w-16 h-16 mx-auto text-[#7c3238]" />
            <h3 className="text-xl font-bold">إدارة المستخدمين</h3>
            <p className="text-gray-600">ربط المستخدمين بالأدوار والموظفين والأقسام</p>
            <Link to={createPageUrl("UserManagement")}>
              <Button className="bg-[#7c3238] hover:bg-[#5a252a]">
                انتقل إلى إدارة المستخدمين
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={getFormTitle()}
        onSubmit={handleSubmit}
        loading={saving}
      >
        {renderForm()}
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا العنصر؟"
      />
    </div>
  );
}