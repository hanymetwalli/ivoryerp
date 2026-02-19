import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Download,
  Filter,
  TrendingUp,
  PieChart,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ar } from "date-fns/locale";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

const COLORS = ["#7c3238", "#c9a86c", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

const LOCATION_LABELS = {
  saudi_madd: "منصة مدد - السعودية",
  egypt: "مصر",
  remote: "عمل عن بُعد",
};

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 5), "yyyy-MM"),
    end: format(new Date(), "yyyy-MM"),
  });

  const { filterEmployees, filterEmployeeRelatedData, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const loadData = async () => {
    if (authLoading) return;
    
    setLoading(true);
    try {
      const [empData, contractData, payrollData, attData, leaveData] = await Promise.all([
        base44.entities.Employee.list("-created_date", 500),
        base44.entities.Contract.list("-created_date", 500),
        base44.entities.Payroll.list("-created_date", 1000),
        base44.entities.Attendance.list("-date", 2000),
        base44.entities.LeaveRequest.list("-created_date", 500),
      ]);

      const allowedEmployees = filterEmployees(empData, PERMISSIONS.VIEW_REPORTS);
      
      const filteredContracts = filterEmployeeRelatedData(contractData, allowedEmployees, (item) => item.employee_id);
      const filteredPayrolls = filterEmployeeRelatedData(payrollData, allowedEmployees, (item) => item.employee_id);
      const filteredAttendance = filterEmployeeRelatedData(attData, allowedEmployees, (item) => item.employee_id);
      const filteredLeaves = filterEmployeeRelatedData(leaveData, allowedEmployees, (item) => item.employee_id);

      setEmployees(allowedEmployees);
      setContracts(filteredContracts);
      setPayrolls(filteredPayrolls);
      setAttendance(filteredAttendance);
      setLeaveRequests(filteredLeaves);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const formatCurrency = (amount, currency = "SAR") => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Employee Stats
  const activeEmployees = employees.filter((e) => e.status === "active");
  const employeesByLocation = Object.entries(
    activeEmployees.reduce((acc, emp) => {
      acc[emp.location_type] = (acc[emp.location_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: LOCATION_LABELS[name] || name,
    value,
  }));

  const employeesByDepartment = Object.entries(
    activeEmployees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name || "غير محدد", value }));

  // Payroll Stats
  const monthlyPayrollData = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthPayrolls = payrolls.filter((p) => p.month === month && p.year === year);
    const totalGross = monthPayrolls.reduce((sum, p) => sum + (p.gross_salary || 0), 0);
    const totalNet = monthPayrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0);
    const totalDeductions = monthPayrolls.reduce((sum, p) => sum + (p.total_deductions || 0), 0);

    monthlyPayrollData.push({
      month: format(date, "MMM yyyy", { locale: ar }),
      إجمالي: totalGross,
      صافي: totalNet,
      خصومات: totalDeductions,
    });
  }

  // Attendance Stats
  const last30DaysAttendance = attendance.filter((a) => {
    const date = parseISO(a.date);
    return date >= subMonths(new Date(), 1);
  });

  const attendanceStats = {
    present: last30DaysAttendance.filter((a) => a.status === "present").length,
    absent: last30DaysAttendance.filter((a) => a.status === "absent").length,
    late: last30DaysAttendance.filter((a) => (a.late_minutes || 0) > 0).length,
    leave: last30DaysAttendance.filter((a) => a.status === "leave").length,
  };

  const attendanceChartData = [
    { name: "حضور", value: attendanceStats.present, color: "#22c55e" },
    { name: "غياب", value: attendanceStats.absent, color: "#ef4444" },
    { name: "تأخير", value: attendanceStats.late, color: "#f59e0b" },
    { name: "إجازة", value: attendanceStats.leave, color: "#3b82f6" },
  ];

  // Leave Stats
  const leaveStats = {
    total: leaveRequests.length,
    approved: leaveRequests.filter((l) => l.status === "approved").length,
    pending: leaveRequests.filter((l) => l.status === "pending" || l.status === "manager_approved").length,
    rejected: leaveRequests.filter((l) => l.status === "rejected").length,
  };

  // Top Late Employees
  const employeeLateMinutes = {};
  last30DaysAttendance.forEach((a) => {
    if (a.late_minutes > 0) {
      employeeLateMinutes[a.employee_id] = (employeeLateMinutes[a.employee_id] || 0) + a.late_minutes;
    }
  });

  const topLateEmployees = Object.entries(employeeLateMinutes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([empId, minutes]) => {
      const emp = employees.find((e) => e.id === empId);
      return {
        employee: emp?.full_name || "-",
        department: emp?.department || "-",
        minutes,
        hours: (minutes / 60).toFixed(1),
      };
    });

  // Top Absent Employees
  const employeeAbsentDays = {};
  last30DaysAttendance
    .filter((a) => a.status === "absent")
    .forEach((a) => {
      employeeAbsentDays[a.employee_id] = (employeeAbsentDays[a.employee_id] || 0) + 1;
    });

  const topAbsentEmployees = Object.entries(employeeAbsentDays)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([empId, days]) => {
      const emp = employees.find((e) => e.id === empId);
      return {
        employee: emp?.full_name || "-",
        department: emp?.department || "-",
        days,
      };
    });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">التقارير</h2>
          <p className="text-gray-500">تقارير وإحصائيات شاملة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="payroll">الرواتب</TabsTrigger>
          <TabsTrigger value="attendance">الحضور والغياب</TabsTrigger>
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="إجمالي الموظفين"
              value={activeEmployees.length}
              icon={Users}
              color="primary"
            />
            <StatCard
              title="العقود النشطة"
              value={contracts.filter((c) => c.status === "active").length}
              icon={DollarSign}
              color="accent"
            />
            <StatCard
              title="طلبات الإجازات المعلقة"
              value={leaveStats.pending}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="نسبة الحضور"
              value={`${Math.round(
                (attendanceStats.present /
                  (attendanceStats.present + attendanceStats.absent || 1)) *
                  100
              )}%`}
              icon={Clock}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع الموظفين حسب الموقع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={employeesByLocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {employeesByLocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Payroll Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مؤشر الرواتب الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPayrollData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="صافي"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="خصومات"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payroll Tab */}
        <TabsContent value="payroll" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تطور الرواتب الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyPayrollData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="إجمالي" fill="#7c3238" />
                  <Bar dataKey="صافي" fill="#22c55e" />
                  <Bar dataKey="خصومات" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">إجمالي المصروفات (آخر 6 أشهر)</p>
                <p className="text-2xl font-bold text-[#7c3238] mt-2">
                  {formatCurrency(
                    payrolls.reduce((sum, p) => sum + (p.gross_salary || 0), 0)
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">صافي الرواتب المدفوعة</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(
                    payrolls.reduce((sum, p) => sum + (p.net_salary || 0), 0)
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500">إجمالي الخصومات</p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {formatCurrency(
                    payrolls.reduce((sum, p) => sum + (p.total_deductions || 0), 0)
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع الحضور (آخر 30 يوم)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={attendanceChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {attendanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إحصائيات الإجازات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>إجمالي الطلبات</span>
                  <span className="font-bold">{leaveStats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>الموافق عليها</span>
                  <span className="font-bold text-green-600">{leaveStats.approved}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span>قيد الانتظار</span>
                  <span className="font-bold text-yellow-600">{leaveStats.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span>المرفوضة</span>
                  <span className="font-bold text-red-600">{leaveStats.rejected}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أعلى موظفين تأخيراً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topLateEmployees.map((emp, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{emp.employee}</p>
                        <p className="text-sm text-gray-500">{emp.department}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-red-600">{emp.hours} ساعة</p>
                        <p className="text-sm text-gray-500">{emp.minutes} دقيقة</p>
                      </div>
                    </div>
                  ))}
                  {topLateEmployees.length === 0 && (
                    <p className="text-gray-500 text-center py-4">لا يوجد تأخير</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أعلى موظفين غياباً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAbsentEmployees.map((emp, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{emp.employee}</p>
                        <p className="text-sm text-gray-500">{emp.department}</p>
                      </div>
                      <p className="font-bold text-red-600">{emp.days} أيام</p>
                    </div>
                  ))}
                  {topAbsentEmployees.length === 0 && (
                    <p className="text-gray-500 text-center py-4">لا يوجد غياب</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع الموظفين حسب القسم</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeesByDepartment} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7c3238" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ملخص الموظفين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>إجمالي الموظفين</span>
                  <span className="font-bold">{employees.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span>موظفين نشطين</span>
                  <span className="font-bold text-green-600">{activeEmployees.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span>موظفين غير نشطين</span>
                  <span className="font-bold text-yellow-600">
                    {employees.filter((e) => e.status === "inactive").length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span>موظفين منتهية خدمتهم</span>
                  <span className="font-bold text-red-600">
                    {employees.filter((e) => e.status === "terminated").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}