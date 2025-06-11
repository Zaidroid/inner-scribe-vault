import React from 'react';
import { useGoalSuggester } from '@/hooks/useGoalSuggester';
import { type Task } from '@/hooks/useSupabaseTasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus } from 'lucide-react';
import { Badge } from './ui/badge';

interface GoalSuggesterProps {
  tasks: Task[] | undefined;
}

export const GoalSuggester: React.FC<GoalSuggesterProps> = ({ tasks }) => {
  const { suggestion, basedOnTasks } = useGoalSuggester(tasks);

  if (!suggestion || basedOnTasks?.length === 0) {
    return null; // Don't show the component if there's no suggestion
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Goal Suggestion
        </CardTitle>
        <CardDescription>
          Based on your recently completed tasks, here's a suggestion for a new goal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-semibold">"{suggestion}"</p>
        
        <div>
          <p className="text-sm font-medium mb-2">Based on:</p>
          <div className="flex flex-wrap gap-2">
            {basedOnTasks?.map(task => (
              <Badge key={task.id} variant="secondary">{task.title}</Badge>
            ))}
          </div>
        </div>

        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create this Goal
        </Button>
      </CardContent>
    </Card>
  );
}; 