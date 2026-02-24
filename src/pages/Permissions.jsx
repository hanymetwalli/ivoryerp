import React, { useState, useEffect } from "react";
import { base44 } from "@/api/ivoryClient";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/AuthProvider";
import { hasPermission, PERMISSIONS } from "@/components/permissions";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ApprovalTimeline, { getCurrentPendingStep } from "@/components/ApprovalTimeline";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import PermissionsForm from "@/components/PermissionsForm";

export default function Permissions() {
    const [permissions, setPermissions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);
    const [approvalProcessing, setApprovalProcessing] = useState(false);
    const [approvalNotes, setApprovalNotes] = useState("");
    const [showApprovalForm, setShowApprovalForm] = useState(null);
    const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
    const [forceApproveLoading, setForceApproveLoading] = useState(false);

    const { currentUser } = useAuth();

    const canEdit = currentUser?.role === 'admin' || currentUser?.hr_role === 'manager';
    const canDelete = currentUser?.role === 'admin' || currentUser?.hr_role === 'manager';
    const canAdd = true;

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [permsData, empData] = await Promise.all([
                base44.entities.PermissionRequest.list("-created_date", 200),
                base44.entities.Employee.list(),
            ]);

            setPermissions(permsData);
            setEmployees(empData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("فشل تحميل البيانات");
        }
        setLoading(false);
    };

    const getEmployeeName = (employeeId) => {
        const emp = employees.find((e) => e.id === employeeId);
        return emp?.full_name || "-";
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        try {
            const dateObj = timeStr.includes('T') || timeStr.includes(' ')
                ? new Date(timeStr)
                : new Date(`1970-01-01T${timeStr}`);
            if (isNaN(dateObj.getTime())) return timeStr;
            return format(dateObj, "hh:mm a");
        } catch (e) {
            return timeStr;
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '-';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs > 0 && mins > 0) return `${hrs} ساعة و ${mins} دقيقة`;
        if (hrs > 0) return `${hrs} ساعة`;
        return `${mins} دقيقة`;
    };

    const handleAdd = () => {
        setSelectedPermission(null);
        setShowForm(true);
    };

    const handleEdit = (permission) => {
        setSelectedPermission(permission);
        setShowForm(true);
    };

    const handleView = (permission) => {
        setSelectedPermission(permission);
        setShowViewModal(true);
    };

    const handleForceApprove = async () => {
        if (!selectedPermission || !selectedPermission.workflow_id) {
            toast.error("لم يتم العثور على سجل سير عمل لهذا الطلب");
            return;
        }

        setForceApproveLoading(true);
        try {
            await base44.entities.Workflow.customAction(selectedPermission.workflow_id, 'force-approve', {
                user_id: currentUser.id
            });

            toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
            setShowForceApproveDialog(false);
            loadData();
        } catch (error) {
            console.error("Force approve error:", error);
            toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
        }
        setForceApproveLoading(false);
    };

    const handleDelete = (permission) => {
        setSelectedPermission(permission);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await base44.entities.PermissionRequest.delete(selectedPermission.id);
            const updatedPermissions = permissions.filter((p) => p.id !== selectedPermission.id);
            setPermissions(updatedPermissions);
            setShowDeleteDialog(false);
            toast.success("تم حذف الطلب بنجاح");
        } catch (error) {
            console.error("Error deleting request:", error);
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        loadData();
    };

    const columns = [
        {
            header: "رقم الطلب",
            accessor: "request_number",
            cell: (row) => <span className="font-mono text-xs">{row.request_number || '-'}</span>
        },
        {
            header: "الموظف",
            accessor: "employee_name",
            cell: (row) => row.employee_name || row.user_name || "غير محدد"
        },
        {
            header: "التاريخ",
            accessor: "request_date",
            cell: (row) =>
                row.request_date ? format(parseISO(row.request_date), "dd/MM/yyyy", { locale: ar }) : "-",
        },
        {
            header: "الوقت",
            accessor: "time",
            cell: (row) => {
                const start = formatTime(row.start_time);
                const end = formatTime(row.end_time);
                return <span dir="ltr" className="text-xs whitespace-nowrap">{`${start} - ${end}`}</span>;
            }
        },
        {
            header: "المدة",
            accessor: "duration_minutes",
            cell: (row) => <span className="text-xs font-medium">{formatDuration(row.duration_minutes)}</span>
        },
        {
            header: "الحالة",
            accessor: "status",
            cell: (row) => <StatusBadge status={row.status || 'pending'} className="" />,
        },
        {
            header: "الإجراءات",
            accessor: "actions",
            cell: (row) => {
                const isOwner = row.employee_id === currentUser?.employee_id;
                const isPending = row.status === 'pending';
                const isReturned = row.status === 'returned';
                const allowEdit = canEdit || (isOwner && (isPending || isReturned));
                const allowDelete = canDelete || (isOwner && isPending);

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(row); }}>
                                <Eye className="w-4 h-4 ml-2" />
                                عرض التفاصيل
                            </DropdownMenuItem>
                            {allowEdit && (isPending || isReturned) && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>
                                    <Edit className="w-4 h-4 ml-2" />
                                    {isReturned ? 'تعديل وإعادة تقديم' : 'تعديل'}
                                </DropdownMenuItem>
                            )}
                            {allowDelete && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(row); }} className="text-red-600">
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف
                                </DropdownMenuItem>
                            )}
                            {hasPermission(PERMISSIONS.FORCE_APPROVE) && row.status === 'pending' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPermission(row);
                                            setShowForceApproveDialog(true);
                                        }}
                                        className="text-blue-600 font-bold"
                                    >
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        الاعتماد النهائي ⚡
                                    </DropdownMenuItem>
                                </>
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
                    <h2 className="text-2xl font-bold text-gray-800">إدارة الاستئذانات</h2>
                    <p className="text-gray-500">سجل طلبات الاستئذان والمغادرة</p>
                </div>
                <div className="flex gap-2">
                    {canAdd && (
                        <Button onClick={handleAdd}>
                            <Plus className="w-4 h-4 ml-2" />
                            طلب استئذان جديد
                        </Button>
                    )}
                </div>
            </div>

            <DataTable
                data={permissions}
                columns={columns}
                loading={loading}
                onAdd={canAdd ? handleAdd : undefined}
                addButtonText="طلب استئذان جديد"
                searchPlaceholder="بحث..."
                emptyMessage="لا توجد طلبات استئذان"
                showAdd={canAdd}
                onRowClick={handleView}
                onExport={() => { }}
                className=""
            />

            {/* Form Modal */}
            <FormModal
                open={showForm}
                onClose={() => setShowForm(false)}
                title={selectedPermission
                    ? (selectedPermission.status === 'returned' ? "تعديل وإعادة تقديم طلب الاستئذان" : "تعديل طلب الاستئذان")
                    : "طلب استئذان جديد"}
                showFooter={false}
                onSubmit={() => { }}
            >
                <PermissionsForm
                    key={selectedPermission ? selectedPermission.id : 'new'}
                    initialData={selectedPermission}
                    employees={employees}
                    onSuccess={async () => {
                        // If the request was returned, also trigger resubmit
                        if (selectedPermission?.status === 'returned') {
                            try {
                                await base44.entities.PermissionRequest.action(selectedPermission.id, 'resubmit', {});
                                toast.success("تم إعادة تقديم الطلب بنجاح");
                            } catch (err) {
                                console.error('Resubmit error:', err);
                                toast.error("تم الحفظ لكن فشلت إعادة التقديم");
                            }
                        }
                        handleFormSuccess();
                    }}
                    onCancel={() => setShowForm(false)}
                />
            </FormModal>

            {/* View/Approval Modal - Enhanced layout matching Leaves.jsx */}
            <FormModal
                open={showViewModal}
                onClose={() => { setShowViewModal(false); setShowApprovalForm(null); setApprovalNotes(""); }}
                title="تفاصيل طلب الاستئذان"
                showFooter={false}
                size="lg"
            >
                {selectedPermission && (
                    <div className="space-y-4" dir="rtl">
                        {/* Header: Request number + Employee + Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">رقم الطلب</p>
                                <p className="font-bold text-lg">{selectedPermission.request_number || "-"}</p>
                                <h3 className="font-bold text-gray-800 mt-2">
                                    {selectedPermission.employee_name || getEmployeeName(selectedPermission.employee_id)}
                                </h3>
                            </div>
                            <StatusBadge status={selectedPermission.status || 'pending'} />
                        </div>

                        {/* Dynamic Pending Approver Badge */}
                        {(() => {
                            const pendingStep = getCurrentPendingStep(selectedPermission.approval_steps);
                            if (!pendingStep || selectedPermission.status === 'approved' || selectedPermission.status === 'rejected') return null;
                            const label = pendingStep.approver_job_title || pendingStep.role_name || 'غير محدد';
                            const name = pendingStep.is_name_visible && pendingStep.approver_name ? ` - ${pendingStep.approver_name}` : '';
                            return (
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-indigo-500 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">📍 جاري الاعتماد من</h4>
                                            <p className="text-sm text-gray-800 font-medium">
                                                {label}{name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Duration Highlight Card */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-600" />
                                مدة الاستئذان
                            </h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600">من الساعة</p>
                                    <p className="font-bold text-lg" dir="ltr">{formatTime(selectedPermission.start_time)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">إلى الساعة</p>
                                    <p className="font-bold text-lg" dir="ltr">{formatTime(selectedPermission.end_time)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">المدة الإجمالية</p>
                                    <p className="font-bold text-lg text-amber-700">
                                        {formatDuration(selectedPermission.duration_minutes)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-gray-500">تاريخ الطلب</p>
                                <p className="font-medium">
                                    {selectedPermission.request_date
                                        ? format(parseISO(selectedPermission.request_date), "dd/MM/yyyy", { locale: ar })
                                        : "-"}
                                </p>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <p className="text-sm text-gray-500">السبب</p>
                                <p className="font-medium">{selectedPermission.reason || "-"}</p>
                            </div>
                        </div>

                        {/* Approval Timeline */}
                        {selectedPermission.approval_steps && selectedPermission.approval_steps.length > 0 && (
                            <div className="border-t pt-4">
                                <ApprovalTimeline
                                    approvalChain={selectedPermission.approval_steps}
                                />
                            </div>
                        )}

                        {/* Inline Approval Actions */}
                        {(() => {
                            const pendingStep = getCurrentPendingStep(selectedPermission.approval_steps);
                            if (!pendingStep || !currentUser) return null;
                            const isMyTurn = pendingStep.approver_user_id === currentUser.id;
                            if (!isMyTurn) return null;

                            const handleApprovalAction = async (action) => {
                                setApprovalProcessing(true);
                                try {
                                    await base44.entities.Approvals.action(pendingStep.id, 'submit', {
                                        user_id: currentUser.id,
                                        action: action,
                                        comments: approvalNotes
                                    });
                                    toast.success(action === 'approved' ? 'تم الاعتماد بنجاح' : action === 'rejected' ? 'تم الرفض' : 'تم الإرجاع');
                                    setShowApprovalForm(null);
                                    setApprovalNotes("");
                                    setShowViewModal(false);
                                    loadData();
                                } catch (error) {
                                    console.error('Approval action error:', error);
                                    toast.error('حدث خطأ أثناء تنفيذ الإجراء');
                                }
                                setApprovalProcessing(false);
                            };

                            return (
                                <div className="border-t pt-4 space-y-3">
                                    <h4 className="font-semibold text-gray-700">اتخاذ إجراء</h4>

                                    {/* Duration reminder for approver */}
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>مدة الاستئذان: <strong>{formatDuration(selectedPermission.duration_minutes)}</strong></span>
                                    </div>

                                    {!showApprovalForm ? (
                                        <div className="flex gap-3">
                                            <Button onClick={() => setShowApprovalForm('approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                اعتماد
                                            </Button>
                                            <Button onClick={() => setShowApprovalForm('return')} variant="outline" className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50">
                                                إرجاع
                                            </Button>
                                            <Button onClick={() => setShowApprovalForm('reject')} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                                                <XCircle className="w-4 h-4 ml-2" />
                                                رفض
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className={`p-4 rounded-lg border ${showApprovalForm === 'approve' ? 'bg-green-50 border-green-100' :
                                            showApprovalForm === 'return' ? 'bg-orange-50 border-orange-100' :
                                                'bg-red-50 border-red-100'
                                            }`}>
                                            <Textarea
                                                placeholder="ملاحظات (اختياري)..."
                                                value={approvalNotes}
                                                onChange={(e) => setApprovalNotes(e.target.value)}
                                                className="bg-white mb-3 min-h-[80px]"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleApprovalAction(
                                                        showApprovalForm === 'approve' ? 'approved' :
                                                            showApprovalForm === 'return' ? 'returned' : 'rejected'
                                                    )}
                                                    disabled={approvalProcessing}
                                                    className={`flex-1 text-white ${showApprovalForm === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                                        showApprovalForm === 'return' ? 'bg-orange-600 hover:bg-orange-700' :
                                                            'bg-red-600 hover:bg-red-700'
                                                        }`}
                                                >
                                                    {approvalProcessing ? 'جاري التنفيذ...' : 'تأكيد'}
                                                </Button>
                                                <Button variant="outline" onClick={() => { setShowApprovalForm(null); setApprovalNotes(""); }} className="flex-1">
                                                    إلغاء
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </FormModal>

            <ConfirmDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
                description="هل أنت متأكد من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
                confirmLabel="حذف"
                cancelLabel="إلغاء"
                variant="destructive"
            />

            <ConfirmDialog
                open={showForceApproveDialog}
                onClose={() => setShowForceApproveDialog(false)}
                onConfirm={handleForceApprove}
                title="تأكيد الاعتماد النهائي الاستثنائي"
                description="هل أنت متأكد من الاعتماد المباشر؟ سيتم تخطي الخطوات المتبقية واعتمادها باسمك كمدير للنظام مع الاحتفاظ بأي اعتمادات سابقة تمت على الطلب."
                confirmLabel="تأكيد الاعتماد ⚡"
                cancelLabel="إلغاء"
                variant="destructive"
                loading={forceApproveLoading}
            />
        </div>
    );
}
