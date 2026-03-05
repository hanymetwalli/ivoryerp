import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, Eye, Download, FileText, CheckCircle, XCircle, Search, Mail, Phone, Calendar, Briefcase, Award, UserPlus, ClipboardCheck, MapPin } from "lucide-react";
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
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PERMISSIONS } from "@/components/permissions";

const STATUS_MAP = {
    new: { label: "جديد", color: "bg-blue-100 text-blue-700" },
    screening: { label: "قيد الفرز", color: "bg-purple-100 text-purple-700" },
    interview: { label: "مقابلة", color: "bg-yellow-100 text-yellow-700" },
    offered: { label: "عرض عمل", color: "bg-green-100 text-green-700" },
    hired: { label: "تم التعيين", color: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "مرفوض", color: "bg-red-100 text-red-700" },
};

const GENDER_MAP = { male: "ذكر", female: "أنثى" };
const MARITAL_MAP = { single: "أعزب/عزباء", married: "متزوج/ة", divorced: "مطلق/ة", widowed: "أرمل/ة", other: "أخرى" };

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api-local';
const ROOT_URL = API_BASE_URL.replace('/api-local', '').replace('/api', '');

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Interview Modal States
    const [showInterviewForm, setShowInterviewForm] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [interviewData, setInterviewData] = useState({});
    const [savingInterview, setSavingInterview] = useState(false);
    const { hasPermission } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const data = await base44.entities.InterviewTemplate.list();
            setTemplates(data || []);
        } catch (error) {
            console.error("Error loading templates:", error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            // Index is overridden in backend to sort by interview_score DESC for evaluated ones
            const data = await base44.entities.JobApplication.list();
            setApplications(data);
        } catch (error) {
            console.error("Error loading applications:", error);
            toast.error("حدث خطأ في تحميل طلبات التوظيف");
        }
        setLoading(false);
    };

    const handleViewDetails = async (app) => {
        setSelectedApp(app);
        setShowDetails(true);
    };

    const handleDownloadCV = (cvPath) => {
        if (!cvPath) {
            toast.error("لا يوجد ملف سيرة ذاتية مرفق");
            return;
        }
        // Clean path if it starts with leading slash
        const cleanPath = cvPath.startsWith('/') ? cvPath.substring(1) : cvPath;
        window.open(`${ROOT_URL}/${cleanPath}`, "_blank");
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await base44.entities.JobApplication.update(id, { status: newStatus });
            toast.success("تم تحديث الحالة بنجاح");
            loadData();

            // Update local selected state if modal is open
            if (selectedApp && selectedApp.id === id) {
                setSelectedApp({ ...selectedApp, status: newStatus });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("حدث خطأ أثناء تحديث الحالة");
        }
    };

    const parseJSONField = (fieldData) => {
        try {
            if (typeof fieldData === 'string') {
                const parsed = JSON.parse(fieldData);
                return Array.isArray(parsed) ? parsed : [];
            }
            if (Array.isArray(fieldData)) return fieldData;
            return [];
        } catch (e) {
            return [];
        }
    };

    const handleOpenInterview = (app) => {
        setSelectedApp(app);
        setInterviewData({});
        setSelectedTemplateId("");
        setSelectedTemplate(null);
        setShowInterviewForm(true);
    };

    const handleTemplateChange = (templateId) => {
        setSelectedTemplateId(templateId);
        const template = templates.find(t => String(t.id) === String(templateId));
        setSelectedTemplate(template);

        // Initialize scores
        const initialData = {};
        if (template && template.items) {
            template.items.forEach(item => {
                initialData[item.id] = "";
            });
        }
        setInterviewData(initialData);
    };

    const handleInterviewSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTemplate) return;

        // Validation - Check max scores
        let totalScore = 0;
        let isValid = true;

        selectedTemplate.items.forEach(item => {
            const score = Number(interviewData[item.id] || 0);
            if (score > item.max_score || score < 0) {
                isValid = false;
                toast.error(`الدرجة للمعيار "${item.criteria_name}" يجب أن تكون بين 0 و ${item.max_score}`);
            }
            totalScore += score;
        });

        if (!isValid) return;

        setSavingInterview(true);
        try {
            // Convert interviewData object to the expected 'evaluations' array format
            const evaluations = Object.keys(interviewData).map(itemId => ({
                template_item_id: itemId,
                given_score: Number(interviewData[itemId]) || 0
            }));

            const payload = {
                job_application_id: selectedApp.id,
                template_id: selectedTemplate.id,
                total_score: totalScore,
                evaluations: evaluations,
                status: 'completed',
                interview_date: new Date().toISOString().split('T')[0]
            };

            // 1. Save Interview (Backend trigger will automatically update the job application status and score)
            await base44.entities.Interview.create(payload);

            toast.success("تم حفظ التقييم بنجاح");
            setShowInterviewForm(false);
            loadData(); // refresh list to show new score
        } catch (error) {
            console.error("Error saving interview:", error);
            toast.error("حدث خطأ أثناء حفظ التقييم");
        }
        setSavingInterview(false);
    };

    const handleHire = (app) => {
        navigate('/Employees', { state: { candidateData: app } });
    };

    const columns = [
        {
            header: "المرشح",
            accessor: "full_name",
            cell: (row) => (
                <div>
                    <p className="font-semibold text-gray-800">{row.full_name}</p>
                    <div className="flex flex-col text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {row.email}</span>
                        {parseJSONField(row.phones)?.[0] && (
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {parseJSONField(row.phones)[0]}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            header: "الوظيفة المتقدم لها",
            accessor: "job_title",
            cell: (row) => (
                <span className="font-medium text-gray-700">{row.job_title || "-"}</span>
            ),
        },
        {
            header: "تاريخ التقديم",
            accessor: "created_at",
            cell: (row) => new Date(row.created_at).toLocaleDateString("ar-SA"),
        },
        {
            header: "التقييم (المقابلة)",
            accessor: "interview_score",
            cell: (row) => {
                if (row.interview_score === null || row.interview_score === undefined) {
                    return <span className="text-gray-400 text-sm">لم يتم التقييم</span>;
                }
                return (
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#7c3238]">{row.interview_score}</span>
                        <span className="text-xs text-gray-500">/ 100</span>
                    </div>
                );
            },
        },
        {
            header: "الحالة",
            accessor: "status",
            cell: (row) => {
                const s = STATUS_MAP[row.status] || STATUS_MAP.new;
                const canEditStatus = hasPermission(PERMISSIONS.EDIT_APPLICATIONS);

                if (!canEditStatus) {
                    return (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>
                            {s.label}
                        </span>
                    );
                }

                return (
                    <Select
                        value={row.status || "new"}
                        onValueChange={(v) => updateStatus(row.id, v)}
                    >
                        <SelectTrigger className={`h-8 border-0 w-32 ${s.color}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(STATUS_MAP).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            header: "الإجراءات",
            accessor: "actions",
            cell: (row) => (
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(row)} className="gap-1 px-2 h-8">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadCV(row.cv_path)} disabled={!row.cv_path} className="text-[#7c3238] gap-1 px-2 h-8">
                        <Download className="w-4 h-4" />
                    </Button>
                    {hasPermission(PERMISSIONS.CREATE_INTERVIEWS) && (
                        <Button variant="outline" size="sm" className="gap-1 px-2 h-8 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 uppercase" onClick={() => handleOpenInterview(row)}>
                            <ClipboardCheck className="w-4 h-4" /> المقابلة
                        </Button>
                    )}
                    {hasPermission(PERMISSIONS.ADD_EMPLOYEE) && (
                        <Button variant="outline" size="sm" className="gap-1 px-2 h-8 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 uppercase" onClick={() => handleHire(row)}>
                            <UserPlus className="w-4 h-4" /> تعيين
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const renderDetailsModal = () => {
        if (!selectedApp) return null;

        const phones = parseJSONField(selectedApp.phones);
        const qualifications = parseJSONField(selectedApp.qualifications);
        const experiences = parseJSONField(selectedApp.experiences);

        return (
            <div className="space-y-6" dir="rtl">
                {/* Header Widget */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-[#7c3238]/10 text-[#7c3238] rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                            {selectedApp.full_name?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedApp.full_name}</h3>
                            <p className="text-[#7c3238] font-medium">{selectedApp.job_title}</p>
                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedApp.email}</span>
                                {phones[0] && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {phones[0]}</span>}
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> {selectedApp.address || "-"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center bg-white p-3 rounded-xl border shadow-sm min-w-[120px]">
                        <p className="text-xs text-gray-500 font-medium mb-1">نتيجة التقييم</p>
                        {selectedApp.interview_score !== null ? (
                            <p className="text-2xl font-bold text-[#7c3238]">{selectedApp.interview_score}<span className="text-sm text-gray-400 font-normal">/100</span></p>
                        ) : (
                            <p className="text-gray-400 text-sm py-1">غير متوفر</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-3 p-4 border rounded-xl">
                        <h4 className="font-semibold flex items-center gap-2 text-gray-800 mb-4 border-b pb-2">
                            <Users className="w-5 h-5 text-gray-500" /> المعلومات الشخصية
                        </h4>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                            <div>
                                <span className="text-gray-500 block mb-1">النوع</span>
                                <span className="font-medium text-gray-900">{GENDER_MAP[selectedApp.gender] || selectedApp.gender || "-"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-1">الحالة الاجتماعية</span>
                                <span className="font-medium text-gray-900">{MARITAL_MAP[selectedApp.marital_status] || selectedApp.marital_status || "-"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-1">تاريخ الميلاد</span>
                                <span className="font-medium text-gray-900">{selectedApp.date_of_birth || "-"}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block mb-1">الوظيفة الحالية</span>
                                <span className="font-medium text-gray-900">{selectedApp.current_job || "-"}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 block mb-1">هواتف إضافية</span>
                                <span className="font-medium text-gray-900">{phones.length > 1 ? phones.slice(1).join(" ، ") : "-"}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 block mb-1">نبذة (Bio)</span>
                                <p className="font-medium text-gray-900 text-justify">{selectedApp.bio || "لا يوجد نبذة مرفقة"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Experience & Qualifications */}
                    <div className="space-y-6">
                        <div className="space-y-3 p-4 border rounded-xl bg-gray-50/50">
                            <h4 className="font-semibold flex items-center gap-2 text-gray-800 mb-4 border-b pb-2">
                                <Award className="w-5 h-5 text-gray-500" /> المؤهلات العلمية
                            </h4>
                            {(Array.isArray(qualifications) ? qualifications : []).length > 0 ? (
                                <ul className="space-y-3">
                                    {(Array.isArray(qualifications) ? qualifications : []).map((q, idx) => (
                                        <li key={idx} className="flex flex-col border-r-2 border-[#7c3238] pr-3 rtl:border-r-2 rtl:border-l-0 rtl:pl-0 rtl:pr-3">
                                            <span className="font-bold text-gray-800">{q.degree}</span>
                                            <span className="text-sm text-gray-600">{q.institution} {q.year ? `(${q.year})` : ""}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">لا توجد مؤهلات مرفقة</p>
                            )}
                        </div>

                        <div className="space-y-3 p-4 border rounded-xl bg-gray-50/50">
                            <h4 className="font-semibold flex items-center gap-2 text-gray-800 mb-4 border-b pb-2">
                                <Briefcase className="w-5 h-5 text-gray-500" /> الخبرات المهنية
                            </h4>
                            {(Array.isArray(experiences) ? experiences : []).length > 0 ? (
                                <ul className="space-y-3">
                                    {(Array.isArray(experiences) ? experiences : []).map((exp, idx) => (
                                        <li key={idx} className="flex flex-col border-r-2 border-gray-400 pr-3 rtl:border-r-2 rtl:border-l-0 rtl:pl-0 rtl:pr-3">
                                            <span className="font-bold text-gray-800">{exp.role}</span>
                                            <span className="text-sm text-gray-600">{exp.company} <span className="text-xs mr-1 bg-white border px-1.5 py-0.5 rounded text-gray-500">{exp.duration}</span></span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">لا توجد خبرات سابقة مرفقة</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#7c3238]" />
                    طلبات التوظيف
                </h2>
                <p className="text-gray-500 mt-1">إدارة مرشحي الوظائف ومتابعة حالاتهم ونتائج المقابلات</p>
            </div>

            <DataTable
                data={applications}
                columns={columns}
                loading={loading}
                showAdd={false}
                searchPlaceholder="بحث باسم المرشح، أو الوظيفة..."
                emptyMessage="لا يوجد طلبات توظيف مسجلة حتى الآن."
            />

            <FormModal
                open={showDetails}
                onClose={() => setShowDetails(false)}
                title="تفاصيل طلب التوظيف"
                size="full"
                showFooter={false}
            >
                {renderDetailsModal()}

                <div className="mt-8 pt-4 border-t flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDetails(false)}
                        >
                            إغلاق
                        </Button>
                        {hasPermission(PERMISSIONS.CREATE_INTERVIEWS) && (
                            <Button
                                variant="outline"
                                className="gap-2 text-blue-600 hover:text-blue-700"
                                onClick={() => { setShowDetails(false); handleOpenInterview(selectedApp); }}
                            >
                                <ClipboardCheck className="w-4 h-4" />
                                تقييم المرشح
                            </Button>
                        )}
                        {hasPermission(PERMISSIONS.ADD_EMPLOYEE) && (
                            <Button
                                variant="outline"
                                className="gap-2 text-emerald-600 hover:text-emerald-700"
                                onClick={() => { setShowDetails(false); handleHire(selectedApp); }}
                            >
                                <UserPlus className="w-4 h-4" />
                                تعيين كموظف
                            </Button>
                        )}
                    </div>

                    <Button
                        className="gap-2 bg-[#7c3238] hover:bg-[#5a252a]"
                        onClick={() => handleDownloadCV(selectedApp.cv_path)}
                        disabled={!selectedApp?.cv_path}
                    >
                        <Download className="w-4 h-4" />
                        تنزيل السيرة الذاتية
                    </Button>
                </div>
            </FormModal>

            {/* Interview Form Modal */}
            <FormModal
                open={showInterviewForm}
                onClose={() => setShowInterviewForm(false)}
                title={`تقييم المقابلة: ${selectedApp?.full_name}`}
                onSubmit={handleInterviewSubmit}
                loading={savingInterview}
                size="lg"
            >
                <div className="space-y-6" dir="rtl">
                    <div>
                        <Label>اختر قالب المقابلة</Label>
                        <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر القالب المعتمد..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name} (من {t.total_score})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedTemplate && (
                        <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
                            <h4 className="font-bold border-b pb-2 mb-4 text-[#7c3238]">{selectedTemplate.name}</h4>

                            {(Array.isArray(selectedTemplate?.items) ? selectedTemplate.items : []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-lg border">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{item.criteria_name}</p>
                                        <p className="text-xs text-gray-500">الدرجة القصوى المسموحة: {item.max_score}</p>
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            type="number"
                                            min="0"
                                            max={item.max_score}
                                            required
                                            placeholder={`/ ${item.max_score}`}
                                            value={interviewData[item.id] !== undefined ? interviewData[item.id] : ""}
                                            onChange={(e) => setInterviewData({ ...interviewData, [item.id]: e.target.value })}
                                            className="text-center font-bold"
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="mt-6 flex justify-between items-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                                <span className="font-bold text-gray-700">إجمالي الدرجات الحالية:</span>
                                <span className="font-bold text-2xl text-[#7c3238]">
                                    {Object.values(interviewData).reduce((acc, val) => acc + Number(val || 0), 0)} <span className="text-sm font-normal text-gray-500">/ {selectedTemplate.total_score}</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </FormModal>
        </div>
    );
}
