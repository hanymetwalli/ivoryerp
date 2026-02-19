// JavaScript Example: Reading Entities
// Filterable fields: employee_id, date, check_in_time, check_in_location, check_out_time, check_out_location, status, notes, is_late, late_minutes, overtime_hours
async function fetchAttendanceEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/Attendance`, {
        headers: {
            'api_key': 'cc318f7fd4634eaea1801fce68b1d92d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: employee_id, date, check_in_time, check_in_location, check_out_time, check_out_location, status, notes, is_late, late_minutes, overtime_hours
async function updateAttendanceEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/Attendance/${entityId}`, {
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