-- إضافة حالة "returned" لجدول الإجازات
ALTER TABLE leave_requests 
    MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending';

-- إضافة حالة "returned" لجدول الاستئذان
ALTER TABLE permission_requests 
    MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'returned') DEFAULT 'pending';
