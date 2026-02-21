import React, { useState, useEffect } from "react";
import { base44 } from "@/api/ivoryClient";
import {
    CheckCircle,
    XCircle,
    RotateCcw,
    Eye,
    MessageSquare,
    Clock,
    User,
    Calendar,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export default function Approvals() {
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState(null);
    const [actionNotes, setActionNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            loadPendingApprovals();
        }
    }, [currentUser]);

    const loadPendingApprovals = async () => {
        setLoading(true);
        try {
            const response = await base44.entities.Approvals.list({ user_id: currentUser.id });
            setSteps(response);
        } catch (error) {
            console.error("Error loading approvals:", error);
            toast.error("فشل تحميل طلبات الاعتماد");
        }
        setLoading(false);
    };

    const handleReview = (step) => {
        setSelectedStep(step);
        setActionNotes("");
        setReviewModalOpen(true);
    };

    const handleSubmitAction = async (action) => {
        if ((action === 'rejected' || action === 'returned') && !actionNotes.trim()) {
            toast.error("يرجى إضافة ملاحظات عند الرفض أو الإرجاع");
            return;
        }

        setIsSubmitting(true);
        try {
            await base44.entities.Approvals.customAction(selectedStep.id, 'submit', {
                user_id: currentUser.id,
                action: action,
                comments: actionNotes
            });

            toast.success("تم تنفيذ الإجراء بنجاح");
            setReviewModalOpen(false);
            loadPendingApprovals();
        } catch (error) {
            console.error("Error submitting approval action:", error);
            toast.error("فشل تنفيذ الإجراء");
        }
        setIsSubmitting(false);
    };

    const getRequestTypeName = (type) => {
        switch (type) {
            case 'permission_requests': return 'طلب استئذان';
            case 'leaves': return 'طلب إجازة';
            default: return type;
        }
    };

    const columns = [
        {
            header: "نوع الطلب",
            accessor: "model_type",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{getRequestTypeName(row.model_type)}</span>
                </div>
            )
        },
        {
            header: "الموظف",
            accessor: "employee_name",
            cell: (row) => row.details?.employee_name || "غير محدد"
        },
        {
            header: "تاريخ الطلب",
            accessor: "request_created_at",
            cell: (row) => row.request_created_at ? format(parseISO(row.request_created_at), "dd/MM/yyyy", { locale: ar }) : "-"
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
                <Button variant="outline" size="sm" onClick={() => handleReview(row)} className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    مراجعة الطلب
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">صندوق الاعتمادات</h2>
                    <p className="text-gray-500">الطلبات التي تنتظر قرارك</p>
                </div>
            </div>

            <DataTable
                data={steps}
                columns={columns}
                loading={loading}
                emptyMessage="لا توجد طلبات معلقة بانتظارك"
                searchPlaceholder="بحث في الطلبات..."
            />

            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
                <DialogContent className="max-w-2xl sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#7c3238]" />
                            مراجعة طلب اعتماد
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStep && (
                        <div className="py-4 space-y-6">
                            {/* Request Summary Card */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-y-4">
                                <div className="space-y-1">
                                    <Label className="text-gray-500 font-normal">نوع الطلب</Label>
                                    <p className="font-bold">{getRequestTypeName(selectedStep.model_type)}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-500 font-normal">رقم الطلب</Label>
                                    <p className="font-mono text-[#7c3238]">{selectedStep.details?.request_number || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-500 font-normal">الموظف صاحب الطلب</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#c9a86c]/20 text-[#c9a86c] flex items-center justify-center text-[10px] font-bold">
                                            {selectedStep.details?.employee_name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="font-medium">{selectedStep.details?.employee_name}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-gray-500 font-normal">التاريخ</Label>
                                    <div className="flex items-center gap-1 text-sm">
                                        <Calendar className="w-3 h-3" />
                                        {selectedStep.details?.request_date}
                                    </div>
                                </div>

                                {selectedStep.model_type === 'permission_requests' && (
                                    <>
                                        <div className="space-y-1 col-span-1">
                                            <Label className="text-gray-500 font-normal">الوقت</Label>
                                            <p className="text-sm font-medium" dir="ltr">
                                                {selectedStep.details?.start_time} - {selectedStep.details?.end_time}
                                            </p>
                                        </div>
                                        <div className="space-y-1 col-span-1">
                                            <Label className="text-gray-500 font-normal">المدة</Label>
                                            <p className="text-sm font-medium">{selectedStep.details?.duration_minutes} دقيقة</p>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <Label className="text-gray-500 font-normal">السبب</Label>
                                            <p className="text-sm bg-white p-2 rounded border border-gray-100 mt-1 italic">
                                                "{selectedStep.details?.reason || 'لا يوجد سبب مذكور'}"
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-500" />
                                    الملاحظات والتعليقات
                                    {(selectedStep.action === 'rejected' || selectedStep.action === 'returned') && (
                                        <span className="text-red-500 text-[10px] font-normal">(إلزامية عند الرفض أو الإرجاع)</span>
                                    )}
                                </Label>
                                <Textarea
                                    value={actionNotes}
                                    onChange={(e) => setActionNotes(e.target.value)}
                                    placeholder="اكتب ملاحظاتك هنا..."
                                    className="min-h-[100px] resize-none focus:ring-[#7c3238]"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="grid grid-cols-3 gap-2 sm:gap-2 pt-4">
                        <Button
                            variant="outline"
                            className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:text-red-700 flex items-center justify-center gap-2 py-6"
                            disabled={isSubmitting}
                            onClick={() => handleSubmitAction('rejected')}
                        >
                            <XCircle className="w-5 h-5" />
                            رفض الطلب
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 hover:text-amber-700 flex items-center justify-center gap-2 py-6"
                            disabled={isSubmitting}
                            onClick={() => handleSubmitAction('returned')}
                        >
                            <RotateCcw className="w-5 h-5" />
                            إرجاع للمراجعة
                        </Button>
                        <Button
                            className="bg-[#7c3238] hover:bg-[#5a252a] text-white flex items-center justify-center gap-2 py-6"
                            disabled={isSubmitting}
                            onClick={() => handleSubmitAction('approved')}
                        >
                            <CheckCircle className="w-5 h-5" />
                            اعتماد الطلب
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
