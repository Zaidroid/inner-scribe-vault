
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus, Copy, Users } from 'lucide-react';

const TeamInvite = () => {
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createTeam = async () => {
    if (!user || !teamName.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          created_by: user.id,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as team member
      await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: 'admin',
        });

      setInviteCode(data.invite_code);
      toast({
        title: "Team Created!",
        description: `Team "${teamName}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const joinTeam = async () => {
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    try {
      // Find team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('invite_code', inviteCode)
        .single();

      if (teamError) throw new Error('Invalid invite code');

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Already a Member",
          description: `You're already a member of ${team.name}.`,
          variant: "destructive",
        });
        return;
      }

      // Join team
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;

      toast({
        title: "Joined Team!",
        description: `You've successfully joined ${team.name}.`,
      });
      setInviteCode('');
    } catch (error) {
      console.error('Error joining team:', error);
      toast({
        title: "Error",
        description: "Failed to join team. Please check the invite code.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create Team
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>
          <Button onClick={createTeam} disabled={loading || !teamName.trim()}>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
          {inviteCode && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <Label>Invite Code</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input value={inviteCode} readOnly />
                <Button onClick={copyInviteCode} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Join Team</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
            />
          </div>
          <Button onClick={joinTeam} disabled={loading || !inviteCode.trim()}>
            Join Team
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeamInvite;
