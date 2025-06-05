
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/hooks/useFinance';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Target, Calendar, Trash2 } from 'lucide-react';

const Finance = () => {
  const { transactions, budgets, goals, addTransaction, addBudget, addFinancialGoal, deleteTransaction, loading } = useFinance();
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense'
  });
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly'
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

  const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Education', 'Travel', 'Other'];

  // Calculate financial statistics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) return;
    
    await addTransaction({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount)
    });
    
    setNewTransaction({ description: '', amount: '', category: '', type: 'expense' });
  };

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.limit) return;
    
    await addBudget({
      ...newBudget,
      limit: parseFloat(newBudget.limit)
    });
    
    setNewBudget({ category: '', limit: '', period: 'monthly' });
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount) return;
    
    await addFinancialGoal({
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0
    });
    
    setNewGoal({ title: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text">Finance Manager</h1>
        <p className="text-muted-foreground mt-1">Track your income, expenses, and financial goals</p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-green-400">${totalIncome.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-400" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${netBalance.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-400" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="goals">Financial Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Add Transaction Form */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  placeholder="Transaction description"
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') => setNewTransaction({ ...newTransaction, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTransaction} className="self-end">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </Card>

          {/* Transactions List */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{transaction.description}</h4>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No transactions yet</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          {/* Add Budget Form */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Create Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="budget-category">Category</Label>
                <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget-limit">Budget Limit</Label>
                <Input
                  id="budget-limit"
                  type="number"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="budget-period">Period</Label>
                <Select value={newBudget.period} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setNewBudget({ ...newBudget, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddBudget} className="self-end">
                <Target className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </Card>

          {/* Budgets List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const spent = transactions
                .filter(t => t.category === budget.category && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
              const percentage = (spent / budget.limit) * 100;
              
              return (
                <Card key={budget.id} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{budget.category}</h4>
                    <Badge variant={percentage > 100 ? 'destructive' : percentage > 80 ? 'secondary' : 'default'}>
                      {budget.period}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${spent.toFixed(2)}</span>
                      <span>Limit: ${budget.limit.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of budget used
                    </p>
                  </div>
                </Card>
              );
            })}
            {budgets.length === 0 && (
              <p className="text-muted-foreground text-center py-8 col-span-full">No budgets created yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Add Financial Goal Form */}
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Create Financial Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Emergency fund"
                />
              </div>
              <div>
                <Label htmlFor="target-amount">Target Amount</Label>
                <Input
                  id="target-amount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label htmlFor="current-amount">Current Amount</Label>
                <Input
                  id="current-amount"
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <Button onClick={handleAddGoal} className="self-end">
                <Target className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </Card>

          {/* Financial Goals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100;
              const isOverdue = goal.deadline && new Date(goal.deadline) < new Date();
              
              return (
                <Card key={goal.id} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{goal.title}</h4>
                    {goal.deadline && (
                      <Badge variant={isOverdue ? 'destructive' : 'outline'}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(goal.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: ${goal.currentAmount.toFixed(2)}</span>
                      <span>Target: ${goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-gradient-primary"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}% complete • ${(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining
                    </p>
                  </div>
                </Card>
              );
            })}
            {goals.length === 0 && (
              <p className="text-muted-foreground text-center py-8 col-span-full">No financial goals set yet</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Finance;
