
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StatsCard from '@/components/StatsCard';
import QuickActions from '@/components/QuickActions';
import HabitCard from '@/components/HabitCard';
import AIInsightCard from '@/components/AIInsightCard';
import { Card } from '@/components/ui/card';
import { useJournal, useHabits } from '@/hooks/useDatabase';
import { Calendar, List, User, Check } from 'lucide-react';

const Dashboard = () => {
  const { entries } = useJournal();
  const { habits, toggleHabit } = useHabits();
  const [moodScore, setMoodScore] = useState(0);

  useEffect(() => {
    // Calculate mood score from recent entries
    if (entries.length > 0) {
      const recentEntries = entries.slice(0, 7); // Last 7 entries
      const moodValues = { terrible: 1, bad: 2, okay: 3, good: 4, great: 5 };
      const totalMood = recentEntries.reduce((sum, entry) => {
        return sum + (moodValues[entry.mood as keyof typeof moodValues] || 3);
      }, 0);
      const avgMood = totalMood / recentEntries.length;
      setMoodScore(Math.round(avgMood * 2) / 2); // Round to nearest 0.5
    }
  }, [entries]);

  const completedHabitsToday = habits.filter(h => h.completed).length;
  const longestStreak = Math.max(...habits.map(h => h.streak), 0);
  
  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  const stats = [
    { 
      title: 'Journal Entries', 
      value: entries.length, 
      icon: Calendar, 
      trend: `+${weekEntries} this week`, 
      color: 'primary' as const 
    },
    { 
      title: 'Active Habits', 
      value: habits.length, 
      icon: List, 
      trend: `${completedHabitsToday} completed today`, 
      color: 'info' as const 
    },
    { 
      title: 'Longest Streak', 
      value: longestStreak, 
      icon: Check, 
      trend: 'Keep it up!', 
      color: 'success' as const 
    },
    { 
      title: 'Mood Score', 
      value: moodScore.toFixed(1), 
      icon: User, 
      trend: 'Based on recent entries', 
      color: 'warning' as const 
    },
  ];

  const recentHabits = habits.slice(0, 3);

  const aiInsights = [
    {
      title: 'Emotional Pattern Detected',
      summary: 'Your mood tends to improve significantly after meditation sessions. Consider increasing frequency.',
      category: 'Mood Analysis',
      confidence: 87,
    },
    {
      title: 'Productivity Peak',
      summary: 'You complete 40% more tasks on days when you journal in the morning.',
      category: 'Behavior',
      confidence: 93,
    },
  ];

  const handleHabitToggle = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      toggleHabit(id, !habit.completed, habit.target);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here's your progress overview</p>
        </div>
        <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <QuickActions />
        </motion.div>

        {/* Recent Habits */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Habits</h3>
            <div className="grid gap-4">
              {recentHabits.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No habits yet. Start building your routine!
                </div>
              ) : (
                recentHabits.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <HabitCard
                      habit={habit}
                      onToggle={handleHabitToggle}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            >
              <AIInsightCard insight={insight} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
