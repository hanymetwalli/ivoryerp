import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exportType } = await req.json();
    
    // جلب البيانات من DevelopmentLog
    const logs = await base44.asServiceRole.entities.DevelopmentLog.list('-log_date', 200);
    const modules = logs.filter(log => log.category === 'module');
    const updateLogs = logs.filter(log => log.category !== 'module');

    let htmlContent = '';

    if (exportType === 'modules') {
      htmlContent = generateModulesHTML(modules);
    } else if (exportType === 'architecture') {
      htmlContent = generateArchitectureHTML(modules);
    } else if (exportType === 'updates') {
      htmlContent = generateUpdatesHTML(updateLogs);
    }

    // استخدام puppeteer أو بديل بسيط - نستخدم HTML فقط
    const fullHTML = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Arial', sans-serif; direction: rtl; font-size: 11pt; line-height: 1.6; }
    h1 { color: #7c3238; text-align: center; font-size: 22pt; margin-bottom: 10px; }
    h2 { color: #7c3238; font-size: 16pt; margin-top: 20px; border-bottom: 2px solid #7c3238; padding-bottom: 5px; }
    h3 { color: #5a252a; font-size: 13pt; margin-top: 15px; }
    h4 { color: #555; font-size: 11pt; margin-top: 10px; font-weight: bold; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #7c3238; padding-bottom: 15px; }
    .subtitle { color: #666; font-size: 12pt; }
    .date { color: #888; font-size: 10pt; margin-top: 5px; }
    .module-page { page-break-after: always; padding: 20px 0; }
    .module-page:last-child { page-break-after: auto; }
    .section { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; border-right: 4px solid #c9a86c; }
    .code-block { background: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 9pt; white-space: pre-wrap; }
    .badge { display: inline-block; padding: 3px 8px; margin: 2px; background: #e0e0e0; border-radius: 3px; font-size: 9pt; }
    .entity-badge { background: #e8eaf6; color: #3f51b5; }
    .rule-box { background: #fff8e1; border-right: 4px solid #ffc107; padding: 10px; margin: 8px 0; }
    .connection { background: #e3f2fd; padding: 10px; margin: 8px 0; border-right: 3px solid #2196f3; }
    ul { margin: 5px 0; padding-right: 20px; }
    li { margin: 3px 0; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
    `;

    return new Response(fullHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="HRMS_Engineering_Report_${exportType}_${new Date().toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateModulesHTML(modules) {
  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let html = `
    <div class="header">
      <h1>الموسوعة الهندسية - وحدات النظام</h1>
      <p class="subtitle">نظام إدارة الموارد البشرية (HRMS)</p>
      <p class="date">تاريخ التصدير: ${today}</p>
    </div>
  `;

  modules.forEach((module, index) => {
    html += `
      <div class="module-page">
        <h2>${index + 1}. ${module.task_title || ''}</h2>
        
        <div class="section">
          <h4>الوصف التقني:</h4>
          <p>${module.technical_description || '-'}</p>
        </div>

        ${module.business_logic ? `
        <div class="section">
          <h4>المنطق البرمجي:</h4>
          <div class="code-block">${module.business_logic.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${module.database_entities && module.database_entities.length > 0 ? `
        <div class="section">
          <h4>الجداول المرتبطة في قاعدة البيانات:</h4>
          <div>
            ${module.database_entities.map(e => `<span class="badge entity-badge">${e}</span>`).join(' ')}
          </div>
        </div>
        ` : ''}

        ${module.frontend_backend_flow ? `
        <div class="section">
          <h4>طريقة الربط Frontend ↔ Backend:</h4>
          <div class="code-block">${module.frontend_backend_flow.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${module.business_rules && module.business_rules.length > 0 ? `
        <div class="section">
          <h4>القواعد الصارمة:</h4>
          ${module.business_rules.map((rule, idx) => `
            <div class="rule-box">
              <strong>${idx + 1}. ${rule.rule || ''}</strong>
              ${rule.validation ? `<br><span style="color: #666;">✓ ${rule.validation}</span>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${module.affected_files && module.affected_files.length > 0 ? `
        <div class="section">
          <h4>الملفات المتأثرة:</h4>
          <ul>
            ${module.affected_files.map(f => `<li><code>${f}</code></li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${module.dependencies && module.dependencies.length > 0 ? `
        <div class="section">
          <h4>التبعيات (Dependencies):</h4>
          <div>
            ${module.dependencies.map(d => `<span class="badge">${d}</span>`).join(' ')}
          </div>
        </div>
        ` : ''}

        ${module.api_endpoints && module.api_endpoints.length > 0 ? `
        <div class="section">
          <h4>نقاط الاتصال API:</h4>
          <ul style="font-family: 'Courier New', monospace; font-size: 9pt;">
            ${module.api_endpoints.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${module.ai_reproduction_prompt ? `
        <div class="section" style="background: linear-gradient(to left, #f3e5f5, #e8eaf6); border-right-color: #9c27b0;">
          <h4>برومبت إعادة البناء بواسطة AI:</h4>
          <div class="code-block" style="background: white;">${module.ai_reproduction_prompt.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}

        ${module.performance_notes ? `
        <div class="section" style="background: #fffde7; border-right-color: #ffc107;">
          <h4>ملاحظات الأداء والتحسينات:</h4>
          <p>${module.performance_notes}</p>
        </div>
        ` : ''}
      </div>
    `;
  });

  return html;
}

function generateArchitectureHTML(modules) {
  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let html = `
    <div class="header">
      <h1>الموسوعة الهندسية - خريطة العلاقات</h1>
      <p class="subtitle">نظام إدارة الموارد البشرية (HRMS)</p>
      <p class="date">تاريخ التصدير: ${today}</p>
    </div>
  `;

  modules.forEach((module, index) => {
    html += `
      <div style="margin-bottom: 30px;">
        <h2>${index + 1}. ${module.task_title || ''}</h2>
        
        ${module.dependencies && module.dependencies.length > 0 ? `
        <div class="section">
          <h4>يعتمد على الوحدات التالية:</h4>
          <ul>
            ${module.dependencies.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${module.module_interconnections && module.module_interconnections.length > 0 ? `
        <div class="section">
          <h4>العلاقات مع الوحدات الأخرى:</h4>
          ${module.module_interconnections.map(conn => `
            <div class="connection">
              <strong>→ ${conn.target_module || ''}</strong>
              <span class="badge" style="background: #bbdefb;">${conn.relationship_type || ''}</span>
              <br>
              <span style="color: #555;">${conn.description || ''}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `;
  });

  return html;
}

function generateUpdatesHTML(updateLogs) {
  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  
  let html = `
    <div class="header">
      <h1>الموسوعة الهندسية - سجل التحديثات</h1>
      <p class="subtitle">نظام إدارة الموارد البشرية (HRMS)</p>
      <p class="date">تاريخ التصدير: ${today}</p>
    </div>
  `;

  updateLogs.forEach((log, index) => {
    const categoryLabels = {
      bug_fix: 'إصلاح خطأ',
      feature: 'ميزة جديدة',
      enhancement: 'تحسين',
      refactor: 'إعادة هيكلة',
      documentation: 'توثيق'
    };

    html += `
      <div style="margin-bottom: 25px; ${index > 0 && index % 3 === 0 ? 'page-break-before: always;' : ''}">
        <h3>${index + 1}. ${log.task_title || ''}</h3>
        
        <p style="color: #666; font-size: 10pt;">
          <strong>التاريخ:</strong> ${log.log_date || '-'} | 
          <strong>النوع:</strong> ${categoryLabels[log.category] || log.category} | 
          <strong>الحالة:</strong> ${log.status || '-'}
        </p>

        ${log.technical_description ? `
        <div class="section">
          <p>${log.technical_description}</p>
        </div>
        ` : ''}

        ${log.affected_files && log.affected_files.length > 0 ? `
        <div style="margin-top: 10px;">
          <h4>الملفات المتأثرة:</h4>
          <ul style="font-family: 'Courier New', monospace; font-size: 9pt;">
            ${log.affected_files.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${log.notes ? `
        <div style="margin-top: 10px; color: #666;">
          <strong>ملاحظات:</strong> ${log.notes}
        </div>
        ` : ''}
      </div>
    `;
  });

  return html;
}