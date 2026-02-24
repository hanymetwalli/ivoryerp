<?php
/**
 * Work Locations Controller
 */

require_once __DIR__ . '/BaseController.php';

class WorkLocationsController extends BaseController {
    protected $table = 'work_locations';
    
    protected $fillable = [
        'id', 'name', 'code', 'address', 'use_coordinates',
        'latitude', 'longitude', 'radius_meters', 'status',
        'ramadan_start_date', 'ramadan_end_date', 'ramadan_hours'
    ];
    
    protected $searchable = ['name', 'code', 'address'];
}
