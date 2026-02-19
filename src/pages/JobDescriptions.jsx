import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Eye, Edit, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import StatusBadge from "@/components/ui/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PERMISSIONS } from "@/components/permissions";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JobDescriptions() {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [positions, setPositions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [noteForm, setNoteForm] = useState({
    employee_id: "",
    notes: "",
    recommendations: ""
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [positionsData, employeesData, departmentsData, userData] = await Promise.all([
        base44.entities.Position.list(),
        base44.entities.Employee.list(),
        base44.entities.Department.list(),
        base44.auth.me(),
      ]);
      setPositions(positionsData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const { data: jobDescriptions = [], isLoading } = useQuery({
    queryKey: ["jobDescriptions"],
    queryFn: () => base44.entities.JobDescription.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.JobDescription.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["jobDescriptions"]);
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم إضافة الوصف الوظيفي بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JobDescription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["jobDescriptions"]);
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم تحديث الوصف الوظيفي بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JobDescription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["jobDescriptions"]);
      setShowDeleteDialog(false);
      setDeleteItem(null);
      toast.success("تم حذف الوصف الوظيفي بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const handleSubmit = () => {
    if (!editingItem?.position_name || !editingItem?.job_objective) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const data = {
      ...editingItem,
      last_review_date: new Date().toISOString().split("T")[0],
      version: editingItem?.version || "1.0",
    };

    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddNote = async () => {
    if (!noteForm.employee_id || !noteForm.notes) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    const employee = employees.find(e => e.id === noteForm.employee_id);
    const newNote = {
      ...noteForm,
      employee_name: employee?.full_name,
      added_by: currentUser.id,
      added_by_name: currentUser.full_name,
      date: new Date().toISOString(),
    };

    const updatedNotes = [...(selectedItem.employee_notes || []), newNote];
    
    try {
      await base44.entities.JobDescription.update(selectedItem.id, {
        employee_notes: updatedNotes,
      });
      queryClient.invalidateQueries(["jobDescriptions"]);
      setShowNotesModal(false);
      setNoteForm({ employee_id: "", notes: "", recommendations: "" });
      toast.success("تم إضافة الملاحظات بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة الملاحظات");
    }
  };

  const addCompetency = () => {
    setEditingItem({
      ...editingItem,
      core_competencies: [
        ...(editingItem?.core_competencies || []),
        { name: "", description: "", performance_indicator: "", measurement_method: "" }
      ]
    });
  };

  const removeCompetency = (index) => {
    const newCompetencies = [...(editingItem.core_competencies || [])];
    newCompetencies.splice(index, 1);
    setEditingItem({ ...editingItem, core_competencies: newCompetencies });
  };

  const updateCompetency = (index, field, value) => {
    const newCompetencies = [...(editingItem.core_competencies || [])];
    newCompetencies[index] = { ...newCompetencies[index], [field]: value };
    setEditingItem({ ...editingItem, core_competencies: newCompetencies });
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find((d) => d.id === departmentId);
    return department?.name || "-";
  };

  const columns = [
    {
      header: "الوظيفة",
      accessor: "position_name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-semibold">{row.position_name}</span>
        </div>
      ),
    },
    {
      header: "القسم",
      accessor: "department_id",
      cell: (row) => getDepartmentName(row.department_id),
    },
    {
      header: "الإصدار",
      accessor: "version",
      cell: (row) => <span className="font-mono text-sm">{row.version || "1.0"}</span>,
    },
    {
      header: "آخر مراجعة",
      accessor: "last_review_date",
      cell: (row) => row.last_review_date || "-",
    },
    {
      header: "الحالة",
      accessor: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedItem(row);
              setShowDetailsModal(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingItem(row);
              setShowModal(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeleteItem(row);
              setShowDeleteDialog(true);
            }}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute permission={PERMISSIONS.VIEW_JOB_DESCRIPTIONS}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">الأوصاف الوظيفية</h2>
            <p className="text-gray-500">إدارة الأوصاف الوظيفية للوظائف المختلفة</p>
          </div>
        </div>

        <DataTable
          data={jobDescriptions}
          columns={columns}
          loading={isLoading}
          onAdd={() => {
            setEditingItem({ status: "active", core_competencies: [], main_tasks: [], qualifications: [], required_skills: [] });
            setShowModal(true);
          }}
          addButtonText="إضافة وصف وظيفي"
          searchPlaceholder="بحث في الأوصاف الوظيفية..."
          emptyMessage="لا توجد أوصاف وظيفية"
        />

        {/* Form Modal */}
        <FormModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          title={editingItem?.id ? "تعديل الوصف الوظيفي" : "إضافة وصف وظيفي جديد"}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          size="xl"
        >
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
              <TabsTrigger value="tasks">المهام والهدف</TabsTrigger>
              <TabsTrigger value="competencies">الجدارات</TabsTrigger>
              <TabsTrigger value="qualifications">المؤهلات</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم الوظيفة *</Label>
                  <Input
                    value={editingItem?.position_name || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, position_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>القسم *</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={editingItem?.department_id || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, department_id: e.target.value })
                    }
                  >
                    <option value="">اختر القسم</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الخبرة المطلوبة</Label>
                  <Input
                    value={editingItem?.required_experience || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, required_experience: e.target.value })
                    }
                    placeholder="مثال: 3-5 سنوات"
                  />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={editingItem?.status || "active"}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, status: e.target.value })
                    }
                  >
                    <option value="active">نشط</option>
                    <option value="draft">مسودة</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div>
                <Label>الهدف من الوظيفة *</Label>
                <Textarea
                  value={editingItem?.job_objective || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, job_objective: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>المهام الرئيسية (سطر لكل مهمة)</Label>
                <Textarea
                  value={(editingItem?.main_tasks || []).join("\n")}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      main_tasks: e.target.value.split("\n").filter(t => t.trim())
                    })
                  }
                  rows={6}
                  placeholder="أدخل كل مهمة في سطر جديد"
                />
              </div>
            </TabsContent>

            <TabsContent value="competencies" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>الجدارات الأساسية</Label>
                <Button type="button" onClick={addCompetency} size="sm">
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة جدارة
                </Button>
              </div>

              {(editingItem?.core_competencies || []).map((comp, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold">الجدارة {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompetency(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="اسم الجدارة"
                    value={comp.name || ""}
                    onChange={(e) => updateCompetency(index, "name", e.target.value)}
                  />
                  <Textarea
                    placeholder="وصف الجدارة"
                    value={comp.description || ""}
                    onChange={(e) => updateCompetency(index, "description", e.target.value)}
                    rows={2}
                  />
                  <Input
                    placeholder="مؤشر الأداء"
                    value={comp.performance_indicator || ""}
                    onChange={(e) => updateCompetency(index, "performance_indicator", e.target.value)}
                  />
                  <Input
                    placeholder="طريقة القياس"
                    value={comp.measurement_method || ""}
                    onChange={(e) => updateCompetency(index, "measurement_method", e.target.value)}
                  />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="qualifications" className="space-y-4">
              <div>
                <Label>المؤهلات الأكاديمية (سطر لكل مؤهل)</Label>
                <Textarea
                  value={(editingItem?.qualifications || []).join("\n")}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      qualifications: e.target.value.split("\n").filter(q => q.trim())
                    })
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>المهارات المطلوبة (سطر لكل مهارة)</Label>
                <Textarea
                  value={(editingItem?.required_skills || []).join("\n")}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      required_skills: e.target.value.split("\n").filter(s => s.trim())
                    })
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>ملاحظات إضافية</Label>
                <Textarea
                  value={editingItem?.notes || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </FormModal>

        {/* Details Modal */}
        <FormModal
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItem(null);
          }}
          title="تفاصيل الوصف الوظيفي"
          showFooter={false}
          size="xl"
        >
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">الوظيفة</p>
                  <p className="font-semibold">{selectedItem.position_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">القسم</p>
                  <p className="font-semibold">{getDepartmentName(selectedItem.department_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">الهدف من الوظيفة</p>
                <p className="text-gray-700">{selectedItem.job_objective}</p>
              </div>

              {selectedItem.main_tasks && selectedItem.main_tasks.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">المهام الرئيسية</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedItem.main_tasks.map((task, i) => (
                      <li key={i} className="text-gray-700">{task}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItem.core_competencies && selectedItem.core_competencies.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3">الجدارات الأساسية</p>
                  <div className="space-y-3">
                    {selectedItem.core_competencies.map((comp, i) => (
                      <div key={i} className="p-3 bg-white rounded border">
                        <p className="font-semibold text-gray-800 mb-1">{comp.name}</p>
                        <p className="text-sm text-gray-600 mb-2">{comp.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">مؤشر الأداء: </span>
                            <span className="text-gray-700">{comp.performance_indicator}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">طريقة القياس: </span>
                            <span className="text-gray-700">{comp.measurement_method}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.qualifications && selectedItem.qualifications.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">المؤهلات المطلوبة</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedItem.qualifications.map((qual, i) => (
                      <li key={i} className="text-gray-700">{qual}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedItem.required_skills && selectedItem.required_skills.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">المهارات المطلوبة</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedItem.required_skills.map((skill, i) => (
                      <li key={i} className="text-gray-700">{skill}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowNotesModal(true);
                  }}
                  className="gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  إضافة ملاحظات للموظف
                </Button>
              </div>

              {selectedItem.employee_notes && selectedItem.employee_notes.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3">ملاحظات الموظفين</p>
                  <div className="space-y-3">
                    {selectedItem.employee_notes.map((note, i) => (
                      <div key={i} className="p-3 bg-white rounded border">
                        <div className="flex justify-between mb-2">
                          <p className="font-semibold text-gray-800">{note.employee_name}</p>
                          <p className="text-xs text-gray-500">{note.date?.split("T")[0]}</p>
                        </div>
                        <p className="text-sm text-gray-700 mb-2"><strong>الملاحظات:</strong> {note.notes}</p>
                        {note.recommendations && (
                          <p className="text-sm text-gray-700"><strong>التوصيات:</strong> {note.recommendations}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">بواسطة: {note.added_by_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </FormModal>

        {/* Notes Modal */}
        <FormModal
          open={showNotesModal}
          onClose={() => {
            setShowNotesModal(false);
            setNoteForm({ employee_id: "", notes: "", recommendations: "" });
          }}
          title="إضافة ملاحظات وتوصيات للموظف"
          onSubmit={handleAddNote}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <Label>الموظف *</Label>
              <select
                className="w-full border rounded-md p-2"
                value={noteForm.employee_id}
                onChange={(e) => setNoteForm({ ...noteForm, employee_id: e.target.value })}
              >
                <option value="">اختر الموظف</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.position}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>الملاحظات *</Label>
              <Textarea
                value={noteForm.notes}
                onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                rows={4}
                placeholder="أدخل ملاحظاتك حول أداء الموظف..."
              />
            </div>

            <div>
              <Label>التوصيات للتطوير والتحسين</Label>
              <Textarea
                value={noteForm.recommendations}
                onChange={(e) => setNoteForm({ ...noteForm, recommendations: e.target.value })}
                rows={4}
                placeholder="أدخل توصياتك لتطوير وتحسين أداء الموظف..."
              />
            </div>
          </div>
        </FormModal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => deleteMutation.mutate(deleteItem.id)}
          title="تأكيد الحذف"
          description={`هل أنت متأكد من حذف الوصف الوظيفي "${deleteItem?.position_name}"؟`}
          loading={deleteMutation.isPending}
        />
      </div>
    </ProtectedRoute>
  );
}