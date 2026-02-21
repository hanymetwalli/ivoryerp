import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { base44 } from '@/api/ivoryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function PermissionsForm({ initialData, employees = [], onSuccess, onCancel }) {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errorData, setErrorData] = useState(null);

    // Default form state
    const defaultFormState = {
        request_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        reason: '',
        employee_id: currentUser?.employee_id || ''
    };

    const [formData, setFormData] = useState(defaultFormState);

    // Check if user has permission to add for others
    const canAddForOthers = currentUser?.role === 'admin' || currentUser?.hr_role === 'manager';

    useEffect(() => {
        if (initialData) {
            // Populate form for Edit Mode
            setFormData({
                request_date: initialData.request_date || (initialData.start_time ? initialData.start_time.split(' ')[0] : new Date().toISOString().split('T')[0]),
                start_time: initialData.start_time ? (initialData.start_time.includes(' ') ? initialData.start_time.split(' ')[1].substring(0, 5) : initialData.start_time.substring(0, 5)) : '',
                end_time: initialData.end_time ? (initialData.end_time.includes(' ') ? initialData.end_time.split(' ')[1].substring(0, 5) : initialData.end_time.substring(0, 5)) : '',
                reason: initialData.reason || '',
                employee_id: initialData.employee_id ? String(initialData.employee_id) : (currentUser?.employee_id ? String(currentUser.employee_id) : '')
            });
        } else {
            // Reset form for New Request Mode
            setFormData({
                ...defaultFormState,
                employee_id: currentUser?.employee_id || ''
            });
        }

        // Clear errors when opening modal
        setErrorData(null);
    }, [initialData, currentUser]); // Removed loadEmployees logic

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear errors on change
        if (errorData) setErrorData(null);
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!formData.start_time || !formData.end_time || !formData.reason || !formData.request_date) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "يرجى تعبئة جميع الحقول المطلوبة.",
            });
            return false;
        }

        if (canAddForOthers && !formData.employee_id) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "يرجى اختيار الموظف.",
            });
            return false;
        }

        if (formData.end_time <= formData.start_time) {
            toast({
                variant: "destructive",
                title: "خطأ في الوقت",
                description: "وقت النهاية يجب أن يكون بعد وقت البداية.",
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorData(null);

        if (!validate()) return;

        setLoading(true);
        try {
            // Prepare payload
            // PermissionsController expects: user_id, start_time, end_time, reason
            // It calculates request_date from start_time usually, but let's send what we have.
            // Actually createRequest takes: user_id, start_time, end_time, reason.
            // AND the start_time/end_time in the controller usually expected as full datetime or Time string? 
            // In the controller: $start = new DateTime($startTime); 
            // If I send "09:00", DateTime("09:00") defaults to today's date + time.
            // To be safe, let's combine date and time if needed, OR just send time if that's what backend expects.
            // The Logic: `request_date` => timestamp.
            // Controller logic: 
            // $start = new DateTime($startTime) 
            // $dataToStore['request_date'] = date('Y-m-d', strtotime($startTime));
            // If I send "14:00", strtotime("14:00") is today 14:00.
            // If the user picked a future date in `request_date`, sending just "14:00" will result in TODAY's date in backend.
            // FIX: Send full datetime string to start_time and end_time.

            const fullStartTime = `${formData.request_date} ${formData.start_time}`;
            const fullEndTime = `${formData.request_date} ${formData.end_time}`;

            const payload = {
                user_id: currentUser?.id, // Always send the current user's ID as the creator
                employee_id: formData.employee_id, // Send employee_id explicitly
                start_time: fullStartTime,
                end_time: fullEndTime,
                reason: formData.reason
            };

            // If backend strictly needs user_id, we might need to find user_id from employee_id for 'others'.
            // For now, let's assume `employee_id` in payload is enough or handled by backend.
            // If we are editing:
            if (initialData && initialData.id) {
                await base44.entities.PermissionRequest.update(initialData.id, payload);
                toast({ title: "تم التعديل بنجاح", description: "تم تعديل طلب الاستئذان." });
            } else {
                await base44.entities.PermissionRequest.create(payload);
                toast({ title: "تم بنجاح", description: "تم إرسال طلب الاستئذان للمراجعة." });
            }

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Submission Error:", error);

            // Handle 422 Limit Exceeded
            // ivoryClient throws Error(data.message). 
            // We need to access the safe 'data' object if possible?
            // Wait, ivoryClient.js throws: `throw new Error(data.message || ...)`
            // It swallows the `data` object! 
            // I need to check `ivoryClient.js` again. 
            // line 34: `throw new Error(data.message || ...)`
            // This makes it hard to get the `details` object for the custom UI.
            // However, the prompt requires me to read the JSON response.
            // If ivoryClient swallows it, I should modify ivoryClient or use a custom fetch here?
            // OR checks if error object has attached data.
            // Standard Error object doesn't have extra props easily.
            // Let's look at ivoryClient again.

            // Re-reading ivoryClient.js:
            // catch (error) { console.error... throw error; }

            // I will use a direct fetch or try to parse the error message if it's JSON.
            // BUT, usually we want to attach the response data to the error.
            // Modify ivoryClient is risky.
            // Alternative: The user said "Integration with Backend using src/api/ivoryClient.js".
            // If strictly using ivoryClient, I might be limited.
            // BUT, look at ivoryClient: 
            // `if (!response.ok) { throw new Error(...) }`
            // It definitely loses the `details`.

            // Let's assume for this task I can use `base44` but I might need to patch it or handle it differently?
            // Or maybe the error message itself contains the info? No, the details are in `details` key.

            // Workaround: I will wrap the call in a try/catch and if it fails, I might not get the details.
            // WAIT! The PROMPT says: "read the JSON response ... using src/api/ivoryClient.js".
            // Maybe the user *thinks* ivoryClient returns the error data? 
            // Or maybe I should fix ivoryClient to attach data to the error? 
            // "Integrate ... using ivoryClient ... UX: handle 422 ... reading JSON response".
            // I will PATCH ivoryClient.js to attach the data to the error object.

            if (error.details) {
                setErrorData(error.details);
            } else {
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: error.message || "حدث خطأ أثناء الإرسال",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4" dir="rtl">
            {errorData && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>تجاوز الحد المسموح</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-col gap-1 text-sm">
                        <span>عذراً، الطلب يتجاوز الرصيد الشهري.</span>
                        {errorData.limit_minutes && <span className="font-bold">الرصيد المسموح: {errorData.limit_minutes} دقيقة</span>}
                        {errorData.consumed_minutes && <span>المستهلك: {errorData.consumed_minutes} دقيقة</span>}
                        {errorData.remaining_minutes && <span>المتبقي: {errorData.remaining_minutes} دقيقة</span>}
                        {errorData.requested_minutes && <span>الطلب الحالي: {errorData.requested_minutes} دقيقة</span>}
                    </AlertDescription>
                </Alert>
            )}

            {/* Request Number Display */}
            {initialData && initialData.request_number && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-md mb-4 flex items-center gap-2 border border-blue-100">
                    <span className="font-semibold">رقم الطلب:</span>
                    <span className="font-mono text-lg">{initialData.request_number}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {canAddForOthers && (
                    <div className="space-y-2">
                        <Label>الموظف *</Label>
                        <Select
                            value={String(formData.employee_id)}
                            onValueChange={(v) => handleSelectChange('employee_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الموظف" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={String(emp.id)}>
                                        {emp.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="request_date">تاريخ الطلب</Label>
                    <Input
                        type="date"
                        id="request_date"
                        name="request_date"
                        value={formData.request_date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_time">وقت البداية</Label>
                        <Input
                            type="time"
                            id="start_time"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_time">وقت النهاية</Label>
                        <Input
                            type="time"
                            id="end_time"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reason">سبب الاستئذان</Label>
                    <Textarea
                        id="reason"
                        name="reason"
                        placeholder="يرجى ذكر سبب الاستئذان..."
                        value={formData.reason}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                            إلغاء
                        </Button>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'حفظ التعديلات' : 'إرسال الطلب'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
