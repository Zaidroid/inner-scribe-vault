import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

export type Team = Tables<'teams'>;

const fetchTeams = async (userId: string): Promise<Team[]> => {
  // First, get the team IDs the user is a member of
  const { data: teamMembers, error: teamMembersError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  if (teamMembersError) {
    throw new Error('Failed to fetch user teams: ' + teamMembersError.message);
  }

  const teamIds = teamMembers.map(member => member.team_id);

  if (teamIds.length === 0) {
    return [];
  }

  // Then, fetch the details for those teams
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds);

  if (teamsError) {
    throw new Error('Failed to fetch teams: ' + teamsError.message);
  }

  return teams || [];
};

export const useTeams = () => {
  const { user } = useAuth();

  return useQuery<Team[], Error>({
    queryKey: ['teams', user?.id],
    queryFn: () => fetchTeams(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}; 