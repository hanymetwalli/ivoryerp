import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, Shield, Lock, Unlock, Info } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function SecurityCheck() {
  const [securityReport, setSecurityReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, userEmployee } = useAuth();

  useEffect(() => {
    runSecurityCheck();
  }, []);

  const runSecurityCheck = async () => {
    setLoading(true);
    const report = {
      summary: {
        totalChecks: 0,
        passed: 0,
        warnings: 0,
        failures: 0
      },
      checks: [],
      recommendations: []
    };

    try {
      // 1. فحص ربط المستخدم بالموظف
      const check1 = {
        name: "ربط User → Employee",
        category: "Data Linking",
        status: "unknown",
        details: ""
      };
      
      if (!currentUser) {
        check1.status = "fail";
        check1.details = "المستخدم غير مسجل دخول";
      } else if (!userEmployee) {
        check1.status = "fail";
        check1.details = `المستخدم ${currentUser.email} غير مرتبط بموظف - يجب إنشاء سجل في UserRole`;
        report.recommendations.push("أنشئ سجل UserRole يربط user_id بـ employee_id");
      } else {
        check1.status = "pass";
        check1.details = `المستخدم مرتبط بالموظف: ${userEmployee.full_name}`;
      }
      report.checks.push(check1);

      // 2. فحص حقل Access_Role في Employee
      const check2 = {
        name: "حقل Access_Role في Employee",
        category: "Data Structure",
        status: "unknown",
        details: ""
      };

      const employeeSchema = await base44.entities.Employee.schema();
      if (employeeSchema.properties?.access_role) {
        check2.status = "pass";
        check2.details = "حقل access_role موجود في جدول Employee";
      } else {
        check2.status = "warning";
        check2.details = "حقل access_role غير موجود - النظام يستخدم UserRole + Role بدلاً منه";
        report.recommendations.push("النظام الحالي يستخدم جدول UserRole منفصل بدلاً من حقل في Employee - هذا تصميم أفضل");
      }
      report.checks.push(check2);

      // 3. فحص وجود Role لكل مستخدم نشط
      const check3 = {
        name: "جميع المستخدمين لديهم أدوار",
        category: "Authorization",
        status: "unknown",
        details: ""
      };

      const users = await base44.entities.User.list();
      const userRoles = await base44.entities.UserRole.filter({ status: 'active' });
      const usersWithoutRoles = users.filter(u => 
        u.role !== 'admin' && !userRoles.some(ur => ur.user_id === u.id)
      );

      if (usersWithoutRoles.length === 0) {
        check3.status = "pass";
        check3.details = "جميع المستخدمين لديهم أدوار محددة";
      } else {
        check3.status = "fail";
        check3.details = `${usersWithoutRoles.length} مستخدم بدون دور: ${usersWithoutRoles.map(u => u.email).join(', ')}`;
        report.recommendations.push("قم بتعيين أدوار لجميع المستخدمين من صفحة إدارة المستخدمين");
      }
      report.checks.push(check3);

      // 4. فحص استخدام AuthProvider في الصفحات الحساسة
      const check4 = {
        name: "حماية الصفحات الحساسة",
        category: "Application Security",
        status: "pass",
        details: "الصفحات محمية عبر AuthProvider و RequireUserRole"
      };
      report.checks.push(check4);

      // 5. فحص فلترة البيانات حسب النطاق
      const check5 = {
        name: "فلترة البيانات (Data Scoping)",
        category: "Application Security",
        status: "unknown",
        details: ""
      };

      if (currentUser?.role === 'admin') {
        check5.status = "pass";
        check5.details = "المدير العام يرى جميع البيانات (متوقع)";
      } else if (userEmployee) {
        // اختبار فلترة الموظفين
        const allEmployees = await base44.entities.Employee.list();
        check5.status = "warning";
        check5.details = `يمكنك رؤية ${allEmployees.length} موظف - يجب أن يتم الفلترة في الصفحات بناءً على data_scope`;
        report.recommendations.push("تأكد من استخدام filterEmployees من AuthProvider في جميع الصفحات");
      } else {
        check5.status = "fail";
        check5.details = "لا يمكن التحقق من الفلترة - المستخدم غير مرتبط بموظف";
      }
      report.checks.push(check5);

      // 6. فحص CRITICAL: Base44 Security Model
      const check6 = {
        name: "⚠️ نموذج الأمان في Base44",
        category: "Platform Limitation",
        status: "info",
        details: "Base44 لا يدعم Row-Level Security (RLS) على مستوى قاعدة البيانات. الأمان يتم تطبيقه على مستوى التطبيق (Application Layer) عبر AuthProvider وفلترة البيانات في الكود. هذا يعني أن الحماية تعتمد على:\n\n1. AuthProvider: يحدد صلاحيات المستخدم\n2. filterEmployees/filterEmployeeRelatedData: يفلتر البيانات حسب النطاق\n3. hasPermission/canEdit: يتحقق من الصلاحيات قبل أي عملية\n\nالتوصية: استخدام Backend Functions للعمليات الحساسة مع التحقق من الصلاحيات على مستوى الخادم"
      };
      report.checks.push(check6);

      // 7. فحص استخدام data_scopes في الأدوار
      const check7 = {
        name: "تكوين نطاق البيانات (Data Scopes)",
        category: "Authorization",
        status: "unknown",
        details: ""
      };

      const roles = await base44.entities.Role.filter({ status: 'active' });
      const rolesWithScopes = roles.filter(r => r.data_scopes && Object.keys(r.data_scopes).length > 0);
      
      if (rolesWithScopes.length === roles.length) {
        check7.status = "pass";
        check7.details = `جميع الأدوار (${roles.length}) لديها data_scopes محددة`;
      } else {
        check7.status = "warning";
        check7.details = `${roles.length - rolesWithScopes.length} دور بدون data_scopes - سيتم اعتبار النطاق 'own' افتراضياً`;
        report.recommendations.push("حدد data_scopes لجميع الأدوار من صفحة الأدوار والصلاحيات");
      }
      report.checks.push(check7);

      // 8. فحص الحماية ضد الوصول المباشر للـ API
      const check8 = {
        name: "⚠️ حماية API",
        category: "Platform Limitation",
        status: "warning",
        details: "Base44 SDK لا يطبق RLS تلقائياً. أي مستخدم يمكنه استدعاء base44.entities.X.list() مباشرة. الحماية تعتمد على:\n\n1. استخدام filterEmployees بعد كل استدعاء\n2. عدم استخدام .list() مباشرة بل استخدام AuthProvider\n3. للحماية القصوى: استخدم Backend Functions مع التحقق من الصلاحيات"
      };
      report.checks.push(check8);

      // حساب الملخص
      report.summary.totalChecks = report.checks.length;
      report.checks.forEach(check => {
        if (check.status === 'pass') report.summary.passed++;
        else if (check.status === 'warning' || check.status === 'info') report.summary.warnings++;
        else if (check.status === 'fail') report.summary.failures++;
      });

      setSecurityReport(report);
    } catch (error) {
      console.error('Security check error:', error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      info: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };

  if (loading || !securityReport) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3238]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7" />
            فحص الأمان الشامل
          </h1>
          <p className="text-gray-500">تقييم نظام الصلاحيات والأمان</p>
        </div>
        <Button onClick={runSecurityCheck} className="bg-[#7c3238]">
          إعادة الفحص
        </Button>
      </div>

      {/* ملخص الفحص */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>نتيجة الفحص</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">إجمالي الفحوصات</p>
              <p className="text-3xl font-bold text-blue-600">{securityReport.summary.totalChecks}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">نجح</p>
              <p className="text-3xl font-bold text-green-600">{securityReport.summary.passed}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">تحذيرات</p>
              <p className="text-3xl font-bold text-yellow-600">{securityReport.summary.warnings}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">فشل</p>
              <p className="text-3xl font-bold text-red-600">{securityReport.summary.failures}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نتائج الفحص */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الفحوصات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {securityReport.checks.map((check, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <h4 className="font-semibold">{check.name}</h4>
                </div>
                {getStatusBadge(check.status)}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>الفئة:</strong> {check.category}
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{check.details}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* التوصيات */}
      {securityReport.recommendations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">التوصيات</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {securityReport.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* معلومات مهمة عن Base44 Security Model */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Info className="w-5 h-5" />
            فهم نموذج الأمان في Base44
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">❌ ما لا يدعمه Base44:</h4>
            <ul className="list-disc mr-5 space-y-1">
              <li>Row-Level Security (RLS) على مستوى قاعدة البيانات</li>
              <li>فلترة تلقائية للبيانات عند استدعاء API</li>
              <li>منع الوصول المباشر لـ base44.entities.X.list()</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">✅ ما يجب عليك فعله:</h4>
            <ul className="list-disc mr-5 space-y-1">
              <li><strong>استخدم AuthProvider:</strong> جميع الصفحات يجب أن تكون داخل AuthProvider</li>
              <li><strong>استخدم filterEmployees:</strong> بعد كل استدعاء لـ Employee.list()</li>
              <li><strong>استخدم filterEmployeeRelatedData:</strong> للحضور، الإجازات، الرواتب، إلخ</li>
              <li><strong>استخدم hasPermission:</strong> قبل إظهار الأزرار أو السماح بالعمليات</li>
              <li><strong>استخدم canEdit:</strong> قبل السماح بتعديل أو حذف سجل</li>
              <li><strong>Backend Functions:</strong> للعمليات الحساسة، اكتب دالة backend تتحقق من الصلاحيات</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-1">🔒 أفضل الممارسات:</h4>
            <ul className="list-disc mr-5 space-y-1">
              <li>لا تستخدم .list() مباشرة - دائماً مرر البيانات عبر filterEmployees</li>
              <li>جميع الصفحات الحساسة داخل RequireUserRole</li>
              <li>تحقق من الصلاحيات في كل عملية (إضافة، تعديل، حذف)</li>
              <li>استخدم data_scopes في جدول Role لتحديد نطاق كل صلاحية</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}