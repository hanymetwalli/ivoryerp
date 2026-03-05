import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Briefcase, Plus, Edit, Trash2, Users, Calendar } from "lucide-react";
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
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

const STATUS_MAP = {
    draft: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
    open: { label: "مفتوحة", color: "bg-green-100 text-green-700" },
    closed: { label: "مغلقة", color: "bg-red-100 text-red-700" },
};

const TYPE_MAP = {
    "full-time": "دوام كامل",
    "part-time": "دوام جزئي",
    contract: "عقد مؤقت",
    remote: "عن بُعد",
};

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [jobsData, deptsData] = await Promise.all([
                base44.entities.JobPosting.list("-created_at"),
                base44.entities.Department.list("-created_at"),
            ]);
            setJobs(jobsData);
            setDepartments(deptsData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("حدث خطأ في تحميل البيانات");
        }
        setLoading(false);
    };

    const handleAdd = () => {
        setSelectedJob(null);
        setFormData({ status: "draft", employment_type: "full-time" });
        setShowForm(true);
    };

    const handleEdit = (job) => {
        setSelectedJob(job);
        setFormData({ ...job });
        setShowForm(true);
    };

    const handleDelete = (job) => {
        setSelectedJob(job);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await base44.entities.JobPosting.delete(selectedJob.id);
            loadData();
            setShowDeleteDialog(false);
            toast.success("تم حذف الوظيفة بنجاح");
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error("يرجى إدخال المسمى الوظيفي");
            return;
        }

        setSaving(true);
        try {
            if (selectedJob) {
                await base44.entities.JobPosting.update(selectedJob.id, formData);
                toast.success("تم تحديث الوظيفة بنجاح");
            } else {
                await base44.entities.JobPosting.create(formData);
                toast.success("تمت إضافة الوظيفة بنجاح");
            }
            loadData();
            setShowForm(false);
        } catch (error) {
            console.error("Error saving:", error);
            toast.error("حدث خطأ أثناء الحفظ");
        }
        setSaving(false);
    };

    const columns = [
        {
            header: "المسمى الوظيفي",
            accessor: "title",
            cell: (row) => (
                <div>
                    <p className="font-semibold text-gray-800">{row.title}</p>
                    {row.department_name && (
                        <p className="text-xs text-gray-500">{row.department_name}</p>
                    )}
                </div>
            ),
        },
        {
            header: "نوع العمل",
            accessor: "employment_type",
            cell: (row) => TYPE_MAP[row.employment_type] || row.employment_type || "-",
        },
        {
            header: "الحالة",
            accessor: "status",
            cell: (row) => {
                const s = STATUS_MAP[row.status] || STATUS_MAP.draft;
                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>
                        {s.label}
                    </span>
                );
            },
        },
        {
            header: "المتقدمون",
            accessor: "applications_count",
            cell: (row) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{row.applications_count ?? 0}</span>
                </div>
            ),
        },
        {
            header: "تاريخ الانتهاء",
            accessor: "deadline",
            cell: (row) => {
                if (!row.deadline) return "-";
                const d = new Date(row.deadline);
                const isExpired = d < new Date();
                return (
                    <span className={isExpired ? "text-red-500" : "text-gray-600"}>
                        {d.toLocaleDateString("ar-SA")}
                    </span>
                );
            },
        },
        {
            header: "الإجراءات",
            accessor: "actions",
            cell: (row) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                        <Edit className="w-4 h-4 ml-1" />
                        تعديل
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row)}
                        className="text-red-600"
                    >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-[#7c3238]" />
                    الوظائف المتاحة
                </h2>
                <p className="text-gray-500 mt-1">إدارة الإعلانات الوظيفية ومتابعة طلبات التقديم</p>
            </div>

            <DataTable
                data={jobs}
                columns={columns}
                loading={loading}
                onAdd={handleAdd}
                addButtonText="إضافة وظيفة"
                emptyMessage="لا توجد وظائف معلنة حالياً"
                searchPlaceholder="بحث في الوظائف..."
            />

            <FormModal
                open={showForm}
                onClose={() => setShowForm(false)}
                title={selectedJob ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"}
                onSubmit={handleSubmit}
                loading={saving}
                size="lg"
            >
                <div className="space-y-4" dir="rtl">
                    <div>
                        <Label>المسمى الوظيفي *</Label>
                        <Input
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="مثال: مهندس برمجيات أول"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>القسم</Label>
                            <Select
                                value={formData.department_id || ""}
                                onValueChange={(v) => setFormData({ ...formData, department_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر القسم" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>نوع العمل</Label>
                            <Select
                                value={formData.employment_type || "full-time"}
                                onValueChange={(v) => setFormData({ ...formData, employment_type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">دوام كامل</SelectItem>
                                    <SelectItem value="part-time">دوام جزئي</SelectItem>
                                    <SelectItem value="contract">عقد مؤقت</SelectItem>
                                    <SelectItem value="remote">عن بُعد</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>الوصف الوظيفي</Label>
                        <Textarea
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="اكتب وصفاً تفصيلياً للمهام والمسؤوليات..."
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label>المتطلبات</Label>
                        <Textarea
                            value={formData.requirements || ""}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            placeholder="المؤهلات والخبرات المطلوبة..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>الحالة</Label>
                            <Select
                                value={formData.status || "draft"}
                                onValueChange={(v) => setFormData({ ...formData, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">مسودة</SelectItem>
                                    <SelectItem value="open">مفتوحة للتقديم</SelectItem>
                                    <SelectItem value="closed">مغلقة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>تاريخ انتهاء التقديم</Label>
                            <Input
                                type="date"
                                value={formData.deadline || ""}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </FormModal>

            <ConfirmDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="حذف الوظيفة"
                description={`هل أنت متأكد من حذف الوظيفة "${selectedJob?.title}"؟ سيتم حذف جميع الطلبات المرتبطة بها.`}
            />
        </div>
    );
}
