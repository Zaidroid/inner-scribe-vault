import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface Profile {
  id: string;
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  experience_points: number;
  level: number;
  coins: number;
  streak_days: number;
  total_tasks_completed: number;
  last_login?: string;
  is_active: boolean;
}

const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return data;
};

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading: loading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user, // Only run the query if the user is available
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // This could be used for real-time updates to the profile if needed
  // useEffect(() => { ... });

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  return {
    profile,
    loading,
    refreshProfile,
  };
};
