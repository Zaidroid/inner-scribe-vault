
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';

export const useJournal = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      const journalEntries = await db.getJournalEntries();
      setEntries(journalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: any) => {
    try {
      await db.saveJournalEntry({
        ...entry,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      });
      await loadEntries();
    } catch (error) {
      console.error('Failed to save journal entry:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await db.deleteJournalEntry(id);
      await loadEntries();
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return { entries, loading, addEntry, deleteEntry, refreshEntries: loadEntries };
};

export const useHabits = () => {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = async () => {
    try {
      const habitList = await db.getHabits();
      setHabits(habitList);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habit: any) => {
    try {
      await db.saveHabit({
        ...habit,
        id: Date.now().toString(),
        current: 0,
        streak: 0,
        completed: false,
        createdAt: new Date().toISOString(),
        completions: [],
      });
      await loadHabits();
    } catch (error) {
      console.error('Failed to save habit:', error);
    }
  };

  const toggleHabit = async (id: string, completed: boolean, value: number = 1) => {
    try {
      await db.updateHabitCompletion(id, completed, value);
      await loadHabits();
    } catch (error) {
      console.error('Failed to update habit:', error);
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await db.deleteHabit(id);
      await loadHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  return { habits, loading, addHabit, toggleHabit, deleteHabit, refreshHabits: loadHabits };
};
