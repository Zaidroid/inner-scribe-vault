-- Step 1: Drop the old, problematic functions.
-- The policies that depended on them are dropped in the preceding migration.

DROP FUNCTION IF EXISTS public.is_admin_of_team(uuid);
DROP FUNCTION IF EXISTS public.is_member_of_team(uuid);


-- Step 2: Create a new function to get a user's role in a team safely

CREATE OR REPLACE FUNCTION public.get_my_role_in_team(team_id_to_check uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
-- Set a temporary search path to prevent recursive RLS checks
SET search_path = public
AS $$
DECLARE
  my_role text;
BEGIN
  SELECT role INTO my_role
  FROM public.team_members
  WHERE team_id = team_id_to_check AND user_id = auth.uid();
  RETURN my_role;
END;
$$;


-- Step 3: Re-create policies using the new function

-- RLS Policies for team_members table
-- 1. Members can see other members of the same team.
CREATE POLICY "Allow members to view team members" ON public.team_members
AS PERMISSIVE FOR SELECT
TO authenticated
USING (public.get_my_role_in_team(team_id) IS NOT NULL);

-- 2. Admins can manage team members.
CREATE POLICY "Allow team admins to manage team members" ON public.team_members
AS PERMISSIVE FOR ALL
TO authenticated
USING (public.get_my_role_in_team(team_id) = 'admin')
WITH CHECK (public.get_my_role_in_team(team_id) = 'admin');


-- RLS Policies for tasks table
CREATE POLICY "Enable read access for team members" ON public.tasks
AS PERMISSIVE FOR SELECT
TO authenticated
USING ( team_id IS NULL OR public.get_my_role_in_team(team_id) IS NOT NULL );

-- RLS Policies for task_templates table
-- CREATE POLICY "Allow read access for team members" ON public.task_templates
-- AS PERMISSIVE FOR SELECT
-- TO authenticated
-- USING ( team_id IS NULL OR public.get_my_role_in_team(team_id) IS NOT NULL ); 