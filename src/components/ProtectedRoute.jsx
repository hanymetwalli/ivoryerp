import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { hasPermission } from "@/components/permissions";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProtectedRoute({ permission, children, fallback }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log("User not authenticated");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c3238]" />
      </div>
    );
  }

  if (!hasPermission(user, permission)) {
    if (fallback) return fallback;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4" dir="rtl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">ليس لديك صلاحية الوصول</h3>
        <p className="text-gray-600">عذراً، ليس لديك الصلاحية للوصول إلى هذه الصفحة.</p>
        <Button onClick={() => window.history.back()} variant="outline">
          العودة
        </Button>
      </div>
    );
  }

  return children;
}