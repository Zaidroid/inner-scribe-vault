import React, { useState } from 'react';
import { useTeamDetails, type TeamMember } from '@/hooks/useTeamDetails';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2, Crown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import TeamInvite from './TeamInvite';
import { Separator } from '../ui/separator';

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

const removeMemberFromTeam = async ({ teamId, userId }: { teamId: string; userId: string }) => {
  const { error } = await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId);
  if (error) throw new Error('Failed to remove member: ' + error.message);
  return { success: true };
};

const updateMemberRole = async ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) => {
  const { error } = await supabase.from('team_members').update({ role }).eq('team_id', teamId).eq('user_id', userId);
  if (error) throw new Error('Failed to update role: ' + error.message);
  return { success: true };
};

export const TeamDetailsModal = ({ isOpen, onClose, teamId }: TeamDetailsModalProps) => {
  const { data: team, isLoading, error } = useTeamDetails(teamId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const currentUserRole = team?.members.find((m: TeamMember) => m.id === user?.id)?.role;
  const isCurrentUserAdmin = currentUserRole === 'admin';

  const removeMemberMutation = useMutation({
    mutationFn: removeMemberFromTeam,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Member has been removed from the team.' });
      queryClient.invalidateQueries({ queryKey: ['teamDetails', teamId] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateMemberRole,
    onSuccess: () => {
      toast({ title: 'Success', description: "Member's role has been updated." });
      queryClient.invalidateQueries({ queryKey: ['teamDetails', teamId] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        {isLoading && <LoadingSpinner />}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {team && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{team.name}</DialogTitle>
              <DialogDescription>{team.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Members ({team.members.length})</h3>
                <ul className="space-y-4">
                  {team.members.map((member: TeamMember) => (
                    <li key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{member.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{member.full_name || member.username}</p>
                           <p className="text-sm text-muted-foreground capitalize flex items-center">
                            {member.role === 'admin' && <Crown className="h-4 w-4 mr-1 text-yellow-500" />}
                            {member.role}
                          </p>
                        </div>
                      </div>
                      {isCurrentUserAdmin && user?.id !== member.id && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={member.role}
                            onValueChange={(newRole) => updateRoleMutation.mutate({ teamId: team.id, userId: member.id, role: newRole })}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => removeMemberMutation.mutate({ teamId: team.id, userId: member.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Invite Members</h3>
                <TeamInvite teamId={team.id} />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 