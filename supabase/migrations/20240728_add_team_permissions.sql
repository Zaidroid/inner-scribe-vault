-- Function to check if the current user is an admin of a specific team.
-- This runs with the permissions of the user calling it.
CREATE OR REPLACE FUNCTION public.is_admin_of_team(team_id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_id_to_check
      AND user_id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Policies for 'team_members' table

-- 1. Allow admins to do anything.
CREATE POLICY "Allow full access for team admins" ON public.team_members
AS PERMISSIVE FOR ALL
TO authenticated
USING ( public.is_admin_of_team(team_id) )
WITH CHECK ( public.is_admin_of_team(team_id) );

-- 2. Allow members to view other members of the same team.
-- (This is already covered by the is_member_of_team check from the previous migration,
-- but we'll make it explicit here for clarity)
CREATE POLICY "Allow read access for members" ON public.team_members
AS PERMISSIVE FOR SELECT
TO authenticated
USING ( public.is_member_of_team(team_id) ); 