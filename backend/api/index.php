<?php
/**
 * Ivory HR System - API Router
 */

// Error handling - log to file, don't show to user to keep JSON clean
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
error_reporting(E_ALL);

// 1. CORS Headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
} else {
    // Fallback for tools/Postman
    header("Access-Control-Allow-Origin: *");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json; charset=utf-8');


// 2. Load dependencies
try {
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../helpers/response.php';
    require_once __DIR__ . '/../helpers/request.php';
    require_once __DIR__ . '/../helpers/audit.php';
    require_once __DIR__ . '/../helpers/workflow.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Core files missing']);
    exit();
}

// 3. Routing logic
$requestUri = $_SERVER['REQUEST_URI'];
error_log("Incoming Request: " . $requestUri); // DEBUG LOG
$scriptName = $_SERVER['SCRIPT_NAME']; 
$basePath = dirname($scriptName); 

$path = parse_url($requestUri, PHP_URL_PATH);
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}
$path = trim($path, '/');
$segments = $path ? explode('/', $path) : [];

$method = $_SERVER['REQUEST_METHOD'];
$entity = isset($segments[0]) ? strtolower($segments[0]) : null;
$id = isset($segments[1]) ? $segments[1] : null;
$action = isset($segments[2]) ? $segments[2] : null;

// Special Handling for Entity/Filter or Entity/Action when ID is missing
if ($id === 'filter') {
    $action = 'filter';
    $id = null;
} elseif ($id === '0') {
    // Keep id as '0' if explicitly sent for custom actions
}

// Map entity to controller
$entities = [
    'employees' => 'EmployeesController',
    'departments' => 'DepartmentsController',
    'positions' => 'PositionsController',
    'contracts' => 'ContractsController',
    'attendance' => 'AttendanceController',
    'leaves' => 'LeavesController',
    'leave-requests' => 'LeavesController',
    'leave-types' => 'LeaveTypesController',
    'overtime' => 'OvertimeController',
    'allowances' => 'AllowancesController',
    'deductions' => 'DeductionsController',
    'bonuses' => 'BonusesController',
    'payroll' => 'PayrollController',
    'payroll-batches' => 'PayrollBatchesController',
    'work-locations' => 'WorkLocationsController',
    'work-schedules' => 'WorkSchedulesController',
    'roles' => 'RolesController',
    'users' => 'UsersController',
    'user-roles' => 'UserRolesController',
    'trainings' => 'TrainingsController',
    'performance-evaluations' => 'EvaluationsController',
    'evaluations' => 'EvaluationsController',
    'resignations' => 'ResignationsController',
    'system-settings' => 'SettingsController',
    'settings' => 'SettingsController',
    'audit-logs' => 'AuditLogsController',
    'dashboard' => 'DashboardController',
    'nationalities' => 'NationalitiesController',
    'bank-names' => 'BankNamesController',
    'contract-types' => 'ContractTypesController',
    'allowance-types' => 'AllowanceTypesController',
    'deduction-types' => 'DeductionTypesController',
    'attendance-statuses' => 'AttendanceStatusesController',
    'training-statuses' => 'TrainingStatusesController',
    'employee-leave-balances' => 'EmployeeLeaveBalancesController',
    // Fix: Map 'employee-trainings' to the new Controller
    'employee-trainings' => 'EmployeeTrainingsController',
    'evaluation-templates' => 'EvaluationTemplatesController',
    'template-kpis' => 'TemplateKPIsController',
    'kpi-results' => 'KPIResultsController',
    'competencies' => 'CompetenciesController',
    'competency-ratings' => 'CompetencyRatingsController',
    'job-descriptions' => 'JobDescriptionsController',
    'business-tasks' => 'BusinessTasksController',
    'development-logs' => 'DevelopmentLogsController',
    'insurance-settings' => 'InsuranceSettingsController',
    'permission-requests' => 'PermissionsController',
    'workflow-settings' => 'WorkflowSettingsController',
    'approvals' => 'ApprovalsController',
    'workflow' => 'WorkflowController', // Placeholder to pass the whitelist
    'functions' => 'FunctionsController', // Placeholder to pass the whitelist
    'company-profile' => 'CompanyProfileController',
    'violation-types' => 'ViolationTypesController',
    'penalty-policies' => 'PenaltyPoliciesController',
    'employee-violations' => 'EmployeeViolationsController',
];

if (!$entity) {
    echo json_encode(['message' => 'Ivory HR API v1.0', 'status' => 'running']);
    exit();
}

if (!isset($entities[$entity])) {
    http_response_code(404);
    echo json_encode(['error' => true, 'message' => 'Entity not found: ' . $entity]);
    exit();
}

$controllerName = $entities[$entity];

// Load controllers
require_once __DIR__ . '/../controllers/LookupControllers.php';

