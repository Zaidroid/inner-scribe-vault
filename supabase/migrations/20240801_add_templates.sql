-- Create task_templates table
CREATE TABLE public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX idx_task_templates_user_id ON public.task_templates(user_id);
CREATE INDEX idx_task_templates_team_id ON public.task_templates(team_id);


-- RLS Policies for task_templates table

-- Users can manage their own templates.
CREATE POLICY "Allow full access for owner"
ON public.task_templates
AS PERMISSIVE FOR ALL
TO authenticated
USING ( auth.uid() = user_id );

-- Team members can view templates for their team.
CREATE POLICY "Allow read access for team members"
ON public.task_templates
AS PERMISSIVE FOR SELECT
TO authenticated
USING ( team_id IS NOT NULL AND public.is_member_of_team(team_id) ); 