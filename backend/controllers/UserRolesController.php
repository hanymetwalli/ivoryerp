<?php
/**
 * User Roles Controller
 */

require_once __DIR__ . '/BaseController.php';

class UserRolesController extends BaseController {
    protected $table = 'user_roles';
    
    protected $fillable = [
        'id', 'user_id', 'role_id', 'employee_id', 'assigned_by', 'status'
    ];
    
    public function index() {
        $result = parent::index();
        
        foreach ($result['data'] as &$ur) {
            // Get user name
            $stmt = $this->db->prepare("SELECT `full_name` FROM `users` WHERE `id` = :id");
            $stmt->execute([':id' => $ur['user_id']]);
            $user = $stmt->fetch();
            $ur['user_name'] = $user ? $user['full_name'] : null;
            
            // Get role name
            $stmt = $this->db->prepare("SELECT `name` FROM `roles` WHERE `id` = :id");
            $stmt->execute([':id' => $ur['role_id']]);
            $role = $stmt->fetch();
            $ur['role_name'] = $role ? $role['name'] : null;
        }
        
        return $result;
    }
}