$controllerFile = __DIR__ . '/../controllers/' . $controllerName . '.php';
if (file_exists($controllerFile)) {
    require_once $controllerFile;
}

// Explicitly load WorkflowController as it might be used via generic routing
if ($controllerName === 'WorkflowController') {
    require_once __DIR__ . '/../controllers/WorkflowController.php';
}

if (!class_exists($controllerName)) {
    http_response_code(501);
    echo json_encode(['error' => true, 'message' => 'Controller class not found: ' . $controllerName]);
    exit();
}

try {
    $result = null;
    $body = getRequestBody();

    // Special Global Functions (Before Controller Instantiation)
    // Fix: Allow processApproval in $id (direct) or $action (nested/v1)
    if ($entity === 'functions' && ($id === 'processApproval' || $action === 'processApproval')) {
        // Handle "processApproval" RPC call from Frontend
        
        $table = $body['table'] ?? $body['entity'] ?? $body['entity_name'] ?? null;
        $recordId = $body['id'] ?? $body['record_id'] ?? $body['entity_id'] ?? null;
        $reqAction = $body['action'] ?? null;
        
        if (!$table || !$recordId || !$reqAction) {
            throw new Exception('Missing parameters for processApproval (table/entity, id/record_id, action)');
        }

        // Normalize table name
        $table = strtolower($table);

        // Map table name to Controller
        $tableToController = [
            'leave_requests' => 'LeavesController',
            'leaves' => 'LeavesController',
            'leaverequest' => 'LeavesController',
            'overtime' => 'OvertimeController',
            'employee_trainings' => 'EmployeeTrainingsController',
            'employeetraining' => 'EmployeeTrainingsController',
            'bonuses' => 'BonusesController',
            'bonus' => 'BonusesController',
            'resignations' => 'ResignationsController',
            'resignation' => 'ResignationsController',
            'performance_evaluations' => 'EvaluationsController',
            'performanceevaluation' => 'EvaluationsController',
            'evaluations' => 'EvaluationsController',
            'contracts' => 'ContractsController',
            'contractrequest' => 'ContractsController'
        ];

        $targetController = $tableToController[$table] ?? null;
        
        if (!$targetController) {
            throw new Exception("Approval not supported for table: $table");
        }

        require_once __DIR__ . '/../controllers/' . $targetController . '.php';
        $ctrl = new $targetController();
        
        // Forward to customAction(id, action, body)
        $result = $ctrl->customAction($recordId, $reqAction, $body);

    } elseif ($entity === 'workflow' && $action === 'chain') {
        $wf = new WorkflowHelper(getDB());
        $result = ['approvalChain' => $wf->getApprovalChain($body['employeeId'], $body['requiresFinanceApproval'] ?? false)];
    } elseif ($entity === 'functions' && ($id === 'importFingerprintLogsSimple' || $id === 'importBitrixLogs')) {
        // Handle Base64 file upload from Frontend
        $filePath = null;
        if (isset($body['file_data'])) {
            $data = explode(',', $body['file_data']);
            $content = base64_decode(end($data));
            $fileName = $body['file_name'] ?? 'upload_' . time() . '.xlsx';
            $uploadDir = __DIR__ . '/uploads/';
            if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
            $filePath = $uploadDir . $fileName;
            file_put_contents($filePath, $content);
        } else {
            $filePath = $body['file_url'] ?? $body['filePath'] ?? null;
        }

        require_once __DIR__ . '/../controllers/AttendanceController.php';
        $controller = new AttendanceController();
        $actionName = ($id === 'importBitrixLogs') ? 'import-bitrix' : 'import-fingerprint';
        $result = $controller->customAction(null, $actionName, ['file_path' => $filePath]);
    } else {
        $controller = new $controllerName();
        switch ($method) {
            case 'GET':
                if ($id !== null && $action !== null && $id !== '0') {
                    $result = $controller->customAction($id, $action, $_GET);
                } elseif ($id === '0' && $action !== null) {
                    $result = $controller->customAction(null, $action, $_GET);
                } elseif ($id !== null && $id !== '') {
                    $result = $controller->show($id);
                } else {
                    $result = $controller->index();
                }
                break;
                
            case 'POST':
                if ($action === 'filter') {
                    $result = $controller->filter($body);
                } elseif ($id !== null && $action !== null && $id !== '0') {
                    $result = $controller->customAction($id, $action, $body);
                } elseif ($id === '0' && $action !== null) {
                    $result = $controller->customAction(null, $action, $body);
                } else {
                    $result = $controller->store($body);
                }
                break;
                
            case 'PUT':
                $result = $controller->update($id, $body);
                break;
                
            case 'DELETE':
                $result = $controller->destroy($id);
                break;
        }
    }
    
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => $e->getMessage()]);
    
    // Ensure we capture fatal errors that happen after this block
    // (though catch Throwable usually catches them in PHP 7+)
}
