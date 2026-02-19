// JavaScript Example: Reading Entities
// Filterable fields: position_id, position_name, department_id, job_objective, main_tasks, core_competencies, qualifications, required_skills, required_experience, notes, version, last_review_date, next_review_date, status, employee_notes
async function fetchJobDescriptionEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/JobDescription`, {
        headers: {
            'api_key': 'cc318f7fd4634eaea1801fce68b1d92d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: position_id, position_name, department_id, job_objective, main_tasks, core_competencies, qualifications, required_skills, required_experience, notes, version, last_review_date, next_review_date, status, employee_notes
async function updateJobDescriptionEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/JobDescription/${entityId}`, {
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