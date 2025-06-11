import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useRealtime = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();
      
    const teamMembersChannel = supabase
      .channel('team-members-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members', filter: `user_id=eq.${user.id}` }, (payload) => {
        // When my team memberships change, refetch my teams and my tasks
        queryClient.invalidateQueries({ queryKey: ['teams', user.id] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(teamMembersChannel);
    };
  }, [queryClient, user]);
}; 