import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Calendar, CheckCircle, AlertCircle, Clock, Code, Database, Zap, GitBranch, Network, BookOpen, Download, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/DataTable";
import FormModal from "@/components/ui/FormModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

export default function DevelopmentLog() {
  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    task_title: "",
    log_date: format(new Date(), "yyyy-MM-dd"),
    category: "feature",
    status: "completed",
    priority: "medium",
    technical_description: "",
    business_logic: "",
    business_rules: [],
    database_entities: [],
    affected_files: [],
    dependencies: [],
    api_endpoints: [],
    ai_reproduction_prompt: "",
    performance_notes: "",
    notes: ""
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    bugFixes: 0,
    features: 0,
    modulesCount: 0,
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.DevelopmentLog.list("-log_date", 200);
      setLogs(data);

      const modulesList = data.filter(log => log.category === "module");
      setModules(modulesList);

      setStats({
        total: data.length,
        completed: data.filter((l) => l.status === "completed" || l.status === "fixed").length,
        bugFixes: data.filter((l) => l.category === "bug_fix").length,
        features: data.filter((l) => l.category === "feature").length,
        modulesCount: modulesList.length,
      });
    } catch (error) {
      console.error("Error loading logs:", error);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: "مكتمل", className: "bg-green-100 text-green-800" },
      fixed: { label: "تم الإصلاح", className: "bg-blue-100 text-blue-800" },
      in_progress: { label: "قيد التنفيذ", className: "bg-yellow-100 text-yellow-800" },
      pending: { label: "معلق", className: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      bug_fix: { label: "إصلاح خطأ", className: "bg-red-100 text-red-800" },
      feature: { label: "ميزة جديدة", className: "bg-purple-100 text-purple-800" },
      enhancement: { label: "تحسين", className: "bg-blue-100 text-blue-800" },
      refactor: { label: "إعادة هيكلة", className: "bg-orange-100 text-orange-800" },
      documentation: { label: "توثيق", className: "bg-teal-100 text-teal-800" },
      module: { label: "وحدة نظام", className: "bg-indigo-100 text-indigo-800" },
    };
    const config = categoryConfig[category] || { label: category, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleAdd = () => {
    setFormData({
      task_title: "",
      log_date: format(new Date(), "yyyy-MM-dd"),
      category: "feature",
      status: "completed",
      priority: "medium",
      technical_description: "",
      business_logic: "",
      business_rules: [],
      database_entities: [],
      affected_files: [],
      dependencies: [],
      api_endpoints: [],
      ai_reproduction_prompt: "",
      performance_notes: "",
      notes: ""
    });
    setShowAddModal(true);
  };

  const handleEdit = (log) => {
    setSelectedLog(log);
    setFormData({
      ...log,
      business_rules: log.business_rules || [],
      database_entities: log.database_entities || [],
      affected_files: log.affected_files || [],
      dependencies: log.dependencies || [],
      api_endpoints: log.api_endpoints || [],
    });
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.task_title || !formData.technical_description) {
      toast.error("يرجى ملء الحقول الأساسية");
      return;
    }

    setSaving(true);
    try {
      if (selectedLog) {
        await base44.entities.DevelopmentLog.update(selectedLog.id, formData);
        toast.success("تم تحديث السجل بنجاح");
      } else {
        await base44.entities.DevelopmentLog.create(formData);
        toast.success("تمت إضافة السجل بنجاح");
      }
      await loadLogs();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };

  const handleDelete = async (log) => {
    if (!window.confirm(`هل أنت متأكد من حذف السجل "${log.task_title}"؟`)) return;
    
    try {
      await base44.entities.DevelopmentLog.delete(log.id);
      toast.success("تم حذف السجل بنجاح");
      await loadLogs();
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const exportModulesToPDF = async () => {
    try {
      const response = await base44.functions.invoke('generateEngineeringPDF', {
        exportType: 'modules'
      });

      const blob = new Blob([response.data], { type: 'text/html; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HRMS_Modules_${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('تم تصدير وحدات النظام - افتح الملف واطبعه كـ PDF من المتصفح');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء التصدير');
    }
  };

  const exportArchitectureToPDF = async () => {
    try {
      const response = await base44.functions.invoke('generateEngineeringPDF', {
        exportType: 'architecture'
      });

      const blob = new Blob([response.data], { type: 'text/html; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HRMS_Architecture_${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('تم تصدير خريطة العلاقات - افتح الملف واطبعه كـ PDF من المتصفح');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء التصدير');
    }
  };

  const exportUpdateLogsToPDF = async () => {
    try {
      const response = await base44.functions.invoke('generateEngineeringPDF', {
        exportType: 'updates'
      });

      const blob = new Blob([response.data], { type: 'text/html; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HRMS_Updates_${format(new Date(), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('تم تصدير سجل التحديثات - افتح الملف واطبعه كـ PDF من المتصفح');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء التصدير');
    }
  };

  const columns = [
    {
      header: "التاريخ",
      accessor: "log_date",
      cell: (row) => (
        <div className="text-sm">
          {row.log_date ? format(parseISO(row.log_date), "dd/MM/yyyy", { locale: ar }) : "-"}
        </div>
      ),
    },
    {
      header: "المهمة",
      accessor: "task_title",
      cell: (row) => (
        <div>
          <p className="font-medium text-gray-800">{row.task_title}</p>
          <p className="text-xs text-gray-500 mt-1">{row.technical_description?.substring(0, 80)}...</p>
        </div>
      ),
    },
    {
      header: "النوع",
      accessor: "category",
      cell: (row) => getCategoryBadge(row.category),
    },
    {
      header: "الحالة",
      accessor: "status",
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: "الإجراءات",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row)}
            className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0"
            title="عرض التفاصيل"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="text-amber-600 h-8 w-8 p-0"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-red-600 h-8 w-8 p-0"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">الموسوعة الهندسية للنظام</h2>
        <p className="text-gray-500">دليل شامل لبنية النظام، القواعد، والتحديثات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي السجلات</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Code className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">وحدات النظام</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.modulesCount}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Database className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مهام مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إصلاحات</p>
                <p className="text-2xl font-bold text-red-600">{stats.bugFixes}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ميزات جديدة</p>
                <p className="text-2xl font-bold text-purple-600">{stats.features}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">سجل التحديثات</TabsTrigger>
          <TabsTrigger value="modules">وحدات النظام</TabsTrigger>
          <TabsTrigger value="architecture">خريطة النظام</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  سجل التحديثات
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportUpdateLogsToPDF}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  تصدير PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={logs.filter(l => l.category !== "module")}
                columns={columns}
                loading={loading}
                onAdd={handleAdd}
                addButtonText="إضافة سجل تطوير"
                searchPlaceholder="بحث في السجلات..."
                emptyMessage="لا توجد سجلات"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <div className="mb-4 flex justify-end">
            <Button
              onClick={exportModulesToPDF}
              className="bg-[#7c3238] hover:bg-[#5a252a] gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير التقرير الهندسي (PDF)
            </Button>
          </div>
          <div className="grid gap-4">
            {modules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-600" />
                        {module.task_title}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{module.technical_description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(module)}
                    >
                      عرض التفاصيل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium mb-1">الجداول المرتبطة:</p>
                      <div className="flex flex-wrap gap-1">
                        {module.database_entities?.map((entity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium mb-1">الملفات:</p>
                      <p className="text-gray-700">{module.affected_files?.length || 0} ملف</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium mb-1">التبعيات:</p>
                      <p className="text-gray-700">{module.dependencies?.length || 0} وحدة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="architecture">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  خريطة العلاقات بين الوحدات
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportArchitectureToPDF}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  تصدير PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modules.map((module) => (
                  <div key={module.id} className="border-r-4 border-indigo-500 pr-4">
                    <h3 className="font-bold text-gray-800 mb-2">{module.task_title}</h3>
                    {module.module_interconnections && module.module_interconnections.length > 0 ? (
                      <div className="space-y-2">
                        {module.module_interconnections.map((conn, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <GitBranch className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <span className="font-medium text-gray-700">{conn.target_module}</span>
                              <span className="text-gray-500 mx-2">←</span>
                              <Badge variant="outline" className="text-xs">{conn.relationship_type}</Badge>
                              <p className="text-gray-600 mt-1">{conn.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">لا توجد علاقات مباشرة مسجلة</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <FormModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedLog?.task_title}
        showFooter={false}
        size="xl"
      >
        {selectedLog && (
          <div className="space-y-6" dir="rtl">
            <div className="flex items-center gap-2">
              {getCategoryBadge(selectedLog.category)}
              {getStatusBadge(selectedLog.status)}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  الوصف التقني
                </h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                  {selectedLog.technical_description}
                </p>
              </div>

              {selectedLog.business_logic && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    المنطق البرمجي
                  </h4>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedLog.business_logic}
                  </p>
                </div>
              )}

              {selectedLog.business_rules && selectedLog.business_rules.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">القواعد الصارمة</h4>
                  <div className="space-y-2">
                    {selectedLog.business_rules.map((rule, idx) => (
                      <div key={idx} className="bg-amber-50 border-r-4 border-amber-500 p-3 rounded">
                        <p className="font-medium text-gray-800">{rule.rule}</p>
                        {rule.validation && (
                          <p className="text-sm text-gray-600 mt-1">✓ {rule.validation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.database_entities && selectedLog.database_entities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    الجداول المرتبطة
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.database_entities.map((entity, idx) => (
                      <Badge key={idx} className="bg-indigo-100 text-indigo-800">
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.frontend_backend_flow && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">طريقة الربط Frontend ↔ Backend</h4>
                  <p className="text-gray-600 bg-green-50 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedLog.frontend_backend_flow}
                  </p>
                </div>
              )}

              {selectedLog.affected_files && selectedLog.affected_files.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">الملفات المتأثرة</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    {selectedLog.affected_files.map((file, idx) => (
                      <div key={idx} className="text-sm text-gray-700 font-mono">
                        • {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.dependencies && selectedLog.dependencies.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">التبعيات</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.dependencies.map((dep, idx) => (
                      <Badge key={idx} variant="outline">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.api_endpoints && selectedLog.api_endpoints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">نقاط الاتصال API</h4>
                  <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                    {selectedLog.api_endpoints.map((endpoint, idx) => (
                      <div key={idx} className="text-sm text-gray-700 font-mono">
                        → {endpoint}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.ai_reproduction_prompt && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    برومبت إعادة البناء بواسطة AI
                  </h4>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedLog.ai_reproduction_prompt}
                    </p>
                  </div>
                </div>
              )}

              {selectedLog.performance_notes && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">ملاحظات الأداء</h4>
                  <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    {selectedLog.performance_notes}
                  </p>
                </div>
              )}

              {selectedLog.notes && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">ملاحظات إضافية</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedLog.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </FormModal>

      <FormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedLog ? "تعديل سجل تطوير" : "إضافة سجل تطوير جديد"}
        onSubmit={handleSubmit}
        loading={saving}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">عنوان المهمة *</label>
              <input
                className="w-full p-2 border rounded-md"
                value={formData.task_title || ""}
                onChange={(e) => setFormData({ ...formData, task_title: e.target.value })}
                placeholder="مثال: تفعيل سجل الرقابة الإدارية"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">التاريخ *</label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={formData.log_date || ""}
                onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">النوع</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.category || "feature"}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="feature">ميزة جديدة</option>
                <option value="bug_fix">إصلاح خطأ</option>
                <option value="enhancement">تحسين</option>
                <option value="refactor">إعادة هيكلة</option>
                <option value="documentation">توثيق</option>
                <option value="module">وحدة نظام (Encyclopedia)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.status || "completed"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="completed">مكتمل</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="pending">معلق</option>
                <option value="fixed">تم الإصلاح</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الأولوية</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.priority || "medium"}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">منخفضة</option>
                <option value="medium">متوسطة</option>
                <option value="high">عالية</option>
                <option value="critical">حرجة</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الوصف التقني *</label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px]"
              value={formData.technical_description || ""}
              onChange={(e) => setFormData({ ...formData, technical_description: e.target.value })}
              placeholder="اشرح ماذا تم برمجياً..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">المنطق البرمجي (Business Logic)</label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[80px]"
              value={formData.business_logic || ""}
              onChange={(e) => setFormData({ ...formData, business_logic: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الجداول المرتبطة (مفصولة بفاصلة)</label>
              <input
                className="w-full p-2 border rounded-md"
                value={Array.isArray(formData.database_entities) ? formData.database_entities.join(", ") : ""}
                onChange={(e) => setFormData({ ...formData, database_entities: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                placeholder="employees, contracts, ..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الملفات المتأثرة (مفصولة بفاصلة)</label>
              <input
                className="w-full p-2 border rounded-md"
                value={Array.isArray(formData.affected_files) ? formData.affected_files.join(", ") : ""}
                onChange={(e) => setFormData({ ...formData, affected_files: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                placeholder="UsersController.php, ..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">برومبت AI لإعادة الإنتاج</label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px] font-mono text-xs"
              value={formData.ai_reproduction_prompt || ""}
              onChange={(e) => setFormData({ ...formData, ai_reproduction_prompt: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ملاحظات إضافية</label>
            <textarea
              className="w-full p-2 border rounded-md"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}