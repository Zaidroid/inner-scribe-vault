
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/database';
import { Target, Plus, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'career' | 'personal' | 'financial' | 'relationships';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

const GOAL_CATEGORIES = [
  { value: 'health', label: 'Health & Fitness', emoji: '💪' },
  { value: 'career', label: 'Career & Skills', emoji: '💼' },
  { value: 'personal', label: 'Personal Growth', emoji: '🌱' },
  { value: 'financial', label: 'Financial', emoji: '💰' },
  { value: 'relationships', label: 'Relationships', emoji: '❤️' },
];

const PRIORITY_COLORS = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal' as Goal['category'],
    targetValue: 1,
    unit: '',
    deadline: '',
    priority: 'medium' as Goal['priority'],
  });
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await db.getGoals();
      setGoals(savedGoals || []);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a goal title.",
        variant: "destructive"
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      currentValue: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.saveGoal(goal);
      setGoals(prev => [...prev, goal]);
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        targetValue: 1,
        unit: '',
        deadline: '',
        priority: 'medium',
      });
      setShowAddForm(false);
      toast({
        title: "Goal Added",
        description: `"${goal.title}" has been added to your goals.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      currentValue: Math.min(newValue, goal.targetValue),
      status: newValue >= goal.targetValue ? 'completed' as const : goal.status,
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.saveGoal(updatedGoal);
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      
      if (updatedGoal.status === 'completed' && goal.status !== 'completed') {
        toast({
          title: "Goal Completed! 🎉",
          description: `Congratulations on achieving "${goal.title}"!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal progress.",
        variant: "destructive"
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await db.deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast({
        title: "Goal Deleted",
        description: "The goal has been removed."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal.",
        variant: "destructive"
      });
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const overallProgress = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Goal Tracker
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set and track your personal goals
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">{activeGoals.length}</div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{completedGoals.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-400">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 border border-primary/20 rounded-lg"
            >
              <h4 className="font-medium mb-4">Add New Goal</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Run a marathon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select value={newGoal.category} onValueChange={(value: Goal['category']) => 
                    setNewGoal(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.emoji} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Value</label>
                  <Input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <Input
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g., km, books, hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <Select value={newGoal.priority} onValueChange={(value: Goal['priority']) => 
                    setNewGoal(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <Input
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about this goal..."
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={addGoal} className="bg-gradient-primary hover:opacity-90">
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No goals yet. Start by adding your first goal!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.currentValue / goal.targetValue) * 100;
              const category = GOAL_CATEGORIES.find(c => c.value === goal.category);
              const isOverdue = new Date(goal.deadline) < new Date() && goal.status !== 'completed';
              
              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          <Badge variant="outline" className={PRIORITY_COLORS[goal.priority]}>
                            {goal.priority}
                          </Badge>
                          {goal.status === 'completed' && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="destructive">
                              <Clock className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{category?.emoji} {category?.label}</span>
                          {goal.deadline && (
                            <span>📅 {new Date(goal.deadline).toLocaleDateString()}</span>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-mono">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(progress)}% complete
                        </span>
                        {goal.status !== 'completed' && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-20 h-7 text-xs"
                              placeholder="Update"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const value = parseFloat(e.currentTarget.value);
                                  if (!isNaN(value)) {
                                    updateGoalProgress(goal.id, value);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default GoalTracker;
