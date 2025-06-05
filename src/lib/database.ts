import { encrypt, decrypt } from './encryption';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  streak?: number;
  createdAt: string;
  updatedAt: string;
}

interface Setting {
  key: string;
  value: any;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'career' | 'personal' | 'financial' | 'relationships';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  createdAt: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

class Database {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'SelfMasteryDB';
  private readonly DB_VERSION = 3; // Incremented for finance and tasks support

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('journal_entries')) {
          db.createObjectStore('journal_entries', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }

        // Add new stores for finance and tasks
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('budgets')) {
          db.createObjectStore('budgets', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('financial_goals')) {
          db.createObjectStore('financial_goals', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
      };
    });
  }

  // Journal methods
  async saveJournalEntry(entry: JournalEntry): Promise<void> {
    if (!this.db) await this.init();

    const encryptedEntry = {
      ...entry,
      title: encrypt(entry.title),
      content: encrypt(entry.content),
      tags: entry.tags.map(tag => encrypt(tag)),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['journal_entries'], 'readwrite');
      const store = transaction.objectStore('journal_entries');
      const request = store.put(encryptedEntry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['journal_entries'], 'readonly');
      const store = transaction.objectStore('journal_entries');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entries = request.result.map((entry: any) => ({
          ...entry,
          title: decrypt(entry.title),
          content: decrypt(entry.content),
          tags: entry.tags.map((tag: string) => decrypt(tag)),
        }));
        resolve(entries);
      };
    });
  }

  async deleteJournalEntry(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['journal_entries'], 'readwrite');
      const store = transaction.objectStore('journal_entries');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Habit methods
  async saveHabit(habit: Habit): Promise<void> {
    if (!this.db) await this.init();

    const encryptedHabit = {
      ...habit,
      name: encrypt(habit.name),
      description: encrypt(habit.description),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      const request = store.put(encryptedHabit);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getHabits(): Promise<Habit[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['habits'], 'readonly');
      const store = transaction.objectStore('habits');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const habits = request.result.map((habit: any) => ({
          ...habit,
          name: decrypt(habit.name),
          description: decrypt(habit.description),
        }));
        resolve(habits);
      };
    });
  }

  async deleteHabit(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['habits'], 'readwrite');
      const store = transaction.objectStore('habits');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Goal methods
  async saveGoal(goal: Goal): Promise<void> {
    if (!this.db) await this.init();
    
    const encryptedGoal = {
      ...goal,
      title: encrypt(goal.title),
      description: encrypt(goal.description),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      const request = store.put(encryptedGoal);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getGoals(): Promise<Goal[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readonly');
      const store = transaction.objectStore('goals');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const goals = request.result.map((goal: any) => ({
          ...goal,
          title: decrypt(goal.title),
          description: decrypt(goal.description),
        }));
        resolve(goals);
      };
    });
  }

  async deleteGoal(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readwrite');
      const store = transaction.objectStore('goals');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Settings methods
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }

  // Transaction methods
  async saveTransaction(transaction: any): Promise<void> {
    if (!this.db) await this.init();

    const encryptedTransaction = {
      ...transaction,
      description: encrypt(transaction.description),
    };

    return new Promise((resolve, reject) => {
      const transactionDB = this.db!.transaction(['transactions'], 'readwrite');
      const store = transactionDB.objectStore('transactions');
      const request = store.put(encryptedTransaction);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTransactions(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transactions = request.result.map((transaction: any) => ({
          ...transaction,
          description: decrypt(transaction.description),
        }));
        resolve(transactions);
      };
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Budget methods
  async saveBudget(budget: any): Promise<void> {
    if (!this.db) await this.init();

    const encryptedBudget = {
      ...budget,
      category: encrypt(budget.category),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['budgets'], 'readwrite');
      const store = transaction.objectStore('budgets');
      const request = store.put(encryptedBudget);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getBudgets(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['budgets'], 'readonly');
      const store = transaction.objectStore('budgets');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const budgets = request.result.map((budget: any) => ({
          ...budget,
          category: decrypt(budget.category),
        }));
        resolve(budgets);
      };
    });
  }

  // Financial Goal methods
  async saveFinancialGoal(goal: any): Promise<void> {
    if (!this.db) await this.init();
    
    const encryptedGoal = {
      ...goal,
      title: encrypt(goal.title),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['financial_goals'], 'readwrite');
      const store = transaction.objectStore('financial_goals');
      const request = store.put(encryptedGoal);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getFinancialGoals(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['financial_goals'], 'readonly');
      const store = transaction.objectStore('financial_goals');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const goals = request.result.map((goal: any) => ({
          ...goal,
          title: decrypt(goal.title),
        }));
        resolve(goals);
      };
    });
  }

  // Task methods
  async saveTask(task: any): Promise<void> {
    if (!this.db) await this.init();

    const encryptedTask = {
      ...task,
      title: encrypt(task.title),
      description: encrypt(task.description || ''),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.put(encryptedTask);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTasks(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const tasks = request.result.map((task: any) => ({
          ...task,
          title: decrypt(task.title),
          description: decrypt(task.description || ''),
        }));
        resolve(tasks);
      };
    });
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async exportData(): Promise<any> {
    const [journals, habits, goals, settings, transactions, budgets, financialGoals, tasks] = await Promise.all([
      this.getJournalEntries(),
      this.getHabits(),
      this.getGoals(),
      this.getAllSettings(),
      this.getTransactions(),
      this.getBudgets(),
      this.getFinancialGoals(),
      this.getTasks(),
    ]);

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      journals,
      habits,
      goals,
      settings,
      transactions,
      budgets,
      financialGoals,
      tasks,
    };
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([
        'journal_entries', 'habits', 'goals', 'settings', 
        'transactions', 'budgets', 'financial_goals', 'tasks'
      ], 'readwrite');
      
      const stores = [
        'journal_entries', 'habits', 'goals', 'settings',
        'transactions', 'budgets', 'financial_goals', 'tasks'
      ];
      let completed = 0;
      
      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === stores.length) {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getAllSettings(): Promise<Setting[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  }
}

export const db = new Database();
