-- This function is triggered when a new user signs up.
-- It creates a corresponding row in the public.profiles table.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'email');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This trigger calls the function after a new user is created.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS POLICIES --

-- Enable RLS for all relevant tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- This function runs with the permissions of the definer, bypassing RLS and breaking recursion.
CREATE OR REPLACE FUNCTION public.is_member_of_team(team_id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = team_id_to_check AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for 'tasks' table
CREATE POLICY "Enable all access for users based on user_id" ON public.tasks
AS PERMISSIVE FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for team members" ON public.tasks
AS PERMISSIVE FOR SELECT
TO authenticated
USING ( team_id IS NOT NULL AND public.is_member_of_team(team_id) );


-- Policies for 'team_members' table
CREATE POLICY "Enable read access for members of the team" ON public.team_members
AS PERMISSIVE FOR SELECT
TO authenticated
USING ( public.is_member_of_team(team_id) ); 