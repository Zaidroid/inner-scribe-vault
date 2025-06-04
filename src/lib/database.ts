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

class Database {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'SelfMasteryDB';
  private readonly DB_VERSION = 2; // Incremented for goals support

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

        // Add goals store in version 2
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
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

  async exportData(): Promise<any> {
    const [journals, habits, goals, settings] = await Promise.all([
      this.getJournalEntries(),
      this.getHabits(),
      this.getGoals(),
      this.getAllSettings(),
    ]);

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      journals,
      habits,
      goals,
      settings,
    };
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['journal_entries', 'habits', 'goals', 'settings'], 'readwrite');
      
      const stores = ['journal_entries', 'habits', 'goals', 'settings'];
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
