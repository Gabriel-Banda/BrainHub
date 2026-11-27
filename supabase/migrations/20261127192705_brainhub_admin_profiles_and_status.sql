ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_status_check
      CHECK (status IN ('active', 'suspended'));
  END IF;
END
$$;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'lecturer', 'ambassador', 'admin'));

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.is_brainhub_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION private.is_brainhub_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_brainhub_admin() TO authenticated;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view profiles" ON public.profiles;
CREATE POLICY "Users and admins can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR (SELECT private.is_brainhub_admin())
);

DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.profiles;
CREATE POLICY "Users and admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR (SELECT private.is_brainhub_admin())
)
WITH CHECK (
  (SELECT auth.uid()) = id
  OR (SELECT private.is_brainhub_admin())
);

CREATE OR REPLACE FUNCTION public.guard_profile_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    IF request_role NOT IN ('service_role', 'postgres', 'supabase_admin')
       AND NOT EXISTS (
         SELECT 1
         FROM public.profiles AS actor
         WHERE actor.id = (SELECT auth.uid())
           AND actor.role = 'admin'
       )
    THEN
      RAISE EXCEPTION 'Only an administrator may change profile roles or account status'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role_changes ON public.profiles;
CREATE TRIGGER trg_guard_profile_role_changes
BEFORE UPDATE OF role, status ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_profile_role_changes();

REVOKE EXECUTE ON FUNCTION public.guard_profile_role_changes() FROM PUBLIC, anon, authenticated;
