-- First, drop the existing foreign key constraint
ALTER TABLE public.activity DROP CONSTRAINT IF EXISTS activity_team_id_fkey;

-- Then, add it back as nullable
ALTER TABLE public.activity ADD CONSTRAINT activity_team_id_fkey 
  FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

-- Create a function to handle task activity logging
CREATE OR REPLACE FUNCTION public.handle_task_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert activity record
  INSERT INTO public.activity (
    user_id,
    team_id,
    activity_type,
    entity_id,
    data
  ) VALUES (
    NEW.user_id,
    NEW.team_id,  -- This can be null for personal tasks
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'task.created'
      WHEN TG_OP = 'UPDATE' THEN 'task.updated'
      WHEN TG_OP = 'DELETE' THEN 'task.deleted'
    END,
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'status', NEW.status,
      'priority', NEW.priority
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_task_activity ON public.tasks;

-- Create new trigger
CREATE TRIGGER on_task_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_task_activity(); 