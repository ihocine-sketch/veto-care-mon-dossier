-- Create function to bypass RLS for admin users to fetch all appointments
CREATE OR REPLACE FUNCTION public.get_all_appointments_for_admin()
RETURNS TABLE (
  id UUID,
  nom_animal TEXT,
  espece TEXT,
  date_rdv TIMESTAMPTZ,
  statut TEXT,
  motif TEXT,
  maitre_id UUID,
  veterinaire_id UUID,
  veterinarian_nom TEXT,
  veterinarian_prenom TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Return all appointments with veterinarian details
  RETURN QUERY
  SELECT 
    rv.id,
    rv.nom_animal,
    rv.espece,
    rv.date_rdv,
    rv.statut,
    rv.motif,
    rv.maitre_id,
    rv.veterinaire_id,
    v.nom as veterinarian_nom,
    v.prenom as veterinarian_prenom
  FROM public.rendez_vous rv
  LEFT JOIN public.veterinaires v ON rv.veterinaire_id = v.id
  ORDER BY rv.date_rdv DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_appointments_for_admin() TO authenticated;

-- Also create a simpler version for basic appointment data
CREATE OR REPLACE FUNCTION public.get_all_appointments_basic()
RETURNS TABLE (
  id UUID,
  nom_animal TEXT,
  espece TEXT,
  date_rdv TIMESTAMPTZ,
  statut TEXT,
  motif TEXT,
  maitre_id UUID,
  veterinaire_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not an admin';
  END IF;
  
  -- Return all appointments without joins
  RETURN QUERY
  SELECT 
    rv.id,
    rv.nom_animal,
    rv.espece,
    rv.date_rdv,
    rv.statut,
    rv.motif,
    rv.maitre_id,
    rv.veterinaire_id
  FROM public.rendez_vous rv
  ORDER BY rv.date_rdv DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_appointments_basic() TO authenticated;
