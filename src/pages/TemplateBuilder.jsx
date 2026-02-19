import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function TemplateBuilder() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const templateId = urlParams.get("id");
  
  const [template, setTemplate] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [categories, setCategories] = useState([]); // قائمة التصنيفات
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
      loadCategories(); // تحميل التصنيفات عند البدء
    }
  }, [templateId]);

  const loadCategories = async () => {
    try {
      // Use the newly fixed SDK method
      const res = await base44.entities.Competency.customAction(0, 'categories');
      
      console.log("Categories loaded:", res);
      
      let cats = [];
      if (res && Array.isArray(res.data)) {
        cats = res.data;
      } else if (Array.isArray(res)) {
        cats = res;
      }
      
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const [tempData, comps, kpiData] = await Promise.all([
        base44.entities.EvaluationTemplate.filter({ id: templateId }).then(r => r[0]),
        base44.entities.Competency.filter({ template_id: templateId }),
        base44.entities.TemplateKPI.filter({ template_id: templateId }),
      ]);
      setTemplate(tempData);
      setCompetencies(comps.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setKpis(kpiData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("فشل في تحميل القالب");
    }
    setLoading(false);
  };

  const addCompetency = () => {
    setCompetencies([
      ...competencies,
      {
        template_id: templateId,
        name: "",
        description: "",
        category: "General", // قيمة افتراضية
        order: competencies.length + 1,
        bars_level_1: "",
        bars_level_2: "",
        bars_level_3: "",
        bars_level_4: "",
        bars_level_5: "",
      },
    ]);
  };

  const updateCompetency = (index, field, value) => {
    const updated = [...competencies];
    updated[index] = { ...updated[index], [field]: value };
    setCompetencies(updated);
  };

  const deleteCompetency = async (index) => {
    const comp = competencies[index];
    if (comp.id) {
      try {
        await base44.entities.Competency.delete(comp.id);
        toast.success("تم حذف الجدارة");
      } catch (error) {
        toast.error("فشل في حذف الجدارة");
        return;
      }
    }
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const addKPI = () => {
    setKpis([
      ...kpis,
      {
        template_id: templateId,
        name: "",
        description: "",
        weight: 0,
        order: kpis.length + 1,
        measurement_unit: "",
      },
    ]);
  };

  const updateKPI = (index, field, value) => {
    const updated = [...kpis];
    updated[index] = { ...updated[index], [field]: value };
    setKpis(updated);
  };

  const deleteKPI = async (index) => {
    const kpi = kpis[index];
    if (kpi.id) {
      try {
        await base44.entities.TemplateKPI.delete(kpi.id);
        toast.success("تم حذف المؤشر");
      } catch (error) {
        toast.error("فشل في حذف المؤشر");
        return;
      }
    }
    setKpis(kpis.filter((_, i) => i !== index));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Save competencies
      for (const comp of competencies) {
        if (!comp.name || !comp.description) continue;
        
        if (comp.id) {
          await base44.entities.Competency.update(comp.id, comp);
        } else {
          await base44.entities.Competency.create(comp);
        }
      }

      // Save KPIs
      for (const kpi of kpis) {
        if (!kpi.name || !kpi.weight) continue;
        
        if (kpi.id) {
          await base44.entities.TemplateKPI.update(kpi.id, kpi);
        } else {
          await base44.entities.TemplateKPI.create(kpi);
        }
      }

      toast.success("تم حفظ القالب بنجاح");
      loadTemplate();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("فشل في حفظ القالب");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3238]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("EvaluationTemplates")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template?.name}</h1>
            <p className="text-gray-600 mt-1">إعداد الجدارات ومؤشرات الأداء</p>
          </div>
        </div>
        <Button
          onClick={saveAll}
          disabled={saving}
          className="gap-2 bg-[#7c3238] hover:bg-[#5a252a]"
        >
          <Save className="w-4 h-4" />
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>

      <Tabs defaultValue="competencies" dir="rtl">
        <datalist id="categories-list">
          {categories.map((cat, i) => (
            <option key={i} value={cat} />
          ))}
        </datalist>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="competencies">الجدارات الجوهرية</TabsTrigger>
          <TabsTrigger value="kpis">مؤشرات الأداء (KPIs)</TabsTrigger>
        </TabsList>

        <TabsContent value="competencies" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">الجدارات الجوهرية</h3>
            <Button onClick={addCompetency} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة جدارة
            </Button>
          </div>

          {competencies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                لا توجد جدارات. اضغط "إضافة جدارة" للبدء
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {competencies.map((comp, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">جدارة {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCompetency(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">اسم الجدارة *</label>
                        <Input
                          value={comp.name}
                          onChange={(e) => updateCompetency(index, "name", e.target.value)}
                          placeholder="مثال: التخطيط والتنظيم"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">التصنيف (الفئة)</label>
                        <div className="relative">
                          <Input
                            list="categories-list"
                            value={comp.category || ""}
                            onChange={(e) => updateCompetency(index, "category", e.target.value)}
                            placeholder="اختر أو اكتب تصنيفاً..."
                            autoComplete="off"
                          />
                          <datalist id="categories-list">
                            {categories.map((cat, i) => (
                              <option key={i} value={cat} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">الوصف *</label>
                      <Textarea
                        value={comp.description}
                        onChange={(e) => updateCompetency(index, "description", e.target.value)}
                        placeholder="القدرة على تصميم وتنفيذ برامج تدريبية..."
                        className="h-20"
                      />
                    </div>

                    <div className="border-t pt-4">
                      <p className="font-medium mb-3">مستويات التقييم (BARS)</p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-red-600">
                            (1) ضعيف
                          </label>
                          <Textarea
                            value={comp.bars_level_1}
                            onChange={(e) => updateCompetency(index, "bars_level_1", e.target.value)}
                            placeholder="وصف الممارسة السلوكية للمستوى الضعيف"
                            className="h-16"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-orange-600">
                            (2) مقبول يحتاج تحسين
                          </label>
                          <Textarea
                            value={comp.bars_level_2}
                            onChange={(e) => updateCompetency(index, "bars_level_2", e.target.value)}
                            placeholder="وصف الممارسة السلوكية للمستوى المقبول"
                            className="h-16"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-yellow-600">
                            (3) يلبي التوقعات
                          </label>
                          <Textarea
                            value={comp.bars_level_3}
                            onChange={(e) => updateCompetency(index, "bars_level_3", e.target.value)}
                            placeholder="وصف الممارسة السلوكية لمن يلبي التوقعات"
                            className="h-16"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-blue-600">
                            (4) يتجاوز التوقعات
                          </label>
                          <Textarea
                            value={comp.bars_level_4}
                            onChange={(e) => updateCompetency(index, "bars_level_4", e.target.value)}
                            placeholder="وصف الممارسة السلوكية لمن يتجاوز التوقعات"
                            className="h-16"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-green-600">
                            (5) استثنائي
                          </label>
                          <Textarea
                            value={comp.bars_level_5}
                            onChange={(e) => updateCompetency(index, "bars_level_5", e.target.value)}
                            placeholder="وصف الممارسة السلوكية للمستوى الاستثنائي"
                            className="h-16"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kpis" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">مؤشرات الأداء (KPIs)</h3>
            <Button onClick={addKPI} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مؤشر
            </Button>
          </div>

          {kpis.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                لا توجد مؤشرات. اضغط "إضافة مؤشر" للبدء
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {kpis.map((kpi, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">مؤشر {index + 1}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteKPI(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">اسم المؤشر *</label>
                        <Input
                          value={kpi.name}
                          onChange={(e) => updateKPI(index, "name", e.target.value)}
                          placeholder="مثال: عدد البرامج التدريبية الناجحة"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">الوزن النسبي % *</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={kpi.weight}
                          onChange={(e) => updateKPI(index, "weight", parseFloat(e.target.value))}
                          placeholder="25"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">الوصف</label>
                      <Textarea
                        value={kpi.description}
                        onChange={(e) => updateKPI(index, "description", e.target.value)}
                        placeholder="وصف تفصيلي للمؤشر وطريقة قياسه"
                        className="h-20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">وحدة القياس</label>
                      <Input
                        value={kpi.measurement_unit}
                        onChange={(e) => updateKPI(index, "measurement_unit", e.target.value)}
                        placeholder="مثال: عدد، نسبة %، ساعات"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>مجموع الأوزان النسبية:</strong> {kpis.reduce((sum, k) => sum + (k.weight || 0), 0)}%
                  {kpis.reduce((sum, k) => sum + (k.weight || 0), 0) !== 100 && (
                    <span className="text-red-600 mr-2">
                      (يجب أن يكون المجموع 100%)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}