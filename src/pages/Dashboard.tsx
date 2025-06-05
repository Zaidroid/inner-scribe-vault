
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/hooks/useDatabase';
import { useFinance } from '@/hooks/useFinance';
import { useTasks } from '@/hooks/useTasks';
import StatsCard from '@/components/StatsCard';
import AIInsightCard from '@/components/AIInsightCard';
import QuickActions from '@/components/QuickActions';
import MeditationTimer from '@/components/MeditationTimer';
import GoalTracker from '@/components/GoalTracker';
import { Calendar, TrendingUp, Target, Brain, Timer, DollarSign, CheckSquare } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { journalEntries, habits, loading } = useDatabase();
  const { transactions, budgets } = useFinance();
  const { tasks } = useTasks();

  // Calculate stats
  const totalEntries = journalEntries.length;
  const entriesThisWeek = journalEntries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const totalHabits = habits.length;
  const completedHabits = habits.filter(habit => habit.completed).length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  const currentStreak = habits.reduce((max, habit) => Math.max(max, habit.streak || 0), 0);

  // Finance stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Task stats
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'meditation', label: 'Meditation', icon: Timer },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Brain },
  ];

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
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your personal growth at a glance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-card/50 rounded-lg border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <StatsCard
                  title="Journal Entries"
                  value={totalEntries.toString()}
                  subtitle={`${entriesThisWeek} this week`}
                  icon={Calendar}
                  trend={entriesThisWeek > 0 ? 'up' : 'neutral'}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <StatsCard
                  title="Habit Completion"
                  value={`${habitCompletionRate}%`}
                  subtitle={`${completedHabits}/${totalHabits} habits`}
                  icon={TrendingUp}
                  trend={habitCompletionRate >= 75 ? 'up' : habitCompletionRate >= 50 ? 'neutral' : 'down'}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <StatsCard
                  title="Net Balance"
                  value={`$${netBalance.toFixed(2)}`}
                  subtitle={`${transactions.length} transactions`}
                  icon={DollarSign}
                  trend={netBalance > 0 ? 'up' : netBalance < 0 ? 'down' : 'neutral'}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <StatsCard
                  title="Task Progress"
                  value={`${taskCompletionRate}%`}
                  subtitle={`${completedTasks}/${totalTasks} completed`}
                  icon={CheckSquare}
                  trend={taskCompletionRate >= 75 ? 'up' : taskCompletionRate >= 50 ? 'neutral' : 'down'}
                />
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <QuickActions />
            </motion.div>

            {/* AI Insights */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <AIInsightCard />
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'meditation' && (
          <motion.div
            key="meditation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <MeditationTimer />
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GoalTracker />
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AIInsightCard />
            
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Generate New Insights</h3>
              <p className="text-muted-foreground mb-4">
                AI analysis of your journal entries and habits to provide personalized insights for growth.
              </p>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Brain className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
