ALTER TABLE permission_requests ADD COLUMN employee_id VARCHAR(36) DEFAULT NULL AFTER user_id;
CREATE INDEX idx_permission_requests_employee_id ON permission_requests(employee_id);
ALTER TABLE permission_requests ADD CONSTRAINT fk_permission_requests_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;
