import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus } from 'lucide-react';

interface InviteMemberModalProps {
  teamId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const inviteUserByEmail = async ({ teamId, email }: { teamId: string; email: string }) => {
  // In a real app, you would have a more secure way to invite users.
  // This is a simplified example.
  // 1. Find the user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    throw new Error('User with that email does not exist.');
  }

  // 2. Add them to the team_members table
  const { error: insertError } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: userData.id, role: 'member' });
  
  if (insertError) {
    throw new Error('Failed to add user to the team. They might already be a member.');
  }

  return { success: true };
};


export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ teamId, isOpen, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: inviteUserByEmail,
    onSuccess: () => {
      toast({ title: 'Success', description: 'User has been invited to the team.' });
      queryClient.invalidateQueries({ queryKey: ['teamDetails', teamId] });
      onOpenChange(false);
      setEmail('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error inviting user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({ title: "Email required", description: "Please enter an email to invite.", variant: "destructive" });
        return;
    }
    mutation.mutate({ teamId, email });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a New Member</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you want to invite to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="email">User's Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 