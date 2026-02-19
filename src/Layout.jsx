import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Building2,
  Briefcase,
  GraduationCap,
  Bell,
  MapPin,
  Building,
  CalendarCheck,
  Gift,
  Shield,
  DollarSign,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import RequireUserRole from "@/components/RequireUserRole";
import { AuthProvider } from "@/components/AuthProvider";

// المكون الداخلي الذي يستخدم useAuth
function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // استخدام AuthProvider للحصول على المستخدم والصلاحيات
  const { currentUser, rolePermissions, loading: authLoading } = useAuth();

  // Helper function للتحقق من الصلاحية
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return rolePermissions.includes(permission);
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: createPageUrl("Dashboard"), label: "لوحة التحكم", permission: PERMISSIONS.VIEW_DASHBOARD },
    {
      label: "الموظفين",
      icon: Users,
      items: [
        { name: "Employees", icon: Users, path: createPageUrl("Employees"), label: "قائمة الموظفين", permission: PERMISSIONS.VIEW_ALL_EMPLOYEES },
        { name: "Contracts", icon: FileText, path: createPageUrl("Contracts"), label: "العقود", permission: PERMISSIONS.VIEW_ALL_CONTRACTS },
        { name: "Trainings", icon: GraduationCap, path: createPageUrl("Trainings"), label: "التدريب", permission: PERMISSIONS.VIEW_ALL_TRAININGS },
        { name: "Resignations", icon: FileText, path: createPageUrl("Resignations"), label: "طلبات الاستقالة", permission: PERMISSIONS.VIEW_RESIGNATIONS },
      ]
    },
    {
      label: "الهيكل التنظيمي",
      icon: Building2,
      permission: PERMISSIONS.VIEW_ORGANIZATIONAL_STRUCTURE,
      items: [
        { name: "OrganizationalStructure", icon: Building2, path: createPageUrl("OrganizationalStructure"), label: "الهيكل الإداري", permission: PERMISSIONS.VIEW_ORGANIZATIONAL_STRUCTURE },
        { name: "WorkLocations", icon: MapPin, path: createPageUrl("WorkLocations"), label: "أماكن العمل", permission: PERMISSIONS.VIEW_WORK_LOCATIONS },
        { name: "JobDescriptions", icon: FileText, path: createPageUrl("JobDescriptions"), label: "الأوصاف الوظيفية", permission: PERMISSIONS.VIEW_JOB_DESCRIPTIONS },
      ]
    },
    {
      label: "الحضور والإجازات",
      icon: CalendarCheck,
      items: [
        { name: "CheckInOut", icon: Clock, path: createPageUrl("CheckInOut"), label: "تسجيل الحضور", permission: PERMISSIONS.CHECKIN_CHECKOUT },
        { name: "Permissions", icon: FileText, path: createPageUrl("Permissions"), label: "طلب استئذان" },
        { name: "Attendance", icon: CalendarCheck, path: createPageUrl("Attendance"), label: "سجل الحضور", permission: PERMISSIONS.VIEW_ALL_ATTENDANCE },
        { name: "Leaves", icon: Calendar, path: createPageUrl("Leaves"), label: "الإجازات", permission: PERMISSIONS.VIEW_ALL_LEAVES },
      ]
    },
    {
      label: "الرواتب والمكافآت",
      icon: DollarSign,
      items: [
        { name: "Payroll", icon: DollarSign, path: createPageUrl("Payroll"), label: "الرواتب", permission: PERMISSIONS.VIEW_ALL_PAYROLL },
        { name: "Bonuses", icon: Gift, path: createPageUrl("Bonuses"), label: "المكافآت", permission: PERMISSIONS.VIEW_ALL_BONUSES },
        { name: "Overtime", icon: Clock, path: createPageUrl("Overtime"), label: "الساعات الإضافية", permission: PERMISSIONS.VIEW_OVERTIME },
      ]
    },
    {
      label: "تقييم الأداء",
      icon: BarChart3,
      items: [
        { name: "PerformanceEvaluations", icon: FileText, path: createPageUrl("PerformanceEvaluations"), label: "التقييمات", permission: PERMISSIONS.VIEW_ALL_EVALUATIONS },
        { name: "EvaluationTemplates", icon: Settings, path: createPageUrl("EvaluationTemplates"), label: "قوالب التقييم", permission: PERMISSIONS.MANAGE_EVALUATION_TEMPLATES },
      ]
    },
    { name: "Reports", icon: BarChart3, path: createPageUrl("Reports"), label: "التقارير", permission: PERMISSIONS.VIEW_REPORTS },
    { name: "Settings", icon: Settings, path: createPageUrl("Settings"), label: "الإعدادات", permission: PERMISSIONS.MANAGE_SETTINGS },
    {
      label: "إدارة النظام",
      icon: Shield,
      permission: PERMISSIONS.MANAGE_ROLES,
      items: [
        { name: "RolesPermissions", icon: Shield, path: createPageUrl("RolesPermissions"), label: "الأدوار والصلاحيات", permission: PERMISSIONS.MANAGE_ROLES },
        { name: "UserManagement", icon: Users, path: createPageUrl("UserManagement"), label: "إدارة المستخدمين", permission: PERMISSIONS.MANAGE_USERS },
        { name: "AuditLog", icon: Shield, path: createPageUrl("AuditLog"), label: "سجل الرقابة الإدارية", permission: PERMISSIONS.MANAGE_ROLES },
        { name: "DevelopmentLog", icon: Code, path: createPageUrl("DevelopmentLog"), label: "سجل التطوير", permission: PERMISSIONS.MANAGE_ROLES },
      ]
    },
  ];

  const activeItem = currentPageName;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <style>{`
        :root {
          --primary: 7 44% 34%;
          --primary-foreground: 0 0% 100%;
          --accent: 39 47% 60%;
          --accent-foreground: 0 0% 100%;
        }
        .bg-primary-custom { background-color: #7c3238; }
        .text-primary-custom { color: #7c3238; }
        .border-primary-custom { border-color: #7c3238; }
        .bg-accent-custom { background-color: #c9a86c; }
        .text-accent-custom { color: #c9a86c; }
        .hover\\:bg-primary-custom:hover { background-color: #7c3238; }
        .hover\\:bg-primary-light:hover { background-color: #8f3b42; }
        .bg-primary-dark { background-color: #5a252a; }
        .sidebar-gradient { background: linear-gradient(180deg, #7c3238 0%, #5a252a 100%); }
      `}</style>

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 transition-all duration-300 sidebar-gradient shadow-xl hidden lg:block",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-lg">نظام الموارد البشرية</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-white hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.filter(item => !item.permission || hasPermission(item.permission)).map((item, idx) => {
              if (item.items) {
                const visibleItems = item.items.filter(subItem => !subItem.permission || hasPermission(subItem.permission));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={idx} className="space-y-1">
                    {!sidebarCollapsed && (
                      <p className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                        {item.label}
                      </p>
                    )}
                    {visibleItems.map((subItem) => {
                      const isActive = subItem.name === activeItem;
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all",
                            isActive
                              ? "bg-white/20 text-white shadow-md"
                              : "text-white/70 hover:bg-white/10 hover:text-white",
                            !sidebarCollapsed ? 'mr-2' : ''
                          )}
                        >
                          <subItem.icon className="w-5 h-5" />
                          {!sidebarCollapsed && <span className="font-medium">{subItem.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                );
              }
              const isActive = item.name === activeItem;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          {currentUser && !sidebarCollapsed && (
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarImage src={currentUser.profile_image} />
                  <AvatarFallback className="bg-white/10 text-white">
                    {currentUser.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser.full_name}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {currentUser.role === 'admin' ? 'مدير عام' : 'مستخدم'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <div className="fixed top-0 right-0 left-0 z-40 bg-white border-b shadow-sm h-16 flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <span className="font-bold text-primary-custom">نظام الموارد البشرية</span>
          <div className="w-10" />
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="fixed inset-y-0 right-0 w-64 sidebar-gradient shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                <span className="text-white font-bold">القائمة</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {navItems.filter(item => !item.permission || hasPermission(item.permission)).map((item, idx) => {
                  if (item.items) {
                    const visibleItems = item.items.filter(subItem => !subItem.permission || hasPermission(subItem.permission));
                    if (visibleItems.length === 0) return null;

                    return (
                      <div key={idx} className="space-y-1">
                        <p className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                          {item.label}
                        </p>
                        {visibleItems.map((subItem) => {
                          const isActive = subItem.name === activeItem;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all mr-2",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "text-white/70 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <subItem.icon className="w-5 h-5" />
                              <span className="font-medium">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }
                  const isActive = item.name === activeItem;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "lg:mr-20" : "lg:mr-64",
          "pt-16 lg:pt-0"
        )}
      >
        {/* Top Bar - Desktop */}
        <header className="hidden lg:flex h-16 bg-white border-b items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">
              {navItems.flatMap(item => item.items || [item]).find((n) => n.name === currentPageName)?.label || currentPageName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.profile_image} />
                      <AvatarFallback className="bg-primary-custom text-white">
                        {currentUser.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{currentUser.full_name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {currentUser.role === 'admin' ? 'مدير عام' : 'مستخدم'}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 ml-2" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => base44.auth.logout()}
                    className="text-red-600"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

// المكون الخارجي الذي يوفر AuthProvider
export default function Layout({ children, currentPageName }) {
  return (
    <RequireUserRole>
      <AuthProvider>
        <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
      </AuthProvider>
    </RequireUserRole>
  );
}