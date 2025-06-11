import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export interface Task {
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

const fetchTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, due_date, points, coins, created_at, updated_at, user_id, team_id, dependencies')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(convertSupabaseTask);
};

export const useSupabaseTasks = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Success!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  };

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase.from('tasks').insert([{ ...taskData, user_id: user.id }]).select().single();
      if (error) throw new Error(error.message);
      return convertSupabaseTask(data);
    },
    ...mutationOptions
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Task> }) => {
      const { data, error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return convertSupabaseTask(data);
    },
    ...mutationOptions
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    ...mutationOptions
  });

  return {
    tasks,
    loading,
    addTask: addTaskMutation.mutateAsync,
    updateTask: (id: string, updates: Partial<Task>) => updateTaskMutation.mutateAsync({ id, updates }),
    deleteTask: deleteTaskMutation.mutateAsync,
  };
};
