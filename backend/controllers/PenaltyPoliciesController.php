<?php
/**
 * Penalty Policies Controller
 */

require_once __DIR__ . '/BaseController.php';

class PenaltyPoliciesController extends BaseController {
    protected $table = 'penalty_policies';
    
    protected $fillable = [
        'id', 'violation_type_id', 'occurrence_number', 'action_type', 'penalty_value'
    ];
}
