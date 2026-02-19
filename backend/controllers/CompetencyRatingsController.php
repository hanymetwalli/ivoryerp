<?php
/**
 * Competency Ratings Controller
 */

require_once __DIR__ . '/BaseController.php';

class CompetencyRatingsController extends BaseController {
    protected $table = 'competency_ratings';
    
    protected $fillable = [
        'id', 'evaluation_id', 'employee_id', 'competency_id', 'rating', 
        'evaluator_id', 'evaluation_date', 'comments'
    ];
}
