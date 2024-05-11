// public/js/company.js
document.addEventListener('DOMContentLoaded', function() {
    fetchCompanies();

    document.getElementById('company-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const companyId = document.getElementById('company_id').value;
        createOrUpdateCompany(companyId);
    });
});

function fetchCompanies() {
    const searchValue = document.getElementById('search-box').value || '';  
    fetch(`/api/companies?search=${encodeURIComponent(searchValue)}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('companies-table').getElementsByTagName('tbody')[0];
            tableBody.innerHTML = '';
            data.data.forEach((company, index) => {
                let row = tableBody.insertRow();
                row.insertCell(0).innerHTML = company.id;
                row.insertCell(1).innerHTML = company.concern_name;
                row.insertCell(2).innerHTML = company.phone;
                row.insertCell(3).innerHTML = company.email;
                let actionsCell = row.insertCell(4);
                actionsCell.innerHTML = `<button onclick="editCompany(${company.id})" class="btn btn-primary btn-sm">Edit</button>
                                         <button onclick="deleteCompany(${company.id})" class="btn btn-danger btn-sm">Delete</button>`;
            });
        });
}

function createOrUpdateCompany(companyId) {
    const url = companyId ? `/api/companies/${companyId}` : '/api/companies';
    const method = companyId ? 'PUT' : 'POST';
    const data = {
        concern_name: document.getElementById('concern_name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
    };

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert('Company saved successfully!');
        resetForm();
        fetchCompanies();
    })
    .catch(error => alert('Error saving company: ' + error));
}

function editCompany(id) {
    fetch(`/api/companies/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('company_id').value = data.id;
            document.getElementById('concern_name').value = data.concern_name;
            document.getElementById('phone').value = data.phone;
            document.getElementById('email').value = data.email;
        });
}

function deleteCompany(id) {
    if (confirm('Are you sure you want to delete this company?')) {
        fetch(`/api/companies/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                alert('Company deleted successfully!');
                fetchCompanies();
            })
            .catch(error => alert('Error deleting company: ' + error));
    }
}

function resetForm() {
    document.getElementById('company-form').reset();
    document.getElementById('company_id').value = '';
}

function searchCompanies() {
    fetchCompanies();
}
