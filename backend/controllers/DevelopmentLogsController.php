<?php
/**
 * Development Logs Controller - الموسوعة الهندسية للنظام
 */

require_once __DIR__ . '/BaseController.php';

class DevelopmentLogsController extends BaseController {
    protected $table = 'development_logs';
    
    protected $fillable = [
        'id', 'task_title', 'log_date', 'category', 'technical_description',
        'business_logic', 'business_rules', 'database_entities', 
        'frontend_backend_flow', 'dependencies', 'ai_reproduction_prompt',
        'module_interconnections', 'api_endpoints', 'affected_files',
        'performance_notes', 'notes', 'status', 'priority'
    ];
    
    protected $searchable = ['task_title', 'technical_description', 'category'];
    protected $defaultSort = 'log_date';
    protected $defaultOrder = 'DESC';
    
    /**
     * Custom actions
     */
    public function customAction($id, $action, $data = null) {
        if ($action === 'generate-pdf') {
            return $this->generatePDF($data['exportType'] ?? 'updates');
        }
        return parent::customAction($id, $action, $data);
    }

    private function generatePDF($type) {
        // Fetch all logs
        $stmt = $this->db->prepare("SELECT * FROM `development_logs` ORDER BY `log_date` DESC");
        $stmt->execute();
        $allLogs = array_map([$this, 'processRow'], $stmt->fetchAll());

        $modules = array_values(array_filter($allLogs, fn($l) => $l['category'] === 'module'));
        $updateLogs = array_values(array_filter($allLogs, fn($l) => $l['category'] !== 'module'));

        $htmlContent = '';
        $title = "الموسوعة الهندسية";

        if ($type === 'modules') {
            $htmlContent = $this->generateModulesHTML($modules);
            $title .= " - وحدات النظام";
        } elseif ($type === 'architecture') {
            $htmlContent = $this->generateArchitectureHTML($modules);
            $title .= " - خريطة العلاقات";
        } else {
            $htmlContent = $this->generateUpdatesHTML($updateLogs);
            $title .= " - سجل التحديثات";
        }

        $fullHTML = "<!DOCTYPE html><html dir='rtl'><head><meta charset='UTF-8'><style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Arial', sans-serif; direction: rtl; font-size: 11pt; line-height: 1.6; }
            h1 { color: #7c3238; text-align: center; font-size: 22pt; margin-bottom: 10px; }
            h2 { color: #7c3238; font-size: 16pt; margin-top: 20px; border-bottom: 2px solid #7c3238; padding-bottom: 5px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #7c3238; padding-bottom: 15px; }
            .section { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; border-right: 4px solid #c9a86c; }
            .code-block { background: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 9pt; white-space: pre-wrap; }
            .badge { display: inline-block; padding: 3px 8px; margin: 2px; background: #e0e0e0; border-radius: 3px; font-size: 9pt; }
        </style></head><body>$htmlContent</body></html>";

        // Return raw HTML as the frontend expects it in response.data
        return $fullHTML;
    }

    private function generateModulesHTML($modules) {
        $html = "<h1>وحدات النظام</h1>";
        foreach ($modules as $m) {
            $html .= "<h2>{$m['task_title']}</h2>";
            $html .= "<div class='section'><strong>الوصف التقني:</strong><p>{$m['technical_description']}</p></div>";
            if (!empty($m['business_logic'])) $html .= "<div class='section'><strong>المنطق البرمجي:</strong><div class='code-block'>{$m['business_logic']}</div></div>";
        }
        return $html;
    }

    private function generateArchitectureHTML($modules) {
        $html = "<h1>خريطة العلاقات</h1>";
        foreach ($modules as $m) {
            $html .= "<h2>{$m['task_title']}</h2>";
            if (!empty($m['dependencies'])) {
                $html .= "<p><strong>يعتمد على:</strong> " . implode(', ', (array)$m['dependencies']) . "</p>";
            }
        }
        return $html;
    }

    private function generateUpdatesHTML($logs) {
        $html = "<h1>سجل التحديثات</h1>";
        foreach ($logs as $l) {
            $html .= "<div style='margin-bottom:20px;'><h3>{$l['task_title']}</h3>";
            $html .= "<p>التاريخ: {$l['log_date']} | النوع: {$l['category']}</p>";
            $html .= "<p>{$l['technical_description']}</p></div>";
        }
        return $html;
    }
}
