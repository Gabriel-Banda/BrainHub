-- Support the admin user list and ambassador filter without scanning profiles.
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc
  ON public.profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_role_created_at_desc
  ON public.profiles (role, created_at DESC);
