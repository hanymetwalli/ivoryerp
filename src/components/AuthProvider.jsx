import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userEmployee, setUserEmployee] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [dataScopes, setDataScopes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      // Handle local admin override
      if (user.role === 'admin' || user.email === 'admin@ivory.com') {
        setRolePermissions(['*']); // كل الصلاحيات
        setDataScopes({});
        setLoading(false);
        return;
      }
      
      // تحميل دور المستخدم من قاعدة البيانات
      const userRoles = await base44.entities.UserRole.filter({ 
        user_id: user.id, 
        status: 'active' 
      });

      if (userRoles.length === 0) {
        // مستخدم بدون دور محدد - لا صلاحيات
        setRolePermissions([]);
        setDataScopes({});
        setLoading(false);
        return;
      }

      const userRoleData = userRoles[0];
      setUserRole(userRoleData);

      // تحميل بيانات الموظف المرتبط بالمستخدم
      if (userRoleData.employee_id) {
        const empData = await base44.entities.Employee.filter({ 
          id: userRoleData.employee_id 
        });
        if (empData.length > 0) {
          setUserEmployee(empData[0]);
        }
      }

      // تحميل بيانات الدور والصلاحيات
      const roles = await base44.entities.Role.filter({ 
        id: userRoleData.role_id,
        status: 'active'
      });

      if (roles.length > 0) {
        const role = roles[0];
        setRolePermissions(role.permissions || []);
        setDataScopes(role.data_scopes || {});
      } else {
        setRolePermissions([]);
        setDataScopes({});
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    setLoading(false);
  };

  // A. التحقق من صلاحية معينة (includes() check)
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    // Admin له جميع الصلاحيات
    if (currentUser.role === 'admin') return true;
    if (rolePermissions.includes('*')) return true;
    
    // A. Check Basic Permission - includes() check
    return rolePermissions.includes(permission);
  };

  // B. الحصول على نطاق البيانات (switch(scope) logic)
  const getDataScope = (permission) => {
    if (!currentUser) return 'none';
    
    // Admin له نطاق كامل
    if (currentUser.role === 'admin') return 'all';
    
    // B. Check Data Scope - Default to 'own' if undefined
    return dataScopes[permission] || 'own';
  };

  // فلترة بيانات الموظفين حسب النطاق (Dynamic Lookup Method)
  const filterEmployees = (employees, permission) => {
    if (!currentUser) return [];
    
    // Admin يرى الكل
    if (currentUser.role === 'admin') return employees;
    
    // A. Check Basic Permission - includes() check
    if (!rolePermissions.includes(permission)) {
      return []; // ACCESS DENIED
    }
    
    // B. Check Data Scope - switch(scope) logic
    const scopeValue = dataScopes[permission] || 'own'; // Default to 'own' if undefined
    
    switch (scopeValue) {
      case 'all':
        return employees; // RETURN ALL RECORDS
        
      case 'department':
        // Match Employee's Department
        if (!userEmployee) return [];
        return employees.filter(emp => emp.department === userEmployee.department);
        
      case 'own':
        // Match Employee's Own ID (or Email)
        if (!userEmployee) return [];
        return employees.filter(emp => 
          emp.id === userEmployee.id || 
          emp.email === currentUser.email
        );
        
      default:
        return []; // Fail Safe
    }
  };

  // فلترة البيانات المرتبطة بموظفين (الحضور، الإجازات، إلخ) - Dynamic Filtering
  const filterEmployeeRelatedData = (data, employees, getEmployeeId) => {
    if (!currentUser) return [];
    
    // Admin يرى الكل
    if (currentUser.role === 'admin') return data;
    
    if (!userEmployee) return [];
    
    // فلترة البيانات بناءً على الموظفين المسموح بهم
    const allowedEmployeeIds = employees.map(e => e.id);
    return data.filter(item => {
      const itemEmployeeId = getEmployeeId(item);
      return allowedEmployeeIds.includes(itemEmployeeId);
    });
  };

  // التحقق من إمكانية تعديل عنصر معين
  const canEdit = (permission, item, getEmployeeId) => {
    if (!hasPermission(permission)) return false;
    if (currentUser?.role === 'admin') return true;
    
    const scope = getDataScope(permission);
    if (scope === 'all') return true;
    
    if (scope === 'own') {
      if (!userEmployee) return false;
      const itemEmployeeId = getEmployeeId(item);
      return itemEmployeeId === userEmployee.id;
    }
    
    if (scope === 'department') {
      if (!userEmployee) return false;
      // سيتم التحقق في الصفحة الفردية
      return true;
    }
    
    return false;
  };

  const value = {
    currentUser,
    userRole,
    userEmployee,
    rolePermissions,
    dataScopes,
    loading,
    hasPermission,
    getDataScope,
    filterEmployees,
    filterEmployeeRelatedData,
    canEdit,
    reload: loadUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}