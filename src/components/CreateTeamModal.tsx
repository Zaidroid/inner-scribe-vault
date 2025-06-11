import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTeamModal = ({ isOpen, onClose }: CreateTeamModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // 1. Create the new team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({ name, description, created_by: user.id })
        .select()
        .single();

      if (teamError) throw teamError;

      // 2. Add the creator as the first member (and an admin)
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({ team_id: teamData.id, user_id: user.id, role: 'admin' });
        
      if (memberError) throw memberError;

      toast({ title: 'Success!', description: 'Team created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['teams'] }); // Refetch teams list
      onClose();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create a New Team
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name</Label>
            <Input 
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Squad"
              required
            />
          </div>
          <div>
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this team's purpose?"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamModal; 