import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { base44 } from '@/api/ivoryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function PermissionsForm() {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [errorData, setErrorData] = useState(null);
    const [formData, setFormData] = useState({
        request_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        reason: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific error when user types
        if (errorData) setErrorData(null);
    };

    const validate = () => {
        if (!formData.start_time || !formData.end_time || !formData.reason) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "يرجى تعبئة جميع الحقول المطلوبة.",
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
                user_id: currentUser?.id,
                start_time: fullStartTime,
                end_time: fullEndTime,
                reason: formData.reason
            };

            await base44.entities.PermissionRequest.create(payload);

            toast({
                title: "تم بنجاح",
                description: "تم إرسال طلب الاستئذان للمراجعة.",
            });

            // Reset Form
            setFormData({
                request_date: new Date().toISOString().split('T')[0],
                start_time: '',
                end_time: '',
                reason: ''
            });

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
        <Card className="w-full max-w-lg mx-auto mt-10">
            <CardHeader>
                <CardTitle className="text-xl">تقديم طلب استئذان</CardTitle>
            </CardHeader>
            <CardContent>
                {errorData && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>تجاوز الحد المسموح</AlertTitle>
                        <AlertDescription className="mt-2 flex flex-col gap-1 text-sm">
                            <span>عذراً، طلبك يتجاوز الرصيد الشهري.</span>
                            <span className="font-bold">الرصيد المسموح: {errorData.limit_minutes} دقيقة</span>
                            <span>المستهلك: {errorData.consumed_minutes} دقيقة</span>
                            <span>المتبقي: {errorData.remaining_minutes} دقيقة</span>
                            <span>الطلب الحالي: {errorData.requested_minutes} دقيقة</span>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        إرسال الطلب
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
