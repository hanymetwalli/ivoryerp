import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
    ShieldAlert,
    Plus,
    Eye,
    FileText,
    MoreVertical,
    Printer,
    Download,
    Calendar,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";
import ApprovalTimeline from "@/components/workflows/ApprovalTimeline";
import { ShieldCheck, Info, Trash2, Edit, Clock, CheckCircle } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function Violations() {
    const [violations, setViolations] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [violationTypes, setViolationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showLetterModal, setShowLetterModal] = useState(false);
    const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [approvalChain, setApprovalChain] = useState([]);
    const [formData, setFormData] = useState({
        id: undefined,
        employee_id: "",
        violation_type_id: "",
        incident_date: new Date().toISOString().split("T")[0],
        notes: "",
    });
    const [saving, setSaving] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const { hasPermission, filterEmployees, currentUser, loading: authLoading } = useAuth();

    // Fetch data only after auth is ready
    useEffect(() => {
        if (!authLoading && currentUser) {
            fetchMetadata();
            fetchViolations();
        }
    }, [authLoading, currentUser]);

    const fetchMetadata = async () => {
        try {
            const [empList, vtList] = await Promise.all([
                base44.entities.Employee.list(),
                base44.entities.ViolationType.list()
            ]);

            const allowedEmployees = filterEmployees(empList, [
                PERMISSIONS.VIEW_ALL_EMPLOYEES,
                PERMISSIONS.VIEW_ALL_VIOLATIONS,
                PERMISSIONS.VIEW_DEPARTMENT_VIOLATIONS
            ]);
            setEmployees(allowedEmployees);
            setViolationTypes(vtList);
        } catch (error) {
            console.error("Error loading metadata:", error);
            toast.error("فشل تحميل بيانات الموظفين أو أنواع المخالفات");
        }
    };

    const fetchViolations = async () => {
        setLoading(true);
        try {
            const vList = await base44.entities.EmployeeViolation.list("-incident_date");
            setViolations(vList);
        } catch (error) {
            console.error("Error loading violations:", error);
            toast.error("فشل تحميل سجل المخالفات");
        }
        setLoading(false);
    };

    const handleRecordViolation = () => {
        setFormData({
            id: undefined,
            employee_id: "",
            violation_type_id: "",
            incident_date: new Date().toISOString().split("T")[0],
            notes: "",
        });
        setShowForm(true);
    };

    const handleSaveViolation = async () => {
        if (!formData.employee_id || !formData.violation_type_id) {
            toast.error("يرجى اختيار الموظف ونوع المخالفة");
            return;
        }

        setSaving(true);
        try {
            if (formData.id) {
                await base44.entities.EmployeeViolation.update(formData.id, formData);
                toast.success("تم تحديث المخالفة");
            } else {
                await base44.entities.EmployeeViolation.create(formData);
                toast.success("تم تسجيل المخالفة واحتساب الجزاء آلياً");
            }
            fetchViolations();
            setShowForm(false);
        } catch (error) {
            console.error("Error saving violation:", error);
            toast.error("فشل تسجيل المخالفة");
        }
        setSaving(false);
    };

    const handleForceApprove = async () => {
        if (!selectedViolation?.workflow_id) return;
        setSaving(true);
        try {
            await base44.entities.Workflow.customAction(selectedViolation.workflow_id, 'force-approve', {
                user_id: currentUser.id
            });
            toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
            fetchViolations(); // Changed loadData() to fetchViolations()
            setShowDetails(false); // Changed setShowViewModal(false) to setShowDetails(false)
            setShowForceApproveDialog(false);
        } catch (error) {
            console.error("Error force approving:", error);
            toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
        }
        setSaving(false);
    };

    const handleViewLetter = (violation) => {
        setSelectedViolation(violation);
        setShowLetterModal(true);
    };

    const handleViewDetails = (violation) => {
        setSelectedViolation(violation);
        setShowDetails(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
        try {
            await base44.entities.EmployeeViolation.delete(id);
            toast.success("تم الحذف بنجاح");
            fetchViolations();
        } catch (error) {
            toast.error("فشل الحذف");
        }
    };

    const handlePrintLetter = () => {
        const printContent = document.getElementById("disciplinary-letter");
        const WindowPrt = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        WindowPrt.document.write(`
            <html dir="rtl">
                <head>
                    <title>خطاب إداري</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.6; }
                        .letter-head { text-align: center; border-bottom: 2px solid #333; margin-bottom: 30px; padding-bottom: 10px; }
                        .content { white-space: pre-wrap; margin-bottom: 50px; }
                        .footer { margin-top: 50px; display: flex; justify-content: space-between; }
                        .signature { text-align: center; width: 200px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="letter-head">
                        <h1>خطاب إداري</h1>
                        <p>تاريخ الخطاب: ${format(new Date(), "dd/MM/yyyy")}</p>
                    </div>
                    <div class="content">
                        ${selectedViolation?.letter_content || ""}
                    </div>
                    <div class="footer">
                        <div class="signature">
                            <p>مسؤول الموارد البشرية</p>
                            <p>________________</p>
                        </div>
                        <div class="signature">
                            <p>توقيع الموظف بالعلم</p>
                            <p>________________</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        WindowPrt.document.close();
        WindowPrt.focus();
        WindowPrt.print();
        WindowPrt.close();
    };

    const getEmployeeName = (id) => employees.find(e => e.id === id)?.full_name || "-";
    const getViolationName = (id) => violationTypes.find(v => v.id === id)?.name || "-";

    const columns = [
        {
            header: "الموظف",
            accessor: "employee_id",
            cell: (row) => row.employee_name || getEmployeeName(row.employee_id)
        },
        {
            header: "المخالفة",
            accessor: "violation_type_id",
            cell: (row) => row.violation_name || getViolationName(row.violation_type_id)
        },
        {
            header: "التاريخ",
            accessor: "incident_date",
            cell: (row) => row.incident_date ? format(parseISO(row.incident_date), "dd/MM/yyyy") : "-"
        },
        {
            header: "التكرار",
            accessor: "occurrence_number",
            cell: (row) => `${row.occurrence_number}`
        },
        {
            header: "الجزاء المطبق",
            accessor: "applied_action",
            cell: (row) => {
                const labels = {
                    warning: "إنذار كتابي",
                    deduction_days: `خصم ${row.applied_value} يوم`,
                    deduction_amount: `خصم ${row.applied_value}`
                };
                return labels[row.applied_action] || row.applied_action;
            }
        },
        {
            header: "الحالة",
            accessor: "status",
            cell: (row) => <StatusBadge status={row.status} />
        },
        {
            header: "الإجراءات",
            accessor: "actions",
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">فتح القائمة</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(row)}>
                            <Info className="w-4 h-4 ml-2" /> تفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewLetter(row)}>
                            <FileText className="w-4 h-4 ml-2" /> خطاب
                        </DropdownMenuItem>
                        {hasPermission(PERMISSIONS.UPDATE_VIOLATION) && row.status === 'pending_approval' && (
                            <DropdownMenuItem onClick={() => { setFormData(row); setShowForm(true); }}>
                                <Edit className="w-4 h-4 ml-2" /> تعديل
                            </DropdownMenuItem>
                        )}
                        {hasPermission(PERMISSIONS.DELETE_VIOLATION) && (
                            <DropdownMenuItem onClick={() => handleDelete(row.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 ml-2" /> حذف
                            </DropdownMenuItem>
                        )}
                        {hasPermission(PERMISSIONS.FORCE_APPROVE) && row.status === 'pending_approval' && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedViolation(row);
                                    setShowForceApproveDialog(true);
                                }}
                                className="text-blue-600 font-bold"
                            >
                                <CheckCircle className="w-4 h-4 ml-2" />
                                اعتماد نهائي استثنائي ⚡
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-600" />
                        سجل المخالفات والجزاءات
                    </h1>
                    <p className="text-slate-500">متابعة المخالفات المسجلة والجزاءات الإدارية المترتبة عليها</p>
                </div>
                {hasPermission(PERMISSIONS.CREATE_VIOLATION) && (
                    <Button onClick={handleRecordViolation} className="gap-2">
                        <Plus className="w-4 h-4" /> تسجيل مخالفة
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={violations}
                        loading={loading}
                        searchPlaceholder="بحث في السجلات..."
                    />
                </CardContent>
            </Card>

            <FormModal
                title="تسجيل مخالفة إدارية"
                open={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleSaveViolation}
                loading={saving}
            >
                <div className="space-y-4 py-4">
                    <div>
                        <Label>الموظف المعني *</Label>
                        <Select
                            value={formData.employee_id || ""}
                            onValueChange={v => setFormData({ ...formData, employee_id: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map(emp => (
                                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
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
                        <Label>تاريخ رصد المخالفة *</Label>
                        <Input
                            type="date"
                            value={formData.incident_date}
                            onChange={e => setFormData({ ...formData, incident_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>ملاحظات إضافية</Label>
                        <Textarea
                            value={formData.notes || ""}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="تفاصيل الحادثة أو شهادات الشهود إن وجدت..."
                        />
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-800">
                        <p className="font-semibold mb-1">💡 ملحوظة:</p>
                        <p>سيقوم النظام باحتساب رقم التكرار واختيار العقوبة المناسبة من لائحة الشركة فور الحفظ.</p>
                    </div>
                </div>
            </FormModal>

            <FormModal
                title="خطاب الإجراء التأديبي"
                open={showLetterModal}
                onClose={() => setShowLetterModal(false)}
                onSubmit={() => { }}
                showFooter={false}
                size="lg"
            >
                <div className="p-4 bg-slate-50 border rounded-lg min-h-[400px]">
                    <div className="flex justify-end mb-4 no-print">
                        <Button variant="outline" onClick={handlePrintLetter} className="gap-2">
                            <Printer className="w-4 h-4" /> طباعة الخطاب
                        </Button>
                    </div>
                    <div id="disciplinary-letter" className="bg-white p-8 shadow-sm border whitespace-pre-wrap font-sans text-lg">
                        {selectedViolation?.letter_content}
                    </div>
                </div>
            </FormModal>

            <FormModal
                title="تفاصيل المخالفة ومسار الاعتماد"
                open={showDetails}
                onClose={() => setShowDetails(false)}
                showFooter={false}
                size="xl"
                onSubmit={() => { }}
            >
                {selectedViolation && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                        <div className="md:col-span-1 space-y-4">
                            <Card className="bg-slate-50/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">بيانات المخالفة</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">الموظف:</span>
                                        <span className="font-medium">{selectedViolation.employee_name || getEmployeeName(selectedViolation.employee_id)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">نوع المخالفة:</span>
                                        <span className="font-medium text-red-600">{selectedViolation.violation_name || getViolationName(selectedViolation.violation_type_id)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">تاريخ الحادثة:</span>
                                        <span className="font-medium">{selectedViolation.incident_date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">الجزاء:</span>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                            {selectedViolation.applied_action}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg border p-4">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    حالة الاعتماد والخطوات
                                </h3>
                                {selectedViolation.workflow_id ? (
                                    <ApprovalTimeline
                                        workflowId={selectedViolation.workflow_id}
                                    />
                                ) : (
                                    <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
                                        لا يوجد مسار اعتماد نشط لهذا السجل
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </FormModal>

            <ConfirmDialog
                open={showForceApproveDialog}
                onClose={() => setShowForceApproveDialog(false)}
                onConfirm={handleForceApprove}
                title="الاعتماد النهائي الاستثنائي ⚡"
                description="هل أنت متأكد من الاعتماد النهائي المباشر لهذا الطلب؟ سيتم تجاوز كافة خطوات سير العمل المتبقية واعتماد الطلب بشكل نهائي استثنائي."
                confirmLabel="تأكيد الاعتماد ⚡"
                variant="primary"
                loading={saving}
            />
        </div>
    );
}
