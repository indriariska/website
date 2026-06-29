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

  // Period filter
  document.getElementById('reportPeriod').addEventListener('change', function() {
    const period = this.value;
    document.getElementById('customDateFrom').style.display = period === 'custom' ? 'block' : 'none';
    document.getElementById('customDateTo').style.display = period === 'custom' ? 'block' : 'none';
  });

  // Generate report
  document.getElementById('generateBtn').addEventListener('click', generateReport);

  // Export buttons
  document.getElementById('exportPdfBtn').addEventListener('click', () => exportReport('pdf'));
  document.getElementById('exportExcelBtn').addEventListener('click', () => exportReport('excel'));
  document.getElementById('exportCsvBtn').addEventListener('click', () => exportReport('csv'));

  generateReport();
});

let reportData = null;

async function generateReport() {
  try {
    const response = await AdminAPI.getDashboardStats();
    
    if (response.success) {
      reportData = response.data;
      updateReportStats();
      updateReportCharts();
      updateReportTables();
    }
  } catch (error) {
    console.error('Failed to generate report:', error);
    showToast('Failed to generate report', 'error');
  }
}

function updateReportStats() {
  const period = document.getElementById('reportPeriod').value;
  let revenue, grossProfit, expenses, netProfit;

  switch (period) {
    case 'daily':
      revenue     = reportData.revenueToday || 0;
      expenses    = 0;
      grossProfit = revenue;
      netProfit   = revenue - expenses;
      break;
    case 'monthly':
      revenue     = reportData.monthlyRevenue   || 0;
      expenses    = reportData.monthlyExpenses  || 0;
      grossProfit = reportData.monthlyProfit    || revenue;
      netProfit   = reportData.netProfit        || (grossProfit - expenses);
      break;
    default: // all time
      revenue     = reportData.totalRevenue || 0;
      expenses    = reportData.monthlyExpenses || 0;
      grossProfit = reportData.grossProfit  || revenue;
      netProfit   = grossProfit - expenses;
  }

  document.getElementById('reportRevenue').textContent    = formatCurrency(revenue);
  document.getElementById('reportGrossProfit').textContent = formatCurrency(grossProfit);
  document.getElementById('reportExpenses').textContent   = formatCurrency(expenses);
  document.getElementById('reportNetProfit').textContent  = formatCurrency(netProfit);
}

function updateReportCharts() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Revenue Trend Chart
  const revenueCtx = document.getElementById('revenueTrendChart').getContext('2d');
  new Chart(revenueCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Revenue',
        data: reportData.monthlyRevenueData || Array(12).fill(0),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            },
          },
        },
      },
    },
  });

  // Profit vs Expense Chart
  const profitExpenseCtx = document.getElementById('profitExpenseChart').getContext('2d');
  new Chart(profitExpenseCtx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Profit',
          data: reportData.monthlyProfitData || Array(12).fill(0),
          backgroundColor: '#10b981',
        },
        {
          label: 'Expenses',
          data: Array(12).fill(reportData.monthlyExpenses || 0),
          backgroundColor: '#ef4444',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            },
          },
        },
      },
    },
  });

  // Sales Growth Chart
  const salesGrowthCtx = document.getElementById('salesGrowthChart').getContext('2d');
  const growthData = calculateGrowthRate(reportData.monthlyOrdersData || Array(12).fill(0));
  new Chart(salesGrowthCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Growth Rate (%)',
        data: growthData,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return value + '%';
            },
          },
        },
      },
    },
  });
}

function calculateGrowthRate(data) {
  return data.map((value, index) => {
    if (index === 0) return 0;
    const previous = data[index - 1];
    if (previous === 0) return 0;
    return ((value - previous) / previous * 100).toFixed(1);
  });
}

