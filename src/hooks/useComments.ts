import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserBasic } from './useUsers';

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: UserBasic;
}

const fetchComments = async (taskId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, profiles(*)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch comments: ' + error.message);
  }

  return data.map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    user: comment.profiles,
  }));
};

export const useComments = (taskId: string | undefined) => {
  return useQuery<Comment[], Error>({
    queryKey: ['comments', taskId],
    queryFn: () => fetchComments(taskId!),
    enabled: !!taskId,
  });
}; 