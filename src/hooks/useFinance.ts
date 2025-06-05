
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';

export const useFinance = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const transactionList = await db.getTransactions();
      setTransactions(transactionList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      const budgetList = await db.getBudgets();
      setBudgets(budgetList);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    }
  };

  const loadFinancialGoals = async () => {
    try {
      const goalList = await db.getFinancialGoals();
      setGoals(goalList);
    } catch (error) {
      console.error('Failed to load financial goals:', error);
    }
  };

  const addTransaction = async (transaction: any) => {
    try {
      await db.saveTransaction({
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      await loadTransactions();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const addBudget = async (budget: any) => {
    try {
      await db.saveBudget({
        ...budget,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      await loadBudgets();
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };

  const addFinancialGoal = async (goal: any) => {
    try {
      await db.saveFinancialGoal({
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      await loadFinancialGoals();
    } catch (error) {
      console.error('Failed to save financial goal:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await db.deleteTransaction(id);
      await loadTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadTransactions(), loadBudgets(), loadFinancialGoals()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    transactions,
    budgets,
    goals,
    loading,
    addTransaction,
    addBudget,
    addFinancialGoal,
    deleteTransaction,
    refreshTransactions: loadTransactions,
    refreshBudgets: loadBudgets,
    refreshGoals: loadFinancialGoals,
  };
};
