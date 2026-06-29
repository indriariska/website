document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  document.getElementById('userName').textContent = user.name || 'Admin';
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Staff';

  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  });

  loadExpenses();

  // Filter listeners
  document.getElementById('searchInput').addEventListener('input', debounce(loadExpenses, 300));
  document.getElementById('dateFrom').addEventListener('change', loadExpenses);
  document.getElementById('dateTo').addEventListener('change', loadExpenses);

  // Modal listeners
  document.getElementById('addExpenseBtn').addEventListener('click', () => openExpenseModal());
  document.getElementById('closeModal').addEventListener('click', closeExpenseModal);
  document.getElementById('cancelBtn').addEventListener('click', closeExpenseModal);
  document.getElementById('expenseModal').addEventListener('click', function(e) {
    if (e.target === this) closeExpenseModal();
  });
  document.getElementById('saveExpenseBtn').addEventListener('click', saveExpense);

  // Export
  document.getElementById('exportBtn').addEventListener('click', exportExpenses);
});

let allExpenses = [];

async function loadExpenses() {
  try {
    const response = await AdminAPI.getExpenses();
    
    if (response.success) {
      allExpenses = response.data;
      filterAndRenderExpenses();
      updateExpenseSummary();
    }
  } catch (error) {
    console.error('Failed to load expenses:', error);
    showToast('Failed to load expenses', 'error');
  }
}

function filterAndRenderExpenses() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;

  let filtered = allExpenses.filter(expense => {
    const matchesSearch = 
      expense.title.toLowerCase().includes(search) ||
      (expense.description && expense.description.toLowerCase().includes(search));
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(expense.createdAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(expense.createdAt) <= new Date(dateTo);
    }

    return matchesSearch && matchesDate;
  });

  renderExpenses(filtered);
}

function renderExpenses(expenses) {
  const tbody = document.getElementById('expensesTable');
  
  if (expenses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No expenses found</td></tr>';
    return;
  }

  tbody.innerHTML = expenses.map(expense => `
    <tr>
      <td><strong>${expense.title}</strong></td>
      <td style="color: var(--error); font-weight: 600;">-${formatCurrency(expense.amount)}</td>
      <td>${expense.description || '-'}</td>
      <td>${formatDate(expense.createdAt)}</td>
      <td>
        <button class="btn-action" onclick="editExpense('${expense.id}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-action danger" onclick="deleteExpense('${expense.id}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function updateExpenseSummary() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const todayExpenses = allExpenses
    .filter(exp => new Date(exp.createdAt) >= today)
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const monthlyExpenses = allExpenses
    .filter(exp => new Date(exp.createdAt) >= monthStart)
    .reduce((sum, exp) => sum + exp.amount, 0);

  document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
  document.getElementById('todayExpenses').textContent = formatCurrency(todayExpenses);
}

function openExpenseModal(expense = null) {
  const modal = document.getElementById('expenseModal');
  const title = document.getElementById('expenseModalTitle');
  const form = document.getElementById('expenseForm');
  
  form.reset();
  document.getElementById('expenseId').value = '';
  
  if (expense) {
    title.textContent = 'Edit Expense';
    document.getElementById('expenseId').value = expense.id;
    document.getElementById('expenseTitle').value = expense.title;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseDescription').value = expense.description || '';
  } else {
    title.textContent = 'Add Expense';
  }
  
  modal.classList.add('show');
}

function closeExpenseModal() {
  document.getElementById('expenseModal').classList.remove('show');
}

async function saveExpense() {
  const id = document.getElementById('expenseId').value;
  const title = document.getElementById('expenseTitle').value;
  const amount = document.getElementById('expenseAmount').value;
  const description = document.getElementById('expenseDescription').value;

  if (!title || !amount) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const expenseData = {
    title,
    amount: parseInt(amount),
    description,
  };

  try {
    let response;
    if (id) {
      response = await AdminAPI.updateExpense(id, expenseData);
    } else {
      response = await AdminAPI.createExpense(expenseData);
    }

    if (response.success) {
      showToast(id ? 'Expense updated successfully' : 'Expense created successfully', 'success');
      closeExpenseModal();
      loadExpenses();
    }
  } catch (error) {
    console.error('Failed to save expense:', error);
    showToast('Failed to save expense', 'error');
  }
}

async function editExpense(id) {
  const expense = allExpenses.find(e => e.id === id);
  if (!expense) return;

  try {
    const response = await AdminAPI.getExpense(id);
    if (response.success) {
      openExpenseModal(response.data);
    }
  } catch (error) {
    console.error('Failed to load expense:', error);
    showToast('Failed to load expense details', 'error');
  }
}

async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }

  try {
    const response = await AdminAPI.deleteExpense(id);
    
    if (response.success) {
      showToast('Expense deleted successfully', 'success');
      loadExpenses();
    }
  } catch (error) {
    console.error('Failed to delete expense:', error);
    showToast('Failed to delete expense', 'error');
  }
}

function exportExpenses() {
  const filtered = getFilteredExpenses();
  
  let csv = 'Title,Amount,Description,Date\n';
  
  filtered.forEach(expense => {
    csv += `"${expense.title}",${expense.amount},"${expense.description || ''}","${formatDate(expense.createdAt)}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Expenses exported successfully', 'success');
}

function getFilteredExpenses() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;

  return allExpenses.filter(expense => {
    const matchesSearch = 
      expense.title.toLowerCase().includes(search) ||
      (expense.description && expense.description.toLowerCase().includes(search));
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(expense.createdAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(expense.createdAt) <= new Date(dateTo);
    }

    return matchesSearch && matchesDate;
  });
}

function formatCurrency(value) {
  return 'Rp ' + (value || 0).toLocaleString('id-ID');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
