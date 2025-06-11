-- MIGRATION: 20240731_consolidate_features.sql
-- This migration consolidates several features and fixes into one file to resolve timestamp conflicts.

--
-- ===== 1. Comments Feature =====
--
-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
-- Trigger for updated_at
CREATE TRIGGER on_comments_updated
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- RLS Policies for comments table
-- 1.1. Read access
CREATE POLICY "Allow read access on tasks for team members" ON public.comments
AS PERMISSIVE FOR SELECT TO authenticated USING (
  public.is_member_of_team((SELECT team_id FROM public.tasks WHERE id = task_id))
);
-- 1.2. Insert access
CREATE POLICY "Allow insert access for team members" ON public.comments
AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (
  public.is_member_of_team((SELECT team_id FROM public.tasks WHERE id = task_id))
);
-- 1.3. Update access
CREATE POLICY "Allow update for comment owner" ON public.comments
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- 1.4. Delete access
CREATE POLICY "Allow delete for comment owner" ON public.comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

--
-- ===== 2. Activity Feed Feature =====
--
-- Create activity table
CREATE TABLE public.activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
-- Add index
CREATE INDEX idx_activity_team_id ON public.activity(team_id);
-- RLS Policy for activity table
CREATE POLICY "Allow read access for team members" ON public.activity
AS PERMISSIVE FOR SELECT TO authenticated USING ( public.is_member_of_team(team_id) );
-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(p_team_id UUID, p_user_id UUID, p_task_id UUID, p_type TEXT, p_metadata JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO public.activity (team_id, user_id, task_id, type, metadata)
  VALUES (p_team_id, p_user_id, p_task_id, p_type, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--
-- ===== 3. Activity Feed Triggers =====
--
-- 3.1. On Task Creation
CREATE OR REPLACE FUNCTION public.handle_task_created_activity()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_activity(NEW.team_id, NEW.user_id, NEW.id, 'task.created', jsonb_build_object('title', NEW.title));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_task_created_activity
  AFTER INSERT ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_task_created_activity();

-- 3.2. On Task Status Change
CREATE OR REPLACE FUNCTION public.handle_task_updated_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.log_activity(NEW.team_id, auth.uid(), NEW.id, 'task.status.changed',
      jsonb_build_object('title', NEW.title, 'old_status', OLD.status, 'new_status', NEW.status));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_task_updated_activity
  AFTER UPDATE ON public.tasks FOR EACH ROW EXECUTE PROCEDURE public.handle_task_updated_activity();

-- 3.3. On Comment Creation
CREATE OR REPLACE FUNCTION public.handle_comment_created_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_team_id UUID;
  v_task_title TEXT;
BEGIN
  SELECT team_id, title INTO v_team_id, v_task_title FROM public.tasks WHERE id = NEW.task_id;
  PERFORM public.log_activity(v_team_id, NEW.user_id, NEW.task_id, 'comment.created',
    jsonb_build_object('task_title', v_task_title, 'comment_preview', left(NEW.content, 50)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_comment_created_activity
  AFTER INSERT ON public.comments FOR EACH ROW EXECUTE PROCEDURE public.handle_comment_created_activity();

--
-- ===== 4. Team Creation RLS Fix =====
--
-- This policy allows the creator of a team to add members to it.
CREATE POLICY "Allow team creators to insert members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND created_by = auth.uid()));

--
-- ===== 5. Reminders Feature =====
--
-- Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, error
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
-- Add indexes
CREATE INDEX idx_reminders_task_id ON public.reminders(task_id);
CREATE INDEX idx_reminders_status_remind_at ON public.reminders(status, remind_at);
-- RLS Policy for reminders table
CREATE POLICY "Allow full access for task owners and team members"
ON public.reminders
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  public.is_member_of_team((SELECT team_id FROM public.tasks WHERE id = task_id))
); 