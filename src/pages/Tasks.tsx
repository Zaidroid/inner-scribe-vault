import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, Kanban, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import TaskColumn from '@/components/TaskColumn';
import TaskAnalytics from '@/components/TaskAnalytics';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSupabaseTasks, Task } from '@/hooks/useSupabaseTasks';
import { useHotkeys } from '@/hooks/useHotkeys';
import { TemplateSelectionModal } from '@/components/TemplateSelectionModal';
import { type TaskTemplate } from '@/hooks/useTaskTemplates';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useModalStore } from '@/hooks/useModalStore';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Tasks = () => {
  const { tasks, loading, addTask, updateTask, deleteTask } = useSupabaseTasks();
  const openModal = useModalStore((state) => state.openModal);
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);

  const events = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter(task => task.due_date)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.due_date!),
        end: new Date(task.due_date!),
        resource: task,
      }));
  }, [tasks]);

  const handleSelectEvent = (event: any) => {
    openModal('TaskForm', { task: event.resource });
  };
  
  const handleOpenForm = (task: Task | null) => {
    openModal('TaskForm', { task });
  };
  
  const handleOpenNewTaskModal = () => {
    openModal('TaskForm');
  };

  const handleSelectTemplate = (template: TaskTemplate) => {
    openModal('TaskForm', {
      task: {
        title: template.name,
        description: template.description,
        priority: template.priority,
        points: template.points,
        team_id: template.team_id,
      }
    });
  };

  useHotkeys({
    'Cmd+T': useCallback(() => handleOpenNewTaskModal(), []),
    'Ctrl+T': useCallback(() => handleOpenNewTaskModal(), []),
  });

  const columns = [
    { id: 'todo' as const, title: 'To Do', color: 'bg-blue-500' },
    { id: 'in-progress' as const, title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review' as const, title: 'Review', color: 'bg-purple-500' },
    { id: 'done' as const, title: 'Done', color: 'bg-green-500' },
  ];

  const handleDragEnd = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Organize, track, and visualize your tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button onClick={() => setTemplateModalOpen(true)} variant="outline">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Create from Template
          </Button> */}
          <Button onClick={handleOpenNewTaskModal}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="board" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Board View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={tasks.filter(task => task.status === column.id)}
                isLoading={loading}
                onDragEnd={handleDragEnd as any}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onTaskClick={(task) => handleOpenForm(task)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
           <div className="h-[75vh] bg-card p-4 rounded-lg mt-4">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={handleSelectEvent}
            />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <TaskAnalytics tasks={tasks} />
        </TabsContent>
      </Tabs>

      {/* <TemplateSelectionModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      /> */}
    </div>
  );
};

export default Tasks;
