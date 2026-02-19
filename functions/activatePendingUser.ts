import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'غير مصرح: يتطلب صلاحيات المدير' 
      }, { status: 403 });
    }

    const { user_id, full_name, password } = await req.json();

    if (!user_id || !password || !full_name) {
      return Response.json({ 
        success: false, 
        error: 'يرجى تعبئة جميع الحقول المطلوبة' 
      }, { status: 400 });
    }

    console.log('تفعيل مستخدم:', user_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('إعدادات Supabase غير متوفرة');
    }

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
      method: 'PUT',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
        }
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      console.error('خطأ Auth:', errorData);
      throw new Error(errorData.msg || errorData.message || 'فشل في تحديث المستخدم');
    }

    console.log('تم تحديث Auth بنجاح');

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ full_name }),
    });

    if (!dbResponse.ok) {
      const dbError = await dbResponse.json();
      console.error('خطأ في تحديث البيانات:', dbError);
    } else {
      console.log('تم تحديث جدول users بنجاح');
    }

    return Response.json({
      success: true,
      message: 'تم تفعيل المستخدم بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في تفعيل المستخدم:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'حدث خطأ غير متوقع'
    }, { status: 500 });
  }
});