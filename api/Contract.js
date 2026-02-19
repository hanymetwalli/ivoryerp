// JavaScript Example: Reading Entities
// Filterable fields: request_number, employee_id, contract_number, contract_type, start_date, end_date, gross_salary, currency, basic_salary, housing_allowance, transport_allowance, other_allowances, status, current_approval_level, approval_history, requires_finance_approval, document_url, notes
async function fetchContractEntities() {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/Contract`, {
        headers: {
            'api_key': 'cc318f7fd4634eaea1801fce68b1d92d', // or use await User.me() to get the API key
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}

// JavaScript Example: Updating an Entity
// Filterable fields: request_number, employee_id, contract_number, contract_type, start_date, end_date, gross_salary, currency, basic_salary, housing_allowance, transport_allowance, other_allowances, status, current_approval_level, approval_history, requires_finance_approval, document_url, notes
async function updateContractEntity(entityId, updateData) {
    const response = await fetch(`https://app.base44.com/api/apps/69712f25b80b6272fafdf7a0/entities/Contract/${entityId}`, {
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