import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LazyAvatarImage } from '@/components/ui/lazy-avatar-image';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';

const ProfileSettings = () => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { addAuditLog } = useAuditLog();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })
      
      if (updateUserError) {
        throw updateUserError;
      }
      
      await addAuditLog('avatar_updated', { new_avatar_url: publicUrl });
      await refreshProfile();
      toast({ title: 'Success', description: 'Avatar updated successfully!' });

    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Profile Settings</h3>
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <LazyAvatarImage src={profile?.avatar_url} alt="User Avatar" />
          <AvatarFallback className="text-2xl">
            {profile?.full_name?.split(' ').map((n:string) => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="avatar-upload" className="font-medium">Update Avatar</Label>
          <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} className="mt-1" />
          <p className="text-xs text-muted-foreground mt-1">
            {uploading ? 'Uploading...' : 'Upload a new profile picture.'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSettings; 