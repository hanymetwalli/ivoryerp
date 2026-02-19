import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";

export default function WorkLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const { hasPermission, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.WorkLocation.list("-created_date");
      setLocations(data);
    } catch (error) {
      console.error("Error loading locations:", error);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setSelectedLocation(null);
    setFormData({ status: "active", radius_meters: 100, use_coordinates: true });
    setShowForm(true);
  };

  const handleEdit = (location) => {
    setSelectedLocation(location);
    setFormData(location);
    setShowForm(true);
  };

  const handleDelete = (location) => {
    setSelectedLocation(location);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await base44.entities.WorkLocation.delete(selectedLocation.id);
      loadData();
      setShowDeleteDialog(false);
      toast.success("تم حذف المكان بنجاح");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("يرجى إدخال اسم المكان");
      return;
    }

    if (formData.use_coordinates !== false && (!formData.latitude || !formData.longitude)) {
      toast.error("يرجى إدخال الإحداثيات أو إلغاء استخدامها");
      return;
    }

    setSaving(true);
    try {
      if (selectedLocation) {
        await base44.entities.WorkLocation.update(selectedLocation.id, formData);
        toast.success("تم تحديث المكان");
      } else {
        await base44.entities.WorkLocation.create(formData);
        toast.success("تمت إضافة المكان");
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("حدث خطأ");
    }
    setSaving(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success("تم تحديد الموقع الحالي");
        },
        (error) => {
          toast.error("تعذر تحديد الموقع");
        }
      );
    }
  };

  const columns = [
    { header: "الاسم", accessor: "name" },
    { header: "الرمز", accessor: "code", cell: (row) => row.code || "-" },
    { header: "العنوان", accessor: "address", cell: (row) => row.address || "-" },
    {
      header: "الإحداثيات",
      accessor: "coordinates",
      cell: (row) => row.use_coordinates === false ? "عمل عن بُعد" : row.latitude ? `${row.latitude?.toFixed(4)}, ${row.longitude?.toFixed(4)}` : "-",
    },
    {
      header: "نطاق السماح",
      accessor: "radius_meters",
      cell: (row) => `${row.radius_meters || 100} متر`,
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => {
        const canEdit = hasPermission(PERMISSIONS.EDIT_WORK_LOCATIONS);
        const canDelete = hasPermission(PERMISSIONS.DELETE_WORK_LOCATIONS);

        if (!canEdit && !canDelete) return null;

        return (
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                <Edit className="w-4 h-4 ml-1" />
                تعديل
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(row)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                حذف
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">أماكن العمل</h2>
        <p className="text-gray-500">إدارة أماكن العمل والإحداثيات الجغرافية</p>
      </div>

      <DataTable
        data={locations}
        columns={columns}
        loading={loading || authLoading}
        onAdd={hasPermission(PERMISSIONS.ADD_WORK_LOCATIONS) ? handleAdd : undefined}
        addButtonText="إضافة مكان عمل"
        emptyMessage="لا توجد أماكن"
        showAdd={hasPermission(PERMISSIONS.ADD_WORK_LOCATIONS)}
      />

      <FormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={selectedLocation ? "تعديل مكان العمل" : "إضافة مكان عمل جديد"}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="space-y-4" dir="rtl">
          <div>
            <Label>اسم المكان / نوع الموقع *</Label>
            <Input
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: منصة مدد - السعودية، مصر، عمل عن بُعد..."
            />
          </div>
          <div>
            <Label>الرمز</Label>
            <Input
              value={formData.code || ""}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div>
            <Label>العنوان</Label>
            <Textarea
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.use_coordinates !== false}
                onChange={(e) => setFormData({ ...formData, use_coordinates: e.target.checked })}
                className="rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-blue-900">استخدام الإحداثيات للتحقق من الموقع</p>
                <p className="text-sm text-blue-700">قم بإلغاء التحديد للعاملين عن بُعد</p>
              </div>
            </label>
          </div>
          {formData.use_coordinates !== false && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>خط العرض (Latitude) *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="24.7136"
                  />
                </div>
                <div>
                  <Label>خط الطول (Longitude) *</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value ? Number(e.target.value) : null })
                    }
                    placeholder="46.6753"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={getCurrentLocation} className="w-full">
                <MapPin className="w-4 h-4 ml-2" />
                استخدام موقعي الحالي
              </Button>
              <div>
                <Label>نطاق السماح (بالمتر)</Label>
                <Input
                  type="number"
                  value={formData.radius_meters || 100}
                  onChange={(e) =>
                    setFormData({ ...formData, radius_meters: Number(e.target.value) })
                  }
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  المسافة المسموحة للموظف من نقطة المركز (افتراضي: 100 متر)
                </p>
              </div>
            </>
          )}

          <div>
            <Label>الحالة</Label>
            <Select
              value={formData.status || "active"}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="حذف مكان العمل"
        description="هل أنت متأكد من حذف هذا المكان؟"
      />
    </div>
  );
}