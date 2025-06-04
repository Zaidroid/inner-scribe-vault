
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { encrypt, decrypt } from './encryption';

interface SelfMasteryDB extends DBSchema {
  journal: {
    key: string;
    value: {
      id: string;
      title: string;
      content: string;
      mood: string;
      tags: string[];
      date: string;
      encrypted: boolean;
    };
  };
  habits: {
    key: string;
    value: {
      id: string;
      name: string;
      frequency: string;
      target: number;
      current: number;
      streak: number;
      completed: boolean;
      createdAt: string;
      completions: Array<{ date: string; value: number }>;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
      encrypted: boolean;
    };
  };
}

class DatabaseManager {
  private db: IDBPDatabase<SelfMasteryDB> | null = null;

  async init() {
    this.db = await openDB<SelfMasteryDB>('selfmastery', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('journal')) {
          db.createObjectStore('journal', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }

  // Journal Methods
  async saveJournalEntry(entry: any) {
    if (!this.db) await this.init();
    const encryptedEntry = {
      ...entry,
      content: encrypt(entry.content),
      encrypted: true,
    };
    return this.db!.put('journal', encryptedEntry);
  }

  async getJournalEntries() {
    if (!this.db) await this.init();
    const entries = await this.db!.getAll('journal');
    return entries.map(entry => ({
      ...entry,
      content: entry.encrypted ? decrypt(entry.content) : entry.content,
    }));
  }

  async deleteJournalEntry(id: string) {
    if (!this.db) await this.init();
    return this.db!.delete('journal', id);
  }

  // Habits Methods
  async saveHabit(habit: any) {
    if (!this.db) await this.init();
    return this.db!.put('habits', habit);
  }

  async getHabits() {
    if (!this.db) await this.init();
    return this.db!.getAll('habits');
  }

  async updateHabitCompletion(id: string, completed: boolean, value: number = 1) {
    if (!this.db) await this.init();
    const habit = await this.db!.get('habits', id);
    if (habit) {
      const today = new Date().toISOString().split('T')[0];
      const existingCompletion = habit.completions.find(c => c.date === today);
      
      if (existingCompletion) {
        existingCompletion.value = completed ? value : 0;
      } else {
        habit.completions.push({ date: today, value: completed ? value : 0 });
      }
      
      habit.completed = completed;
      habit.current = completed ? value : 0;
      
      // Update streak
      if (completed) {
        habit.streak += 1;
      } else {
        habit.streak = 0;
      }
      
      return this.db!.put('habits', habit);
    }
  }

  async deleteHabit(id: string) {
    if (!this.db) await this.init();
    return this.db!.delete('habits', id);
  }

  // Settings Methods
  async saveSetting(key: string, value: any, encrypted: boolean = true) {
    if (!this.db) await this.init();
    const settingValue = encrypted ? encrypt(value) : value;
    return this.db!.put('settings', { key, value: settingValue, encrypted });
  }

  async getSetting(key: string) {
    if (!this.db) await this.init();
    const setting = await this.db!.get('settings', key);
    if (setting) {
      return setting.encrypted ? decrypt(setting.value) : setting.value;
    }
    return null;
  }

  // Export/Import Methods
  async exportData() {
    if (!this.db) await this.init();
    const journals = await this.getJournalEntries();
    const habits = await this.getHabits();
    const settings = await this.db!.getAll('settings');
    
    return {
      journals,
      habits,
      settings: settings.map(s => ({
        key: s.key,
        value: s.encrypted ? decrypt(s.value) : s.value,
      })),
      exportDate: new Date().toISOString(),
    };
  }

  async clearAllData() {
    if (!this.db) await this.init();
    await this.db!.clear('journal');
    await this.db!.clear('habits');
    await this.db!.clear('settings');
  }
}

export const db = new DatabaseManager();
