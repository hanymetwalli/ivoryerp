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

    const { email, full_name, password, role } = await req.json();

    if (!email || !password || !full_name) {
      return Response.json({ 
        success: false, 
        error: 'يرجى تعبئة جميع الحقول المطلوبة' 
      }, { status: 400 });
    }

    console.log('إنشاء مستخدم:', { email, full_name, role });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('إعدادات Supabase غير متوفرة');
    }

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
        app_metadata: {
          role: role || 'user'
        }
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      console.error('خطأ Auth:', errorData);
      throw new Error(errorData.msg || errorData.message || 'فشل في إنشاء المستخدم');
    }

    const authData = await authResponse.json();
    console.log('تم إنشاء المستخدم:', authData.id);

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: authData.id,
        email,
        full_name,
        role: role || 'user',
      }),
    });

    if (!dbResponse.ok) {
      const dbError = await dbResponse.json();
      console.error('خطأ في حفظ البيانات:', dbError);
    } else {
      console.log('تم حفظ البيانات في جدول users');
    }

    return Response.json({
      success: true,
      user: authData,
      message: 'تم إنشاء المستخدم بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'حدث خطأ غير متوقع'
    }, { status: 500 });
  }
});