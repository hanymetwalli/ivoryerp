<?php
/**
 * PayrollBatchesController - إدارة حزم رواتب الموظفين
 */

require_once __DIR__ . '/BaseController.php';

class PayrollBatchesController extends BaseController {
    protected $table = 'payroll_batches';
    
    protected $fillable = [
        'id', 'month', 'year', 'total_amount', 'status', 'workflow_id', 'notes', 'created_at'
    ];
    
    protected $searchable = ['id', 'status'];
    
    public function index() {
        return parent::index();
    }

    public function destroy($id) {
        try {
            $this->db->beginTransaction();
            
            // 1. جلب بيانات الحزمة والتحقق من الحالة
            $batch = $this->show($id);
            
            if ($batch['status'] === 'approved' || $batch['status'] === 'paid') {
                throw new Exception("لا يمكن حذف حزمة رواتب معتمدة أو مدفوعة.");
            }
            
            // 2. حذف سجلات الرواتب المرتبطة
            $stmt = $this->db->prepare("DELETE FROM payroll WHERE batch_id = ?");
            $stmt->execute([$id]);
            
            // 3. حذف سجل الحزمة
            $stmt = $this->db->prepare("DELETE FROM payroll_batches WHERE id = ?");
            $stmt->execute([$id]);
            
            // 4. حذف طلب الاعتماد المرتبط إن وجد
            if (!empty($batch['workflow_id'])) {
                $stmt = $this->db->prepare("DELETE FROM workflow_requests WHERE id = ?");
                $stmt->execute([$batch['workflow_id']]);
                
                $stmt = $this->db->prepare("DELETE FROM workflow_request_steps WHERE request_id = ?");
                $stmt->execute([$batch['workflow_id']]);
            }

            $this->db->commit();
            recordAuditLog('delete', 'payroll_batches', $id, $batch, null);
            return ['success' => true];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
}
