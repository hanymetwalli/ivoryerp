<?php
/**
 * Leave Types Controller
 */

require_once __DIR__ . '/BaseController.php';

class LeaveTypesController extends BaseController {
    protected $table = 'leave_types';
    
    protected $fillable = [
        'id', 'name', 'code', 'default_balance', 'min_days',
        'is_paid', 'requires_document', 'max_consecutive_days', 'status'
    ];
    
    protected $searchable = ['name', 'code'];
}
