const expensesForm = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expenseList');
const totalAmount = document.getElementById('totalAmount');
const incomeAmount = document.getElementById('incomeAmount');
const balanceAmount = document.getElementById('balanceAmount');
const darkModeToggle = document.getElementById('darkModeToggle');
const editIncomeBtn = document.getElementById('editIncomeBtn');
const chartCanvas = document.getElementById('expenseChart').getContext('2d');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let income = parseFloat(localStorage.getItem('income')) || 0;
let isEditing = false;
let editId = null;
let chart;

// Handle expense form submission
expensesForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value || new Date().toISOString().split('T')[0];

  if (!description || isNaN(amount) || !category) {
    alert("Please fill all fields");
    return;
  }

  const expenseData = {
    id: isEditing ? editId : Date.now(),
    description,
    amount,
    category,
    date,
  };

  if (isEditing) {
    expenses = expenses.map((item) => (item.id === editId ? expenseData : item));
    isEditing = false;
    editId = null;
  } else {
    expenses.push(expenseData);
  }

  saveExpenses();
  renderExpenses();
  expensesForm.reset();
});

// Edit Income functionality
editIncomeBtn.addEventListener("click", () => {
  const newIncome = prompt("Enter your total income:", income);
  if (newIncome !== null && !isNaN(parseFloat(newIncome))) {
    income = parseFloat(newIncome);
    localStorage.setItem('income', income);
    renderExpenses();
  }
});

// Save to localStorage
function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Render all expenses and update totals
function renderExpenses() {
  expenseList.innerHTML = "";
  let total = 0;
  let categoryData = {
    Food: 0, Transport: 0, Shopping: 0,  Health: 0, Others: 0
  };

  expenses.forEach((expense) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.description}</td>
      <td>₦${expense.amount.toFixed(2)}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>
        <button onclick="editExpense(${expense.id})"><i class="fas fa-pen"></i></button>
        <button onclick="deleteExpense(${expense.id})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    expenseList.appendChild(row);
    total += expense.amount;
    categoryData[expense.category] += expense.amount;
  });

  totalAmount.textContent = total.toFixed(2);
  incomeAmount.textContent = income.toFixed(2);
  balanceAmount.textContent = (income - total).toFixed(2);
  updateChart(categoryData);
}

// Edit expense
function editExpense(id) {
  const expense = expenses.find((exp) => exp.id === id);
  if (!expense) return;

  descriptionInput.value = expense.description;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;

  isEditing = true;
  editId = id;
}

// Delete expense
function deleteExpense(id) {
  if (confirm("Delete this expense?")) {
    expenses = expenses.filter((expense) => expense.id !== id);
    saveExpenses();
    renderExpenses();
  }
}
// Chart function
function updateChart(categoryData) {
  if (chart) {
    chart.destroy(); // Destroy the old chart before rendering a new one
  }

  chart = new Chart(chartCanvas, {
    type: 'pie', 
    data: {
      labels: Object.keys(categoryData), 
      datasets: [{
        label: 'Expenses by Category',
        data: Object.values(categoryData), // Values for each category
        backgroundColor: [
          '#ff6384',
          '#36a2eb',
          '#cc65fe',
          '#ffce56',
          '#4caf50'
        ]
      }]
    },
    options: {
      responsive: true, // chart responsiveness 
      maintainAspectRatio: false, // Allow custom sizing of the chart
      plugins: {
        legend: {
          position: 'top' // Adjust the position of the legend
        }
      }
    }
  });
}

// Toggle Dark Mode
darkModeToggle.addEventListener("click", () => {
document.body.classList.toggle('dark-mode');
});

// Initial render of expenses
renderExpenses();