import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';

interface TeamInviteProps {
  teamId: string;
}

const TeamInvite = ({ teamId }: TeamInviteProps) => {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email.trim()) return;
    setIsInviting(true);
    // Placeholder for actual invite logic
    console.log(`Inviting ${email} to team ${teamId}`);
    await new Promise(res => setTimeout(res, 1000));
    setIsInviting(false);
    setEmail('');
    toast({
      title: 'Invitation Sent!',
      description: `${email} has been invited to join your team.`,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Invite new members to your team by entering their email address.
      </p>
      <div className="flex items-center gap-2">
        <Input
          type="email"
          placeholder="member@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isInviting}
        />
        <Button onClick={handleInvite} disabled={isInviting || !email}>
          {isInviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Invite</span>
        </Button>
      </div>
    </div>
  );
};

export default TeamInvite; 