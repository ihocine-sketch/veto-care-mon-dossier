-- Fix RLS policies for admin users to read all appointments
-- This migration ensures admin users can access all rendez_vous records

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can read all appointments" ON public.rendez_vous;
DROP POLICY IF EXISTS "Admins can update all appointments" ON public.rendez_vous;

-- Create new admin policy using direct role check
CREATE POLICY "admins_read_all" ON public.rendez_vous
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create admin update policy
CREATE POLICY "admins_update_all" ON public.rendez_vous
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create admin insert policy (for completeness)
CREATE POLICY "admins_insert_all" ON public.rendez_vous
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create admin delete policy (for completeness)
CREATE POLICY "admins_delete_all" ON public.rendez_vous
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Also fix the function-based policies to ensure they work correctly
-- The current_user_role() function should work, but let's make sure it's properly defined

-- Recreate the current_user_role function if needed
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Grant necessary permissions to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.rendez_vous TO authenticated;
GRANT SELECT ON public.roles TO authenticated;
