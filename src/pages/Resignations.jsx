import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText, Plus, Eye, Calendar, User, AlertCircle, Upload, Paperclip,
  MoreVertical, Edit, Trash2, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import ApprovalActions from "@/components/ApprovalActions";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/components/permissions";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Resignations() {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showForceApproveDialog, setShowForceApproveDialog] = useState(false);
  const [forceApproveLoading, setForceApproveLoading] = useState(false);

  const {
    currentUser,
    userEmployee,
    hasPermission,
    filterEmployees,
    filterEmployeeRelatedData,
    loading: authLoading,
  } = useAuth();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading]);

  const loadData = async () => {
    if (authLoading) return;
    try {
      const employeesData = await base44.entities.Employee.list();
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const { data: resignations = [], isLoading } = useQuery({
    queryKey: ["resignations"],
    queryFn: () => base44.entities.Resignation.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Resignation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم إضافة طلب الاستقالة بنجاح");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("حدث خطأ أثناء الحفظ: " + (error.message || "خطأ غير معروف"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Resignation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم تحديث طلب الاستقالة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resignation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
      setShowDeleteDialog(false);
      setSelectedItem(null);
      toast.success("تم حذف طلب الاستقالة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedFiles = [];
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedFiles.push({
          name: file.name,
          url: result.file_url,
          upload_date: new Date().toISOString(),
        });
      }

      setEditingItem({
        ...editingItem,
        attachments: [...(editingItem.attachments || []), ...uploadedFiles],
      });
      toast.success("تم رفع الملفات بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الملفات");
    }
    setUploading(false);
  };

  const removeAttachment = (index) => {
    const newAttachments = [...(editingItem.attachments || [])];
    newAttachments.splice(index, 1);
    setEditingItem({ ...editingItem, attachments: newAttachments });
  };

  const handleSubmit = () => {
    const data = {
      ...editingItem,
      resignation_date: editingItem.resignation_date || new Date().toISOString().split("T")[0],
      notice_period_days: editingItem.notice_period_days || 30,
    };

    if (!data.employee_id) {
      toast.error("يرجى اختيار الموظف");
      return;
    }
    if (!data.end_of_service_date) {
      toast.error("يرجى تحديد تاريخ نهاية الخدمة");
      return;
    }
    if (!data.reason || data.reason.trim().length === 0) {
      toast.error("يرجى كتابة سبب الاستقالة");
      return;
    }

    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleForceApprove = async () => {
    if (!selectedItem || !selectedItem.workflow_id) {
      toast.error("لم يتم العثور على سجل سير عمل لهذا الطلب");
      return;
    }

    setForceApproveLoading(true);
    try {
      await base44.entities.Workflow.customAction(selectedItem.workflow_id, 'force-approve', {
        user_id: currentUser.id
      });

      toast.success("⚡ تم الاعتماد النهائي الاستثنائي بنجاح");
      setShowForceApproveDialog(false);
      queryClient.invalidateQueries({ queryKey: ["resignations"] });
    } catch (error) {
      console.error("Force approve error:", error);
      toast.error(error.message || "حدث خطأ أثناء الاعتماد الاستثنائي");
    }
    setForceApproveLoading(false);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.full_name || "-";
  };

  const handleApprovalAction = async (action) => {
    if (!pendingStep) return;

    toast.promise(
      base44.entities.Approvals.action(pendingStep.id, "submit", {
        user_id: currentUser.id,
        action: action,
        comments: approvalNotes,
      }),
      {
        loading: "جاري معالجة الطلب...",
        success: () => {
          setShowDetailsModal(false);
          setSelectedItem(null);
          setApprovalNotes("");
          queryClient.invalidateQueries({ queryKey: ["resignations"] });
          return "تمت المعالجة بنجاح";
        },
        error: (err) => `حدث خطأ: ${err.message || "خطأ غير معروف"}`,
      }
    );
  };

  const getPendingStep = (item) => {
    if (!item.approval_steps) return null;
    return item.approval_steps.find((s) => s.status === "pending");
  };

  const pendingStep = selectedItem ? getPendingStep(selectedItem) : null;
  const isApprover = pendingStep && pendingStep.approver_user_id === currentUser?.id;
  const [approvalNotes, setApprovalNotes] = useState("");

  const columns = [
    {
      header: "رقم الطلب",
      accessor: "request_number",
      cell: (row) => (
        <span className="font-mono text-sm">{row.request_number}</span>
      ),
    },
    {
      header: "اسم الموظف",
      accessor: "employee_id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          {getEmployeeName(row.employee_id)}
        </div>
      ),
    },
    {
      header: "تاريخ التقديم",
      accessor: "resignation_date",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {row.resignation_date
            ? format(new Date(row.resignation_date), "dd/MM/yyyy", { locale: ar })
            : "-"}
        </div>
      ),
    },
    {
      header: "تاريخ نهاية الخدمة",
      accessor: "end_of_service_date",
      cell: (row) => (
        row.end_of_service_date
          ? format(new Date(row.end_of_service_date), "dd/MM/yyyy", { locale: ar })
          : "-"
      ),
    },
    {
      header: "الحالة",
      accessor: "workflow_status",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={row.workflow_status || row.status} />
          {row.workflow_status === 'pending' && getPendingStep(row) && (
            <span className="text-[10px] text-gray-400">
              بانتظار: {getPendingStep(row).role_name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(row)}>
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
            </DropdownMenuItem>

            {(row.workflow_status === 'returned' || row.status === 'draft') && (
              <>
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل وإعادة تقديم
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(row)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              </>
            )}
            {hasPermission(PERMISSIONS.FORCE_APPROVE) && (row.status === 'pending' || row.workflow_status === 'pending') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedItem(row);
                    setShowForceApproveDialog(true);
                  }}
                  className="text-blue-600 font-bold"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  الاعتماد النهائي ⚡
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <ProtectedRoute permission={PERMISSIONS.VIEW_ALL_EMPLOYEES} fallback={<div className="p-8 text-center text-gray-500">لا تملك صلاحية الوصول لهذه الصفحة</div>}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">طلبات الاستقالة</h2>
            <p className="text-gray-500">إدارة طلبات استقالة الموظفين</p>
          </div>
        </div>

        <DataTable
          data={resignations}
          columns={columns}
          loading={isLoading}
          onAdd={() => {
            setEditingItem({});
            setShowModal(true);
          }}
          addButtonText="طلب استقالة جديد"
          searchPlaceholder="بحث في طلبات الاستقالة..."
          emptyMessage="لا توجد طلبات استقالة"
        />

        <FormModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          title={editingItem?.id ? "تعديل طلب الاستقالة" : "طلب استقالة جديد"}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <Label>الموظف *</Label>
              <select
                className="w-full border rounded-md p-2"
                value={editingItem?.employee_id || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, employee_id: e.target.value })
                }
              >
                <option value="">اختر الموظف</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} - {emp.employee_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>تاريخ تقديم الاستقالة *</Label>
                <Input
                  type="date"
                  value={editingItem?.resignation_date || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, resignation_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>تاريخ نهاية الخدمة *</Label>
                <Input
                  type="date"
                  value={editingItem?.end_of_service_date || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, end_of_service_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>فترة الإشعار (بالأيام)</Label>
              <Input
                type="number"
                value={editingItem?.notice_period_days || 30}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    notice_period_days: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <Label>سبب الاستقالة *</Label>
              <Textarea
                value={editingItem?.reason || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, reason: e.target.value })
                }
                rows={4}
                placeholder="اكتب سبب الاستقالة..."
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

            <div>
              <Label>المرفقات</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById("file-upload").click()}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? "جاري الرفع..." : "رفع ملفات"}
                    </Button>
                  </label>
                </div>
                {editingItem?.attachments && editingItem.attachments.length > 0 && (
                  <div className="space-y-1">
                    {editingItem.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600"
                        >
                          حذف
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </FormModal>

        <FormModal
          open={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItem(null);
            setApprovalNotes("");
          }}
          title="تفاصيل طلب الاستقالة"
          showFooter={false}
          size="xl"
        >
          {selectedItem && (
            <div className="space-y-6">
              {/* Status Banner */}
              {pendingStep && (
                <div className={`p-4 rounded-lg flex items-center justify-between ${isApprover ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isApprover ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-semibold ${isApprover ? 'text-amber-900' : 'text-blue-900'}`}>
                        {isApprover ? 'بانتظار مراجعتك واعتمادك' : `بانتظار: ${pendingStep.role_name}`}
                      </p>
                      <p className={`text-sm ${isApprover ? 'text-amber-700' : 'text-blue-700'}`}>
                        {isApprover ? 'يرجى مراجعة تفاصيل الاستقالة واتخاذ الإجراء المناسب' : `هذا الطلب حالياً عند ${pendingStep.role_name}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">رقم الطلب</p>
                  <p className="font-semibold font-mono">{selectedItem.request_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الموظف</p>
                  <p className="font-semibold">{getEmployeeName(selectedItem.employee_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ التقديم</p>
                  <p className="font-semibold">
                    {selectedItem.resignation_date
                      ? format(new Date(selectedItem.resignation_date), "dd/MM/yyyy", {
                        locale: ar,
                      })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ نهاية الخدمة</p>
                  <p className="font-semibold">
                    {selectedItem.end_of_service_date
                      ? format(new Date(selectedItem.end_of_service_date), "dd/MM/yyyy", {
                        locale: ar,
                      })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">فترة الإشعار</p>
                  <p className="font-semibold">{selectedItem.notice_period_days || 30} يوم</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الحالة</p>
                  <StatusBadge status={selectedItem.workflow_status || selectedItem.status} />
                </div>
              </div>

              <div className="p-4 bg-white border rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">سبب الاستقالة</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.reason}</p>
              </div>

              {selectedItem.notes && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">ملاحظات إضافية</p>
                  <p className="text-gray-700">{selectedItem.notes}</p>
                </div>
              )}

              {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">المرفقات</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white border rounded hover:bg-gray-100 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-blue-600">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4">مسار الاعتمادات</h3>
                <ApprovalTimeline
                  approvalChain={selectedItem.approval_steps || []}
                />
              </div>

              {/* Approval Action Form */}
              {isApprover && (
                <div className="border-t pt-6 space-y-4">
                  <Label>ملاحظات الاعتماد / الرفض</Label>
                  <Textarea
                    placeholder="اكتب ملاحظاتك هنا..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => handleApprovalAction('return_for_review')}
                    >
                      إعادة للمراجعة
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleApprovalAction('reject')}
                    >
                      رفض الطلب
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprovalAction('approve')}
                    >
                      اعتماد الطلب
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </FormModal>

        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => deleteMutation.mutate(selectedItem.id)}
          title="حذف طلب الاستقالة"
          description="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        />

        <ConfirmDialog
          open={showForceApproveDialog}
          onClose={() => setShowForceApproveDialog(false)}
          onConfirm={handleForceApprove}
          title="تأكيد الاعتماد النهائي الاستثنائي"
          description="هل أنت متأكد من الاعتماد المباشر؟ سيتم تخطي الخطوات المتبقية واعتمادها باسمك كمدير للنظام مع الاحتفاظ بأي اعتمادات سابقة تمت على الطلب."
          confirmLabel="تأكيد الاعتماد ⚡"
          cancelLabel="إلغاء"
          variant="destructive"
          loading={forceApproveLoading}
        />
      </div>
    </ProtectedRoute>
  );
}