
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import HabitForm from '@/components/HabitForm';
import HabitCard from '@/components/HabitCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useHabits } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { Plus, List, Calendar, Target, TrendingUp } from 'lucide-react';

const Habits = () => {
  const [showForm, setShowForm] = useState(false);
  const { habits, loading, addHabit, toggleHabit } = useHabits();
  const { toast } = useToast();

  const handleSaveHabit = async (habit: any) => {
    try {
      await addHabit(habit);
      setShowForm(false);
      toast({
        title: "Habit Added",
        description: `"${habit.name}" has been added to your habits.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add habit.",
        variant: "destructive",
      });
    }
  };

  const handleHabitToggle = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      await toggleHabit(id, !habit.completed, habit.target);
    }
  };

  // Calculate progress statistics
  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const weeklyProgress = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const avgStreak = totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading your habits..." />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Habits</h1>
          <p className="text-muted-foreground mt-1">Track your daily routines and build consistency</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <HabitForm
            onSave={handleSaveHabit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">{weeklyProgress}%</span>
              </div>
              <Progress value={weeklyProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedToday} of {totalHabits} habits completed
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Streak Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Streak</span>
                <span className="font-medium">{avgStreak} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Streaks</span>
                <span className="font-medium">{totalStreak} days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep building those streaks!
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Habits List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Your Habits ({habits.length})
          </h3>
          
          {habits.length === 0 ? (
            <div className="text-center py-12">
              <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No habits yet</h3>
              <p className="text-muted-foreground mb-6">
                Start building your routine by creating your first habit.
              </p>
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Habit
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {habits.map((habit, index) => (
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
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Habits;
