<?php
/**
 * Lookup Controllers - نسخة نظيفة تماماً بدون تكرار
 * تحتوي فقط على الجداول البسيطة التي لا تحتاج لملف منفصل
 */

require_once __DIR__ . '/BaseController.php';

class NationalitiesController extends BaseController {
    protected $table = 'nationalities';
    protected $fillable = ['id', 'name', 'code', 'status'];
}

class BankNamesController extends BaseController {
    protected $table = 'bank_names';
    protected $fillable = ['id', 'name', 'code', 'swift_code', 'status'];
}

class ContractTypesController extends BaseController {
    protected $table = 'contract_types';
    protected $fillable = ['id', 'name', 'code', 'description', 'status'];
}

class AllowanceTypesController extends BaseController {
    protected $table = 'allowance_types';
    protected $fillable = ['id', 'name', 'code', 'description', 'is_taxable', 'status'];
}

class DeductionTypesController extends BaseController {
    protected $table = 'deduction_types';
    protected $fillable = ['id', 'name', 'code', 'description', 'status'];
}

class AttendanceStatusesController extends BaseController {
    protected $table = 'attendance_statuses';
    protected $fillable = ['id', 'name', 'code', 'color', 'status'];
}

class TrainingStatusesController extends BaseController {
    protected $table = 'training_statuses';
    protected $fillable = ['id', 'name', 'code', 'status'];
}

class InsuranceSettingsController extends BaseController {
    protected $table = 'insurance_settings';
    protected $fillable = ['id', 'location_type', 'year', 'employee_percentage', 'company_percentage', 'max_insurable_salary', 'status'];
}

class EmployeeLeaveBalancesController extends BaseController {
    protected $table = 'employee_leave_balances';
    protected $fillable = ['id', 'employee_id', 'leave_type_id', 'year', 'total_balance', 'used_balance', 'remaining_balance'];
}

// REMOVED: EmployeeTrainingsController (Now has its own file: EmployeeTrainingsController.php)
// REMOVED: CompetenciesController (Has its own file)
