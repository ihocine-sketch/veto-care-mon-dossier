-- Add consultation fee to veterinaires table
ALTER TABLE public.veterinaires
ADD COLUMN consultation_fee DECIMAL(10, 2) DEFAULT 50.00 NOT NULL;

-- Add payment fields to rendez_vous table
ALTER TABLE public.rendez_vous
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' NOT NULL,
ADD COLUMN payment_amount DECIMAL(10, 2),
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN stripe_payment_id VARCHAR(255),
ADD COLUMN invoice_url VARCHAR(255);

-- Create payments table for tracking payment history
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.rendez_vous(id) ON DELETE CASCADE,
  maitre_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR' NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (maitre_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX idx_payments_maitre_id ON public.payments(maitre_id);
CREATE INDEX idx_payments_status ON public.payments(status);
