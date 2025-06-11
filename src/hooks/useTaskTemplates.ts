import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TaskTemplate {
  id: string;
  user_id: string;
  team_id: string | null;
  name: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  points: number | null;
}

const fetchTaskTemplates = async (): Promise<TaskTemplate[]> => {
  const { data, error } = await supabase
    .from('task_templates')
    .select('*');

  if (error) throw new Error('Failed to fetch task templates: ' + error.message);
  return data;
};

const createTaskTemplate = async (newTemplate: Omit<TaskTemplate, 'id'>): Promise<TaskTemplate> => {
  const { data, error } = await supabase
    .from('task_templates')
    .insert(newTemplate)
    .select()
    .single();
    
  if (error) throw new Error('Failed to create task template: ' + error.message);
  return data;
};


export const useTaskTemplates = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: templates = [], isLoading } = useQuery<TaskTemplate[], Error>({
    queryKey: ['taskTemplates'],
    queryFn: fetchTaskTemplates,
  });

  const createTemplateMutation = useMutation({
    mutationFn: createTaskTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplateMutation.mutateAsync,
  };
}; 