-- Admin-only dashboard APIs. Email addresses are sourced from auth.users
-- and are never exposed through the profiles table.

CREATE OR REPLACE FUNCTION public.admin_dashboard_overview()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR NOT (SELECT private.is_brainhub_admin()) THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'total_users', (
      SELECT count(*) FROM auth.users
    ),
    'signups_last_7d', (
      SELECT count(*) FROM auth.users
      WHERE created_at >= now() - interval '7 days'
    ),
    'total_ambassadors', (
      SELECT count(*) FROM public.profiles
      WHERE role = 'ambassador'
    ),
    'total_xp_awarded', (
      SELECT coalesce(sum(xp), 0) FROM public.gamification
    ),
    'total_docs_completed', (
      SELECT count(*) FROM public.progress
      WHERE completed IS TRUE
    ),
    'suspended_users', (
      SELECT count(*) FROM public.profiles
      WHERE status = 'suspended'
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_dashboard_signups()
RETURNS TABLE(day date, signups bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR NOT (SELECT private.is_brainhub_admin()) THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT days.day::date,
         count(users.id)::bigint AS signups
  FROM generate_series(
    current_date - 29,
    current_date,
    interval '1 day'
  ) AS days(day)
  LEFT JOIN auth.users AS users
    ON users.created_at >= days.day
   AND users.created_at < days.day + interval '1 day'
  GROUP BY days.day
  ORDER BY days.day;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search text DEFAULT NULL,
  p_role_filter text DEFAULT NULL,
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  full_name text,
  email text,
  role text,
  status text,
  university text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL
     OR NOT (SELECT private.is_brainhub_admin()) THEN
    RAISE EXCEPTION 'Administrator access required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT p.id,
         p.full_name,
         u.email::text,
         p.role,
         p.status,
         p.university,
         p.created_at
  FROM public.profiles AS p
  JOIN auth.users AS u ON u.id = p.id
  WHERE (
      nullif(trim(p_search), '') IS NULL
      OR coalesce(p.full_name, '') ILIKE '%' || trim(p_search) || '%'
      OR coalesce(u.email, '') ILIKE '%' || trim(p_search) || '%'
      OR coalesce(p.university, '') ILIKE '%' || trim(p_search) || '%'
    )
    AND (
      nullif(trim(p_role_filter), '') IS NULL
      OR p.role = trim(p_role_filter)
    )
  ORDER BY p.created_at DESC NULLS LAST
  LIMIT greatest(1, least(coalesce(p_limit, 200), 200))
  OFFSET greatest(coalesce(p_offset, 0), 0);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_dashboard_signups() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users(text, text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_signups() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text, integer, integer) TO authenticated;
