
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, List, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'New Journal Entry',
      icon: Calendar,
      action: () => navigate('/journal'),
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Add Habit',
      icon: List,
      action: () => navigate('/habits'),
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Quick Note',
      icon: Plus,
      action: () => navigate('/journal'),
      gradient: 'from-green-500 to-teal-500',
    },
    {
      label: 'Mood Check',
      icon: User,
      action: () => navigate('/journal'),
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <Card className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            onClick={action.action}
            className={`h-16 flex-col bg-gradient-to-r ${action.gradient} text-white hover:opacity-90 transition-opacity`}
          >
            <action.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
