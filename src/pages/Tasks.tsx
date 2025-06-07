
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, Kanban } from 'lucide-react';
import TaskColumn from '@/components/TaskColumn';
import TaskAnalytics from '@/components/TaskAnalytics';
import TaskEditModal from '@/components/TaskEditModal';
import TaskForm from '@/components/TaskForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assignee?: string;
  dependencies?: string[];
  points?: number;
  coins?: number;
  team_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Tasks = () => {
  const { tasks, loading, addTask, updateTask, deleteTask } = useSupabaseTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const columns = [
    { id: 'todo' as const, title: 'To Do', color: 'bg-blue-500' },
    { id: 'in-progress' as const, title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review' as const, title: 'Review', color: 'bg-purple-500' },
    { id: 'done' as const, title: 'Done', color: 'bg-green-500' },
  ];

  const handleDragEnd = (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Validate status
    const validStatuses: Task['status'][] = ['todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(newStatus as Task['status'])) {
      console.error('Invalid status:', newStatus);
      return;
    }

    // Check dependencies before allowing move to "done"
    if (newStatus === 'done' && task.dependencies && task.dependencies.length > 0) {
      const incompleteDependencies = task.dependencies.filter(depId => {
        const depTask = tasks.find(t => t.id === depId);
        return depTask && depTask.status !== 'done';
      });

      if (incompleteDependencies.length > 0) {
        alert('Cannot move to Done: some dependencies are not completed yet.');
        return;
      }
    }

    updateTask(taskId, { status: newStatus as Task['status'] });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (taskId: string, updates: Partial<Task>) => {
    updateTask(taskId, updates);
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Organize and track your tasks with our Kanban board
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="board" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Board View
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
                onDragEnd={handleDragEnd}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <TaskAnalytics tasks={tasks} />
        </TabsContent>
      </Tabs>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={addTask}
      />

      <TaskEditModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleEditSave}
        allTasks={tasks}
      />
    </div>
  );
};

export default Tasks;
