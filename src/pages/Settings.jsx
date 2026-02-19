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
          header: "بداية الدوام",
          accessor: "start_time",
        },
        {
          header: "نهاية الدوام",
          accessor: "end_time",
        },
        {
          header: "فترة السماح",
          accessor: "grace_period_minutes",
          cell: (row) => `${row.grace_period_minutes || 0} دقيقة`,
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>بداية الدوام *</Label>
                <Input
                  type="time"
                  value={formData.start_time || ""}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>نهاية الدوام *</Label>
                <Input
                  type="time"
                  value={formData.end_time || ""}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>
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
        </TabsList>

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