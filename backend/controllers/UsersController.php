<?php
/**
 * Users Controller
 */

require_once __DIR__ . '/BaseController.php';

class UsersController extends BaseController {
    protected $table = 'users';
    
    protected $fillable = [
        'id', 'email', 'password', 'full_name', 'avatar', 'status'
    ];
    
    protected $hidden = ['password'];
    
    protected $searchable = ['email', 'full_name'];
    
    /**
     * Override index to include role info
     */
    public function index() {
        $result = parent::index();
        
        foreach ($result['data'] as &$user) {
            // Get role
            $stmt = $this->db->prepare("
                SELECT r.name as role_name, r.code as role_code, r.id as role_id, ur.employee_id
                FROM `user_roles` ur 
                JOIN `roles` r ON ur.role_id = r.id 
                WHERE ur.user_id = :id AND ur.status = 'active' 
                LIMIT 1
            ");
            $stmt->execute([':id' => $user['id']]);
            $role = $stmt->fetch();
            
            if ($role) {
                $user['role'] = $role['role_code']; // For frontend check
                $user['role_name'] = $role['role_name'];
                $user['role_id'] = $role['role_id'];
                $user['employee_id'] = $role['employee_id'];
            }
        }
        
        return $result;
    }
    
    public function update($id, $data) {
        if (!empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']); // Don't overwrite with empty
        }
        return parent::update($id, $data);
    }

    public function destroy($id) {
        try {
            $this->db->beginTransaction();
            // 1. Delete roles
            $stmt = $this->db->prepare("DELETE FROM `user_roles` WHERE `user_id` = :id");
            $stmt->execute([':id' => $id]);
            // 2. Delete user
            $result = parent::destroy($id);
            $this->db->commit();
            return $result;
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    /**
     * Custom actions
     */
    public function customAction($id, $action, $data = null) {
        if ($action === 'login') {
            return $this->login($data);
        }
        if ($action === 'create-directly') {
            return $this->createUserDirectly($data);
        }
        return parent::customAction($id, $action, $data);
    }
    
    private function createUserDirectly($data) {
        try {
            if (empty($data['email']) || empty($data['password']) || empty($data['full_name'])) {
                return ['error' => true, 'message' => 'البريد الإلكتروني، الاسم، وكلمة المرور مطلوبة'];
            }

            // Check if email already exists
            $stmt = $this->db->prepare("SELECT id FROM `users` WHERE `email` = :email");
            $stmt->execute([':email' => $data['email']]);
            if ($stmt->fetch()) {
                return ['error' => true, 'message' => 'هذا البريد الإلكتروني مسجل مسبقاً'];
            }

            $userId = generateUUID();
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            $roleCode = $data['role'] ?? 'user';

            $this->db->beginTransaction();

            // 1. Create User
            $stmt = $this->db->prepare("
                INSERT INTO `users` (id, email, password, full_name, status, created_at) 
                VALUES (:id, :email, :password, :full_name, 'active', NOW())
            ");
            $stmt->execute([
                ':id' => $userId,
                ':email' => $data['email'],
                ':password' => $hashedPassword,
                ':full_name' => $data['full_name']
            ]);

            // 2. Find Role ID
            $stmt = $this->db->prepare("SELECT id FROM `roles` WHERE `code` = :code OR `name` = :name1 OR `name` = :name2 OR `name` = :name3 LIMIT 1");
            $roleCodeAr = ($roleCode === 'admin') ? 'مدير عام' : 'مستخدم';
            $roleCodeEn = ($roleCode === 'admin') ? 'Admin' : 'User';
            $stmt->execute([
                ':code' => $roleCode, 
                ':name1' => $roleCode,
                ':name2' => $roleCodeAr, 
                ':name3' => $roleCodeEn
            ]);
            $role = $stmt->fetch();
            
            if ($role) {
                // 3. Create User Role
                $stmt = $this->db->prepare("
                    INSERT INTO `user_roles` (id, user_id, role_id, status, assigned_at) 
                    VALUES (:id, :user_id, :role_id, 'active', NOW())
                ");
                $stmt->execute([
                    ':id' => generateUUID(),
                    ':user_id' => $userId,
                    ':role_id' => $role['id']
                ]);
            }

            $this->db->commit();
            
            $result = ['success' => true, 'message' => 'تم إنشاء المستخدم بنجاح', 'user_id' => $userId];
            recordAuditLog('create', 'users', $userId, null, $result);
            return $result;

        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            return ['error' => true, 'message' => 'حدث خطأ: ' . $e->getMessage()];
        }
    }
    
    private function login($data) {
        if (empty($data['email']) || empty($data['password'])) {
            return ['error' => true, 'message' => 'Email and password required'];
        }
        
        $stmt = $this->db->prepare("SELECT * FROM `users` WHERE `email` = :email AND `status` = 'active'");
        $stmt->execute([':email' => $data['email']]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($data['password'], $user['password'])) {
            // Get Role & Employee ID
            $stmt = $this->db->prepare("
                SELECT r.code as role_code, ur.employee_id 
                FROM `user_roles` ur 
                JOIN `roles` r ON ur.role_id = r.id 
                WHERE ur.user_id = :id AND ur.status = 'active'
            ");
            $stmt->execute([':id' => $user['id']]);
            $roleData = $stmt->fetch();
            
            // Create token (simple base64 for demo)
            $tokenPayload = $user['id'] . ':' . time();
            $token = base64_encode($tokenPayload);
            
            return [
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['full_name'],
                    'email' => $user['email'],
                    'role' => $roleData ? $roleData['role_code'] : 'user',
                    'employee_id' => $roleData ? $roleData['employee_id'] : null
                ]
            ];
        }
        
        return ['error' => true, 'message' => 'Invalid credentials'];
    }
}
