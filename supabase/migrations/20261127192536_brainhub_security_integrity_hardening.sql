-- Initial security and integrity hardening applied to the BrainHub project.
-- Keeps user-owned records private and protects administrative operations.

CREATE OR REPLACE FUNCTION public.guard_profile_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF request_role NOT IN ('service_role', 'postgres', 'supabase_admin')
       AND NOT EXISTS (
         SELECT 1
         FROM public.profiles AS actor
         WHERE actor.id = (SELECT auth.uid())
           AND actor.role = 'admin'
       )
    THEN
      RAISE EXCEPTION 'Only an administrator may change profile roles'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role_changes ON public.profiles;
CREATE TRIGGER trg_guard_profile_role_changes
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_role_changes();

ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = 'pg_catalog';
ALTER FUNCTION public.update_disc_timestamp() SET search_path = 'pg_catalog';

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_disc_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_profile_role_changes() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS disc_update_timestamp ON public.discussions;

CREATE OR REPLACE VIEW public.discussion_counts
WITH (security_invoker = true)
AS
SELECT page_id,
       count(*) FILTER (WHERE parent_id IS NULL) AS comment_count
FROM public.discussions
GROUP BY page_id;

DROP POLICY IF EXISTS "Users can view own discussions" ON public.discussions;
CREATE POLICY "Public can view discussions"
ON public.discussions
FOR SELECT
TO anon, authenticated
USING (true);

REVOKE ALL PRIVILEGES ON TABLE
  public.profiles,
  public.progress,
  public.bookmarks,
  public.gamification
FROM anon;

REVOKE ALL PRIVILEGES ON TABLE
  public.discussions,
  public.discussion_counts
FROM anon;
GRANT SELECT ON TABLE public.discussions, public.discussion_counts TO anon;

DROP INDEX IF EXISTS public.idx_discussions_created_at;
