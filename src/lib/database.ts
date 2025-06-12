import { encrypt, decrypt } from './encryption';
import { obsidianSync } from './obsidian';

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

interface Mutation {
  id: number;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
}

class Database {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'SelfMasteryDB';
  private readonly DB_VERSION = 5; // Incremented for dead-letter queue

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

        // Add new store for offline mutations
        if (!db.objectStoreNames.contains('mutations')) {
          const store = db.createObjectStore('mutations', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Add new store for "dead" mutations
        if (!db.objectStoreNames.contains('dead_mutations')) {
          db.createObjectStore('dead_mutations', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // Journal methods
  async saveJournalEntry(entry: JournalEntry): Promise<void> {
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const entries = await this.getRawJournalEntries();
    return Promise.all(entries.map(async (entry: any) => ({
      ...entry,
      title: await decrypt(entry.title),
      content: await decrypt(entry.content),
      tags: await Promise.all(entry.tags.map((tag: string) => decrypt(tag))),
    })));
  }

  async getRawJournalEntries(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['journal_entries'], 'readonly');
      const store = transaction.objectStore('journal_entries');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteJournalEntry(id: string): Promise<void> {
  }

  // Habit methods
  async saveHabit(habit: Habit): Promise<void> {
  }

  async getHabits(): Promise<Habit[]> {
    const habits = await this.getRawHabits();
    return Promise.all(habits.map(async (habit: any) => ({
        ...habit,
        name: await decrypt(habit.name),
        description: await decrypt(habit.description),
    })));
  }

  async getRawHabits(): Promise<any[]> {
      if (!this.db) await this.init();
      return new Promise((resolve, reject) => {
          const transaction = this.db!.transaction(['habits'], 'readonly');
          const store = transaction.objectStore('habits');
          const request = store.getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
      });
  }

  async deleteHabit(id: string): Promise<void> {
  }

  // Goal methods
  async saveGoal(goal: Goal): Promise<void> {
  }

  async getGoals(): Promise<Goal[]> {
    const goals = await this.getRawGoals();
    return Promise.all(goals.map(async g => ({...g, title: await decrypt(g.title), description: await decrypt(g.description)})));
  }

  async getRawGoals(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['goals'], 'readonly');
      const store = transaction.objectStore('goals');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteGoal(id: string): Promise<void> {
  }

  // Settings methods
  async saveSetting(key: string, value: any): Promise<void> {
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
  async saveTransaction(transaction: Transaction): Promise<void> {
  }

  async getTransactions(): Promise<any[]> {
    const transactions = await this.getRawTransactions();
    return Promise.all(transactions.map(async t => ({...t, description: await decrypt(t.description)})));
  }

  async getRawTransactions(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteTransaction(id: string): Promise<void> {
  }

  // Budget methods
  async saveBudget(budget: Budget): Promise<void> {
  }

  async getBudgets(): Promise<any[]> {
    const budgets = await this.getRawBudgets();
    return Promise.all(budgets.map(async b => ({...b, category: await decrypt(b.category)})));
  }

  async getRawBudgets(): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['budgets'], 'readonly');
        const store = transaction.objectStore('budgets');
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteBudget(id: string): Promise<void> {
  }

  // Financial Goal methods
  async saveFinancialGoal(goal: FinancialGoal): Promise<void> {
  }

  async getFinancialGoals(): Promise<FinancialGoal[]> {
    const goals = await this.getRawFinancialGoals();
    return Promise.all(goals.map(async g => ({...g, title: await decrypt(g.title)})));
  }

  async getRawFinancialGoals(): Promise<FinancialGoal[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['financial_goals'], 'readonly');
        const store = transaction.objectStore('financial_goals');
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteFinancialGoal(id: string): Promise<void> {
  }

  // Task methods
  async saveTask(task: Task): Promise<void> {
  }

  async getTasks(): Promise<Task[]> {
    const tasks = await this.getRawTasks();
    return Promise.all(tasks.map(async t => ({...t, title: await decrypt(t.title), description: await decrypt(t.description)})));
  }

  async getRawTasks(): Promise<Task[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['tasks'], 'readonly');
        const store = transaction.objectStore('tasks');
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteTask(id: string): Promise<void> {
  }

  async exportData(): Promise<any> {
    if (!this.db) await this.init();
    const stores = ['journal_entries', 'habits', 'goals', 'transactions', 'budgets', 'financial_goals', 'tasks', 'settings'];
    const data: { [key: string]: any[] } = {};

    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(stores, 'readonly');
        transaction.onerror = () => reject(transaction.error);
        
        let completed = 0;
        stores.forEach(storeName => {
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => {
                data[storeName] = request.result;
                completed++;
                if (completed === stores.length) {
                    resolve(data);
                }
            };
        });
    });
  }

  async importData(data: { [key: string]: any[] }): Promise<void> {
    if (!this.db) await this.init();
    await this.clearAllData(); // Clear old data before import
    
    const stores = Object.keys(data);

    return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(stores, 'readwrite');
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();

        stores.forEach(storeName => {
            const store = transaction.objectStore(storeName);
            data[storeName].forEach(item => {
                store.put(item);
            });
        });
    });
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
