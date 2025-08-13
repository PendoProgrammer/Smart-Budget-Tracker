// Expense Tracker & Budget Planner JavaScript

class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [
            'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
            'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
            'Salary', 'Freelance', 'Business', 'Gifts', 'Other'
        ];
        this.monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget')) || 0;
        this.currentEditId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateCategories();
        this.setTodayDate();
        this.updateDashboard();
        this.renderTransactions();
        this.renderCategories();
        this.updateBudgetDisplay();
    }

    setupEventListeners() {
        // Transaction form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Budget setup
        document.getElementById('setBudgetBtn').addEventListener('click', () => {
            this.setBudget();
        });

        // Category management
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.addCategory();
        });

        // Type change to update categories
        document.getElementById('type').addEventListener('change', () => {
            this.updateCategoryOptions();
        });

        // Filters
        ['filterType', 'filterCategory', 'filterDateFrom', 'filterDateTo'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.renderTransactions();
            });
        });

        // Header actions
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Modal events
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeModal();
            }
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editTransactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTransaction();
        });

        // Edit type change
        document.getElementById('editType').addEventListener('change', () => {
            this.updateEditCategoryOptions();
        });
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    populateCategories() {
        this.updateCategoryOptions();
        this.updateFilterCategories();
    }

    updateCategoryOptions() {
        const categorySelect = document.getElementById('category');
        const type = document.getElementById('type').value;
        
        categorySelect.innerHTML = '<option value="">Select category</option>';
        
        let filteredCategories = this.categories;
        if (type === 'income') {
            filteredCategories = this.categories.filter(cat => 
                ['Salary', 'Freelance', 'Business', 'Gifts', 'Other'].includes(cat)
            );
        } else if (type === 'expense') {
            filteredCategories = this.categories.filter(cat => 
                !['Salary', 'Freelance', 'Business'].includes(cat)
            );
        }

        filteredCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    updateEditCategoryOptions() {
        const categorySelect = document.getElementById('editCategory');
        const type = document.getElementById('editType').value;
        
        categorySelect.innerHTML = '<option value="">Select category</option>';
        
        let filteredCategories = this.categories;
        if (type === 'income') {
            filteredCategories = this.categories.filter(cat => 
                ['Salary', 'Freelance', 'Business', 'Gifts', 'Other'].includes(cat)
            );
        } else if (type === 'expense') {
            filteredCategories = this.categories.filter(cat => 
                !['Salary', 'Freelance', 'Business'].includes(cat)
            );
        }

        filteredCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    updateFilterCategories() {
        const filterCategory = document.getElementById('filterCategory');
        filterCategory.innerHTML = '<option value="">All Categories</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterCategory.appendChild(option);
        });
    }

    addTransaction() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (!description || !amount || !type || !category || !date) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }

        const transaction = {
            id: Date.now().toString(),
            description,
            amount,
            type,
            category,
            date,
            timestamp: new Date().toISOString()
        };

        this.transactions.push(transaction);
        this.saveData();
        this.updateDashboard();
        this.renderTransactions();
        this.updateBudgetDisplay();
        
        // Reset form
        document.getElementById('transactionForm').reset();
        this.setTodayDate();
        document.getElementById('category').innerHTML = '<option value="">Select category</option>';
        
        this.showNotification(`Transaction added successfully!`, 'success');
    }

    setBudget() {
        const budgetInput = document.getElementById('monthlyBudget');
        const budget = parseFloat(budgetInput.value);

        if (!budget || budget <= 0) {
            this.showNotification('Please enter a valid budget amount', 'error');
            return;
        }

        this.monthlyBudget = budget;
        localStorage.setItem('monthlyBudget', budget);
        budgetInput.value = '';
        
        this.updateBudgetDisplay();
        this.showNotification('Monthly budget updated successfully!', 'success');
    }

    addCategory() {
        const categoryInput = document.getElementById('newCategory');
        const category = categoryInput.value.trim();

        if (!category) {
            this.showNotification('Please enter a category name', 'error');
            return;
        }

        if (this.categories.includes(category)) {
            this.showNotification('Category already exists', 'error');
            return;
        }

        this.categories.push(category);
        localStorage.setItem('categories', JSON.stringify(this.categories));
        categoryInput.value = '';
        
        this.populateCategories();
        this.renderCategories();
        this.showNotification('Category added successfully!', 'success');
    }

    deleteCategory(category) {
        if (confirm(`Are you sure you want to delete the category "${category}"?`)) {
            this.categories = this.categories.filter(cat => cat !== category);
            localStorage.setItem('categories', JSON.stringify(this.categories));
            
            this.populateCategories();
            this.renderCategories();
            this.showNotification('Category deleted successfully!', 'success');
        }
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        this.currentEditId = id;
        
        // Populate edit form
        document.getElementById('editDescription').value = transaction.description;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editType').value = transaction.type;
        document.getElementById('editDate').value = transaction.date;
        
        // Update categories based on type
        this.updateEditCategoryOptions();
        document.getElementById('editCategory').value = transaction.category;
        
        // Show modal
        document.getElementById('editModal').style.display = 'block';
    }

    updateTransaction() {
        const description = document.getElementById('editDescription').value.trim();
        const amount = parseFloat(document.getElementById('editAmount').value);
        const type = document.getElementById('editType').value;
        const category = document.getElementById('editCategory').value;
        const date = document.getElementById('editDate').value;

        if (!description || !amount || !type || !category || !date) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (amount <= 0) {
            this.showNotification('Amount must be greater than 0', 'error');
            return;
        }

        const transactionIndex = this.transactions.findIndex(t => t.id === this.currentEditId);
        if (transactionIndex === -1) return;

        this.transactions[transactionIndex] = {
            ...this.transactions[transactionIndex],
            description,
            amount,
            type,
            category,
            date
        };

        this.saveData();
        this.updateDashboard();
        this.renderTransactions();
        this.updateBudgetDisplay();
        this.closeModal();
        
        this.showNotification('Transaction updated successfully!', 'success');
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveData();
            this.updateDashboard();
            this.renderTransactions();
            this.updateBudgetDisplay();
            this.showNotification('Transaction deleted successfully!', 'success');
        }
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditId = null;
    }

    updateDashboard() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('balance').textContent = this.formatCurrency(balance);

        // Update balance color
        const balanceElement = document.getElementById('balance');
        balanceElement.style.color = balance >= 0 ? '#4CAF50' : '#f44336';
    }

    updateBudgetDisplay() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyExpenses = this.transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return t.type === 'expense' && 
                       transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const remaining = this.monthlyBudget - monthlyExpenses;
        const percentage = this.monthlyBudget > 0 ? (monthlyExpenses / this.monthlyBudget) * 100 : 0;

        document.getElementById('budgetAmount').textContent = this.formatCurrency(this.monthlyBudget);
        document.getElementById('spentAmount').textContent = this.formatCurrency(monthlyExpenses);
        document.getElementById('remainingAmount').textContent = this.formatCurrency(remaining);
        document.getElementById('progressText').textContent = `${Math.round(percentage)}%`;

        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${Math.min(percentage, 100)}%`;
        
        // Update progress color based on percentage
        progressFill.className = 'progress-fill';
        if (percentage > 90) {
            progressFill.classList.add('danger');
        } else if (percentage > 75) {
            progressFill.classList.add('warning');
        }

        // Update remaining amount color
        const remainingElement = document.getElementById('remainingAmount');
        remainingElement.style.color = remaining >= 0 ? '#4CAF50' : '#f44336';
    }

    renderTransactions() {
        const transactionsList = document.getElementById('transactionsList');
        const filteredTransactions = this.getFilteredTransactions();
        
        document.getElementById('transactionCount').textContent = 
            `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''}`;

        if (filteredTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>No transactions found</p>
                    <small>Add your first transaction to get started</small>
                </div>
            `;
            return;
        }

        transactionsList.innerHTML = filteredTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(transaction => `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-meta">
                            <span><i class="fas fa-tag"></i> ${transaction.category}</span>
                            <span><i class="fas fa-calendar"></i> ${this.formatDate(transaction.date)}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'expense' ? '-' : '+'}${this.formatCurrency(transaction.amount)}
                    </div>
                    <div class="transaction-actions">
                        <button class="edit-btn" onclick="tracker.editTransaction('${transaction.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="tracker.deleteTransaction('${transaction.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
    }

    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        
        if (this.categories.length === 0) {
            categoriesList.innerHTML = '<p>No custom categories added</p>';
            return;
        }

        categoriesList.innerHTML = this.categories.map(category => `
            <div class="category-item">
                <span>${category}</span>
                <i class="fas fa-times delete-category" onclick="tracker.deleteCategory('${category}')"></i>
            </div>
        `).join('');
    }

    getFilteredTransactions() {
        let filtered = [...this.transactions];

        const filterType = document.getElementById('filterType').value;
        const filterCategory = document.getElementById('filterCategory').value;
        const filterDateFrom = document.getElementById('filterDateFrom').value;
        const filterDateTo = document.getElementById('filterDateTo').value;

        if (filterType) {
            filtered = filtered.filter(t => t.type === filterType);
        }

        if (filterCategory) {
            filtered = filtered.filter(t => t.category === filterCategory);
        }

        if (filterDateFrom) {
            filtered = filtered.filter(t => t.date >= filterDateFrom);
        }

        if (filterDateTo) {
            filtered = filtered.filter(t => t.date <= filterDateTo);
        }

        return filtered;
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            categories: this.categories,
            monthlyBudget: this.monthlyBudget,
            exportDate: new Date().toISOString(),
            summary: {
                totalIncome: this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                totalExpenses: this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                transactionCount: this.transactions.length
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            if (confirm('This will delete all transactions, categories, and budget settings. Are you absolutely sure?')) {
                localStorage.clear();
                this.transactions = [];
                this.categories = [
                    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
                    'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
                    'Salary', 'Freelance', 'Business', 'Gifts', 'Other'
                ];
                this.monthlyBudget = 0;
                
                this.populateCategories();
                this.updateDashboard();
                this.renderTransactions();
                this.renderCategories();
                this.updateBudgetDisplay();
                
                this.showNotification('All data cleared successfully!', 'success');
            }
        }
    }

    saveData() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the expense tracker when the page loads
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new ExpenseTracker();
});