
-- Enum for app roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'vet');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.roles;
CREATE POLICY "Users can view their own role"
  ON public.roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.roles;
CREATE POLICY "Admins can insert roles"
  ON public.roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.roles;
CREATE POLICY "Admins can update roles"
  ON public.roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.roles;
CREATE POLICY "Admins can delete roles"
  ON public.roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-assign default 'client' role on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill: every existing user gets 'client'
INSERT INTO public.roles (user_id, role)
SELECT id, 'client' FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- Backfill: admin and vet by email
INSERT INTO public.roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@veto-care.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.roles (user_id, role)
SELECT id, 'vet' FROM auth.users WHERE email = 'vet@veto-care.com'
ON CONFLICT (user_id, role) DO NOTHING;
