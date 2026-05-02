
-- Veterinaires table
CREATE TABLE public.veterinaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  specialite TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.veterinaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view veterinaires"
  ON public.veterinaires FOR SELECT
  TO authenticated
  USING (true);

-- Rendez-vous table
CREATE TABLE public.rendez_vous (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maitre_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  veterinaire_id UUID NOT NULL REFERENCES public.veterinaires(id) ON DELETE RESTRICT,
  nom_animal TEXT NOT NULL,
  espece TEXT NOT NULL,
  date_rdv TIMESTAMPTZ NOT NULL,
  motif TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  carnet_sante_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their own rendez-vous"
  ON public.rendez_vous FOR SELECT
  TO authenticated
  USING (auth.uid() = maitre_id);

CREATE POLICY "Owners can create their own rendez-vous"
  ON public.rendez_vous FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = maitre_id);

CREATE POLICY "Owners can update their own rendez-vous"
  ON public.rendez_vous FOR UPDATE
  TO authenticated
  USING (auth.uid() = maitre_id);

CREATE POLICY "Owners can delete their own rendez-vous"
  ON public.rendez_vous FOR DELETE
  TO authenticated
  USING (auth.uid() = maitre_id);

-- Storage bucket for carnets de santé (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('carnets_sante', 'carnets_sante', false);

CREATE POLICY "Owners can view their own carnets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'carnets_sante' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can upload their own carnets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'carnets_sante' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update their own carnets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'carnets_sante' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete their own carnets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'carnets_sante' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed veterinaires
INSERT INTO public.veterinaires (nom, prenom, specialite) VALUES
  ('Dubois', 'Marie', 'Médecine générale'),
  ('Lefevre', 'Jean', 'Chirurgie'),
  ('Martin', 'Sophie', 'Dermatologie'),
  ('Bernard', 'Lucas', 'Cardiologie'),
  ('Moreau', 'Camille', 'NAC (Nouveaux Animaux de Compagnie)');
