import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle, Shield, User, Users, Link as LinkIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { PERMISSIONS } from "@/components/permissions";

export default function DiagnosticsPermissions() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, userRole, userEmployee, rolePermissions, dataScopes, loading: authLoading } = useAuth();

  useEffect(() => {
    runDiagnostics();
  }, [authLoading]);

  const runDiagnostics = async () => {
    if (authLoading) return;
    
    setLoading(true);
    const results = {
      authProvider: {},
      database: {},
      permissions: {},
      issues: []
    };

    try {
      // 1. فحص AuthProvider
      results.authProvider = {
        currentUser: currentUser ? { 
          id: currentUser.id, 
          email: currentUser.email, 
          role: currentUser.role,
          full_name: currentUser.full_name 
        } : null,
        userRole: userRole || null,
        userEmployee: userEmployee ? { id: userEmployee.id, name: userEmployee.full_name, department: userEmployee.department } : null,
        rolePermissions: rolePermissions || [],
        dataScopes: dataScopes || {},
        hasAuthProvider: !!currentUser,
        isAdminBySystem: currentUser?.role === 'admin',
        effectivePermissions: currentUser?.role === 'admin' ? ['جميع الصلاحيات (admin)'] : (rolePermissions || [])
      };

      if (!currentUser) {
        results.issues.push({ type: 'error', message: 'المستخدم غير مسجل دخول' });
      }
      
      // التحقق من تعارض الصلاحيات
      if (currentUser?.role === 'admin' && userRole) {
        results.issues.push({ 
          type: 'warning', 
          message: 'المستخدم لديه role=admin في النظام، لذلك يتم تجاهل الدور المخصص في UserRole. إذا أردت تحديد صلاحياته، يجب تغيير role إلى user في جدول User' 
        });
      }

      // 2. فحص قاعدة البيانات
      const [users, userRoles, roles, employees] = await Promise.all([
        base44.entities.User.list().catch(() => []),
        base44.entities.UserRole.list().catch(() => []),
        base44.entities.Role.list().catch(() => []),
        base44.entities.Employee.list().catch(() => [])
      ]);

      results.database = {
        totalUsers: users.length,
        totalUserRoles: userRoles.length,
        totalRoles: roles.length,
        totalEmployees: employees.length,
        users: users.slice(0, 5).map(u => ({ id: u.id, email: u.email, full_name: u.full_name })),
        userRoles: userRoles.slice(0, 5).map(ur => ({ 
          id: ur.id, 
          user_id: ur.user_id, 
          role_id: ur.role_id, 
          employee_id: ur.employee_id,
          status: ur.status 
        })),
        roles: roles.map(r => ({ 
          id: r.id, 
          name: r.name, 
          code: r.code,
          permissionsCount: (r.permissions || []).length,
          permissions: r.permissions || [],
          dataScopes: r.data_scopes || {},
          status: r.status 
        })),
        employees: employees.slice(0, 5).map(e => ({ 
          id: e.id, 
          full_name: e.full_name, 
          department: e.department 
        }))
      };

      // 3. فحص الربط بين الكيانات
      if (currentUser && currentUser.id) {
        const myUserRole = userRoles.find(ur => ur.user_id === currentUser.id && ur.status === 'active');
        
        if (!myUserRole) {
          results.issues.push({ 
            type: 'error', 
            message: `لا يوجد سجل UserRole نشط للمستخدم ${currentUser.email}` 
          });
        } else {
          const myRole = roles.find(r => r.id === myUserRole.role_id);
          const myEmployee = employees.find(e => e.id === myUserRole.employee_id);
          
          if (!myRole) {
            results.issues.push({ 
              type: 'error', 
              message: 'الدور المحدد في UserRole غير موجود في جدول Role' 
            });
          }
          
          if (!myEmployee && myUserRole.employee_id) {
            results.issues.push({ 
              type: 'warning', 
              message: 'الموظف المحدد في UserRole غير موجود في جدول Employee' 
            });
          }

          results.permissions = {
            myUserRole,
            myRole,
            myEmployee,
            rolePermissions: myRole?.permissions || [],
            dataScopes: myRole?.data_scopes || {}
          };
        }
      }

      // 4. فحص توافق الصلاحيات
      const definedPermissions = Object.values(PERMISSIONS);
      const unusedPermissions = [];
      
      roles.forEach(role => {
        (role.permissions || []).forEach(perm => {
          if (!definedPermissions.includes(perm)) {
            unusedPermissions.push({ role: role.name, permission: perm });
          }
        });
      });

      if (unusedPermissions.length > 0) {
        results.issues.push({
          type: 'warning',
          message: `صلاحيات غير معرفة في PERMISSIONS: ${unusedPermissions.length}`,
          details: unusedPermissions
        });
      }

      // 5. فحص المستخدمين بدون أدوار
      const usersWithoutRoles = users.filter(u => 
        !userRoles.some(ur => ur.user_id === u.id && ur.status === 'active')
      );

      if (usersWithoutRoles.length > 0) {
        results.issues.push({
          type: 'warning',
          message: `${usersWithoutRoles.length} مستخدم بدون دور نشط`,
          details: usersWithoutRoles.map(u => u.email)
        });
      }

      setDiagnostics(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      results.issues.push({ type: 'error', message: `خطأ في الفحص: ${error.message}` });
      setDiagnostics(results);
    }
    setLoading(false);
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3238]" />
      </div>
    );
  }

  if (!diagnostics) {
    return <div>حدث خطأ في تحميل التشخيصات</div>;
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">تشخيص نظام الصلاحيات</h1>
          <p className="text-gray-500">فحص شامل لنظام الصلاحيات والأدوار</p>
        </div>
        <Button onClick={runDiagnostics} className="bg-[#7c3238]">
          إعادة الفحص
        </Button>
      </div>

      {/* المشاكل */}
      {diagnostics.issues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              المشاكل المكتشفة ({diagnostics.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {diagnostics.issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                {issue.type === 'error' ? (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{issue.message}</p>
                  {issue.details && (
                    <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(issue.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {diagnostics.issues.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-medium text-lg">لم يتم اكتشاف مشاكل</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات AuthProvider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            AuthProvider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">المستخدم الحالي:</h4>
              <pre className="text-xs p-3 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(diagnostics.authProvider.currentUser, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">دور المستخدم:</h4>
              <pre className="text-xs p-3 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(diagnostics.authProvider.userRole, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">موظف المستخدم:</h4>
              <pre className="text-xs p-3 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(diagnostics.authProvider.userEmployee, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                الصلاحيات الفعلية:
                {diagnostics.authProvider.isAdminBySystem && (
                  <Badge className="bg-red-600">ADMIN - كل الصلاحيات</Badge>
                )}
              </h4>
              <div className="flex flex-wrap gap-2">
                {diagnostics.authProvider.effectivePermissions.map((perm, idx) => (
                  <Badge key={idx} variant={diagnostics.authProvider.isAdminBySystem ? "default" : "outline"}>
                    {perm}
                  </Badge>
                ))}
              </div>
              {!diagnostics.authProvider.isAdminBySystem && diagnostics.authProvider.rolePermissions.length === 0 && (
                <p className="text-red-600 text-sm mt-2">⚠️ لا توجد صلاحيات محددة</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">نطاق البيانات:</h4>
              <pre className="text-xs p-3 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(diagnostics.authProvider.dataScopes, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات قاعدة البيانات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            قاعدة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">المستخدمين</p>
              <p className="text-2xl font-bold text-blue-600">{diagnostics.database.totalUsers}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">UserRole</p>
              <p className="text-2xl font-bold text-green-600">{diagnostics.database.totalUserRoles}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">الأدوار</p>
              <p className="text-2xl font-bold text-purple-600">{diagnostics.database.totalRoles}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">الموظفين</p>
              <p className="text-2xl font-bold text-orange-600">{diagnostics.database.totalEmployees}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">الأدوار:</h4>
              {diagnostics.database.roles.map((role, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{role.name}</span>
                    <Badge variant={role.status === 'active' ? 'default' : 'secondary'}>
                      {role.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">الكود: {role.code}</p>
                  <p className="text-sm text-gray-600">عدد الصلاحيات: {role.permissionsCount}</p>
                  <details className="mt-2">
                    <summary className="text-sm text-blue-600 cursor-pointer">عرض التفاصيل</summary>
                    <pre className="text-xs p-2 bg-white rounded mt-2 overflow-auto">
                      {JSON.stringify({ permissions: role.permissions, dataScopes: role.dataScopes }, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الصلاحيات الحالية */}
      {diagnostics.permissions.myRole && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              صلاحياتي الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">الدور</p>
                  <p className="font-bold text-blue-800">{diagnostics.permissions.myRole.name}</p>
                </div>
                {diagnostics.permissions.myEmployee && (
                  <>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">الموظف</p>
                      <p className="font-bold text-green-800">{diagnostics.permissions.myEmployee.full_name}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">القسم</p>
                      <p className="font-bold text-purple-800">{diagnostics.permissions.myEmployee.department}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">الصلاحيات ({diagnostics.permissions.rolePermissions.length}):</h4>
                <div className="flex flex-wrap gap-2">
                  {diagnostics.permissions.rolePermissions.map((perm, idx) => (
                    <Badge key={idx} className="bg-[#7c3238]">{perm}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">نطاق البيانات:</h4>
                <pre className="text-xs p-3 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(diagnostics.permissions.dataScopes, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}