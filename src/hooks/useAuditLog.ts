import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface LogData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const addAuditLog = async (eventType: string, metadata?: LogData) => {
    try {
      if (!user) {
        return;
      }

      const { error } = await supabase.from('audit_logs').insert([
        {
          user_id: user.id,
          event_type: eventType,
          metadata: metadata || {},
        },
      ]);

      if (error) {
        console.error('Error adding audit log:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to add audit log:', error);
    }
  };

  return { addAuditLog };
}; 