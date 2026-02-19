<?php
/**
 * Template KPIs Controller
 */

require_once __DIR__ . '/BaseController.php';

class TemplateKPIsController extends BaseController {
    protected $table = 'template_kpis';
    
    protected $fillable = [
        'id', 'template_id', 'name', 'description', 'weight', 'max_score', 'unit', 'target'
    ];
    
    protected $searchable = ['name'];

    public function store($data) {
        // Map measurement_unit to unit if present
        // We prioritize measurement_unit because that's likely what the frontend sends
        if (isset($data['measurement_unit'])) {
            $data['unit'] = $data['measurement_unit'];
        }
        return parent::store($data);
    }

    public function update($id, $data) {
        // Map measurement_unit to unit if present
        if (isset($data['measurement_unit'])) {
            $data['unit'] = $data['measurement_unit'];
        }
        return parent::update($id, $data);
    }

    protected function processRow($row) {
        $row = parent::processRow($row);
        // Map unit -> measurement_unit for frontend compatibility
        if (isset($row['unit'])) {
            $row['measurement_unit'] = $row['unit'];
        }
        // Ensure target is available
        if (!isset($row['target'])) {
            $row['target'] = null;
        }
        return $row;
    }
}
