// JavaScript Example: Reading Entities
// Filterable fields: request_number, employee_id, leave_type_id, start_date, end_date, days_count, reason, document_url, status, current_approval_level, approval_history, requires_finance_approval
async function fetchLeaveRequestEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/LeaveRequest`, {
        headers: {
            'api_key': 'cc318f7fd4634eaea1801fce68b1d92d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: request_number, employee_id, leave_type_id, start_date, end_date, days_count, reason, document_url, status, current_approval_level, approval_history, requires_finance_approval
async function updateLeaveRequestEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/LeaveRequest/${entityId}`, {
        method: 'PUT',
        headers: {
            'api_key': 'cc318f7fd4634eaea1801fce68b1d92d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    const data = await response.json();
    console.log(data);
}