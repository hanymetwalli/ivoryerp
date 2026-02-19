import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_name, entity_id, action, notes } = await req.json();
    
    // التحقق من نوع الكيان المسموح
    const validEntities = ['LeaveRequest', 'Bonus', 'Overtime', 'EmployeeTraining', 'Resignation', 'PerformanceEvaluation'];
    if (!validEntities.includes(entity_name)) {
      return Response.json({ error: 'Invalid entity type' }, { status: 400 });
    }
    
    // جلب السجل
    const records = await base44.asServiceRole.entities[entity_name].filter({ id: entity_id });
    if (records.length === 0) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }
    const record = records[0];

    // جلب بيانات الموظف المقدم للطلب
    const employees = await base44.asServiceRole.entities.Employee.filter({ id: record.employee_id });
    if (employees.length === 0) {
      return Response.json({ error: 'Employee not found' }, { status: 404 });
    }
    const employee = employees[0];

    // ✅ جلب سلسلة الاعتماد (تصحيح الوصول للبيانات)
    const chainResponse = await base44.asServiceRole.functions.invoke('getApprovalChain', {
      employeeId: record.employee_id,
      requiresFinanceApproval: record.requires_finance_approval !== false,
      entity: entity_name,
    });
    
    console.log('[processApproval] 📡 Chain response:', chainResponse);
    
    // ✅ تصحيح: الوصول المباشر للبيانات
    const chainData = chainResponse.data || chainResponse;
    
    if (!chainData || !chainData.approvalChain) {
      console.error('[processApproval] ❌ Failed to build approval chain:', chainData);
      return Response.json({ 
        error: 'فشل في بناء سلسلة الاعتماد - خطأ تقني في النظام',
        details: 'لم يتمكن النظام من بناء مسار الاعتماد للطلب. يرجى التواصل مع الدعم الفني.',
        debug: chainData?.trace || ['No trace available'],
      }, { status: 500 });
    }
    
    const { approvalChain, trace, employee_info } = chainData;
    console.log('[processApproval] ✅ Approval chain built:', approvalChain.length, 'levels');
    console.log('[processApproval] 📋 Chain details:', approvalChain);
    console.log('[processApproval] 🔍 Trace log:', trace);
    console.log('[processApproval] 👤 Employee info:', employee_info);

    // تحديد المستوى الحالي
    const currentLevel = record.current_approval_level || approvalChain[0]?.level;
    const currentLevelIndex = approvalChain.findIndex(l => l.level === currentLevel);
    
    if (currentLevelIndex === -1) {
      return Response.json({ error: 'Invalid approval level' }, { status: 400 });
    }

    // التحقق من صلاحية المستخدم للاعتماد
    const currentLevelInfo = approvalChain[currentLevelIndex];
    let canApprove = false;
    
    console.log('[processApproval] Current approval level:', currentLevel, 'Level info:', currentLevelInfo);
    
    // ✅ جلب بيانات موظف المستخدم الحالي ودوره
    const userRoles = await base44.asServiceRole.entities.UserRole.filter({ user_id: user.id });
    let userEmployee = null;
    let userRoleCode = null;
    
    if (userRoles.length > 0) {
      if (userRoles[0].employee_id) {
        const userEmps = await base44.asServiceRole.entities.Employee.filter({ id: userRoles[0].employee_id });
        if (userEmps.length > 0) userEmployee = userEmps[0];
      }
      
      // ✅ جلب كود الدور من قاعدة البيانات
      if (userRoles[0].role_id) {
        const roles = await base44.asServiceRole.entities.Role.filter({ id: userRoles[0].role_id });
        if (roles.length > 0) {
          userRoleCode = roles[0].code;
        }
      }
    }

    console.log('[processApproval] User:', user.full_name, 'Employee:', userEmployee?.full_name, 'Role:', userRoleCode, 'Request from:', employee.full_name);

    // ✅ التحقق من Admin بناءً على Role Code (وليس user.role)
    const isSystemAdmin = userRoleCode === 'admin';
    const isAccountingManager = userRoleCode === 'ac_manager';
    
    if (isSystemAdmin) {
      console.log('[processApproval] ✅ System Admin - auto approve');
      canApprove = true;
    } else if (isAccountingManager && currentLevelInfo.role_required === 'finance_manager') {
      console.log('[processApproval] ✅ Accounting Manager for finance approval - auto approve');
      canApprove = true;
    } else if (currentLevelInfo.approver_id) {
      // التحقق من أن المستخدم هو المدير المطلوب
      const isRequiredApprover = userEmployee && userEmployee.id === currentLevelInfo.approver_id;
      const isSelfApproval = userEmployee && userEmployee.id === record.employee_id;
      
      console.log('[processApproval] Approver check:', {
        isRequiredApprover,
        isSelfApproval,
        userEmployeeId: userEmployee?.id,
        requiredApproverId: currentLevelInfo.approver_id,
        requestEmployeeId: record.employee_id,
      });
      
      // ✅ السماح بالاعتماد إذا كان المدير المطلوب، حتى لو كان هو نفسه (إلا إذا كان طلبه الشخصي)
      canApprove = isRequiredApprover && !isSelfApproval;
    } else if (currentLevelInfo.role_required) {
      // التحقق من أن المستخدم لديه الدور المطلوب
      const userRole = userRoles.length > 0 ? userRoles[0] : null;
      if (userRole && userRole.role_id) {
        const roles = await base44.asServiceRole.entities.Role.filter({ id: userRole.role_id });
        if (roles.length > 0) {
          const userRoleCode = roles[0].code;
          const requiredRole = currentLevelInfo.role_required;
          
          console.log('[processApproval] Role check:', {
            userRoleCode,
            requiredRole,
          });
          
          // مطابقة مباشرة أو مطابقة بدائل للأدوار
          const roleMatches = userRoleCode === requiredRole ||
            (requiredRole === 'finance_manager' && userRoleCode === 'ac_manager') ||
            (requiredRole === 'hr_manager' && userRoleCode === 'admin');
          
          const isSelfApproval = userEmployee && userEmployee.id === record.employee_id;
          
          console.log('[processApproval] Role matches:', roleMatches, 'Self approval:', isSelfApproval);
          
          // ✅ السماح بالاعتماد للأدوار الإدارية حتى لو كان موظفاً (إلا إذا كان طلبه الشخصي)
          canApprove = roleMatches && !isSelfApproval;
        }
      }
    }

    console.log('[processApproval] Final decision - Can approve:', canApprove);

    if (!canApprove) {
      console.log('[processApproval] ❌ REJECTED: Not authorized');
      
      // ✅ مصنع رسائل الخطأ التشريحية (Detailed Message Factory)
      let errorTitle = '⛔ غير مصرح لك بالاعتماد في هذا المستوى';
      let detailedReason = '';
      let actionRequired = '';
      
      if (currentLevelInfo.approver_id) {
        // حالة: مدير مباشر محدد
        if (userEmployee && userEmployee.id === record.employee_id) {
          // محاولة اعتماد طلب شخصي
          errorTitle = '⛔ لا يمكن اعتماد طلبك الشخصي';
          detailedReason = `أنت "${user.full_name}" تحاول اعتماد طلبك الشخصي. هذا غير مسموح به في النظام.`;
          actionRequired = `الطلب في انتظار اعتماد مديرك المباشر:\n👤 ${currentLevelInfo.approver_name} (${currentLevelInfo.approver_employee_number})\n📋 ${currentLevelInfo.approver_position}`;
        } else {
          // ليس المدير المطلوب
          errorTitle = '⛔ لست المدير المسؤول عن هذه المرحلة';
          detailedReason = `المستخدم الحالي: "${user.full_name}"${userEmployee ? ` (${userEmployee.employee_number})` : ''}\nليس هو المدير المطلوب للاعتماد في هذا المستوى.`;
          actionRequired = `المدير المطلوب حالياً:\n👤 ${currentLevelInfo.approver_name} (${currentLevelInfo.approver_employee_number})\n📋 ${currentLevelInfo.approver_position}\n🏢 ${currentLevelInfo.level_name}`;
        }
      } else if (currentLevelInfo.role_required) {
        // حالة: دور إداري مطلوب
        errorTitle = '⛔ لا تملك الدور الإداري المطلوب';
        detailedReason = `المستخدم الحالي: "${user.full_name}"\nالدور الحالي: ${userRoleCode || 'غير محدد'}\nالدور المطلوب: ${currentLevelInfo.role_required}`;
        actionRequired = `المطلوب للاعتماد:\n📌 ${currentLevelInfo.level_name}\n🎭 الدور: ${currentLevelInfo.role_required}${currentLevelInfo.approver_name ? `\n👤 المسؤول: ${currentLevelInfo.approver_name} (${currentLevelInfo.approver_employee_number})` : ''}`;
      }
      
      // ✅ إظهار السلسلة المتبقية مع التفاصيل
      const remainingChain = approvalChain.slice(currentLevelIndex).map((l, i) => {
        const num = currentLevelIndex + i + 1;
        const approver = l.approver_name ? ` → ${l.approver_name} (${l.approver_employee_number})` : '';
        return `${num}. ${l.level_name}${approver}`;
      }).join('\n');
      
      // ✅ السلسلة المكتملة
      const completedChain = currentLevelIndex > 0 
        ? approvalChain.slice(0, currentLevelIndex).map((l, i) => {
            const approver = l.approver_name ? ` → ${l.approver_name}` : '';
            return `${i + 1}. ${l.level_name}${approver} ✅`;
          }).join('\n')
        : 'لم يتم اعتماد أي مستوى بعد';
      
      return Response.json({ 
        success: false,
        error: errorTitle,
        detailed_reason: detailedReason,
        action_required: actionRequired,
        approval_status: {
          current_level: currentLevelInfo.level_name,
          current_level_number: currentLevelIndex + 1,
          total_levels: approvalChain.length,
          completed_levels: currentLevelIndex,
          remaining_levels: approvalChain.length - currentLevelIndex,
        },
        approval_chain: {
          completed: completedChain,
          remaining: remainingChain,
        },
        technical_debug: {
          user_id: user.id,
          user_name: user.full_name,
          user_employee: userEmployee?.full_name || 'N/A',
          user_employee_number: userEmployee?.employee_number || 'N/A',
          user_role_code: userRoleCode || 'N/A',
          required_approver_id: currentLevelInfo.approver_id || 'N/A',
          required_approver_name: currentLevelInfo.approver_name || 'N/A',
          required_role: currentLevelInfo.role_required || 'N/A',
          request_employee_id: record.employee_id,
          chain_trace: trace || [],
        },
      }, { status: 403 });
    }

    // تحديث سجل الاعتماد
    const approvalHistory = record.approval_history || [];
    approvalHistory.push({
      level: currentLevel,
      approver_id: user.id,
      approver_name: user.full_name,
      action: action,
      date: new Date().toISOString(),
      notes: notes || '',
    });

    let newStatus = record.status;
    let newLevel = currentLevel;

    // ✅ إذا كان رفض، تحديث الحالة + استرداد الرصيد إذا كان معتمداً سابقاً
    if (action === 'reject') {
      newStatus = 'rejected';
      newLevel = null; // إنهاء سلسلة الاعتماد
      
      // ✅ استرداد الرصيد إذا كان الطلب معتمداً سابقاً (approved → rejected)
      if (entity_name === 'LeaveRequest' && record.status === 'approved') {
        const currentYear = new Date().getFullYear();
        const balances = await base44.asServiceRole.entities.EmployeeLeaveBalance.filter({
          employee_id: record.employee_id,
          leave_type_id: record.leave_type_id,
          year: currentYear,
        });

        if (balances.length > 0) {
          const balance = balances[0];
          const newUsed = Math.max(0, (balance.used_balance || 0) - record.days_count);
          const newRemaining = balance.total_balance - newUsed;
          
          await base44.asServiceRole.entities.EmployeeLeaveBalance.update(balance.id, {
            used_balance: newUsed,
            remaining_balance: newRemaining,
          });
        }
      }
    } else if (action === 'approve') {
      // الانتقال للمستوى التالي
      if (currentLevelIndex < approvalChain.length - 1) {
        newLevel = approvalChain[currentLevelIndex + 1].level;
        newStatus = 'pending';
      } else {
        // ✅ الاعتماد النهائي + Double Check للرصيد
        newStatus = 'approved';
        newLevel = null; // إنهاء سلسلة الاعتماد
        
        // ✅ تحديث رصيد الإجازات مع Double Check
        if (entity_name === 'LeaveRequest') {
          const currentYear = new Date().getFullYear();
          const balances = await base44.asServiceRole.entities.EmployeeLeaveBalance.filter({
            employee_id: record.employee_id,
            leave_type_id: record.leave_type_id,
            year: currentYear,
          });

          if (balances.length > 0) {
            const balance = balances[0];
            const remainingAfterApproval = balance.total_balance - ((balance.used_balance || 0) + record.days_count);
            
            // ✅ Double Check: التحقق النهائي من كفاية الرصيد
            if (remainingAfterApproval < 0) {
              return Response.json({
                success: false,
                error: `⚠️ فشل الاعتماد: الرصيد المتبقي غير كافٍ (${balance.remaining_balance} يوم متاح، ${record.days_count} يوم مطلوب)`,
              }, { status: 400 });
            }
            
            // خصم الأيام فقط إذا كان الرصيد كافياً
            await base44.asServiceRole.entities.EmployeeLeaveBalance.update(balance.id, {
              used_balance: (balance.used_balance || 0) + record.days_count,
              remaining_balance: remainingAfterApproval,
            });
          } else {
            // لا يوجد رصيد أصلاً
            return Response.json({
              success: false,
              error: `⚠️ فشل الاعتماد: لا يوجد رصيد متاح لهذا الموظف في هذا النوع من الإجازات`,
            }, { status: 400 });
          }
        }
        
        // إذا كان استقالة، إيقاف راتب الموظف
        if (entity_name === 'Resignation' && record.end_of_service_date) {
          await base44.asServiceRole.entities.Employee.update(record.employee_id, {
            status: 'terminated',
            termination_date: record.end_of_service_date,
          });
        }
      }
    }

    // ✅ تم نقل التحديث للأعلى (قبل الـ return)

    // ✅ تسجيل في Audit Log مع إظهار التسلسل
    try {
      const remainingChain = approvalChain.slice(currentLevelIndex + 1).map(l => l.level_name).join(' ← ');
      
      await base44.asServiceRole.entities.AuditLog.create({
        user_id: user.id,
        user_name: user.full_name,
        user_email: user.email,
        action: action,
        entity_name: entity_name,
        record_id: entity_id,
        record_identifier: record.request_number || entity_id,
        details: `${action === 'approve' ? '✅ اعتماد' : '❌ رفض'} ${entity_name} - المستوى: ${currentLevelInfo.level_name}${remainingChain ? ` | المتبقي: ${remainingChain}` : ' | النهائي'}${notes ? ' | ملاحظات: ' + notes : ''}`,
        changed_data: {
          from_status: record.status,
          to_status: newStatus,
          current_level: currentLevelInfo.level_name,
          next_level: newLevel ? approvalChain.find(l => l.level === newLevel)?.level_name : 'مكتمل',
          remaining_levels: remainingChain || 'لا يوجد',
        },
        severity: action === 'approve' && newStatus === 'approved' ? 'high' : 'medium',
      });
    } catch (logError) {
      console.error('Failed to log audit event:', logError);
      // لا نوقف العملية إذا فشل التسجيل
    }

    // ✅ بناء الحالة المرئية (Status Tracking) للمستخدم
    const nextLevelInfo = newLevel ? approvalChain.find(l => l.level === newLevel) : null;
    
    // السلسلة المكتملة
    const completedChain = approvalChain.slice(0, currentLevelIndex + 1).map((l, i) => {
      const approver = l.approver_name || 'النظام';
      return `${i + 1}. ${l.level_name} → ${approver} ✅`;
    }).join('\n');
    
    // السلسلة المتبقية
    const remainingChain = nextLevelInfo
      ? approvalChain.slice(currentLevelIndex + 1).map((l, i) => {
          const num = currentLevelIndex + i + 2;
          const approver = l.approver_name ? ` → ${l.approver_name} (${l.approver_employee_number})` : '';
          return `${num}. ${l.level_name}${approver} ⏳`;
        }).join('\n')
      : 'مكتمل - لا توجد مراحل متبقية';
    
    // ✅ نص الحالة الوصفي (current_status_desc)
    let statusDescription = '';
    if (action === 'reject') {
      statusDescription = `❌ تم رفض الطلب من: ${user.full_name} (${currentLevelInfo.level_name})${notes ? `\nالسبب: ${notes}` : ''}`;
    } else if (newStatus === 'approved') {
      statusDescription = `✅ تم اعتماد الطلب نهائياً\nآخر اعتماد: ${user.full_name} (${currentLevelInfo.level_name})`;
    } else {
      const nextApprover = nextLevelInfo?.approver_name || nextLevelInfo?.level_name || 'غير محدد';
      const nextPosition = nextLevelInfo?.approver_position || '';
      statusDescription = `⏳ معتمد من: ${user.full_name} (${currentLevelInfo.level_name})\nجاري الاعتماد من: ${nextApprover}${nextPosition ? ` - ${nextPosition}` : ''}`;
    }
    
    // ✅ حفظ الوصف في السجل
    const updateData = {
      status: newStatus,
      current_approval_level: newLevel,
      approval_history: approvalHistory,
      current_status_desc: statusDescription, // ✅ الحقل المطلوب للعرض
    };
    
    // تحديث السجل
    await base44.asServiceRole.entities[entity_name].update(entity_id, updateData);
    
    return Response.json({
      success: true,
      message: action === 'approve' 
        ? (newStatus === 'approved' ? '🎉 تم الاعتماد النهائي بنجاح' : '✅ تم الاعتماد - في انتظار المستوى التالي')
        : '❌ تم رفض الطلب',
      approval_action: {
        action: action,
        approved_by: user.full_name,
        approved_by_employee_number: userEmployee?.employee_number,
        approved_at_level: currentLevelInfo.level_name,
        notes: notes || 'لا توجد ملاحظات',
      },
      new_status: {
        status: newStatus,
        status_description: statusDescription,
        current_level: newLevel ? nextLevelInfo?.level_name : 'مكتمل',
        next_approver: nextLevelInfo ? {
          name: nextLevelInfo.approver_name,
          employee_number: nextLevelInfo.approver_employee_number,
          position: nextLevelInfo.approver_position,
          level: nextLevelInfo.level_name,
        } : null,
      },
      approval_progress: {
        total_levels: approvalChain.length,
        completed_levels: currentLevelIndex + 1,
        remaining_levels: newLevel ? approvalChain.length - (currentLevelIndex + 1) : 0,
        completion_percentage: Math.round(((currentLevelIndex + 1) / approvalChain.length) * 100),
      },
      approval_chain_visual: {
        completed: completedChain,
        remaining: remainingChain,
        full_chain: approvalChain.map((l, i) => `${i + 1}. ${l.level_name}${l.approver_name ? ` → ${l.approver_name}` : ''}`).join(' → '),
      },
    });
  } catch (error) {
    console.error('Error in processApproval:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});