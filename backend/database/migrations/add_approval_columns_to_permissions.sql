ALTER TABLE permission_requests ADD COLUMN request_number VARCHAR(50) DEFAULT NULL AFTER id;
ALTER TABLE permission_requests ADD COLUMN approval_chain JSON DEFAULT NULL AFTER status;
ALTER TABLE permission_requests ADD COLUMN current_level_idx INT DEFAULT 0 AFTER approval_chain;
ALTER TABLE permission_requests ADD COLUMN current_status_desc TEXT DEFAULT NULL AFTER current_level_idx;
ALTER TABLE permission_requests ADD COLUMN rejection_reason TEXT DEFAULT NULL AFTER current_status_desc;
ALTER TABLE permission_requests ADD COLUMN manager_approval_date DATETIME DEFAULT NULL;
ALTER TABLE permission_requests ADD COLUMN hr_approval_date DATETIME DEFAULT NULL;

CREATE INDEX idx_permission_requests_request_number ON permission_requests(request_number);
