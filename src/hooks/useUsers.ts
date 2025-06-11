import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserBasic {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

const fetchUsers = async (): Promise<UserBasic[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url');

  if (error) {
    throw new Error('Failed to fetch users: ' + error.message);
  }
  return data || [];
};

export const useUsers = () => {
  return useQuery<UserBasic[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}; 