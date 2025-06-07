
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

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

type SupabaseTask = Tables<'tasks'>;

// Helper function to convert Supabase task to our Task type
const convertSupabaseTask = (supabaseTask: SupabaseTask): Task => {
  return {
    id: supabaseTask.id,
    title: supabaseTask.title,
    description: supabaseTask.description || undefined,
    status: (supabaseTask.status as Task['status']) || 'todo',
    priority: (supabaseTask.priority as Task['priority']) || 'medium',
    due_date: supabaseTask.due_date || undefined,
    assignee: supabaseTask.assignee || undefined,
    dependencies: supabaseTask.dependencies || [],
    points: supabaseTask.points || 5,
    coins: supabaseTask.coins || 2,
    team_id: supabaseTask.team_id || undefined,
    user_id: supabaseTask.user_id,
    created_at: supabaseTask.created_at || new Date().toISOString(),
    updated_at: supabaseTask.updated_at || new Date().toISOString(),
  };
};

export const useSupabaseTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const convertedTasks = (data || []).map(convertSupabaseTask);
      setTasks(convertedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create tasks.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description || null,
          status: taskData.status,
          priority: taskData.priority,
          due_date: taskData.due_date || null,
          assignee: taskData.assignee || null,
          dependencies: taskData.dependencies || [],
          points: taskData.points || 5,
          coins: taskData.coins || 2,
          team_id: taskData.team_id || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: "Error",
          description: "Failed to create task. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const convertedTask = convertSupabaseTask(data);
      setTasks(prev => [convertedTask, ...prev]);
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description || null,
          status: updates.status,
          priority: updates.priority,
          due_date: updates.due_date || null,
          assignee: updates.assignee || null,
          dependencies: updates.dependencies || [],
          points: updates.points,
          coins: updates.coins,
          team_id: updates.team_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        toast({
          title: "Error",
          description: "Failed to update task. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const convertedTask = convertSupabaseTask(data);
      setTasks(prev => prev.map(task => 
        task.id === id ? convertedTask : task
      ));
      
      toast({
        title: "Success",
        description: "Task updated successfully!",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // First, remove this task from any dependencies
      const tasksWithDependencies = tasks.filter(task => 
        task.dependencies && task.dependencies.includes(id)
      );

      for (const task of tasksWithDependencies) {
        const updatedDependencies = task.dependencies?.filter(depId => depId !== id) || [];
        await supabase
          .from('tasks')
          .update({ 
            dependencies: updatedDependencies,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);
      }

      // Then delete the task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTasks();

    // Set up real-time subscription
    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