function updateReportTables() {
  // Top Services (replaces "Best Selling Products")
  const bestSellingTable = document.getElementById('bestSellingTable');
  if (reportData.topServices && reportData.topServices.length > 0) {
    bestSellingTable.innerHTML = reportData.topServices.map(s => `
      <tr>
        <td>${escHtml(s.serviceType)}</td>
        <td>${s.totalOrders}</td>
        <td>${formatCurrency(s.totalRevenue)}</td>
        <td>${formatCurrency(s.totalOrders > 0 ? Math.round(s.totalRevenue / s.totalOrders) : 0)}</td>
      </tr>
    `).join('');
  } else {
    bestSellingTable.innerHTML = '<tr><td colspan="4" class="loading">Belum ada data</td></tr>';
  }

  // Top Customers (from latest orders)
  const bestCustomersTable = document.getElementById('bestCustomersTable');
  if (reportData.latestOrders && reportData.latestOrders.length > 0) {
    // Aggregate by email
    const byEmail = {};
    reportData.latestOrders.forEach(order => {
      const key = order.customerEmail || order.customerName;
      if (!byEmail[key]) {
        byEmail[key] = {
          name: order.customerName,
          whatsapp: order.customerWhatsapp,
          orders: 0,
          spending: 0,
        };
      }
      byEmail[key].orders++;
      byEmail[key].spending += order.price;
    });

    const sorted = Object.values(byEmail).sort((a, b) => b.spending - a.spending).slice(0, 10);
    bestCustomersTable.innerHTML = sorted.map(c => `
      <tr>
        <td>${escHtml(c.name)}</td>
        <td>${escHtml(c.whatsapp || '–')}</td>
        <td>${c.orders}</td>
        <td>${formatCurrency(c.spending)}</td>
      </tr>
    `).join('');
  } else {
    bestCustomersTable.innerHTML = '<tr><td colspan="4" class="loading">Belum ada data</td></tr>';
  }
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function exportReport(format) {
  if (!reportData) {
    showToast('No report data to export', 'error');
    return;
  }

  const period = document.getElementById('reportPeriod').value;
  const filename = `report_${period}_${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'csv':
      exportToCSV(filename);
      break;
    case 'excel':
      exportToExcel(filename);
      break;
    case 'pdf':
      exportToPDF(filename);
      break;
  }
}

function exportToCSV(filename) {
  let csv = 'Metric,Value\n';
  csv += `Total Revenue,${reportData.totalRevenue}\n`;
  csv += `Gross Profit,${reportData.grossProfit}\n`;
  csv += `Total Orders,${reportData.totalOrders}\n`;
  csv += `Total Customers,${reportData.totalCustomers}\n`;
  csv += `Total Products,${reportData.totalProducts}\n\n`;
  
  csv += 'Month,Revenue,Profit,Orders\n';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  reportData.monthlyRevenueData.forEach((revenue, i) => {
    csv += `${months[i]},${revenue},${reportData.monthlyProfitData[i]},${reportData.monthlyOrdersData[i]}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Report exported to CSV', 'success');
}

function exportToExcel(filename) {
  // Simple Excel export using CSV with .xls extension
  // For proper Excel export, you would need a library like xlsx
  exportToCSV(filename);
  showToast('Report exported to Excel (CSV format)', 'success');
}

function exportToPDF(filename) {
  // Simple PDF export using window.print
  // For proper PDF export, you would need a library like jsPDF
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>Report - ${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #6366f1; }
        .stat { margin: 20px 0; padding: 15px; background: #f5f5f5; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #6366f1; color: white; }
      </style>
    </head>
    <body>
      <h1>Business Report</h1>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
      
      <div class="stat">
        <h3>Summary</h3>
        <p>Total Revenue: ${formatCurrency(reportData.totalRevenue)}</p>
        <p>Gross Profit: ${formatCurrency(reportData.grossProfit)}</p>
        <p>Total Orders: ${reportData.totalOrders}</p>
        <p>Total Customers: ${reportData.totalCustomers}</p>
      </div>
      
      <h3>Monthly Data</h3>
      <table>
        <tr><th>Month</th><th>Revenue</th><th>Profit</th><th>Orders</th></tr>
        ${reportData.monthlyRevenueData.map((revenue, i) => `
          <tr>
            <td>${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</td>
            <td>${formatCurrency(revenue)}</td>
            <td>${formatCurrency(reportData.monthlyProfitData[i])}</td>
            <td>${reportData.monthlyOrdersData[i]}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
  
  showToast('Report exported to PDF', 'success');
}

function formatCurrency(value) {
  return 'Rp ' + (value || 0).toLocaleString('id-ID');
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
