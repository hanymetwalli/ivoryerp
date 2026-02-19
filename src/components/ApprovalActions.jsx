import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export default function ApprovalActions({ entityName, recordId, onApproved }) {
  const [processing, setProcessing] = useState(false);
  const { currentUser } = useAuth();
  
  // State for form visibility
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [notes, setNotes] = useState("");

  const handleAction = async (action, notesText = "") => {
    setProcessing(true);
    try {
      const response = await base44.functions.invoke('processApproval', {
        entity_name: entityName,
        entity_id: recordId,
        action: action,
        notes: notesText,
        approver_id: currentUser?.id,
        approver_name: currentUser?.full_name || currentUser?.name || currentUser?.email
      });
      
      const result = response.data || response; // Handle nested data structure

      if (result.success) {
        toast.success(result.message || (action === 'approve' ? 'تم الاعتماد بنجاح' : 'تم الرفض بنجاح'));
        
        setShowApproveForm(false);
        setShowRejectForm(false);
        setNotes("");
        
        if (onApproved) {
            onApproved(result); // Pass result back
        }
      } else {
        const errorMsg = result.message || result.error || 'حدث خطأ غير متوقع';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error(`${action} error:`, error);
      toast.error('حدث خطأ في الاتصال');
    }
    setProcessing(false);
  };
  
  // Render nothing if processing (or show loader)
  if (processing) {
      return <div className="text-sm text-gray-500 animate-pulse">جاري التنفيذ...</div>;
  }

  return (
    <div className="space-y-3">
      {!showApproveForm && !showRejectForm && (
        <div className="flex gap-3">
          <Button
            onClick={() => setShowApproveForm(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 ml-2" />
            اعتماد
          </Button>
          <Button
            onClick={() => setShowRejectForm(true)}
            variant="outline"
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <XCircle className="w-4 h-4 ml-2" />
            رفض
          </Button>
        </div>
      )}

      {showApproveForm && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-100 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                تأكيد الاعتماد
            </h4>
            <div className="space-y-3">
                <Textarea
                    placeholder="ملاحظات (اختياري)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white border-green-200 focus:border-green-400 min-h-[80px]"
                />
                <div className="flex gap-2">
                    <Button 
                        onClick={() => handleAction('approve', notes)}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                        تأكيد
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => { setShowApproveForm(false); setNotes(""); }}
                        className="border-green-200 text-green-700 hover:bg-green-100 flex-1"
                    >
                        إلغاء
                    </Button>
                </div>
            </div>
        </div>
      )}

      {showRejectForm && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                تأكيد الرفض
            </h4>
            <div className="space-y-3">
                <Textarea
                    placeholder="سبب الرفض (اختياري)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-white border-red-200 focus:border-red-400 min-h-[80px]"
                />
                <div className="flex gap-2">
                    <Button 
                        onClick={() => handleAction('reject', notes)}
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                    >
                        تأكيد الرفض
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => { setShowRejectForm(false); setNotes(""); }}
                        className="border-red-200 text-red-700 hover:bg-red-100 flex-1"
                    >
                        إلغاء
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}