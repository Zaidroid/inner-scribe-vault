
import React from 'react';
import StatsCard from '@/components/StatsCard';
import QuickActions from '@/components/QuickActions';
import HabitCard from '@/components/HabitCard';
import AIInsightCard from '@/components/AIInsightCard';
import { Card } from '@/components/ui/card';
import { Calendar, List, User, Check } from 'lucide-react';

const Dashboard = () => {
  // Mock data - replace with real data from your storage
  const stats = [
    { title: 'Journal Entries', value: 12, icon: Calendar, trend: '+3 this week', color: 'primary' as const },
    { title: 'Habits Tracked', value: 8, icon: List, trend: '5 active', color: 'info' as const },
    { title: 'Streak Days', value: 15, icon: Check, trend: 'Personal best!', color: 'success' as const },
    { title: 'Mood Score', value: '8.2', icon: User, trend: '+1.2 vs last week', color: 'warning' as const },
  ];

  const habits = [
    { id: '1', name: 'Morning Meditation', streak: 7, completed: true, target: 1, current: 1 },
    { id: '2', name: 'Read 30 mins', streak: 5, completed: false, target: 30, current: 15 },
    { id: '3', name: 'Exercise', streak: 3, completed: true, target: 1, current: 1 },
  ];

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
    console.log('Toggle habit:', id);
    // Implement habit toggle logic
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
          <div key={index} style={{ animationDelay: `${index * 100}ms` }}>
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Habits */}
        <div className="lg:col-span-2">
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Habits</h3>
            <div className="grid gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={handleHabitToggle}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((insight, index) => (
            <AIInsightCard key={index} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
