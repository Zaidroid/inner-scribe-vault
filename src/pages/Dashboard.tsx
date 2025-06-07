
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import DashboardWidget from '@/components/Dashboard/DashboardWidget';
import WidgetSelector from '@/components/Dashboard/WidgetSelector';
import StatsCard from '@/components/StatsCard';
import GoalTracker from '@/components/GoalTracker';
import TeamInvite from '@/components/Collaboration/TeamInvite';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Target, Users, Settings } from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const Dashboard = () => {
  const { profile, loading: profileLoading } = useProfile();
  const { tasks, loading: tasksLoading } = useSupabaseTasks();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'stats', title: 'Statistics Overview', component: 'StatsOverview', position: { x: 0, y: 0 }, size: { width: 12, height: 4 } },
    { id: 'goals', title: 'Goal Tracker', component: 'GoalTracker', position: { x: 0, y: 4 }, size: { width: 6, height: 6 } },
  ]);

  const addWidget = (widget: any) => {
    const newWidget: DashboardWidget = {
      id: widget.id,
      title: widget.title,
      component: widget.component,
      position: { x: 0, y: widgets.length * 4 },
      size: { width: 6, height: 4 },
    };
    setWidgets([...widgets, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.component) {
      case 'StatsOverview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              title="Tasks Completed"
              value={profile?.total_tasks_completed || 0}
              icon={<Target className="h-6 w-6" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Experience Points"
              value={profile?.experience_points || 0}
              icon={<BarChart3 className="h-6 w-6" />}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Current Streak"
              value={profile?.streak_days || 0}
              icon={<Target className="h-6 w-6" />}
              trend={{ value: 3, isPositive: true }}
            />
          </div>
        );
      case 'GoalTracker':
        return <GoalTracker />;
      case 'TeamActivity':
        return (
          <div>
            <h4 className="font-medium mb-2">Team Collaboration</h4>
            <p className="text-sm text-muted-foreground mb-4">Connect with team members and collaborate on tasks.</p>
            <TeamInvite />
          </div>
        );
      default:
        return <div>Widget not found</div>;
    }
  };

  if (profileLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Level {profile?.level || 1} • {profile?.coins || 0} coins • {profile?.experience_points || 0} XP
          </p>
        </div>
        <WidgetSelector
          onAddWidget={addWidget}
          existingWidgets={widgets.map(w => w.id)}
        />
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Collaboration
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {widgets.map((widget) => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <DashboardWidget
                  id={widget.id}
                  title={widget.title}
                  onRemove={removeWidget}
                >
                  {renderWidget(widget)}
                </DashboardWidget>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <TeamInvite />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <DashboardWidget
            id="ai-insights"
            title="AI-Powered Insights"
          >
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Today's Recommendation</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your recent activity, consider focusing on your highest priority tasks first thing in the morning when your energy is at its peak.
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Progress Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  You've completed {tasks.filter(t => t.status === 'done').length} tasks this week. 
                  Your productivity is {tasks.length > 10 ? 'above' : 'below'} average. Keep up the great work!
                </p>
              </div>
            </div>
          </DashboardWidget>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
