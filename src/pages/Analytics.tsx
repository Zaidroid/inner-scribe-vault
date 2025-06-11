import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { BrainCircuit, FileText } from 'lucide-react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { useJournal } from '@/hooks/useDatabase';
import { processTaskDataForChart, processMoodDataForChart, processTaskPriorityForChart, processJournalForHeatmap, processMoodTrendForChart } from '@/lib/analytics';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReportGenerator from '@/components/ReportGenerator';
import ExportButtons from '@/components/ExportButtons';
import { isWithinInterval } from 'date-fns';
import JournalHeatmap from '@/components/JournalHeatmap';
import GoalMetrics from '@/components/GoalMetrics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const ReportDisplay = ({ reportData }) => {
  if (!reportData) return null;

  return (
    <Card className="p-6 mt-6">
      <h3 className="font-semibold mb-4">Generated Report</h3>
      {reportData.tasks.length === 0 && reportData.journalEntries.length === 0 ? (
        <p className="text-muted-foreground">No data found for the selected criteria.</p>
      ) : (
        <div className="space-y-4">
          {reportData.tasks.length > 0 && (
            <div>
              <h4 className="font-medium">Tasks</h4>
              <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                {reportData.tasks.map(task => <li key={task.id}>{task.title} (Status: {task.status})</li>)}
              </ul>
            </div>
          )}
          {reportData.journalEntries.length > 0 && (
            <div>
              <h4 className="font-medium">Journal Entries</h4>
              <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                {reportData.journalEntries.map(entry => <li key={entry.id}>{entry.title} (Mood: {entry.mood})</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const Analytics = () => {
  const { tasks, loading: tasksLoading } = useSupabaseTasks();
  const { entries, loading: journalLoading } = useJournal();
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = (options) => {
    const { startDate, endDate, includeTasks, includeJournal } = options;

    const filteredTasks = includeTasks ? tasks.filter(task => {
      if (!startDate || !endDate) return true;
      return isWithinInterval(new Date(task.created_at), { start: startDate, end: endDate });
    }) : [];

    const filteredJournal = includeJournal ? entries.filter(entry => {
      if (!startDate || !endDate) return true;
      return isWithinInterval(new Date(entry.date), { start: startDate, end: endDate });
    }) : [];

    setReportData({ tasks: filteredTasks, journalEntries: filteredJournal });
  };

  const taskChartData = processTaskDataForChart(tasks);
  const moodChartData = processMoodDataForChart(entries);
  const priorityChartData = processTaskPriorityForChart(tasks);
  const heatmapData = processJournalForHeatmap(entries);
  const moodTrendData = processMoodTrendForChart(entries);

  if (tasksLoading || journalLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Analyzing your data..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
          <BrainCircuit />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Visualize your progress and gain insights into your habits.</p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Report Generator
        </h3>
        <div className="space-y-4">
          <ReportGenerator onGenerate={handleGenerateReport} />
          <ExportButtons reportData={reportData} />
        </div>
      </Card>
      
      <ReportDisplay reportData={reportData} />
      
      <div className="mt-6">
        <JournalHeatmap data={heatmapData} />
      </div>
      
      <div className="mt-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Mood Over Time</h3>
          {moodTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 5]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="dailyAverage" name="Daily Average" stroke="#8884d8" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="movingAverage" name="7-Day Trend" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Not enough journal data to display trend analysis.</p>
            </div>
          )}
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Task Completion Trends</h3>
          {taskChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" fill="#8884d8" name="Tasks Created" />
                <Bar dataKey="completed" fill="#82ca9d" name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Not enough task data to display chart.</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Mood Distribution</h3>
          {moodChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={moodChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {moodChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Not enough journal data to display chart.</p>
            </div>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Task Priority Distribution</h3>
          {priorityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={priorityChartData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  fill="#8884d8" 
                  paddingAngle={5}
                  label
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">Not enough task data to display chart.</p>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <GoalMetrics />
      </div>
    </motion.div>
  );
};

export default Analytics; 