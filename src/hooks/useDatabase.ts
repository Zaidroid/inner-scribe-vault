
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';

export const useJournal = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      const journalEntries = await db.getJournalEntries();
      setEntries(journalEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
        createdAt: new Date().toISOString(),
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
      const habits = await db.getHabits();
      const habit = habits.find(h => h.id === id);
      if (habit) {
        const updatedHabit = {
          ...habit,
          completed,
          current: completed ? value : 0,
          streak: completed ? (habit.streak || 0) + 1 : 0,
          updatedAt: new Date().toISOString()
        };
        await db.saveHabit(updatedHabit);
        await loadHabits();
      }
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

export const useGoals = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = async () => {
    try {
      const goalList = await db.getGoals();
      setGoals(goalList);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: any) => {
    try {
      await db.saveGoal({
        ...goal,
        id: Date.now().toString(),
        currentValue: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      await loadGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const updateGoal = async (id: string, updates: any) => {
    try {
      const goals = await db.getGoals();
      const goal = goals.find(g => g.id === id);
      if (goal) {
        const updatedGoal = {
          ...goal,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await db.saveGoal(updatedGoal);
        await loadGoals();
      }
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await db.deleteGoal(id);
      await loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  return { goals, loading, addGoal, updateGoal, deleteGoal, refreshGoals: loadGoals };
};

// Combined hook for convenience
export const useDatabase = () => {
  const journal = useJournal();
  const habits = useHabits();
  const goals = useGoals();

  return {
    journalEntries: journal.entries,
    habits: habits.habits,
    goals: goals.goals,
    loading: journal.loading || habits.loading || goals.loading,
    ...journal,
    ...habits,
    ...goals
  };
};
