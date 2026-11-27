CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
BEGIN
  IF request_role = 'service_role'
     OR session_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF (SELECT auth.uid()) IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'student';
      NEW.status := 'active';
      RETURN NEW;
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Only an administrator may change profile roles or account status'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  IF NOT public.is_brainhub_admin() THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'student';
      NEW.status := 'active';
    ELSIF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Only an administrator may change profile roles or account status'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role_changes ON public.profiles;
DROP FUNCTION IF EXISTS public.guard_profile_role_changes();

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE INSERT OR UPDATE OF role, status ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();
