
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import HabitCard from '@/components/HabitCard';
import { useHabits } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { Plus, List, Calendar } from 'lucide-react';

const Habits = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('daily');
  const [newHabitTarget, setNewHabitTarget] = useState('1');

  const { habits, loading, addHabit, toggleHabit } = useHabits();
  const { toast } = useToast();

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }

    const habit = {
      name: newHabitName,
      frequency: newHabitFrequency,
      target: parseInt(newHabitTarget),
    };
    
    try {
      await addHabit(habit);
      toast({
        title: "Habit Added",
        description: `"${newHabitName}" has been added to your habits.`,
      });
      
      // Reset form
      setNewHabitName('');
      setNewHabitTarget('1');
      setNewHabitFrequency('daily');
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add habit. Please try again.",
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
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Progress Overview */}
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
              <Progress value={weeklyProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {completedToday} out of {totalHabits} habits completed
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
              <List className="h-5 w-5 mr-2" />
              Average Streak
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Days</span>
                <span className="font-medium">{avgStreak}</span>
              </div>
              <div className="text-2xl font-bold text-primary">{avgStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep building those streaks!</p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Habit</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Habit Name</label>
                  <Input
                    placeholder="e.g., Morning meditation"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Frequency</label>
                  <Select value={newHabitFrequency} onValueChange={setNewHabitFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Target</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddHabit} className="bg-gradient-primary hover:opacity-90">
                  Add Habit
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No habits yet. Add your first habit to get started!
          </div>
        ) : (
          <AnimatePresence>
            {habits.map((habit, index) => (
              <motion.div 
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <HabitCard habit={habit} onToggle={handleHabitToggle} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default Habits;
