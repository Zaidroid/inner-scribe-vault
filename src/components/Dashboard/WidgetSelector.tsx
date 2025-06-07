
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, BarChart3, Target, Calendar, DollarSign, Users } from 'lucide-react';

interface Widget {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: string;
}

const availableWidgets: Widget[] = [
  { id: 'stats', title: 'Statistics Overview', icon: BarChart3, component: 'StatsOverview' },
  { id: 'goals', title: 'Goal Tracker', icon: Target, component: 'GoalTracker' },
  { id: 'habits', title: 'Habit Progress', icon: Calendar, component: 'HabitProgress' },
  { id: 'finance', title: 'Finance Summary', icon: DollarSign, component: 'FinanceSummary' },
  { id: 'team', title: 'Team Activity', icon: Users, component: 'TeamActivity' },
];

interface WidgetSelectorProps {
  onAddWidget: (widget: Widget) => void;
  existingWidgets: string[];
}

const WidgetSelector = ({ onAddWidget, existingWidgets }: WidgetSelectorProps) => {
  const availableToAdd = availableWidgets.filter(w => !existingWidgets.includes(w.id));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableToAdd.map((widget) => (
          <DropdownMenuItem
            key={widget.id}
            onClick={() => onAddWidget(widget)}
            className="flex items-center gap-2"
          >
            <widget.icon className="h-4 w-4" />
            {widget.title}
          </DropdownMenuItem>
        ))}
        {availableToAdd.length === 0 && (
          <DropdownMenuItem disabled>
            All widgets added
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WidgetSelector;
