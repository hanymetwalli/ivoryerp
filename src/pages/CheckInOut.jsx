import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, MapPin, CheckCircle, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function CheckInOut() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [workLocation, setWorkLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
          toast.error("تعذر تحديد موقعك. يرجى السماح بالوصول للموقع.");
        }
      );
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const userRoles = await base44.entities.UserRole.filter({
        user_id: currentUser.id,
        status: "active",
      });

      if (userRoles.length > 0 && userRoles[0].employee_id) {
        const emp = await base44.entities.Employee.filter({
          id: userRoles[0].employee_id,
        });

        if (emp.length > 0) {
          setEmployee(emp[0]);

          if (emp[0].work_location_id) {
            const loc = await base44.entities.WorkLocation.filter({
              id: emp[0].work_location_id,
            });
            if (loc.length > 0) {
              setWorkLocation(loc[0]);
            }
          }

          const today = format(new Date(), "yyyy-MM-dd");
          const attendance = await base44.entities.Attendance.filter({
            employee_id: emp[0].id,
            date: today,
          });

          if (attendance.length > 0) {
            setTodayAttendance(attendance[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    }
    setLoading(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const validateLocation = () => {
    // إذا لم يكن هناك مكان عمل أو إذا كان لا يستخدم الإحداثيات
    if (!workLocation || workLocation.use_coordinates === false) {
      return { valid: true, distance: 0 };
    }

    if (!userLocation) {
      return { valid: false, message: "جاري تحديد الموقع..." };
    }

    if (!workLocation.latitude || !workLocation.longitude) {
      return { valid: true, distance: 0 };
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      workLocation.latitude,
      workLocation.longitude
    );

    if (distance > (workLocation.radius_meters || 100)) {
      return {
        valid: false,
        message: `أنت خارج نطاق مكان العمل. المسافة: ${Math.round(distance)} متر. الحد المسموح: ${workLocation.radius_meters || 100} متر.`,
      };
    }

    return { valid: true, distance: Math.round(distance) };
  };

  const handleCheckIn = async () => {
    if (!userLocation) {
      toast.error("جاري تحديد الموقع، يرجى الانتظار...");
      return;
    }

    const locationCheck = validateLocation();
    if (!locationCheck.valid) {
      toast.error(locationCheck.message);
      return;
    }

    setProcessing(true);
    try {
      const now = new Date();
      const timeString = format(now, "HH:mm:ss");
      const dateString = format(now, "yyyy-MM-dd");

      // تم نقل حساب المقاييس والتحقق من الموقع بالكامل للباك إند لضمان الأمان والدقة
      await base44.entities.Attendance.create({
        employee_id: employee.id,
        date: dateString,
        check_in_time: timeString,
        check_in_location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        status: "present",
        source: "mobile_app", // المصدر مهم عشان الباك إند يفعل قواعد التحقق
      });

      toast.success("تم تسجيل الحضور بنجاح");
      loadData();
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("حدث خطأ في تسجيل الحضور");
    }
    setProcessing(false);
  };

  const handleCheckOut = async () => {
    if (!userLocation) {
      toast.error("جاري تحديد الموقع، يرجى الانتظار...");
      return;
    }

    const locationCheck = validateLocation();
    if (!locationCheck.valid) {
      toast.error(locationCheck.message);
      return;
    }

    setProcessing(true);
    try {
      const now = new Date();
      const timeString = format(now, "HH:mm:ss");

      // تم نقل إعادة حساب المقاييس والتحقق من الموقع بالكامل للباك إند
      await base44.entities.Attendance.update(todayAttendance.id, {
        check_out_time: timeString,
        check_out_location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        source: "mobile_app",
      });

      toast.success("تم تسجيل الانصراف بنجاح");
      loadData();
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error("حدث خطأ في تسجيل الانصراف");
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3238]" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center min-h-screen" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">حسابك غير مرتبط بموظف</h3>
            <p className="text-gray-600">
              يرجى التواصل مع إدارة الموارد البشرية لربط حسابك بسجل الموظف الخاص بك.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const locationCheck = validateLocation();
  const currentTime = format(new Date(), "HH:mm");
  const currentDate = format(new Date(), "EEEE، d MMMM yyyy", { locale: ar });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              مرحباً، {employee.full_name}
            </CardTitle>
            <p className="text-center text-gray-500">{employee.position}</p>
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-r from-[#7c3238] to-[#5a252a] text-white">
          <CardContent className="p-8 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg mb-2">{currentDate}</p>
            <p className="text-4xl font-bold">{currentTime}</p>
          </CardContent>
        </Card>

        {workLocation && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-[#7c3238]" />
                <h3 className="font-semibold">مكان العمل</h3>
              </div>
              <p className="text-gray-700 mb-2">{workLocation.name}</p>
              <p className="text-sm text-gray-600">{workLocation.address}</p>
              {userLocation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {locationCheck.valid ? (
                      <>
                        ✓ أنت داخل نطاق مكان العمل ({locationCheck.distance} متر)
                      </>
                    ) : (
                      <>⚠️ {locationCheck.message}</>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {todayAttendance ? (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-lg">سجل اليوم</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">وقت الحضور</p>
                  <p className="text-2xl font-bold text-green-700">
                    {todayAttendance.check_in_time}
                  </p>
                </div>
                {todayAttendance.check_out_time ? (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">وقت الانصراف</p>
                    <p className="text-2xl font-bold text-gray-700">
                      {todayAttendance.check_out_time}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-orange-600">لم يتم تسجيل الانصراف</p>
                  </div>
                )}
              </div>
              {!todayAttendance.check_out_time && (
                <Button
                  onClick={handleCheckOut}
                  disabled={processing || !locationCheck.valid}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="lg"
                >
                  <LogOut className="w-5 h-5 ml-2" />
                  تسجيل الانصراف
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8">
              <Button
                onClick={handleCheckIn}
                disabled={processing || !locationCheck.valid}
                className="w-full bg-[#7c3238] hover:bg-[#5a252a]"
                size="lg"
              >
                <CheckCircle className="w-5 h-5 ml-2" />
                تسجيل الحضور
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}