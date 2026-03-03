import React from "react";
import { cn } from "@/lib/utils";

const statusStyles = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  returned: "bg-orange-100 text-orange-700 border-orange-200",
  manager_approved: "bg-blue-100 text-blue-700 border-blue-200",
  gm_approved: "bg-indigo-100 text-indigo-700 border-indigo-200",
  hr_approved: "bg-green-100 text-green-700 border-green-200",
  draft: "bg-yellow-100 text-yellow-700 border-yellow-200",
  pending_review: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  present: "bg-green-100 text-green-700 border-green-200",
  absent: "bg-red-100 text-red-700 border-red-200",
  leave: "bg-blue-100 text-blue-700 border-blue-200",
  holiday: "bg-purple-100 text-purple-700 border-purple-200",
  weekend: "bg-gray-100 text-gray-600 border-gray-200",
  expired: "bg-orange-100 text-orange-700 border-orange-200",
  terminated: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  enrolled: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  planned: "bg-blue-100 text-blue-700 border-blue-200",
  force_approved: "bg-blue-100 text-blue-700 border-blue-200",
  resigned: "bg-orange-100 text-orange-700 border-orange-200",
};

const statusLabels = {
  active: "نشط",
  inactive: "غير نشط",
  pending: "قيد الانتظار",
  approved: "معتمد",
  rejected: "مرفوض",
  returned: "مُعاد بملاحظة",
  manager_approved: "موافقة المدير",
  gm_approved: "موافقة المدير العام",
  hr_approved: "معتمد من الموارد البشرية",
  force_approved: "اعتماد نهائي استثنائي ⚡",
  draft: "مسودة",
  pending_review: "قيد المراجعة",
  paid: "مدفوع",
  present: "حاضر",
  absent: "غائب",
  leave: "إجازة",
  holiday: "عطلة رسمية",
  weekend: "نهاية الأسبوع",
  expired: "منتهي",
  terminated: "مفسوخ",
  completed: "مكتمل",
  in_progress: "قيد التنفيذ",
  enrolled: "مسجل",
  cancelled: "ملغي",
  planned: "مستقبلي",
  resigned: "مستقيل",
};

export default function StatusBadge({ status, customLabel = null, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status] || statusStyles.inactive,
        className
      )}
    >
      {customLabel || statusLabels[status] || status}
    </span>
  );
}