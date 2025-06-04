
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { X, Save, Target } from 'lucide-react';

interface HabitFormProps {
  onSave: (habit: any) => void;
  onCancel: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [target, setTarget] = useState('1');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }

    const habit = {
      name: name.trim(),
      frequency,
      target: parseInt(target),
    };

    onSave(habit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Target className="h-5 w-5 mr-2" />
              New Habit
            </h3>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label htmlFor="habit-name" className="block text-sm font-medium mb-2">
              Habit Name
            </label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink water, Exercise, Read..."
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium mb-2">
              Frequency
            </label>
            <Select value={frequency} onValueChange={setFrequency}>
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
            <label htmlFor="target" className="block text-sm font-medium mb-2">
              Target (per {frequency.slice(0, -2)})
            </label>
            <Input
              id="target"
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90">
              <Save className="h-4 w-4 mr-2" />
              Create Habit
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default HabitForm;
