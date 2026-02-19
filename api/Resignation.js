// JavaScript Example: Reading Entities
// Filterable fields: request_number, employee_id, resignation_date, end_of_service_date, reason, notice_period_days, status, current_approval_level, approval_history, notes, final_settlement_amount, exit_interview_notes, attachments, clearance_form
async function fetchResignationEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/Resignation`, {
        headers: {
            'api_key': 'cc318f7fd4634eaea1801fce68b1d92d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: request_number, employee_id, resignation_date, end_of_service_date, reason, notice_period_days, status, current_approval_level, approval_history, notes, final_settlement_amount, exit_interview_notes, attachments, clearance_form
async function updateResignationEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/Resignation/${entityId}`, {
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