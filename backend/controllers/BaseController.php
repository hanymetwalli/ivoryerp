<?php
/**
 * Base Controller - النسخة الفولاذية النهائية (Steel Version)
 * مصممة لتجنب جميع أخطاء SQL و PHP والتوافق مع الواجهة
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/request.php';
require_once __DIR__ . '/../helpers/audit.php';
require_once __DIR__ . '/../helpers/response.php';

abstract class BaseController {
    protected $db;
    protected $table;
    protected $primaryKey = 'id';
    protected $fillable = [];
    protected $searchable = [];
    protected $defaultSort = 'id'; 
    protected $defaultOrder = 'DESC';
    protected $casts = [];
    
    public function __construct() {
        $this->db = getDB();
    }
    
    public function index() {
        try {
            $params = getQueryParams();
            $page = max(1, intval($params['page'] ?? 1));
            $limit = min(1000, max(1, intval($params['limit'] ?? 100)));
            $offset = ($page - 1) * $limit;
            
            $sort = $params['sort'] ?? $this->defaultSort;
            if ($sort === 'created_date' || $sort === 'created_at') {
                $sort = $this->columnExists('created_at') ? 'created_at' : $this->primaryKey;
            }
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $sort)) $sort = $this->primaryKey;
            $order = (isset($params['order']) && strtoupper($params['order']) === 'ASC') ? 'ASC' : 'DESC';
            
            $where = ' WHERE 1=1 ';
            $sqlParams = [];
            if (!empty($params['search']) && !empty($this->searchable)) {
                $terms = [];
                foreach ($this->searchable as $f) { $terms[] = "`$f` LIKE :search"; }
                $where .= " AND (" . implode(' OR ', $terms) . ")";
                $sqlParams[':search'] = '%' . $params['search'] . '%';
            }
            
            // Generic attribute filtering
            foreach ($params as $key => $value) {
                if ($value !== '' && $value !== null && $key !== 'search' && $key !== 'page' && $key !== 'limit' && $key !== 'sort' && $key !== 'order') {
                    if (in_array($key, $this->fillable)) {
                        $where .= " AND `{$key}` = :filter_{$key}";
                        $sqlParams[":filter_{$key}"] = $value;
                    }
                }
            }
            
            $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM `{$this->table}`" . $where);
            $countStmt->execute($sqlParams);
            $totalRow = $countStmt->fetch();
            $total = $totalRow ? (int)$totalRow['total'] : 0;
            
            $sql = "SELECT * FROM `{$this->table}`" . $where . " ORDER BY `$sort` $order LIMIT $limit OFFSET $offset";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($sqlParams);
            
            return [
                'data' => array_map([$this, 'processRow'], $stmt->fetchAll()),
                'pagination' => ['total' => $total, 'page' => $page, 'limit' => $limit, 'pages' => ($total > 0) ? ceil($total / $limit) : 1]
            ];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
    
    public function show($id) {
        $stmt = $this->db->prepare("SELECT * FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id");
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch();
        if (!$data) {
            http_response_code(404);
            return ['error' => true, 'message' => 'Record not found'];
        }
        return $this->processRow($data);
    }
    
    public function store($data) {
        try {
            $data = array_intersect_key($data, array_flip($this->fillable));
            if (!isset($data[$this->primaryKey]) || empty($data[$this->primaryKey])) {
                $data[$this->primaryKey] = generateUUID();
            }
            
            // Default Status if not provided
            if (in_array('status', $this->fillable) && (!isset($data['status']) || empty($data['status']))) {
                $data['status'] = 'active';
            }

            $saveData = $this->prepareForSave($data);
            $fields = array_keys($saveData);
            $sql = "INSERT INTO `{$this->table}` (`" . implode("`, `", $fields) . "`) VALUES (:" . implode(", :", $fields) . ")";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($saveData);
            
            $result = $this->show($data[$this->primaryKey]);
            recordAuditLog('create', $this->table, $data[$this->primaryKey], null, $result);
            return $result;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
    
    public function update($id, $data) {
        try {
            $oldData = $this->show($id); // verify existence and get old values
            $cleanData = array_intersect_key($data, array_flip($this->fillable));
            if (isset($cleanData[$this->primaryKey])) unset($cleanData[$this->primaryKey]);
            
            if (empty($cleanData)) return $oldData;
            
            $saveData = $this->prepareForSave($cleanData);
            $set = [];
            $finalParams = ['target_id_for_update' => $id];
            
            foreach ($saveData as $k => $v) {
                $set[] = "`$k` = :val_$k";
                $finalParams["val_$k"] = $v;
            }
            
            $sql = "UPDATE `{$this->table}` SET " . implode(", ", $set) . " WHERE `{$this->primaryKey}` = :target_id_for_update";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($finalParams);
            
            $newData = $this->show($id);
            recordAuditLog('update', $this->table, $id, $oldData, $newData);
            return $newData;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }
    
    public function destroy($id) {
        try {
            $oldData = $this->show($id);
            $stmt = $this->db->prepare("DELETE FROM `{$this->table}` WHERE `{$this->primaryKey}` = :id");
            $stmt->execute([':id' => $id]);
            recordAuditLog('delete', $this->table, $id, $oldData, null);
            return ['success' => true];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    public function filter($filters) {
        try {
            $where = []; $params = [];
            foreach ($filters as $f => $v) {
                if (in_array($f, $this->fillable) || $f === $this->primaryKey) {
                    $where[] = "`$f` = :$f";
                    $params[$f] = $v;
                }
            }
            $sql = "SELECT * FROM `{$this->table}`" . (!empty($where) ? " WHERE " . implode(" AND ", $where) : "");
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return array_map([$this, 'processRow'], $stmt->fetchAll());
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => true, 'message' => $e->getMessage()];
        }
    }

    public function customAction($id, $action, $data = null) {
        http_response_code(405);
        return ['error' => true, 'message' => "Action $action not supported for this entity"];
    }

    protected function processRow($row) {
        if (!$row) return $row;
        foreach ($row as $k => $v) {
            if ($v === null) continue;
            
            // Explicit casting if defined
            if (isset($this->casts[$k])) {
                if ($this->casts[$k] === 'array') {
                    if (is_string($v)) {
                        $decoded = json_decode($v, true);
                        $row[$k] = is_array($decoded) ? $decoded : [];
                    } elseif (!is_array($v)) {
                        $row[$k] = [];
                    }
                    continue; // Skip further automatic processing for explicitly casted fields
                }
            }

            // 1. Handle JSON (Old-school PHP compatible check)
            if (is_string($v) && $v !== '' && ($v[0] === '{' || $v[0] === '[')) {
                $decoded = json_decode($v, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $row[$k] = $decoded;
                    continue;
                }
            }
            
            // 2. Handle Numeric Strings (Critical for toFixed and calculation)
            if (is_string($v) && is_numeric($v)) {
                // If it contains a decimal point, treat as float
                if (strpos($v, '.') !== false) {
                    $row[$k] = (float)$v;
                } else if (strlen($v) < 11 && $v[0] !== '0') {
                    // Treat as integer if not starting with zero (phone numbers)
                    $row[$k] = (int)$v;
                }
            }
        }
        return $row;
    }
    
    protected function prepareForSave($data) {
        foreach ($data as $k => $v) {
            if (is_array($v) || is_object($v)) {
                $data[$k] = json_encode($v, JSON_UNESCAPED_UNICODE);
            } elseif (is_bool($v)) {
                $data[$k] = $v ? 1 : 0;
            }
        }
        return $data;
    }

    protected function columnExists($column) {
        try {
            $stmt = $this->db->prepare("SHOW COLUMNS FROM `{$this->table}` LIKE :col");
            $stmt->execute([':col' => $column]);
            return $stmt->fetch() !== false;
        } catch (Exception $e) { return false; }
    }

    /**
     * Get current user access info
     */
    protected function getUserAccess() {
        $userId = getCurrentUserId();
        if (!$userId) return null;

        static $access = null;
        if ($access !== null) return $access;

        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();

        // Get role, permissions, data_scopes and employee_id
        $stmt = $this->db->prepare("
            SELECT r.permissions, r.data_scopes, ur.employee_id 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :user_id AND ur.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([':user_id' => $userId]);
        $roleData = $stmt->fetch();

        // Get department_id if employee_id exists
        $departmentId = null;
        if ($roleData['employee_id'] ?? null) {
            $stmt = $this->db->prepare("SELECT department_id FROM employees WHERE id = :id");
            $stmt->execute([':id' => $roleData['employee_id']]);
            $departmentId = $stmt->fetchColumn();
        }

        $permissionsData = $roleData['permissions'] ?? '';
        $permissions = [];
        if (is_array($permissionsData)) {
            $permissions = $permissionsData;
        } else if (is_string($permissionsData) && !empty($permissionsData)) {
            $permissions = json_decode($permissionsData, true) ?: [];
        }

        $scopesData = $roleData['data_scopes'] ?? '';
        $dataScopes = [];
        if (is_array($scopesData)) {
            $dataScopes = $scopesData;
        } else if (is_string($scopesData) && !empty($scopesData)) {
            $dataScopes = json_decode($scopesData, true) ?: [];
        }

        $access = [
            'user' => $user,
            'permissions' => $permissions,
            'data_scopes' => $dataScopes,
            'employee_id' => $roleData['employee_id'] ?? null,
            'department_id' => $departmentId,
            'is_admin' => ($user && $user['email'] === 'admin@ivory.com') || in_array('*', $permissions) || in_array('all', $permissions)
        ];

        return $access;
    }

    /**
     * Check if user has permission
     */
    protected function checkPermission($permission) {
        $access = $this->getUserAccess();
        if (!$access) jsonError('Unauthorized', 401);
        if ($access['is_admin']) return true;

        $perms = is_array($permission) ? $permission : [$permission];
        foreach ($perms as $p) {
            if (in_array($p, $access['permissions'])) return true;
        }

        jsonError('Forbidden: Missing permission ' . (is_array($permission) ? implode(' or ', $permission) : $permission), 403);
    }
}
