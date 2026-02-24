import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, FileDown, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { PERMISSIONS, hasPermission } from "@/components/permissions";
import ApprovalActions from "@/components/ApprovalActions";
import ApprovalTimeline from "@/components/ApprovalTimeline";

export default function EvaluationForm() {
  const [currentUser, setCurrentUser] = useState(null);
  const [canApprove, setCanApprove] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const evaluationId = urlParams.get("id");

  const [evaluation, setEvaluation] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [template, setTemplate] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [competencyRatings, setCompetencyRatings] = useState({});
  const [kpiResults, setKpiResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (evaluationId) {
      loadEvaluation();
      loadCurrentUser();
    }
  }, [evaluationId]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      // Check approval permissions
      const canApproveManager = await hasPermission(user, PERMISSIONS.APPROVE_EVALUATION_MANAGER);
      const canApproveGM = await hasPermission(user, PERMISSIONS.APPROVE_EVALUATION_GM);
      const canApproveHR = await hasPermission(user, PERMISSIONS.APPROVE_EVALUATION_HR);

      setCanApprove(canApproveManager || canApproveGM || canApproveHR);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadEvaluation = async () => {
    setLoading(true);
    try {
      const evalData = await base44.entities.PerformanceEvaluation.filter({ id: evaluationId }).then(r => r[0]);

      // Map DB fields to Frontend State
      const signatures = evalData.signatures || {};
      setEvaluation({
        ...evalData,
        // Map DB columns to Frontend state variables
        improvement_areas: evalData.areas_for_improvement,
        development_actions: evalData.development_plan,

        // Flatten signatures for inputs
        employee_signature_date: signatures.employee_signature_date,
        evaluator_signature_date: signatures.evaluator_signature_date,
        hr_signature_date: signatures.hr_signature_date
      });

      const [empData, tempData, comps, kpiData, compRatings, kpiRes] = await Promise.all([
        base44.entities.Employee.filter({ id: evalData.employee_id }).then(r => r[0]),
        base44.entities.EvaluationTemplate.filter({ id: evalData.template_id }).then(r => r[0]),
        base44.entities.Competency.filter({ template_id: evalData.template_id }),
        base44.entities.TemplateKPI.filter({ template_id: evalData.template_id }),
        base44.entities.CompetencyRating.filter({ evaluation_id: evaluationId }),
        base44.entities.KPIResult.filter({ evaluation_id: evaluationId }),
      ]);

      setEmployee(empData);
      setTemplate(tempData);
      setCompetencies(comps.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setKpis(kpiData.sort((a, b) => (a.order || 0) - (b.order || 0)));

      // Map ratings
      const ratingsMap = {};
      compRatings.forEach(cr => {
        ratingsMap[cr.competency_id] = cr;
      });
      setCompetencyRatings(ratingsMap);

      // Map KPI results
      const resultsMap = {};
      kpiRes.forEach(kr => {
        resultsMap[kr.template_kpi_id] = kr;
      });
      setKpiResults(resultsMap);

    } catch (error) {
      console.error("Error loading evaluation:", error);
      toast.error("فشل في تحميل التقييم");
    }
    setLoading(false);
  };

  const updateCompetencyRating = (compId, rating) => {
    setCompetencyRatings({
      ...competencyRatings,
      [compId]: {
        ...competencyRatings[compId],
        competency_id: compId,
        evaluation_id: evaluationId,
        rating,
      },
    });
  };

  const updateKPIResult = (kpiId, field, value) => {
    setKpiResults({
      ...kpiResults,
      [kpiId]: {
        ...kpiResults[kpiId],
        template_kpi_id: kpiId,
        evaluation_id: evaluationId,
        [field]: value,
      },
    });
  };

  const calculateOverallScore = () => {
    let totalScore = 0;
    let totalWeight = 0;

    // Calculate from KPIs
    kpis.forEach(kpi => {
      const result = kpiResults[kpi.id];
      if (result?.rating) {
        totalScore += result.rating * (kpi.weight / 100);
        totalWeight += kpi.weight / 100;
      }
    });

    return totalWeight > 0 ? ((totalScore / totalWeight) * 20).toFixed(1) : 0;
  };

  const saveEvaluation = async () => {
    setSaving(true);
    try {
      // Save competency ratings
      for (const compId in competencyRatings) {
        const rating = competencyRatings[compId];
        if (!rating.rating) continue;

        // Ensure mandatory fields
        const payload = {
          ...rating,
          employee_id: evaluation.employee_id,
          competency_id: compId,
          evaluation_id: evaluationId,
          evaluator_id: currentUser?.id,
          evaluation_date: new Date().toISOString().split('T')[0]
        };

        if (rating.id) {
          await base44.entities.CompetencyRating.update(rating.id, payload);
        } else {
          await base44.entities.CompetencyRating.create(payload);
        }
      }

      // Save KPI results
      for (const kpiId in kpiResults) {
        const result = kpiResults[kpiId];
        // Find corresponding KPI template to get weight
        const templateKpi = kpis.find(k => k.id === kpiId);
        const weight = templateKpi ? templateKpi.weight : 0;

        const payload = {
          ...result,
          weight: weight,
          kpi_name: templateKpi ? templateKpi.name : '',
          unit: templateKpi ? templateKpi.unit : ''
        };

        if (result.id) {
          await base44.entities.KPIResult.update(result.id, payload);
        } else {
          await base44.entities.KPIResult.create(payload);
        }
      }

      // Update evaluation with overall score
      const overallScore = calculateOverallScore();

      await base44.entities.PerformanceEvaluation.update(evaluationId, {
        overall_score: overallScore,
        strengths: evaluation.strengths,
        // Map Frontend State -> DB Columns
        areas_for_improvement: evaluation.improvement_areas,
        development_plan: evaluation.development_actions,
        signatures: {
          employee_signature_date: evaluation.employee_signature_date,
          evaluator_signature_date: evaluation.evaluator_signature_date,
          hr_signature_date: evaluation.hr_signature_date
        }
      });

      toast.success("تم حفظ التقييم بنجاح");
      loadEvaluation();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error("فشل في حفظ التقييم");
    }
    setSaving(false);
  };

  const submitForApproval = async () => {
    setSaving(true);
    try {
      // 1. First save all data (ratings, kpis, etc.)
      await saveEvaluation();

      // 2. Update status to pending (This will trigger workflow generation on the backend)
      await base44.entities.PerformanceEvaluation.update(evaluationId, {
        status: "pending"
      });

      toast.success("تم رفع التقييم للاعتماد");
      loadEvaluation();
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("فشل في رفع التقييم");
    }
    setSaving(false);
  };

  const handleApproval = async (action, notes = "") => {
    try {
      const response = await base44.functions.invoke("processApproval", {
        entity_name: "PerformanceEvaluation",
        entity_id: evaluationId,
        action,
        notes,
      });

      if (response.data.success) {
        toast.success(action === "approve" ? "تم اعتماد التقييم بنجاح" : "تم رفض التقييم");
        loadEvaluation();
      } else {
        toast.error(response.data.error || "فشل في معالجة الطلب");
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      toast.error("فشل في معالجة الطلب");
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      1: "bg-red-100 text-red-800 border-red-200",
      2: "bg-orange-100 text-orange-800 border-orange-200",
      3: "bg-yellow-100 text-yellow-800 border-yellow-200",
      4: "bg-blue-100 text-blue-800 border-blue-200",
      5: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[level] || "";
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("PerformanceEvaluations")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">تقييم الأداء</h1>
            <p className="text-gray-600 mt-1">
              {employee?.full_name} - {employee?.position}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" />
            تصدير PDF
          </Button>
          {evaluation?.status === 'draft' && (
            <>
              <Button
                onClick={saveEvaluation}
                disabled={saving}
                variant="outline"
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "جاري الحفظ..." : "حفظ مسودة"}
              </Button>
              <Button
                onClick={submitForApproval}
                disabled={saving}
                className="gap-2 bg-[#7c3238] hover:bg-[#5a252a]"
              >
                <CheckCircle className="w-4 h-4" />
                رفع للاعتماد
              </Button>
            </>
          )}
          {evaluation?.status !== 'draft' && evaluation?.status !== 'completed' && (
            <Button
              onClick={saveEvaluation}
              disabled={saving}
              className="gap-2 bg-[#7c3238] hover:bg-[#5a252a]"
            >
              <Save className="w-4 h-4" />
              {saving ? "جاري الحفظ..." : "حفظ التقييم"}
            </Button>
          )}
        </div>
      </div>

      {/* Evaluation Info */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات التقييم</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">رقم التقييم</p>
              <p className="font-medium">{evaluation?.evaluation_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">فترة التقييم</p>
              <p className="font-medium">
                {evaluation?.period_start} - {evaluation?.period_end}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">القالب</p>
              <p className="font-medium">{template?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الدرجة الإجمالية</p>
              <p className="font-medium text-lg text-[#7c3238]">
                {calculateOverallScore()}%
              </p>
            </div>
          </div>

          {/* Approval Info Banner */}
          {evaluation?.status !== 'draft' && evaluation?.status !== 'completed' && evaluation?.approval_steps?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-amber-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">
                  {(() => {
                    const pendingStep = evaluation.approval_steps.find(s => s.status === 'pending');
                    if (pendingStep) {
                      const title = pendingStep.approver_job_title || pendingStep.role_name || `الخطوة ${pendingStep.step_order}`;
                      return `جارى الاعتماد من: ${title}`;
                    }
                    return evaluation.current_status_desc || 'قيد المراجعة';
                  })()}
                </span>
              </div>
            </div>
          )}

          {/* Approval Timeline */}
          {evaluation?.approval_steps?.length > 0 && (
            <div className="border-t pt-4">
              <ApprovalTimeline
                approvalChain={evaluation.approval_steps}
              />
            </div>
          )}

          {/* Approval Actions */}
          {evaluation?.status !== 'draft' && evaluation?.status !== 'completed' && (
            <div className="border-t pt-4">
              <ApprovalActions
                entityName="PerformanceEvaluation"
                recordId={evaluationId}
                onApproved={() => {
                  toast.success("تم تحديث الحالة بنجاح");
                  loadEvaluation();
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competencies Section */}
      <Card>
        <CardHeader>
          <CardTitle>الجدارات الجوهرية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {competencies.map((comp, index) => (
            <div key={comp.id} className="border-b pb-6 last:border-b-0">
              <h3 className="font-semibold text-lg mb-2">
                {index + 1}. {comp.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{comp.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((level) => {
                  const barsDesc = comp[`bars_level_${level}`];
                  const isSelected = competencyRatings[comp.id]?.rating === level;

                  return (
                    <button
                      key={level}
                      onClick={() => updateCompetencyRating(comp.id, level)}
                      className={`p-3 border-2 rounded-lg text-right transition-all ${isSelected
                        ? getLevelColor(level) + " border-current"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="font-bold mb-1">({level})</div>
                      <div className="text-xs">{barsDesc}</div>
                    </button>
                  );
                })}
              </div>

              {competencyRatings[comp.id]?.notes !== undefined && (
                <div className="mt-3">
                  <Textarea
                    placeholder="ملاحظات إضافية..."
                    value={competencyRatings[comp.id]?.notes || ""}
                    onChange={(e) =>
                      setCompetencyRatings({
                        ...competencyRatings,
                        [comp.id]: {
                          ...competencyRatings[comp.id],
                          notes: e.target.value,
                        },
                      })
                    }
                    className="h-20"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* KPIs Section */}
      <Card>
        <CardHeader>
          <CardTitle>الأهداف والإنجازات (KPIs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold">الهدف الذكي (KPI)</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">المستهدف</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">المحقق</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">الوزن %</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">التقييم (1-5)</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi) => {
                  const result = kpiResults[kpi.id] || {};
                  return (
                    <tr key={kpi.id} className="border-b">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{kpi.name}</p>
                          {kpi.description && (
                            <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Input
                          type="number"
                          value={result.target_value || ""}
                          onChange={(e) =>
                            updateKPIResult(kpi.id, "target_value", parseFloat(e.target.value))
                          }
                          className="w-24 mx-auto text-center"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Input
                          type="number"
                          value={result.actual_value || ""}
                          onChange={(e) =>
                            updateKPIResult(kpi.id, "actual_value", parseFloat(e.target.value))
                          }
                          className="w-24 mx-auto text-center"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium">{kpi.weight}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={result.rating || ""}
                          onChange={(e) =>
                            updateKPIResult(kpi.id, "rating", parseInt(e.target.value))
                          }
                          className="w-32 mx-auto border rounded px-2 py-1 text-center text-sm"
                        >
                          <option value="">-</option>
                          <option value="1">(1) ضعيف</option>
                          <option value="2">(2) مقبول</option>
                          <option value="3">(3) جيد</option>
                          <option value="4">(4) جيد جدًا</option>
                          <option value="5">(5) ممتاز</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Development Plan (IDP) */}
      <Card>
        <CardHeader>
          <CardTitle>خطة التطوير الفردي (IDP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">نقاط القوة الرئيسية</label>
            <Textarea
              value={evaluation?.strengths || ""}
              onChange={(e) =>
                setEvaluation({ ...evaluation, strengths: e.target.value })
              }
              placeholder="استناداً للجدارات التي حصل فيها الموظف على تقييم 4 أو 5"
              className="h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">فجوات الأداء / فرص التحسين</label>
            <Textarea
              value={evaluation?.improvement_areas || ""}
              onChange={(e) =>
                setEvaluation({ ...evaluation, improvement_areas: e.target.value })
              }
              placeholder="التركيز على الجدارات دون المستوى 3"
              className="h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">إجراءات التطوير المقترحة</label>
            <Textarea
              value={evaluation?.development_actions || ""}
              onChange={(e) =>
                setEvaluation({ ...evaluation, development_actions: e.target.value })
              }
              placeholder="مثل: الحصول على شهادة معينة، أو دورات متقدمة"
              className="h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle>التوقيعات والاعتماد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-medium mb-2">توقيع الموظف</p>
              <Input
                type="date"
                value={evaluation?.employee_signature_date || ""}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, employee_signature_date: e.target.value })
                }
              />
            </div>
            <div>
              <p className="font-medium mb-2">توقيع المدير المباشر</p>
              <Input
                type="date"
                value={evaluation?.evaluator_signature_date || ""}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, evaluator_signature_date: e.target.value })
                }
              />
            </div>
            <div>
              <p className="font-medium mb-2">توقيع الموارد البشرية</p>
              <Input
                type="date"
                value={evaluation?.hr_signature_date || ""}
                onChange={(e) =>
                  setEvaluation({ ...evaluation, hr_signature_date: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}