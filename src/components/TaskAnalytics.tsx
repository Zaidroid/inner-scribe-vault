
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface TaskAnalyticsProps {
  tasks: any[];
}

const TaskAnalytics = ({ tasks }: TaskAnalyticsProps) => {
  // Calculate analytics data
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const completionRate = tasks.length > 0 ? (statusCounts.done || 0) / tasks.length * 100 : 0;

  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace('-', ' '),
    count,
    fill: {
      'todo': '#3b82f6',
      'in-progress': '#eab308',
      'review': '#8b5cf6',
      'done': '#22c55e'
    }[status] || '#6b7280'
  }));

  const priorityData = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority,
    count,
    fill: {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    }[priority] || '#6b7280'
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Completion Rate */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold">Completion Rate</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-2xl font-bold">{completionRate.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground">
              {statusCounts.done || 0}/{tasks.length}
            </span>
          </div>
          <Progress value={completionRate} className="w-full" />
        </div>
      </Card>

      {/* Overdue Tasks */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold">Overdue Tasks</h3>
        </div>
        <div className="text-2xl font-bold text-red-500">{overdueTasks}</div>
        <p className="text-sm text-muted-foreground">Need attention</p>
      </Card>

      {/* In Progress */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold">In Progress</h3>
        </div>
        <div className="text-2xl font-bold text-yellow-500">{statusCounts['in-progress'] || 0}</div>
        <p className="text-sm text-muted-foreground">Active tasks</p>
      </Card>

      {/* Total Tasks */}
      <Card className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Total Tasks</h3>
        </div>
        <div className="text-2xl font-bold">{tasks.length}</div>
        <p className="text-sm text-muted-foreground">All time</p>
      </Card>

      {/* Status Distribution Chart */}
      <Card className="glass-card p-6 col-span-1 md:col-span-2">
        <h3 className="font-semibold mb-4">Status Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Priority Distribution */}
      <Card className="glass-card p-6 col-span-1 md:col-span-2">
        <h3 className="font-semibold mb-4">Priority Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ priority, percent }) => `${priority} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default TaskAnalytics;
