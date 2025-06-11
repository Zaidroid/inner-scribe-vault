import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  remind_at: string;
  status: string;
}

const fetchReminders = async (taskId: string): Promise<Reminder[]> => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('task_id', taskId)
    .order('remind_at', { ascending: true });

  if (error) throw new Error('Failed to fetch reminders: ' + error.message);
  return data;
};

const addReminder = async (newReminder: Omit<Reminder, 'id' | 'status'>): Promise<Reminder> => {
  const { data, error } = await supabase
    .from('reminders')
    .insert({ ...newReminder, status: 'pending' })
    .select()
    .single();
    
  if (error) throw new Error('Failed to add reminder: ' + error.message);
  return data;
};

const deleteReminder = async (reminderId: string): Promise<void> => {
  const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
  if (error) throw new Error('Failed to delete reminder: ' + error.message);
};

export const useReminders = (taskId: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: reminders = [], isLoading } = useQuery<Reminder[], Error>({
    queryKey: ['reminders', taskId],
    queryFn: () => fetchReminders(taskId!),
    enabled: !!taskId,
  });

  const addReminderMutation = useMutation({
    mutationFn: addReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', taskId] });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', taskId] });
    },
  });

  return {
    reminders,
    isLoading,
    createReminder: (remindAt: string) => {
      if (!taskId || !user) return Promise.reject('Task ID or user is missing');
      return addReminderMutation.mutateAsync({
        task_id: taskId,
        user_id: user.id,
        remind_at: remindAt,
      });
    },
    removeReminder: deleteReminderMutation.mutateAsync,
  };
}; 