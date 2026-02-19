-- Fix: Add approval columns to employee_trainings (not just trainings)
ALTER TABLE employee_trainings ADD COLUMN approval_chain JSON NULL;
ALTER TABLE employee_trainings ADD COLUMN current_level_idx INT DEFAULT 0;
ALTER TABLE employee_trainings ADD COLUMN current_status_desc TEXT NULL;
