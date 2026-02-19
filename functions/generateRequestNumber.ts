import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity, entityName, prefix } = await req.json();
    
    const finalEntity = entity || entityName;
    const finalPrefix = prefix || finalEntity?.slice(0, 3).toUpperCase() || 'REQ';

    // جلب آخر رقم مستخدم
    const records = await base44.asServiceRole.entities[finalEntity].list('-created_date', 1);
    
    let nextNumber = 1;
    if (records.length > 0 && records[0].request_number) {
      const lastNumber = records[0].request_number;
      const numberPart = lastNumber.split('-').pop();
      nextNumber = parseInt(numberPart) + 1;
    }

    const year = new Date().getFullYear();
    const requestNumber = `${finalPrefix}-${year}-${String(nextNumber).padStart(6, '0')}`;

    return Response.json({ request_number: requestNumber });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});