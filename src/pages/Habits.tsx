
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import HabitCard from '@/components/HabitCard';
import { Plus, List, Calendar } from 'lucide-react';

const Habits = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState('daily');
  const [newHabitTarget, setNewHabitTarget] = useState('1');

  const habits = [
    { id: '1', name: 'Morning Meditation', streak: 7, completed: true, target: 1, current: 1 },
    { id: '2', name: 'Read 30 minutes', streak: 5, completed: false, target: 30, current: 15 },
    { id: '3', name: 'Exercise', streak: 3, completed: true, target: 1, current: 1 },
    { id: '4', name: 'Write in journal', streak: 10, completed: true, target: 1, current: 1 },
    { id: '5', name: 'Drink 8 glasses of water', streak: 2, completed: false, target: 8, current: 5 },
  ];

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const habit = {
        id: Date.now().toString(),
        name: newHabitName,
        frequency: newHabitFrequency,
        target: parseInt(newHabitTarget),
        current: 0,
        streak: 0,
        completed: false,
      };
      
      console.log('Adding habit:', habit);
      // Implement save logic to IndexedDB
      
      // Reset form
      setNewHabitName('');
      setNewHabitTarget('1');
      setNewHabitFrequency('daily');
      setShowAddForm(false);
    }
  };

  const handleHabitToggle = (id: string) => {
    console.log('Toggle habit:', id);
    // Implement habit toggle logic
  };

  const weeklyProgress = 85; // Mock data
  const monthlyProgress = 72; // Mock data

  return (
    <div className="space-y-6 animate-fade-in">
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
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Progress
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{weeklyProgress}%</span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">5 out of 7 days this week</p>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <List className="h-5 w-5 mr-2" />
            Monthly Progress
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{monthlyProgress}%</span>
            </div>
            <Progress value={monthlyProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">22 out of 30 days this month</p>
          </div>
        </Card>
      </div>

      {/* Add Habit Form */}
      {showAddForm && (
        <Card className="glass-card p-6 animate-fade-in">
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
      )}

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit, index) => (
          <div key={habit.id} style={{ animationDelay: `${index * 100}ms` }}>
            <HabitCard habit={habit} onToggle={handleHabitToggle} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Habits;
