
import { useSupabaseTasks } from './useSupabaseTasks';

// Re-export the Supabase tasks hook to maintain backward compatibility
// This allows existing components to continue working without changes
export const useTasks = useSupabaseTasks;
