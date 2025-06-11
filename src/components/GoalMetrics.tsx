import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { db } from '@/lib/database';
import { Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// Assuming Goal interface is defined in a shared types file or here
interface Goal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  status: 'active' | 'completed' | 'paused';
}

const COLORS = ['#0088FE', '#E0E0E0'];

const GoalMetrics = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    loadGoals();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalProgress = goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0;
  
  const progressData = [
    { name: 'Completed', value: totalProgress },
    { name: 'Remaining', value: 100 - totalProgress },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center">
        <Target className="h-5 w-5 mr-2" />
        Goal Progress Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {progressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-current">
                {`${Math.round(totalProgress)}%`}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-medium">Active Goals</h4>
          {activeGoals.length > 0 ? (
            activeGoals.map(goal => (
              <div key={goal.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {`${Math.round((goal.currentValue / goal.targetValue) * 100)}%`}
                  </span>
                </div>
                <Progress value={(goal.currentValue / goal.targetValue) * 100} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No active goals.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GoalMetrics; 