import React from "react";
import { CheckCircle, Clock, XCircle, User, RotateCcw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

/**
 * Get the current pending step from the approval chain
 */
export function getCurrentPendingStep(steps) {
  if (!steps || !Array.isArray(steps)) return null;
  return steps.find(s => s.status === 'pending') || null;
}

/**
 * Get display label for a step (job_title or role_name)
 */
function getStepTitle(step) {
  return step.approver_job_title || step.role_name || (step.approver_name ? 'المدير المباشر' : `الخطوة ${step.step_order}`);
}

/**
 * Get the approver display name respecting visibility
 */
function getApproverDisplay(step) {
  if (!step.approver_user_id) {
    return { name: null, subtitle: getStepTitle(step), badge: 'بانتظار التعيين' };
  }

  const nameVisible = step.is_name_visible === 1 || step.is_name_visible === true || step.is_name_visible === '1';
  const title = getStepTitle(step);

  if (nameVisible) {
    return { name: step.approver_name, subtitle: title, badge: null };
  } else {
    return { name: null, subtitle: title, badge: null };
  }
}

export default function ApprovalTimeline({ approvalChain = [] }) {
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
              const status = step.status || 'pending';
              const date = step.action_date || step.decision_date || step.date;
              const notes = step.comments || step.notes;
              const display = getApproverDisplay(step);
              const actor = step.approver_name;

              const isApproved = status === 'approved';
              const isRejected = status === 'rejected';
              const isReturned = status === 'returned';
              const isPending = status === 'pending';

              // Is this the current active step?
              const isCurrentStep = isPending && (idx === 0 || steps[idx - 1]?.status === 'approved');

              return (
                <div key={step.id || idx} className="relative flex gap-4 items-start">
                  {/* Icon Node */}
                  <div className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white",
                    isApproved && "border-green-500 bg-green-50",
                    isRejected && "border-red-500 bg-red-50",
                    isReturned && "border-orange-500 bg-orange-50",
                    isPending && "border-gray-300",
                    isCurrentStep && "border-blue-500 ring-4 ring-blue-50"
                  )}>
                    {isApproved && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {isRejected && <XCircle className="w-5 h-5 text-red-600" />}
                    {isReturned && <RotateCcw className="w-4 h-4 text-orange-600" />}
                    {isPending && <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                  </div>

                  {/* Content Card */}
                  <div className={cn(
                    "flex-1 rounded-lg border p-3 transition-all",
                    isApproved && "bg-green-50/50 border-green-100",
                    isRejected && "bg-red-50/50 border-red-100",
                    isReturned && "bg-orange-50/50 border-orange-100",
                    isPending && "bg-white border-gray-100",
                    isCurrentStep && "ring-1 ring-blue-200"
                  )}>
                    <div className="flex justify-between items-start">
                      <div>
                        {/* Job title / Role name (always visible) */}
                        <h5 className={cn("font-bold text-sm",
                          isApproved ? "text-green-800" : isRejected ? "text-red-800" : isReturned ? "text-orange-800" : "text-gray-700"
                        )}>
                          {display.subtitle}
                        </h5>

                        {/* Approver name (respects is_name_visible) */}
                        {display.name && (
                          <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {display.name}
                          </p>
                        )}

                        {/* Awaiting assignment badge */}
                        {display.badge && (
                          <p className="text-xs text-amber-600 mt-0.5 italic">{display.badge}</p>
                        )}
                      </div>

                      {date && (
                        <span className="text-[10px] text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-100">
                          {(() => {
                            try { return format(parseISO(date), "d/MM/yyyy h:mm a", { locale: ar }); }
                            catch { return date; }
                          })()}
                        </span>
                      )}
                    </div>

                    {/* Status Badge & Actor */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isApproved && <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">تم الاعتماد</span>}
                        {isRejected && <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">مرفوض</span>}
                        {isReturned && <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded">مُرجع</span>}
                        {isPending && isCurrentStep && <span className="text-xs text-blue-600 font-medium animate-pulse">جاري الانتظار...</span>}
                        {isPending && !isCurrentStep && <span className="text-xs text-gray-400">في الانتظار...</span>}

                        {actor && status !== 'pending' && (display.name !== null) && (
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