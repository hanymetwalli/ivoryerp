import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Plus, Eye, Calendar, User, AlertCircle, Upload, Paperclip,
  MoreVertical, Edit, Trash2 
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
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import ApprovalTimeline from "@/components/ApprovalTimeline";
import ApprovalActions from "@/components/ApprovalActions";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PERMISSIONS } from "@/components/permissions";
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
  const [currentUser, setCurrentUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [employeesData, userData] = await Promise.all([
        base44.entities.Employee.list(),
        base44.auth.me(),
      ]);
      setEmployees(employeesData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const { data: resignations = [], isLoading } = useQuery({
    queryKey: ["resignations"],
    queryFn: () => base44.entities.Resignation.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const requestNumber = await base44.functions.invoke("generateRequestNumber", {
          entity: "Resignation",
        });
        
        const approvalChain = await base44.functions.invoke("getApprovalChain", {
          entity: "Resignation",
          employeeId: data.employee_id,
        });

        return base44.entities.Resignation.create({
          ...data,
          request_number: requestNumber.data.request_number,
          approval_chain: approvalChain.data.approvalChain, // Save the full chain
          current_approval_level: approvalChain.data.approvalChain[0]?.level,
          current_level_idx: 0,
          current_status_desc: approvalChain.data.approvalChain[0] 
            ? `جارى الاعتماد من: ${approvalChain.data.approvalChain[0].level_name}` 
            : 'قيد الانتظار',
          approval_history: [],
        });
      } catch (error) {
        console.error("Error creating resignation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["resignations"]);
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
      queryClient.invalidateQueries(["resignations"]);
      setShowModal(false);
      setEditingItem(null);
      toast.success("تم تحديث طلب الاستقالة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Resignation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["resignations"]);
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

  const handleApprovalAction = async (action, notes) => {
    try {
      // Use entity: "resignation" which matches the backend map fix
      const result = await base44.functions.invoke("processApproval", {
        entity: "resignation",
        record_id: selectedItem.id,
        action,
        notes,
      });

      if (result.data.success) {
        queryClient.invalidateQueries(["resignations"]);
        setShowDetailsModal(false);
        toast.success(
          action === "approve" ? "تم الاعتماد بنجاح" : "تم الرفض"
        );
      } else {
        toast.error(result.data.message || "حدث خطأ");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء العملية");
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.full_name || "-";
  };

  const handleView = async (item) => {
    // Generate chain if missing
    if (!item.approval_chain || item.approval_chain.length === 0) {
        try {
            const chainResponse = await base44.functions.invoke('getApprovalChain', {
                entity: 'Resignation',
                employeeId: item.employee_id
            });
            
            const newChain = chainResponse.data.approvalChain || [];
            
            // Save to Backend to persist fix
            await base44.entities.Resignation.update(item.id, {
                approval_chain: newChain,
                current_level_idx: 0, // Reset if regenerating
                current_approval_level: newChain[0]?.level
            });

            // Update local state
            setSelectedItem({
                ...item,
                approval_chain: newChain
            });
        } catch (e) {
            console.error('Error loading chain:', e);
            setSelectedItem(item);
        }
    } else {
        setSelectedItem(item);
    }
    
    setShowDetailsModal(true);
  };

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
      header: "فترة الإشعار",
      accessor: "notice_period_days",
      cell: (row) => `${row.notice_period_days || 30} يوم`,
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
            
            {(row.status === 'pending' || row.status === 'draft') && (
              <>
                <DropdownMenuItem onClick={() => handleEdit(row)}>
                  <Edit className="w-4 h-4 ml-2" />
                  تعديل
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
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <ProtectedRoute permission={PERMISSIONS.VIEW_ALL_EMPLOYEES}>
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
          }}
          title="تفاصيل طلب الاستقالة"
          showFooter={false}
          size="xl"
        >
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
                  <StatusBadge status={selectedItem.status} />
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">سبب الاستقالة</p>
                    <p className="text-amber-800 mt-1">{selectedItem.reason}</p>
                  </div>
                </div>
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
                  <div className="space-y-2">
                    {selectedItem.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-white rounded hover:bg-gray-100 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-blue-600">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <ApprovalTimeline
                approvalHistory={selectedItem.approval_history || []}
                approvalChain={selectedItem.approval_chain || []}
                currentLevel={selectedItem.current_approval_level}
                status={selectedItem.status}
              />

              {/* Ensure we only show actions if chain exists */}
              <ApprovalActions
                entityName="resignation"
                recordId={selectedItem.id}
                onApproved={() => {
                  queryClient.invalidateQueries(["resignations"]);
                  setShowDetailsModal(false);
                }}
              />
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
      </div>
    </ProtectedRoute>
  );
}