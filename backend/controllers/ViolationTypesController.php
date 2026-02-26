<?php
/**
 * Violation Types Controller
 */

require_once __DIR__ . '/BaseController.php';

class ViolationTypesController extends BaseController {
    protected $table = 'violation_types';
    
    protected $fillable = [
        'id', 'name', 'description', 'letter_template'
    ];
    
    protected $searchable = ['name', 'description'];
}
