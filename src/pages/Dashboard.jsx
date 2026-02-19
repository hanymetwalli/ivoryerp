import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeContracts: 0,
    pendingLeaves: 0,
    monthlyPayroll: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { filterEmployees, filterEmployeeRelatedData, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading]);

  const loadDashboardData = async () => {
    if (authLoading) return;
    
    setLoading(true);
    try {
      const [employees, contracts, leaves, payrolls] = await Promise.all([
        base44.entities.Employee.list("-created_date", 100),
        base44.entities.Contract.list("-created_date", 100),
        base44.entities.LeaveRequest.list("-created_date", 50),
        base44.entities.Payroll.list("-created_date", 50),
      ]);

      const allowedEmployees = filterEmployees(employees, PERMISSIONS.VIEW_ALL_EMPLOYEES);
      const activeEmployees = allowedEmployees.filter((e) => e.status === "active");
      
      const filteredContracts = filterEmployeeRelatedData(contracts, allowedEmployees, (item) => item.employee_id);
      const activeContracts = filteredContracts.filter((c) => c.status === "active");
      
      const filteredLeaves = filterEmployeeRelatedData(leaves, allowedEmployees, (item) => item.employee_id);
      const pendingLeaves = filteredLeaves.filter((l) => l.status === "pending" || l.status === "manager_approved");
      
      const filteredPayrolls = filterEmployeeRelatedData(payrolls, allowedEmployees, (item) => item.employee_id);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthlyPayrollTotal = filteredPayrolls
        .filter((p) => p.month === currentMonth && p.year === currentYear)
        .reduce((sum, p) => sum + (p.net_salary || 0), 0);

      setStats({
        totalEmployees: activeEmployees.length,
        activeContracts: activeContracts.length,
        pendingLeaves: pendingLeaves.length,
        monthlyPayroll: monthlyPayrollTotal,
      });

      setRecentEmployees(allowedEmployees.slice(0, 5));
      setPendingRequests(pendingLeaves.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount, currency = "SAR") => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الموظفين"
          value={stats.totalEmployees}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="العقود النشطة"
          value={stats.activeContracts}
          icon={FileText}
          color="accent"
        />
        <StatCard
          title="طلبات الإجازات المعلقة"
          value={stats.pendingLeaves}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="مسير الرواتب الشهري"
          value={formatCurrency(stats.monthlyPayroll)}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to={createPageUrl("Employees")}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#7c3238]/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#7c3238]/10">
                <Users className="w-5 h-5 text-[#7c3238]" />
              </div>
              <span className="font-medium text-gray-700">إدارة الموظفين</span>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl("Attendance")}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#7c3238]/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">الحضور والانصراف</span>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl("Leaves")}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#7c3238]/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">الإجازات</span>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl("Payroll")}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-[#7c3238]/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <span className="font-medium text-gray-700">مسير الرواتب</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">أحدث الموظفين</CardTitle>
            <Link to={createPageUrl("Employees")}>
              <Button variant="ghost" size="sm" className="text-[#7c3238]">
                عرض الكل
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recentEmployees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد موظفين</p>
            ) : (
              <div className="space-y-3">
                {recentEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7c3238] flex items-center justify-center text-white font-semibold">
                        {employee.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{employee.full_name}</p>
                        <p className="text-sm text-gray-500">{employee.position}</p>
                      </div>
                    </div>
                    <StatusBadge status={employee.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">طلبات الإجازات المعلقة</CardTitle>
            <Link to={createPageUrl("Leaves")}>
              <Button variant="ghost" size="sm" className="text-[#7c3238]">
                عرض الكل
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-800">طلب إجازة</p>
                      <p className="text-sm text-gray-500">
                        من {format(new Date(request.start_date), "dd/MM/yyyy", { locale: ar })} إلى{" "}
                        {format(new Date(request.end_date), "dd/MM/yyyy", { locale: ar })}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}