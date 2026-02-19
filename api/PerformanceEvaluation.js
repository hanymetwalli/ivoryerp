// JavaScript Example: Reading Entities
// Filterable fields: evaluation_number, employee_id, template_id, evaluator_id, period_start, period_end, evaluation_date, overall_score, strengths, improvement_areas, development_actions, employee_signature_date, evaluator_signature_date, hr_signature_date, status, approval_history
async function fetchPerformanceEvaluationEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/PerformanceEvaluation`, {
        headers: {
            'api_key': 'cc318f7fd4634eaea1801fce68b1d92d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: evaluation_number, employee_id, template_id, evaluator_id, period_start, period_end, evaluation_date, overall_score, strengths, improvement_areas, development_actions, employee_signature_date, evaluator_signature_date, hr_signature_date, status, approval_history
async function updatePerformanceEvaluationEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/PerformanceEvaluation/${entityId}`, {
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