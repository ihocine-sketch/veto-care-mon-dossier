-- Role system: admin, client, vet
CREATE TABLE IF NOT EXISTS public.roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client', 'vet')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;
CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-assign "client" role for every new auth user.
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill existing users without a role.
INSERT INTO public.roles (user_id, role)
SELECT id, 'client'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.roles)
ON CONFLICT (user_id) DO NOTHING;

-- Roles table policies
DROP POLICY IF EXISTS "Users can read their own role" ON public.roles;
CREATE POLICY "Users can read their own role"
  ON public.roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own client role" ON public.roles;
CREATE POLICY "Users can create their own client role"
  ON public.roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'client');

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.roles;
CREATE POLICY "Admins can manage all roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.user_id = auth.uid() AND r.role = 'admin'
    )
  );

-- Map vet records to login accounts.
ALTER TABLE public.veterinaires
ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add notes field for veterinarian notes on appointments.
ALTER TABLE public.rendez_vous
ADD COLUMN IF NOT EXISTS notes_veterinaire TEXT;

-- Role helper functions for RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_veterinaire_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.veterinaires WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Rebuild veterinaires policies for role-based access
DROP POLICY IF EXISTS "Authenticated users can view veterinaires" ON public.veterinaires;
DROP POLICY IF EXISTS "Authenticated users can read veterinaires" ON public.veterinaires;
DROP POLICY IF EXISTS "Admins can manage veterinaires" ON public.veterinaires;

CREATE POLICY "Authenticated users can read veterinaires"
  ON public.veterinaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage veterinaires"
  ON public.veterinaires FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- Rebuild rendez_vous policies for admin/vet/client access
DROP POLICY IF EXISTS "Owners can view their own rendez-vous" ON public.rendez_vous;
DROP POLICY IF EXISTS "Owners can create their own rendez-vous" ON public.rendez_vous;
DROP POLICY IF EXISTS "Owners can update their own rendez-vous" ON public.rendez_vous;
DROP POLICY IF EXISTS "Owners can delete their own rendez-vous" ON public.rendez_vous;

DROP POLICY IF EXISTS "Clients can view own appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Clients can create own appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Clients can update own appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Clients can delete own appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Admins can read all appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Admins can update all appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Vets can read own appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Vets can update own appointments" ON public.rendez_vous;

CREATE POLICY "Clients can view own appointments"
  ON public.rendez_vous FOR SELECT
  TO authenticated
  USING (auth.uid() = maitre_id);

CREATE POLICY "Clients can create own appointments"
  ON public.rendez_vous FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = maitre_id);

CREATE POLICY "Clients can update own appointments"
  ON public.rendez_vous FOR UPDATE
  TO authenticated
  USING (auth.uid() = maitre_id)
  WITH CHECK (auth.uid() = maitre_id);

CREATE POLICY "Clients can delete own appointments"
  ON public.rendez_vous FOR DELETE
  TO authenticated
  USING (auth.uid() = maitre_id);

CREATE POLICY "Admins can read all appointments"
  ON public.rendez_vous FOR SELECT
  TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Admins can update all appointments"
  ON public.rendez_vous FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Vets can read own appointments"
  ON public.rendez_vous FOR SELECT
  TO authenticated
  USING (public.current_user_veterinaire_id() = veterinaire_id);

CREATE POLICY "Vets can update own appointments"
  ON public.rendez_vous FOR UPDATE
  TO authenticated
  USING (public.current_user_veterinaire_id() = veterinaire_id)
  WITH CHECK (
    public.current_user_veterinaire_id() = veterinaire_id
    AND statut IN ('en_attente', 'confirme', 'annule', 'confirmé', 'annulé')
  );
