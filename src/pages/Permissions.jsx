import React, { useState, useEffect } from "react";
import { base44 } from "@/api/ivoryClient";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import ApprovalActions from "@/components/ApprovalActions";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import PermissionsForm from "@/components/PermissionsForm";
import { useAuth } from "@/components/AuthProvider";

export default function Permissions() {
    const [permissions, setPermissions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);

    const { currentUser } = useAuth();


    // Permissions check (mock or real)
    // Assuming useAuth provides `hasPermission` or we use the helper from `permissions.js`
    // But for now, let's rely on currentUser role or similar.
    const canEdit = currentUser?.role === 'admin' || currentUser?.hr_role === 'manager';
    const canDelete = currentUser?.role === 'admin' || currentUser?.hr_role === 'manager';
    const canAdd = true; // Everyone can add

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

    const handleApprovalSuccess = () => {
        setShowViewModal(false);
        loadData();
        toast.success("تم تحديث الحالة بنجاح");
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

                const start = formatTime(row.start_time);
                const end = formatTime(row.end_time);
                return <span dir="ltr" className="text-xs whitespace-nowrap">{`${start} - ${end}`}</span>;
            }
        },
        {
            header: "السبب",
            accessor: "reason",
            cell: (row) => <span className="truncate max-w-xs block" title={row.reason}>{row.reason}</span>
        },
        {
            header: "الحالة",
            accessor: "status",
            cell: (row) => <StatusBadge status={row.status || 'pending'} customLabel={row.current_status_desc} className="" />,
        },
        {
            header: "الإجراءات",
            accessor: "actions",
            cell: (row) => {
                const isOwner = row.employee_id === currentUser?.employee_id;
                const isPending = row.status === 'pending';
                const allowEdit = canEdit || (isOwner && isPending);
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
                            {allowEdit && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>
                                    <Edit className="w-4 h-4 ml-2" />
                                    تعديل
                                </DropdownMenuItem>
                            )}
                            {allowDelete && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(row); }} className="text-red-600">
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
                title={selectedPermission ? "تعديل طلب الاستئذان" : "طلب استئذان جديد"}
                showFooter={false}
                onSubmit={() => { }}
            >
                <PermissionsForm
                    key={selectedPermission ? selectedPermission.id : 'new'}
                    initialData={selectedPermission}
                    employees={employees}
                    onSuccess={handleFormSuccess}
                    onCancel={() => setShowForm(false)}
                />
            </FormModal>

            {/* View/Approval Modal */}
            <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>تفاصيل الطلب {selectedPermission?.request_number && `- ${selectedPermission.request_number}`}</DialogTitle>
                    </DialogHeader>
                    {selectedPermission && (
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <span className="text-gray-500 block">الموظف</span>
                                    <span className="font-medium">{selectedPermission.employee_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">التاريخ</span>
                                    <span className="font-medium">{selectedPermission.request_date}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">الوقت</span>
                                    <span className="font-medium" dir="ltr">{selectedPermission.start_time} - {selectedPermission.end_time}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">المدة</span>
                                    <span className="font-medium">{selectedPermission.duration_minutes} دقيقة</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500 block">السبب</span>
                                    <span className="font-medium">{selectedPermission.reason}</span>
                                </div>
                            </div>

                            {/* Approval Actions */}
                            <ApprovalActions
                                entityName="PermissionRequest"
                                recordId={selectedPermission.id}
                                onApproved={handleApprovalSuccess}
                            />

                            <ApprovalTimeline
                                approvalChain={selectedPermission.approval_chain || []}
                                approvalHistory={[]}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
        </div>
    );
}
