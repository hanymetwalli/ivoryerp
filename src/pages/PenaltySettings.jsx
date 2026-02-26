import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
    Settings as SettingsIcon,
    Plus,
    Edit,
    Trash2,
    MoreVertical,
    FileText,
    ShieldAlert,
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
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function PenaltySettings() {
    const [violationTypes, setViolationTypes] = useState([]);
    const [penaltyPolicies, setPenaltyPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("violation_types");

    const [showForm, setShowForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [currentEntity, setCurrentEntity] = useState("");

    const { hasPermission } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vTypes, pPolicies] = await Promise.all([
                base44.entities.ViolationType.list(),
                base44.entities.PenaltyPolicy.list()
            ]);
            setViolationTypes(vTypes);
            setPenaltyPolicies(pPolicies);
        } catch (error) {
            console.error("Error loading disciplinary settings:", error);
            toast.error("فشل تحميل البيانات");
        }
        setLoading(false);
    };

    const handleAdd = (entity) => {
        setCurrentEntity(entity);
        setSelectedItem(null);
        setFormData({});
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
        return currentEntity === "ViolationType"
            ? base44.entities.ViolationType
            : base44.entities.PenaltyPolicy;
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
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
            toast.error("حدث خطأ أثناء الحفظ");
        }
        setSaving(false);
    };

    const violationTypeColumns = [
        { header: "الاسم", accessor: "name" },
        { header: "الوصف", accessor: "description" },
        {
            header: "الحدث",
            accessor: "actions",
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem
                            onClick={() => handleEdit(row, "ViolationType")}
                            disabled={!hasPermission(PERMISSIONS.MANAGE_PENALTY_SETTINGS)}
                        >
                            <Edit className="w-4 h-4 ml-2" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDelete(row, "ViolationType")}
                            className="text-red-600"
                            disabled={!hasPermission(PERMISSIONS.MANAGE_PENALTY_SETTINGS)}
                        >
                            <Trash2 className="w-4 h-4 ml-2" /> حذف
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const penaltyPolicyColumns = [
        {
            header: "المخالفة",
            accessor: "violation_type_id",
            cell: (row) => violationTypes.find(v => v.id === row.violation_type_id)?.name || "غير معروف"
        },
        { header: "رقم التكرار", accessor: "occurrence_number" },
        {
            header: "نوع الجزاء",
            accessor: "action_type",
            cell: (row) => {
                const labels = {
                    warning: "إنذار",
                    deduction_days: "خصم أيام",
                    deduction_amount: "خصم مبلغ"
                };
                return labels[row.action_type] || row.action_type;
            }
        },
        { header: "القيمة", accessor: "penalty_value" },
        {
            header: "الإجراءات",
            accessor: "actions",
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem
                            onClick={() => handleEdit(row, "PenaltyPolicy")}
                            disabled={!hasPermission(PERMISSIONS.MANAGE_PENALTY_SETTINGS)}
                        >
                            <Edit className="w-4 h-4 ml-2" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDelete(row, "PenaltyPolicy")}
                            className="text-red-600"
                            disabled={!hasPermission(PERMISSIONS.MANAGE_PENALTY_SETTINGS)}
                        >
                            <Trash2 className="w-4 h-4 ml-2" /> حذف
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-600" />
                        إعدادات لائحة الجزاءات
                    </h1>
                    <p className="text-slate-500">إدارة أنواع المخالفات وسياسات العقوبات التصاعدية</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100">
                    <TabsTrigger value="violation_types">أنواع المخالفات</TabsTrigger>
                    <TabsTrigger value="penalty_policies">سياسات العقوبات</TabsTrigger>
                </TabsList>

                <TabsContent value="violation_types" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>أنواع المخالفات</CardTitle>
                                <CardDescription>تعريف أنواع المخالفات وقوالب صور الإنذار</CardDescription>
                            </div>
                            <Button
                                onClick={() => handleAdd("ViolationType")}
                                className="gap-2"
                                disabled={!hasPermission(PERMISSIONS.MANAGE_PENALTY_SETTINGS)}
                            >
                                <Plus className="w-4 h-4" /> إضافة نوع مخالفة
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={violationTypeColumns}
                                data={violationTypes}
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="penalty_policies" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>سياسات العقوبات</CardTitle>
                                <CardDescription>تحديد العقوبات بناءً على تكرار المخالفة</CardDescription>
                            </div>
                            <Button
                                onClick={() => handleAdd("PenaltyPolicy")}
                                className="gap-2"
                                disabled={!hasPermission(PERMISSIONS.MANAGE_PENALTY_SETTINGS)}
                            >
                                <Plus className="w-4 h-4" /> إضافة سياسة
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={penaltyPolicyColumns}
                                data={penaltyPolicies}
                                loading={loading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <FormModal
                title={selectedItem ? "تعديل" : "إضافة جديدة"}
                open={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleSubmit}
                loading={saving}
            >
                <div className="space-y-4 py-4">
                    {currentEntity === "ViolationType" ? (
                        <>
                            <div>
                                <Label>اسم المخالفة *</Label>
                                <Input
                                    value={formData.name || ""}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثلاً: التأخر عن العمل"
                                />
                            </div>
                            <div>
                                <Label>الوصف</Label>
                                <Textarea
                                    value={formData.description || ""}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    قالب خطاب الإنذار
                                </Label>
                                <Textarea
                                    className="h-40 font-mono text-sm"
                                    value={formData.letter_template || ""}
                                    onChange={e => setFormData({ ...formData, letter_template: e.target.value })}
                                    placeholder="استخدم المتغيرات: {employee_name}, {violation_name}, {incident_date}, {penalty_action}"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    المتغيرات المتاحة:
                                    {" {employee_name}, {violation_name}, {incident_date}, {penalty_action}"}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <Label>نوع المخالفة *</Label>
                                <Select
                                    value={formData.violation_type_id || ""}
                                    onValueChange={v => setFormData({ ...formData, violation_type_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع المخالفة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {violationTypes.map(vt => (
                                            <SelectItem key={vt.id} value={vt.id}>{vt.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>رقم التكرار *</Label>
                                <Input
                                    type="number"
                                    value={formData.occurrence_number || ""}
                                    onChange={e => setFormData({ ...formData, occurrence_number: parseInt(e.target.value) })}
                                    placeholder="1 للمرة الأولى، 2 للثانية..."
                                />
                            </div>
                            <div>
                                <Label>نوع الإجراء *</Label>
                                <Select
                                    value={formData.action_type || ""}
                                    onValueChange={v => setFormData({ ...formData, action_type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الإجراء" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="warning">إنذار كتابي</SelectItem>
                                        <SelectItem value="deduction_days">خصم أيام من الراتب</SelectItem>
                                        <SelectItem value="deduction_amount">خصم مبلغ ثابت</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>القيمة (عدد الأيام أو المبلغ)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.penalty_value || ""}
                                    onChange={e => setFormData({ ...formData, penalty_value: parseFloat(e.target.value) })}
                                />
                            </div>
                        </>
                    )}
                </div>
            </FormModal>

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}
