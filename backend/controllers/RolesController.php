<?php
/**
 * Roles Controller
 */

require_once __DIR__ . '/BaseController.php';

class RolesController extends BaseController {
    protected $table = 'roles';
    
    protected $fillable = [
        'id', 'name', 'code', 'description', 'permissions', 'data_scopes', 'approval_level', 'status'
    ];
    
    protected $searchable = ['name', 'code'];
    
    public function index() {
        $result = parent::index();
        
        foreach ($result['data'] as &$role) {
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM `user_roles` WHERE `role_id` = :id AND `status` = 'active'");
            $stmt->execute([':id' => $role['id']]);
            $role['users_count'] = (int) $stmt->fetch()['count'];
        }
        return $result;
    }
}
