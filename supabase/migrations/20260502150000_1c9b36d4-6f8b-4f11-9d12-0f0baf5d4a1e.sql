-- Add reminder tracking to appointment records
ALTER TABLE public.rendez_vous
ADD COLUMN reminder_sent_at timestamptz;
