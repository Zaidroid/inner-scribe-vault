import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Team } from './useTeams';
import type { UserBasic } from './useUsers';

export interface TeamMember extends UserBasic {
  role: 'admin' | 'member';
}

export interface TeamDetails extends Team {
  members: TeamMember[];
}

const fetchTeamDetails = async (teamId: string): Promise<TeamDetails> => {
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('*, team_members( role, profiles(*) )') // Correctly structured query
    .eq('id', teamId)
    .single();
    
  if (teamError) throw new Error('Failed to fetch team details: ' + teamError.message);

  const members: TeamMember[] = teamData.team_members.map((tm: any) => ({
    ...tm.profiles,
    role: tm.role
  })).filter(member => member.id); // Filter out potential null profiles

  const { team_members, ...restOfTeamData } = teamData;
  return { ...restOfTeamData, members };
};

export const useTeamDetails = (teamId: string | undefined) => {
  return useQuery<TeamDetails, Error>({
    queryKey: ['teamDetails', teamId],
    queryFn: () => fetchTeamDetails(teamId!),
    enabled: !!teamId, // Only run the query if teamId is available
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}; 