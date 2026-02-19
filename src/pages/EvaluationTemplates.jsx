import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, Settings, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/components/permissions";

export default function EvaluationTemplates() {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["evaluationTemplates"],
    queryFn: () => base44.entities.EvaluationTemplate.list("-created_date"),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pos, deps] = await Promise.all([
        base44.entities.Position.list(),
        base44.entities.Department.list(),
      ]);
      setPositions(pos);
      setDepartments(deps);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EvaluationTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluationTemplates"] });
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم إنشاء القالب بنجاح");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EvaluationTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluationTemplates"] });
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم تحديث القالب بنجاح");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EvaluationTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluationTemplates"] });
      toast.success("تم حذف القالب بنجاح");
    },
  });

  const handleSubmit = () => {
    const formData = editingItem;
    
    if (!formData.name) {
      toast.error("الرجاء إدخال اسم القالب");
      return;
    }

    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm("هل أنت متأكد من حذف هذا القالب؟")) {
      deleteMutation.mutate(id);
    }
  };

  const getPositionName = (posId) => {
    const pos = positions.find((p) => p.id === posId);
    return pos?.name || "-";
  };

  const getDepartmentName = (depId) => {
    const dep = departments.find((d) => d.id === depId);
    return dep?.name || "-";
  };

  const columns = [
    {
      header: "اسم القالب",
      accessor: "name",
    },
    {
      header: "المنصب",
      cell: (row) => getPositionName(row.position_id),
    },
    {
      header: "القسم",
      cell: (row) => getDepartmentName(row.department_id),
    },
    {
      header: "فترة التقييم",
      cell: (row) => {
        const periods = {
          monthly: "شهري",
          quarterly: "ربع سنوي",
          "semi-annual": "نصف سنوي", // Changed from semi_annual to semi-annual
          semi_annual: "نصف سنوي",   // Keep both for backward compatibility if needed
          annual: "سنوي",
          probation: "فترة تجربة"
        };
        // Handle both underscore and hyphen just in case
        return periods[row.evaluation_period] || periods[row.evaluation_period?.replace('_', '-')] || "-";
      },
    },
    {
      header: "الحالة",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "الإجراءات",
      cell: (row) => (
        <div className="flex gap-2">
          <Link to={`${createPageUrl("TemplateBuilder")}?id=${row.id}`}>
            <Button variant="ghost" size="icon" title="إعداد الجدارات والمؤشرات">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingItem(row);
              setShowModal(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute permission={PERMISSIONS.MANAGE_EVALUATION_TEMPLATES}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">قوالب التقييم</h1>
            <p className="text-gray-600 mt-1">إدارة قوالب التقييم للوظائف المختلفة</p>
          </div>
          <Button
            onClick={() => {
              setEditingItem({});
              setShowModal(true);
            }}
            className="gap-2 bg-[#7c3238] hover:bg-[#5a252a]"
          >
            <Plus className="w-4 h-4" />
            قالب جديد
          </Button>
        </div>

        <DataTable
          data={templates}
          columns={columns}
          loading={isLoading}
          searchPlaceholder="بحث في القوالب..."
          emptyMessage="لا توجد قوالب"
          showAdd={false}
        />

        <FormModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          title={editingItem?.id ? "تعديل القالب" : "قالب جديد"}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم القالب *</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={editingItem?.name || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, name: e.target.value })
                }
                placeholder="مثال: تقييم أخصائي تسويق رقمي"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">المنصب</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={editingItem?.position_id || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, position_id: e.target.value })
                }
              >
                <option value="">اختر منصب</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">القسم</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={editingItem?.department_id || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, department_id: e.target.value })
                }
              >
                <option value="">اختر قسم</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">فترة التقييم</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={editingItem?.evaluation_period || "annual"}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, evaluation_period: e.target.value })
                }
              >
                <option value="annual">سنوي</option>
                <option value="semi-annual">نصف سنوي</option>
                <option value="quarterly">ربع سنوي</option>
                <option value="monthly">شهري</option>
                <option value="probation">فترة تجربة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الوصف</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 h-24"
                value={editingItem?.description || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
                placeholder="وصف القالب والغرض منه"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={editingItem?.status || "active"}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, status: e.target.value })
                }
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>
        </FormModal>
      </div>
    </ProtectedRoute>
  );
}