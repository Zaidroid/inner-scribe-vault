import React, { useState } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const RemindersManager = ({ taskId }: { taskId: string }) => {
  const { reminders, isLoading, createReminder, removeReminder } = useReminders(taskId);
  const [newReminderDate, setNewReminderDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddReminder = async () => {
    if (!newReminderDate) {
      toast({ title: 'Date required', description: 'Please select a date and time.', variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    try {
      await createReminder(new Date(newReminderDate).toISOString());
      setNewReminderDate('');
      toast({ title: 'Success', description: 'Reminder added successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveReminder = async (reminderId: string) => {
    try {
      await removeReminder(reminderId);
      toast({ title: 'Success', description: 'Reminder removed.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Reminders
      </h3>
      
      <div className="space-y-2">
        <Label htmlFor="reminder-date">Add a new reminder</Label>
        <div className="flex items-center gap-2">
          <Input
            id="reminder-date"
            type="datetime-local"
            value={newReminderDate}
            onChange={(e) => setNewReminderDate(e.target.value)}
          />
          <Button onClick={handleAddReminder} disabled={isAdding}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading && <p>Loading reminders...</p>}
        {reminders.map(reminder => (
          <div key={reminder.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <p className="text-sm">
              {format(new Date(reminder.remind_at), "PPP 'at' p")}
            </p>
            <Button variant="ghost" size="icon" onClick={() => handleRemoveReminder(reminder.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {!isLoading && reminders.length === 0 && (
          <p className="text-sm text-muted-foreground">No reminders set for this task.</p>
        )}
      </div>
    </div>
  );
}; 