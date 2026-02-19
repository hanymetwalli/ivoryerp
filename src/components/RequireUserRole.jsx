import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertCircle, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RequireUserRole({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        setError('no_role');
        setLoading(false);
        return;
      }
      setUser(currentUser);

      // المسؤول العام يمكنه الدخول دائماً
      if (currentUser.role === 'admin') {
        setUserRole({ role: 'admin' });
        setLoading(false);
        return;
      }

      // التحقق من وجود UserRole نشط
      const userRoles = await base44.entities.UserRole.filter({
        user_id: currentUser.id,
        status: 'active',
      });

      if (userRoles && userRoles.length > 0) {
        setUserRole(userRoles[0]);
      } else {
        setError('no_role');
      }
    } catch (err) {
      console.error("Error checking user role:", err);
      setError('error');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3238]" />
      </div>
    );
  }

  if (error === 'no_role') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">غير مصرح لك بالدخول</h3>
            <p className="text-gray-600 mb-4">
              حسابك غير مفعل في النظام. يرجى التواصل مع إدارة الموارد البشرية لتفعيل حسابك وربطه بدور وصلاحيات محددة.
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 mb-4">
              <p className="font-medium mb-1">معلومات الحساب:</p>
              <p>الاسم: {user?.full_name}</p>
              <p>البريد: {user?.email}</p>
            </div>
            <Button
              onClick={() => base44.auth.logout()}
              variant="outline"
              className="w-full"
            >
              تسجيل الخروج
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error === 'error') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">حدث خطأ</h3>
            <p className="text-gray-600 mb-4">
              تعذر التحقق من صلاحيات الدخول. يرجى المحاولة مرة أخرى.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#7c3238] hover:bg-[#5a252a]"
            >
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}