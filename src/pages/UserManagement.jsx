import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Edit, Shield, Link as LinkIcon, Plus, Download, Upload, Trash2, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/components/permissions";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleData, setRoleData] = useState({});
  const [newUserData, setNewUserData] = useState({});
  const [editUserData, setEditUserData] = useState({});
  const [activateData, setActivateData] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, userRolesData, rolesData, empData, pendingResponse] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.UserRole.list(),
        base44.entities.Role.list(),
        base44.entities.Employee.list(),
        base44.functions.invoke('listPendingUsers').catch(() => ({ data: { pendingUsers: [] } }))
      ]);
      setUsers(usersData);
      setUserRoles(userRolesData);
      setRoles(rolesData);
      setEmployees(empData);
      setPendingUsers(pendingResponse.data?.pendingUsers || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const getUserRole = (userId) => {
    return userRoles.find((ur) => ur.user_id === userId);
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || "-";
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.full_name || "-";
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    const existingRole = getUserRole(user.id);
    setRoleData({
      role_id: existingRole?.role_id || "",
      employee_id: existingRole?.employee_id || "",
    });
    setShowRoleModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserData({
      full_name: user.full_name || "",
      email: user.email || "",
      role: user.role || "user",
      password: "" // Keep empty unless changing
    });
    setShowEditUserModal(true);
  };

  const handleSubmitEditUser = async () => {
    if (!editUserData.email || !editUserData.full_name) {
      toast.error("يرجى تعبئة الحقول المطلوبة");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = { ...editUserData };
      if (!dataToSave.password) delete dataToSave.password;

      await base44.entities.User.update(selectedUser.id, dataToSave);
      toast.success("تم تحديث بيانات المستخدم بنجاح");
      await loadData();
      setShowEditUserModal(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
    setSaving(false);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${user.full_name || user.email}"؟ سيتم حذف جميع الأدوار المرتبطة به أيضاً.`)) {
      return;
    }

    try {
      await base44.entities.User.delete(user.id);
      toast.success("تم حذف المستخدم بنجاح");
      loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleAddUser = () => {
    setNewUserData({ role: "user" });
    setShowAddUserModal(true);
  };

  const handleSubmitNewUser = async () => {
    console.log("Submitting new user:", newUserData);
    if (!newUserData.email) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!newUserData.full_name) {
      toast.error("يرجى إدخال الاسم الكامل");
      return;
    }
    if (!newUserData.password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    setSaving(true);
    try {
      const response = await base44.functions.invoke('createUserDirectly', {
        email: newUserData.email,
        full_name: newUserData.full_name,
        password: newUserData.password,
        role: newUserData.role || "user",
      });
      
      console.log("Direct create response:", response);
      // Standard base44 pattern uses response.data
      const resData = response.data;
      if (resData.success) {
        toast.success("تم إنشاء المستخدم بنجاح");
        await loadData();
        setShowAddUserModal(false);
        setNewUserData({});
      } else {
        const errorMsg = resData.message || resData.error || "فشل في إنشاء المستخدم";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error(error.message || "حدث خطأ أثناء إضافة المستخدم");
    }
    setSaving(false);
  };

  const handleActivateUser = (user) => {
    setSelectedUser(user);
    const existingRole = getUserRole(user.id);
    setActivateData({
      full_name: user.full_name || "",
      password: "",
      role_id: existingRole?.role_id || "",
      employee_id: existingRole?.employee_id || ""
    });
    setShowActivateModal(true);
  };

  const handleSubmitActivate = async () => {
    if (!activateData.full_name || !activateData.password) {
      toast.error("يرجى تعبئة جميع الحقول");
      return;
    }

    if (!activateData.role_id) {
      toast.error("يرجى اختيار الدور");
      return;
    }

    setSaving(true);
    try {
      const response = await base44.functions.invoke('activatePendingUser', {
        user_id: selectedUser.id,
        full_name: activateData.full_name,
        password: activateData.password,
      });
      
      if (response.data.success) {
        const userRole = getUserRole(selectedUser.id);
        const userRoleData = {
          user_id: selectedUser.id,
          role_id: activateData.role_id,
          employee_id: activateData.employee_id || null,
          status: "active",
        };

        if (userRole) {
          await base44.entities.UserRole.update(userRole.id, userRoleData);
        } else {
          await base44.entities.UserRole.create(userRoleData);
        }

        toast.success("تم تفعيل المستخدم وتعيين الدور بنجاح");
        await loadData();
        setShowActivateModal(false);
        setActivateData({});
      } else {
        throw new Error(response.data.error || "فشل في تفعيل المستخدم");
      }
    } catch (error) {
      console.error("خطأ:", error);
      toast.error(error.message || "حدث خطأ أثناء تفعيل المستخدم");
    }
    setSaving(false);
  };

  const handleSubmitRole = async () => {
    if (!selectedUser || !roleData.role_id) {
      toast.error("يرجى اختيار الدور");
      return;
    }

    setSaving(true);
    try {
      const existingRole = getUserRole(selectedUser.id);
      const dataToSave = {
        user_id: selectedUser.id,
        ...roleData,
        status: "active",
      };

      if (existingRole) {
        await base44.entities.UserRole.update(existingRole.id, dataToSave);
      } else {
        await base44.entities.UserRole.create(dataToSave);
      }
      
      toast.success("تم تحديث الدور بنجاح");
      loadData();
      setShowRoleModal(false);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
    setSaving(false);
  };

  const exportToCSV = () => {
    const headers = ["الاسم", "البريد الإلكتروني", "الدور في النظام", "الدور", "الموظف المرتبط"];
    const rows = users.map((user) => {
      const userRole = getUserRole(user.id);
      return [
        user.full_name || "",
        user.email || "",
        user.role === "admin" ? "مدير عام" : "مستخدم",
        userRole ? getRoleName(userRole.role_id) : "",
        userRole?.employee_id ? getEmployeeName(userRole.employee_id) : "",
      ];
    });
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: "الاسم",
      accessor: "full_name",
      cell: (row) => row.full_name || <span className="text-gray-400 italic">معلق - لم يكمل التسجيل</span>,
    },
    {
      header: "البريد الإلكتروني",
      accessor: "email",
    },
    {
      header: "الحالة",
      accessor: "status",
      cell: (row) => {
        const isPending = !row.full_name || row.full_name.trim() === "";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPending 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-green-100 text-green-800"
          }`}>
            {isPending ? "معلق" : "نشط"}
          </span>
        );
      },
    },
    {
      header: "الدور في النظام",
      accessor: "role",
      cell: (row) => (
        <span className={row.role === "admin" ? "font-semibold text-[#7c3238]" : ""}>
          {row.role === "admin" ? "مدير عام" : "مستخدم"}
        </span>
      ),
    },
    {
      header: "الدور",
      accessor: "user_role",
      cell: (row) => {
        const userRole = getUserRole(row.id);
        return userRole ? getRoleName(userRole.role_id) : "-";
      },
    },
    {
      header: "الموظف المرتبط",
      accessor: "employee",
      cell: (row) => {
        const userRole = getUserRole(row.id);
        return userRole?.employee_id ? getEmployeeName(userRole.employee_id) : "-";
      },
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => {
        const isPending = !row.full_name || row.full_name.trim() === "";
        return (
          <div className="flex gap-2">
            {isPending ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleActivateUser(row)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                تفعيل وتعيين الدور
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleEditUser(row)} title="تعديل البيانات">
                  <Edit className="w-4 h-4 text-blue-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEditRole(row)} title="تعديل الدور">
                  <Shield className="w-4 h-4 text-amber-600" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(row)} title="حذف">
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <ProtectedRoute permission={PERMISSIONS.MANAGE_USERS}>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة المستخدمين والأدوار</h2>
            <p className="text-gray-500">إضافة المستخدمين وتعيين الأدوار والصلاحيات</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">ربط المستخدمين بالأدوار</h3>
          <p className="text-sm text-blue-800">
            قم بإضافة مستخدمين جدد أو ربط المستخدمين الحاليين بموظف ودور محدد للتحكم في الصلاحيات
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className={filterStatus === "all" ? "bg-[#7c3238] hover:bg-[#5a252a]" : ""}
          >
            الكل ({users.length + pendingUsers.length})
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
            className={filterStatus === "active" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            النشطين ({users.length})
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
            className={filterStatus === "pending" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
          >
            المعلقين ({pendingUsers.length})
          </Button>
        </div>

        <DataTable
          data={
            filterStatus === "pending" 
              ? pendingUsers 
              : filterStatus === "active" 
              ? users 
              : [...users, ...pendingUsers]
          }
          columns={columns}
          loading={loading}
          onAdd={handleAddUser}
          addButtonText="إضافة مستخدم جديد"
          searchPlaceholder="بحث..."
          emptyMessage={
            filterStatus === "pending" 
              ? "لا يوجد مستخدمون معلقون" 
              : filterStatus === "active"
              ? "لا يوجد مستخدمون نشطون"
              : "لا يوجد مستخدمون"
          }
        />

        <FormModal
          open={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          title="إضافة مستخدم جديد"
          onSubmit={(e) => {
            console.log("FormModal onSubmit triggered");
            if (e && e.preventDefault) e.preventDefault();
            handleSubmitNewUser();
          }}
          loading={saving}
        >
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>الاسم الكامل *</Label>
              <Input
                value={newUserData.full_name || ""}
                onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                placeholder="الاسم الكامل"
              />
            </div>

            <div>
              <Label>البريد الإلكتروني *</Label>
              <Input
                type="email"
                value={newUserData.email || ""}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <Label>كلمة المرور *</Label>
              <Input
                type="password"
                value={newUserData.password || ""}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="كلمة المرور"
              />
            </div>

            <div>
              <Label>الدور في النظام *</Label>
              <Select
                value={newUserData.role || "user"}
                onValueChange={(v) => setNewUserData({ ...newUserData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="admin">مدير عام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                سيتم إنشاء المستخدم مباشرة بكلمة المرور المحددة. يمكنه تسجيل الدخول فوراً.
              </p>
            </div>
          </div>
        </FormModal>

        <FormModal
          open={showEditUserModal}
          onClose={() => setShowEditUserModal(false)}
          title="تعديل بيانات المستخدم"
          onSubmit={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            handleSubmitEditUser();
          }}
          loading={saving}
        >
          <div className="space-y-4" dir="rtl">
            <div>
              <Label>الاسم الكامل *</Label>
              <Input
                value={editUserData.full_name || ""}
                onChange={(e) => setEditUserData({ ...editUserData, full_name: e.target.value })}
                placeholder="الاسم الكامل"
              />
            </div>

            <div>
              <Label>البريد الإلكتروني *</Label>
              <Input
                type="email"
                value={editUserData.email || ""}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <Label>كلمة المرور (اتركها فارغة لعدم التغيير)</Label>
              <Input
                type="password"
                value={editUserData.password || ""}
                onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                placeholder="كلمة المرور الجديدة"
              />
            </div>

            <div>
              <Label>الدور في النظام *</Label>
              <Select
                value={editUserData.role || "user"}
                onValueChange={(v) => setEditUserData({ ...editUserData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم</SelectItem>
                  <SelectItem value="admin">مدير عام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormModal>

        <FormModal
          open={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          title="تعديل دور المستخدم"
          onSubmit={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            handleSubmitRole();
          }}
          loading={saving}
        >
          {selectedUser && (
            <div className="space-y-4" dir="rtl">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">المستخدم</p>
                <p className="font-medium">{selectedUser.full_name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>

              <div>
                <Label>الدور *</Label>
                <Select
                  value={roleData.role_id || ""}
                  onValueChange={(v) => setRoleData({ ...roleData, role_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.filter(r => r.status === 'active').map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  <LinkIcon className="w-4 h-4 inline ml-1" />
                  الموظف المرتبط
                </Label>
                <Select
                  value={roleData.employee_id || ""}
                  onValueChange={(v) => setRoleData({ ...roleData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>بدون موظف مرتبط</SelectItem>
                    {employees.filter(e => e.status === 'active').map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.employee_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </FormModal>

        <FormModal
          open={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          title="تفعيل مستخدم معلق"
          onSubmit={(e) => {
            if (e && e.preventDefault) e.preventDefault();
            handleSubmitActivate();
          }}
          loading={saving}
        >
          {selectedUser && (
            <div className="space-y-4" dir="rtl">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>

              <div>
                <Label>الاسم الكامل *</Label>
                <Input
                  value={activateData.full_name || ""}
                  onChange={(e) => setActivateData({ ...activateData, full_name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <Label>كلمة المرور *</Label>
                <Input
                  type="password"
                  value={activateData.password || ""}
                  onChange={(e) => setActivateData({ ...activateData, password: e.target.value })}
                  placeholder="أدخل كلمة المرور"
                />
              </div>

              <div>
                <Label>الدور *</Label>
                <Select
                  value={activateData.role_id || ""}
                  onValueChange={(v) => setActivateData({ ...activateData, role_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.filter(r => r.status === 'active').map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  <LinkIcon className="w-4 h-4 inline ml-1" />
                  الموظف المرتبط
                </Label>
                <Select
                  value={activateData.employee_id || ""}
                  onValueChange={(v) => setActivateData({ ...activateData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>بدون موظف مرتبط</SelectItem>
                    {employees.filter(e => e.status === 'active').map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.employee_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  سيتم تفعيل المستخدم وتعيين كلمة المرور والدور المحدد. يمكنه تسجيل الدخول مباشرة بعد التفعيل.
                </p>
              </div>
            </div>
          )}
        </FormModal>
      </div>
    </ProtectedRoute>
  );
}