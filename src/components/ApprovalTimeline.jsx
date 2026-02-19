import React from "react";
import { CheckCircle, Clock, XCircle, User, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ApprovalTimeline({ approvalChain, approvalHistory }) {
  // Merge legacy history with chain if needed, or use integrated chain
  // In our new system, 'approvalChain' contains the status directly.
  
  // If we have an integrated chain (new system)
  const isIntegrated = approvalChain?.some(step => step.status && step.status !== 'pending');
  
  const steps = approvalChain || [];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        مسار الاعتمادات
      </h4>
      
      {steps.length > 0 ? (
        <div className="relative pr-4">
          {/* Vertical Line */}
          <div className="absolute right-[27px] top-4 bottom-4 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {steps.map((step, idx) => {
              // Determine status
              let status = step.status || 'pending';
              let date = step.decision_date || step.date;
              let actor = step.actor_name || step.approver_name;
              let notes = step.notes;

              // Legacy compatibility: Check approvalHistory if provided
              if (!isIntegrated && approvalHistory) {
                  const historyItem = approvalHistory.find(h => h.level === step.level);
                  if (historyItem) {
                      status = historyItem.action === 'approve' ? 'approved' : 'rejected';
                      date = historyItem.date;
                      actor = historyItem.approver_name;
                      notes = historyItem.notes;
                  }
              }

              const isApproved = status === 'approved' || status === 'manager_approved' || status === 'hr_approved' || status === 'gm_approved';
              const isRejected = status === 'rejected';
              const isPending = status === 'pending';
              const isSkipped = status === 'skipped';

              return (
                <div key={idx} className="relative flex gap-4 items-start">
                  {/* Icon Node */}
                  <div className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white",
                    isApproved && "border-green-500 bg-green-50",
                    isRejected && "border-red-500 bg-red-50",
                    isPending && "border-gray-300",
                    // Highlight current pending step if previous is approved or it's the first
                    isPending && (idx === 0 || steps[idx-1]?.status === 'approved') && "border-blue-500 ring-4 ring-blue-50"
                  )}>
                    {isApproved && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {isRejected && <XCircle className="w-5 h-5 text-red-600" />}
                    {isPending && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>

                  {/* Content Card */}
                  <div className={cn(
                    "flex-1 rounded-lg border p-3 transition-all",
                    isApproved && "bg-green-50/50 border-green-100",
                    isRejected && "bg-red-50/50 border-red-100",
                    isPending && "bg-white border-gray-100"
                  )}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className={cn("font-bold text-sm", 
                            isApproved ? "text-green-800" : isRejected ? "text-red-800" : "text-gray-700"
                        )}>
                          {step.level_name || step.role_title}
                        </h5>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {step.approver_name || step.role_required}
                        </p>
                      </div>
                      
                      {date && (
                        <span className="text-[10px] text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100">
                          {format(parseISO(date), "d/MM/yyyy h:mm a", { locale: ar })}
                        </span>
                      )}
                    </div>

                    {/* Status Badge & Actor */}
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                             {isApproved && <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">تم الاعتماد</span>}
                             {isRejected && <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">مرفوض</span>}
                             {isPending && <span className="text-xs text-gray-400">في الانتظار...</span>}
                             
                             {actor && status !== 'pending' && (
                                 <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                     <User className="w-3 h-3" />
                                     {actor}
                                 </span>
                             )}
                        </div>
                    </div>

                    {/* Notes */}
                    {notes && (
                      <div className="mt-2 text-xs text-gray-600 bg-white/50 p-2 rounded border border-gray-100 italic">
                        "{notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
           لا يوجد مسار اعتمادات
        </div>
      )}
    </div>
  );
}