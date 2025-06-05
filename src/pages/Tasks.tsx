
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { PlusCircle, Calendar, User, Flag } from 'lucide-react';
import TaskColumn from '@/components/TaskColumn';

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, loading } = useTasks();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    assignee: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-blue-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
  ];

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    
    await addTask({
      ...newTask,
      status: 'todo'
    });
    
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
    setShowAddForm(false);
  };

  const handleDragEnd = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Task Manager</h1>
          <p className="text-muted-foreground mt-1">Organize your tasks with a Kanban board</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-primary">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div>
                <Label htmlFor="task-description">Description</Label>
                <Input
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTask} className="flex-1">
                  Add Task
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(task => task.status === column.id)}
            onDragEnd={handleDragEnd}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        ))}
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.id);
          return (
            <Card key={column.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{column.title}</p>
                  <p className="text-2xl font-bold">{columnTasks.length}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Tasks;
