-- Animals table
CREATE TABLE public.animaux (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maitre_id UUID NOT NULL,
  nom TEXT NOT NULL,
  espece TEXT NOT NULL,
  race TEXT,
  age INTEGER,
  poids NUMERIC(5,2),
  allergies TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.animaux ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own animals" ON public.animaux
  FOR SELECT TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owners insert own animals" ON public.animaux
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = maitre_id);
CREATE POLICY "Owners update own animals" ON public.animaux
  FOR UPDATE TO authenticated USING (auth.uid() = maitre_id);
CREATE POLICY "Owners delete own animals" ON public.animaux
  FOR DELETE TO authenticated USING (auth.uid() = maitre_id);

-- Updated_at trigger function (shared)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_animaux_updated_at
BEFORE UPDATE ON public.animaux
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Link appointments to an animal (optional, nullable for existing rows)
ALTER TABLE public.rendez_vous ADD COLUMN animal_id UUID;
CREATE INDEX idx_rendez_vous_animal_id ON public.rendez_vous(animal_id);
CREATE INDEX idx_animaux_maitre_id ON public.animaux(maitre_id);

-- Storage bucket for animal photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos-animaux', 'photos-animaux', true);

CREATE POLICY "Animal photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos-animaux');

CREATE POLICY "Owners can upload animal photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'photos-animaux' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update their animal photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'photos-animaux' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete their animal photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'photos-animaux' AND auth.uid()::text = (storage.foldername(name))[1]);