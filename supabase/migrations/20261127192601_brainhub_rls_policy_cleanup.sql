CREATE OR REPLACE FUNCTION public.is_brainhub_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_brainhub_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_brainhub_admin() TO authenticated;

DROP POLICY IF EXISTS "Public can view discussions" ON public.discussions;

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users and admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.uid()) = id
  OR (SELECT public.is_brainhub_admin())
)
WITH CHECK (
  (SELECT auth.uid()) = id
  OR (SELECT public.is_brainhub_admin())
);
