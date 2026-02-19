<?php
/**
 * Positions Controller
 */

require_once __DIR__ . '/BaseController.php';

class PositionsController extends BaseController {
    protected $table = 'positions';
    
    protected $fillable = [
        'id', 'name', 'code', 'department', 'level', 'status'
    ];
    
    protected $searchable = ['name', 'code'];
}
