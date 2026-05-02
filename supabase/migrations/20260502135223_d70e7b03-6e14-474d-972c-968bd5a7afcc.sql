-- Add missing FK on rendez_vous.veterinaire_id (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rendez_vous_veterinaire_id_fkey'
  ) THEN
    ALTER TABLE public.rendez_vous
      ADD CONSTRAINT rendez_vous_veterinaire_id_fkey
      FOREIGN KEY (veterinaire_id) REFERENCES public.veterinaires(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Create public storage bucket "carnets-sante"
INSERT INTO storage.buckets (id, name, public)
VALUES ('carnets-sante', 'carnets-sante', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for carnets-sante bucket
CREATE POLICY "Public can view carnets-sante"
ON storage.objects FOR SELECT
USING (bucket_id = 'carnets-sante');

CREATE POLICY "Authenticated users can upload to their folder in carnets-sante"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'carnets-sante'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files in carnets-sante"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'carnets-sante'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files in carnets-sante"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'carnets-sante'
  AND auth.uid()::text = (storage.foldername(name))[1]
);