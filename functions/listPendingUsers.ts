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

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('إعدادات Supabase غير متوفرة');
    }

    // جلب جميع المستخدمين من Supabase Auth
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      console.error('خطأ في جلب المستخدمين:', errorData);
      throw new Error('فشل في جلب المستخدمين من Auth');
    }

    const authData = await authResponse.json();
    const allAuthUsers = authData.users || [];

    // جلب المستخدمين من قاعدة البيانات
    const dbUsers = await base44.entities.User.list();
    const dbUserIds = new Set(dbUsers.map(u => u.id));

    // المستخدمين المعلقين هم الذين في Auth ولكن ليسوا في قاعدة البيانات
    // أو الذين في قاعدة البيانات بدون full_name
    const pendingUsers = allAuthUsers.filter(authUser => {
      const dbUser = dbUsers.find(u => u.id === authUser.id);
      
      // إذا لم يكن في قاعدة البيانات، فهو معلق
      if (!dbUser) return true;
      
      // إذا كان في قاعدة البيانات ولكن بدون full_name، فهو معلق
      if (!dbUser.full_name || dbUser.full_name.trim() === '') return true;
      
      return false;
    }).map(authUser => ({
      id: authUser.id,
      email: authUser.email,
      created_at: authUser.created_at,
      confirmed_at: authUser.confirmed_at,
      invited_at: authUser.invited_at,
      role: authUser.role || 'user'
    }));

    return Response.json({
      success: true,
      pendingUsers,
      totalCount: pendingUsers.length
    });
    
  } catch (error) {
    console.error('خطأ في جلب المستخدمين المعلقين:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'حدث خطأ غير متوقع'
    }, { status: 500 });
  }
});