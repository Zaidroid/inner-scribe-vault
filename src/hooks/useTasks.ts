
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';

export const useTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const taskList = await db.getTasks();
      setTasks(taskList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (task: any) => {
    try {
      await db.saveTask({
        ...task,
        id: Date.now().toString(),
        dependencies: task.dependencies || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await loadTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    try {
      const tasks = await db.getTasks();
      const task = tasks.find(t => t.id === id);
      if (task) {
        const updatedTask = {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        await db.saveTask(updatedTask);
        await loadTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Remove this task from any dependencies
      const allTasks = await db.getTasks();
      const tasksToUpdate = allTasks.filter(task => 
        task.dependencies && task.dependencies.includes(id)
      );

      for (const task of tasksToUpdate) {
        const updatedDependencies = task.dependencies.filter((depId: string) => depId !== id);
        await db.saveTask({
          ...task,
          dependencies: updatedDependencies,
          updatedAt: new Date().toISOString()
        });
      }

      await db.deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks: loadTasks,
  };
};
