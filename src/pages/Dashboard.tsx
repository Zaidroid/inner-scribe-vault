
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
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, Users, Settings, Sparkles, TrendingUp, Calendar, Clock } from 'lucide-react';

interface DashboardWidget {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Tasks Completed"
              value={profile?.total_tasks_completed || 0}
              icon={Target}
              trend="+12% from last week"
            />
            <StatsCard
              title="Experience Points"
              value={profile?.experience_points || 0}
              icon={BarChart3}
              trend="+8% from last week"
            />
            <StatsCard
              title="Current Streak"
              value={profile?.streak_days || 0}
              icon={Target}
              trend="+3 days this week"
            />
          </div>
        );
      case 'GoalTracker':
        return <GoalTracker />;
      case 'TeamActivity':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Team Collaboration</h4>
              <Badge variant="secondary" className="ml-auto">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect with team members and collaborate on tasks to achieve your goals together.
            </p>
            <TeamInvite />
          </div>
        );
      default:
        return <div>Widget not found</div>;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getLevelProgress = () => {
    const currentXP = profile?.experience_points || 0;
    const currentLevel = profile?.level || 1;
    const xpForNextLevel = currentLevel * 100;
    const progress = (currentXP % 100) / 100 * 100;
    return { progress, xpForNextLevel };
  };

  if (profileLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const { progress, xpForNextLevel } = getLevelProgress();

  return (
    <motion.div 
      className="space-y-8 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.h1 
                className="text-4xl font-bold gradient-text"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {getGreeting()}, {profile?.full_name || 'User'}!
              </motion.h1>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Level {profile?.level || 1}
                </Badge>
                <span className="text-sm">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{profile?.coins || 0}</span>
                  <span className="text-xs">coins</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {profile?.experience_points || 0} / {xpForNextLevel} XP
                </span>
              </div>
            </div>
          </div>
          
          <motion.div variants={itemVariants}>
            <WidgetSelector
              onAddWidget={addWidget}
              existingWidgets={widgets.map(w => w.id)}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Sparkles className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {widgets.map((widget, index) => (
                <motion.div
                  key={widget.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1,
                    layout: { duration: 0.3 }
                  }}
                  whileHover={{ y: -2 }}
                  className="hover-lift"
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

          <TabsContent value="collaboration" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <DashboardWidget
                id="collaboration-main"
                title="Team Collaboration Hub"
              >
                <TeamInvite />
              </DashboardWidget>
            </motion.div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <DashboardWidget
                id="ai-insights"
                title="AI-Powered Insights"
              >
                <div className="space-y-6">
                  <motion.div 
                    className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          Today's Recommendation
                          <Badge variant="secondary" className="text-xs">AI</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Based on your recent activity patterns, consider focusing on your highest priority tasks first thing in the morning when your energy and focus are at their peak.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          Progress Analysis
                          <Badge variant="secondary" className="text-xs">Weekly</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          You've completed {tasks.filter(t => t.status === 'done').length} tasks this week. 
                          Your productivity is {tasks.length > 10 ? 'above' : 'at'} average levels. 
                          {tasks.length > 10 ? 'Excellent work! ' : 'Keep building momentum! '}
                          Consider setting a stretch goal for next week.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          Optimization Tip
                          <Badge variant="secondary" className="text-xs">Smart</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Your current streak of {profile?.streak_days || 0} days shows great consistency! 
                          Try time-blocking your calendar to maintain this momentum and achieve even better results.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </DashboardWidget>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
