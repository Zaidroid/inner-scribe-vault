import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UserBasic } from './useUsers';

export interface ActivityEvent {
  id: string;
  type: string;
  metadata: any;
  created_at: string;
  user: UserBasic;
  task_id: string | null;
}

const PAGE_SIZE = 20;

const fetchActivityFeed = async ({ pageParam = 0 }): Promise<{ data: ActivityEvent[], nextPage: number | null }> => {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  
  const { data, error, count } = await supabase
    .from('activity')
    .select('*, profiles(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error('Failed to fetch activity feed: ' + error.message);
  }

  const formattedData: ActivityEvent[] = data.map((event: any) => ({
    id: event.id,
    type: event.type,
    metadata: event.metadata,
    created_at: event.created_at,
    user: event.profiles,
    task_id: event.task_id,
  }));

  const nextPage = to < (count ?? 0) -1 ? pageParam + 1 : null;

  return { data: formattedData, nextPage };
};

export const useActivityFeed = () => {
  return useInfiniteQuery({
    queryKey: ['activityFeed'],
    queryFn: fetchActivityFeed,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}; 