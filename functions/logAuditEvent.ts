import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action, 
      entity_name, 
      record_id, 
      record_identifier, 
      details, 
      changed_data,
      severity 
    } = await req.json();

    // Validation
    if (!action || !entity_name) {
      return Response.json({ 
        error: 'Missing required parameters (action, entity_name)' 
      }, { status: 400 });
    }

    // تحديد مستوى الخطورة تلقائياً إذا لم يُحدد
    let calculatedSeverity = severity || 'medium';
    
    // عمليات حرجة
    if (action === 'delete' && ['Payroll', 'Employee', 'Contract'].includes(entity_name)) {
      calculatedSeverity = 'critical';
    } else if (action === 'approve' && ['Payroll', 'Bonus'].includes(entity_name)) {
      calculatedSeverity = 'high';
    } else if (action === 'delete') {
      calculatedSeverity = 'high';
    }

    // الحصول على IP من الطلب
    const ip_address = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'unknown';

    // حفظ في سجل التدقيق
    const auditLog = await base44.asServiceRole.entities.AuditLog.create({
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      action: action,
      entity_name: entity_name,
      record_id: record_id || null,
      record_identifier: record_identifier || null,
      details: details || '',
      changed_data: changed_data || null,
      ip_address: ip_address,
      severity: calculatedSeverity,
    });

    return Response.json({
      success: true,
      log_id: auditLog.id,
    });
  } catch (error) {
    console.error('Error in logAuditEvent:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});