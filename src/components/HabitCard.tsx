
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    streak: number;
    completed: boolean;
    target: number;
    current: number;
  };
  onToggle: (id: string) => void;
}

const HabitCard = ({ habit, onToggle }: HabitCardProps) => {
  const progress = (habit.current / habit.target) * 100;

  return (
    <Card className="glass-card p-4 hover-lift">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{habit.name}</h4>
        <Button
          size="sm"
          variant={habit.completed ? 'default' : 'outline'}
          onClick={() => onToggle(habit.id)}
          className={habit.completed ? 'bg-green-500 hover:bg-green-600' : ''}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{habit.current}/{habit.target}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Streak</span>
          <span className="font-medium text-orange-400">{habit.streak} days</span>
        </div>
      </div>
    </Card>
  );
};

export default HabitCard;
