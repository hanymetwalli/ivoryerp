import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardList, Plus, Edit, Trash2, PlusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";

export default function InterviewTemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [items, setItems] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.InterviewTemplate.list("-created_at");
            setTemplates(data);
        } catch (error) {
            console.error("Error loading templates:", error);
            toast.error("حدث خطأ في تحميل البيانات");
        }
        setLoading(false);
    };

    // Calculate total score from items
    const totalScore = items.reduce((sum, item) => sum + (parseFloat(item.max_score) || 0), 0);

    const handleAdd = () => {
        setSelectedTemplate(null);
        setFormData({ name: "", description: "" });
        setItems([{ criteria_name: "", max_score: 10 }]);
        setShowForm(true);
    };

    const handleEdit = async (template) => {
        setSelectedTemplate(template);
        setFormData({ name: template.name, description: template.description || "" });

        // Load full template with items
        try {
            const full = await base44.entities.InterviewTemplate.get(template.id);
            setItems(
                full.items && full.items.length > 0
                    ? full.items.map((i) => ({
                        id: i.id,
                        criteria_name: i.criteria_name,
                        max_score: i.max_score,
                    }))
                    : [{ criteria_name: "", max_score: 10 }]
            );
        } catch {
            setItems([{ criteria_name: "", max_score: 10 }]);
        }

        setShowForm(true);
    };

    const handleDelete = (template) => {
        setSelectedTemplate(template);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await base44.entities.InterviewTemplate.delete(selectedTemplate.id);
            loadData();
            setShowDeleteDialog(false);
            toast.success("تم حذف القالب بنجاح");
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    // === Dynamic Items Management ===
    const addItem = () => {
        setItems([...items, { criteria_name: "", max_score: 10 }]);
    };

    const removeItem = (index) => {
        if (items.length <= 1) {
            toast.error("يجب وجود بند تقييم واحد على الأقل");
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error("يرجى إدخال اسم القالب");
            return;
        }

        // Validate items
        const validItems = items.filter((i) => i.criteria_name.trim() !== "");
        if (validItems.length === 0) {
            toast.error("يرجى إضافة بند تقييم واحد على الأقل");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                items: validItems.map((item, index) => ({
                    ...(item.id ? { id: item.id } : {}),
                    criteria_name: item.criteria_name,
                    max_score: parseFloat(item.max_score) || 10,
                    sort_order: index,
                })),
            };

            if (selectedTemplate) {
                await base44.entities.InterviewTemplate.update(selectedTemplate.id, payload);
                toast.success("تم تحديث القالب بنجاح");
            } else {
                await base44.entities.InterviewTemplate.create(payload);
                toast.success("تم إنشاء القالب بنجاح");
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
            header: "اسم القالب",
            accessor: "name",
            cell: (row) => (
                <div>
                    <p className="font-semibold text-gray-800">{row.name}</p>
                    {row.description && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{row.description}</p>
                    )}
                </div>
            ),
        },
        {
            header: "عدد البنود",
            accessor: "items_count",
            cell: (row) => (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {row.items_count ?? 0} بند
                </span>
            ),
        },
        {
            header: "إجمالي الدرجات",
            accessor: "total_score",
            cell: (row) => (
                <span className="font-bold text-[#7c3238]">{row.total_score ?? 0}</span>
            ),
        },
        {
            header: "الحالة",
            accessor: "status",
            cell: (row) => {
                const isActive = row.status === "active";
                return (
                    <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}
                    >
                        {isActive ? "نشط" : "غير نشط"}
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
                    <ClipboardList className="w-6 h-6 text-[#7c3238]" />
                    قوالب تقييم المقابلات
                </h2>
                <p className="text-gray-500 mt-1">إنشاء وإدارة معايير تقييم المرشحين</p>
            </div>

            <DataTable
                data={templates}
                columns={columns}
                loading={loading}
                onAdd={handleAdd}
                addButtonText="إنشاء قالب جديد"
                emptyMessage="لا توجد قوالب تقييم. قم بإنشاء قالب ليتم استخدامه في المقابلات."
                searchPlaceholder="بحث في القوالب..."
            />

            <FormModal
                open={showForm}
                onClose={() => setShowForm(false)}
                title={selectedTemplate ? "تعديل القالب" : "إنشاء قالب تقييم جديد"}
                onSubmit={handleSubmit}
                loading={saving}
                size="lg"
            >
                <div className="space-y-5" dir="rtl">
                    {/* Basic Info */}
                    <div>
                        <Label>اسم القالب *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: تقييم مقابلة المطورين"
                        />
                    </div>
                    <div>
                        <Label>الوصف</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="وصف مختصر للقالب..."
                            rows={2}
                        />
                    </div>

                    {/* Dynamic Items */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <Label className="text-base font-bold">بنود التقييم</Label>
                                <p className="text-xs text-gray-500 mt-0.5">أضف معايير التقييم والدرجة القصوى لكل بند</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-[#7c3238]/10 px-3 py-1.5 rounded-lg">
                                    <span className="text-xs text-gray-500 ml-1">الإجمالي:</span>
                                    <span className="text-lg font-bold text-[#7c3238]">{totalScore}</span>
                                    <span className="text-xs text-gray-500 mr-1">درجة</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                    <span className="text-xs font-medium text-gray-400 w-6 text-center">
                                        {index + 1}
                                    </span>
                                    <Input
                                        value={item.criteria_name}
                                        onChange={(e) => updateItem(index, "criteria_name", e.target.value)}
                                        placeholder="اسم المعيار (مثال: المهارات التقنية)"
                                        className="flex-1"
                                    />
                                    <div className="flex items-center gap-1.5 w-28">
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={item.max_score}
                                            onChange={(e) =>
                                                updateItem(index, "max_score", e.target.value === "" ? "" : Number(e.target.value))
                                            }
                                            className="w-20 text-center"
                                        />
                                        <span className="text-xs text-gray-500 whitespace-nowrap">درجة</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                            className="w-full mt-3 border-dashed border-2 text-gray-500 hover:text-[#7c3238] hover:border-[#7c3238]"
                        >
                            <PlusCircle className="w-4 h-4 ml-2" />
                            إضافة بند تقييم جديد
                        </Button>
                    </div>
                </div>
            </FormModal>

            <ConfirmDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="حذف القالب"
                description={`هل أنت متأكد من حذف القالب "${selectedTemplate?.name}"؟`}
            />
        </div>
    );
}
