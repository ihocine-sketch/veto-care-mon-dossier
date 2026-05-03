
ALTER TABLE public.veterinaires ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.rendez_vous ADD COLUMN IF NOT EXISTS notes_veterinaire TEXT;
ALTER TABLE public.rendez_vous ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE public.rendez_vous ADD COLUMN IF NOT EXISTS amount NUMERIC;

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own payments" ON public.payments;
CREATE POLICY "Users insert own payments" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage veterinaires
DROP POLICY IF EXISTS "Admins manage veterinaires" ON public.veterinaires;
CREATE POLICY "Admins manage veterinaires" ON public.veterinaires
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow vets to update their assigned appointments
DROP POLICY IF EXISTS "Vets update assigned rendez-vous" ON public.rendez_vous;
CREATE POLICY "Vets update assigned rendez-vous" ON public.rendez_vous
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.veterinaires v WHERE v.id = veterinaire_id AND v.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Vets view assigned rendez-vous" ON public.rendez_vous;
CREATE POLICY "Vets view assigned rendez-vous" ON public.rendez_vous
  FOR SELECT TO authenticated
  USING (
    auth.uid() = maitre_id OR
    EXISTS (SELECT 1 FROM public.veterinaires v WHERE v.id = veterinaire_id AND v.user_id = auth.uid())
  );
