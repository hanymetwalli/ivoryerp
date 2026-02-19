<?php
/**
 * KPI Results Controller
 */

require_once __DIR__ . '/BaseController.php';

class KPIResultsController extends BaseController {
    protected $table = 'kpi_results';
    
    protected $fillable = [
        'id', 'evaluation_id', 'kpi_id', 'kpi_name', 'unit', 
        'target', 'achieved', 'score', 'weight', 'weighted_score', 'comments'
    ];
    
    protected $searchable = ['kpi_name'];

    // Helper to map incoming frontend fields to DB columns
    private function mapIncomingData($data) {
        if (isset($data['target_value'])) {
            $data['target'] = $data['target_value'];
        }
        if (isset($data['actual_value'])) {
            $data['achieved'] = $data['actual_value'];
        }
        if (isset($data['rating'])) {
            $data['score'] = $data['rating'];
        }
        // Map template_kpi_id to kpi_id (critical for frontend integration)
        if (isset($data['template_kpi_id'])) {
            $data['kpi_id'] = $data['template_kpi_id'];
        }
        
        // Calculate weighted score if not provided
        if (isset($data['score']) && isset($data['weight'])) {
            $data['weighted_score'] = ($data['score'] * ($data['weight'] / 100));
        }
        return $data;
    }

    public function store($data) {
        $data = $this->mapIncomingData($data);
        return parent::store($data);
    }

    public function update($id, $data) {
        $data = $this->mapIncomingData($data);
        return parent::update($id, $data);
    }
    
    // Map outgoing data for frontend compatibility
    protected function processRow($row) {
        $row = parent::processRow($row);
        
        // Map DB columns back to frontend expected props
        if (isset($row['target'])) $row['target_value'] = $row['target'];
        if (isset($row['achieved'])) $row['actual_value'] = $row['achieved'];
        if (isset($row['score'])) $row['rating'] = $row['score'];
        if (isset($row['kpi_id'])) $row['template_kpi_id'] = $row['kpi_id'];
        
        return $row;
    }
}
