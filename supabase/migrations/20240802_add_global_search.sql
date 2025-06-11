-- Function for global search across tasks and teams
CREATE OR REPLACE FUNCTION global_search(search_term TEXT)
RETURNS TABLE(
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    'task' as type,
    t.title,
    t.description,
    '/tasks/' || t.id as url -- This might need adjustment depending on routing
  FROM
    public.tasks t
  WHERE
    t.title ILIKE '%' || search_term || '%' OR
    t.description ILIKE '%' || search_term || '%'
  
  UNION ALL

  SELECT
    tm.id,
    'team' as type,
    tm.name as title,
    tm.description,
    '/team/' || tm.id as url
  FROM
    public.teams tm
  WHERE
    tm.name ILIKE '%' || search_term || '%' OR
    tm.description ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql; 