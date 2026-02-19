<?php
/**
 * Work Locations Controller
 */

require_once __DIR__ . '/BaseController.php';

class WorkLocationsController extends BaseController {
    protected $table = 'work_locations';
    
    protected $fillable = [
        'id', 'name', 'code', 'address', 'use_coordinates',
        'latitude', 'longitude', 'radius_meters', 'status'
    ];
    
    protected $searchable = ['name', 'code', 'address'];
}
