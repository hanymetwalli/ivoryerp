import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Briefcase, MapPin, Clock, FileText, ChevronLeft, PlusCircle, XCircle, Upload, CheckCircle2, Calendar } from "lucide-react";
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
import FormModal from "@/components/ui/FormModal";
import { toast } from "sonner";

const TYPE_MAP = {
    "full-time": "دوام كامل",
    "part-time": "دوام جزئي",
    contract: "عقد مؤقت",
    remote: "عن بُعد",
};

export default function Careers() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: "",
        dob: "",
        gender: "male",
        marital_status: "single",
        email: "",
        address: "",
        current_job: "",
        bio: "",
    });

    // Dynamic Arrays
    const [phones, setPhones] = useState([""]);
    const [qualifications, setQualifications] = useState([{ degree: "", institution: "", year: "" }]);
    const [experiences, setExperiences] = useState([{ company: "", role: "", duration: "" }]);
    const [cvFile, setCvFile] = useState(null);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.JobPosting.list("-created_at");
            // Only show open jobs
            setJobs(data.filter((j) => j.status === "open"));
        } catch (error) {
            console.error("Error loading jobs:", error);
            toast.error("تعذر تحميل الوظائف المتاحة حالياً");
        }
        setLoading(false);
    };

    const handleApply = (job) => {
        setSelectedJob(job);
        setSuccess(false);

        // Reset form
        setFormData({
            full_name: "",
            dob: "",
            gender: "male",
            marital_status: "single",
            email: "",
            address: "",
            current_job: "",
            bio: "",
        });
        setPhones([""]);
        setQualifications([{ degree: "", institution: "", year: "" }]);
        setExperiences([{ company: "", role: "", duration: "" }]);
        setCvFile(null);

        setShowForm(true);
    };

    const handleArrayChange = (setter, state, index, field, value) => {
        const updated = [...state];
        if (field === null) {
            // Primitive array like phones
            updated[index] = value;
        } else {
            // Object array
            updated[index] = { ...updated[index], [field]: value };
        }
        setter(updated);
    };

    const handleCreateArrayItem = (setter, state, emptyItem) => {
        setter([...state, emptyItem]);
    };

    const handleRemoveArrayItem = (setter, state, index) => {
        setter(state.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.full_name || !formData.email || !cvFile) {
            toast.error("يرجى إكمال البيانات الأساسية وإرفاق السيرة الذاتية");
            return;
        }

        setSaving(true);
        try {
            // Prepare FormData for multipart/form-data upload
            const payload = new FormData();
            payload.append("job_posting_id", selectedJob.id);
            Object.keys(formData).forEach((key) => {
                payload.append(key, formData[key] || "");
            });

            // Append JSON formatted dynamic arrays
            payload.append("phones", JSON.stringify(phones.filter((p) => p.trim() !== "")));
            payload.append("qualifications", JSON.stringify(qualifications.filter((q) => q.degree.trim() !== "")));
            payload.append("experiences", JSON.stringify(experiences.filter((ex) => ex.role.trim() !== "")));

            // Append file
            payload.append("cv_file", cvFile);

            // Using the ivoryClient which handles FormData natively and removes Content-Type wrapper
            await base44.entities.JobApplication.create(payload);

            toast.success("تم إرسال طلب التوظيف بنجاح!");
            setSuccess(true);

            // Refresh to update applications count
            loadJobs();
        } catch (error) {
            console.error("Error submitting application:", error);
            toast.error("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-[#7c3238] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                    انضم إلى فريقنا
                </h1>
                <p className="text-xl text-gray-500">
                    اكتشف الفرص الوظيفية المتاحة وكن جزءاً من رحلة نجاحنا وتطورنا المستمر.
                </p>
            </div>

            <div className="mt-12">
                {jobs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">لا توجد شواغر حالياً</h3>
                        <p className="text-gray-500 mt-2">يرجى متابعة الصفحة مستقبلاً للاطلاع على الفرص الجديدة.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#7c3238] mb-1">
                                                {job.department_name || "الشركة"}
                                            </p>
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                                                {job.title}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                            <Clock className="w-3.5 h-3.5" />
                                            {TYPE_MAP[job.employment_type] || job.employment_type}
                                        </span>
                                        {job.deadline && (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                <Calendar className="w-3.5 h-3.5" />
                                                التقديم حتى: {new Date(job.deadline).toLocaleDateString("ar-SA")}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-4 text-sm text-gray-600 line-clamp-3">
                                        {job.description || "لا يوجد وصف مختصر."}
                                    </p>
                                </div>

                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 mt-auto">
                                    <Button
                                        onClick={() => handleApply(job)}
                                        className="w-full bg-[#7c3238] hover:bg-[#5a252a] text-white gap-2 group"
                                    >
                                        تقديم الآن
                                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <FormModal
                open={showForm}
                onClose={() => setShowForm(false)}
                title={selectedJob ? `التقديم على: ${selectedJob.title}` : ""}
                onSubmit={handleSubmit}
                loading={saving}
                size="xl"
                submitLabel="إرسال الطلب"
                showFooter={!success}
            >
                {success ? (
                    <div className="text-center py-12">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900">تم إرسال طلبك بنجاح!</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            شكراً لاهتمامك بالانضمام إلينا. سيتم مراجعة طلبك والتواصل معك قريباً في حال ترشيحك للمقابلة.
                        </p>
                        <Button
                            className="mt-8 bg-[#7c3238] hover:bg-[#5a252a]"
                            onClick={() => setShowForm(false)}
                        >
                            إغلاق
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8" dir="rtl">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <div className="flex items-center border-b pb-2">
                                <FileText className="w-5 h-5 text-[#7c3238] mr-2 rtl:ml-2" />
                                <h3 className="text-lg font-bold text-gray-800">1. البيانات الشخصية</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>الاسم الرباعي *</Label>
                                    <Input
                                        required
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="مطابق للهوية / الجواز"
                                    />
                                </div>
                                <div>
                                    <Label>البريد الإلكتروني *</Label>
                                    <Input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>تاريخ الميلاد</Label>
                                    <Input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>عنوان السكن (المدينة، الحي)</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>النوع</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(v) => setFormData({ ...formData, gender: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">ذكر</SelectItem>
                                            <SelectItem value="female">أنثى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>الحالة الاجتماعية</Label>
                                    <Select
                                        value={formData.marital_status}
                                        onValueChange={(v) => setFormData({ ...formData, marital_status: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">أعزب/عزباء</SelectItem>
                                            <SelectItem value="married">متزوج/ة</SelectItem>
                                            <SelectItem value="other">أخرى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Dynamic Phones */}
                            <div>
                                <Label className="mb-2 block">أرقام الهواتف (هاتف واحد على الأقل) *</Label>
                                <div className="space-y-2">
                                    {phones.map((phone, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Input
                                                required={idx === 0}
                                                value={phone}
                                                onChange={(e) => handleArrayChange(setPhones, phones, idx, null, e.target.value)}
                                                placeholder="05XXXXXXXX"
                                                className="flex-1"
                                            />
                                            {phones.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveArrayItem(setPhones, phones, idx)} className="text-red-400 hover:text-red-600">
                                                    <XCircle className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleCreateArrayItem(setPhones, phones, "")} className="text-[#7c3238]">
                                        <PlusCircle className="w-4 h-4 ml-1" /> رقم إضافي
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Experience & Qualifications */}
                        <div className="space-y-6">
                            <div className="flex items-center border-b pb-2">
                                <Briefcase className="w-5 h-5 text-[#7c3238] mr-2 rtl:ml-2" />
                                <h3 className="text-lg font-bold text-gray-800">2. المؤهلات والخبرات</h3>
                            </div>

                            <div>
                                <Label>الوظيفة الحالية (إن وجد)</Label>
                                <Input
                                    value={formData.current_job}
                                    onChange={(e) => setFormData({ ...formData, current_job: e.target.value })}
                                    placeholder="المسمى الوظيفي الحالي"
                                />
                            </div>

                            {/* Qualifications */}
                            <div>
                                <Label className="mb-2 block font-semibold text-gray-700">المؤهلات العلمية</Label>
                                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {qualifications.map((q, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                            <Input
                                                placeholder="الدرجة والتخصص (مثال: بكالوريوس تقنية معلومات)"
                                                value={q.degree}
                                                onChange={(e) => handleArrayChange(setQualifications, qualifications, idx, "degree", e.target.value)}
                                                className="flex-[2]"
                                            />
                                            <Input
                                                placeholder="المؤسسة التعليمية"
                                                value={q.institution}
                                                onChange={(e) => handleArrayChange(setQualifications, qualifications, idx, "institution", e.target.value)}
                                                className="flex-[2]"
                                            />
                                            <Input
                                                placeholder="سنة التخرج"
                                                value={q.year}
                                                onChange={(e) => handleArrayChange(setQualifications, qualifications, idx, "year", e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveArrayItem(setQualifications, qualifications, idx)} className="text-red-400 flex-shrink-0">
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => handleCreateArrayItem(setQualifications, qualifications, { degree: "", institution: "", year: "" })} className="w-full border-dashed">
                                        <PlusCircle className="w-4 h-4 ml-2" /> إضافة مؤهل
                                    </Button>
                                </div>
                            </div>

                            {/* Experiences */}
                            <div>
                                <Label className="mb-2 block font-semibold text-gray-700">الخبرات المهنية</Label>
                                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {experiences.map((exp, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                            <Input
                                                placeholder="المسمى الوظيفي"
                                                value={exp.role}
                                                onChange={(e) => handleArrayChange(setExperiences, experiences, idx, "role", e.target.value)}
                                                className="flex-[2]"
                                            />
                                            <Input
                                                placeholder="جهة العمل / الشركة"
                                                value={exp.company}
                                                onChange={(e) => handleArrayChange(setExperiences, experiences, idx, "company", e.target.value)}
                                                className="flex-[2]"
                                            />
                                            <Input
                                                placeholder="المدة (مثال: 3 سنوات)"
                                                value={exp.duration}
                                                onChange={(e) => handleArrayChange(setExperiences, experiences, idx, "duration", e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveArrayItem(setExperiences, experiences, idx)} className="text-red-400 flex-shrink-0">
                                                <XCircle className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => handleCreateArrayItem(setExperiences, experiences, { company: "", role: "", duration: "" })} className="w-full border-dashed">
                                        <PlusCircle className="w-4 h-4 ml-2" /> إضافة خبرة
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label>نبذة مختصرة (Bio)</Label>
                                <Textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="تحدث عن مهاراتك وشغفك المهني..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Section 3: CV Upload */}
                        <div>
                            <div className="flex items-center border-b pb-2 mb-4">
                                <Upload className="w-5 h-5 text-[#7c3238] mr-2 rtl:ml-2" />
                                <h3 className="text-lg font-bold text-gray-800">3. المرفقات</h3>
                            </div>
                            <Label className="block mb-2">السيرة الذاتية (CV) *</Label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">اضغط لرفع الملف</span> أو قم بالسحب والإفلات
                                        </p>
                                        <p className="text-xs text-gray-500">PDF, DOC, DOCX (الحد الأقصى 5MP)</p>
                                        {cvFile && (
                                            <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                <CheckCircle2 className="w-4 h-4 ml-1" />
                                                {cvFile.name}
                                            </div>
                                        )}
                                    </div>
                                    <Input
                                        required
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setCvFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                    </div>
                )}
            </FormModal>
        </div>
    );
}
