-- Synchronisation de l'agenda Rêvade Pro avec Google Agenda / Outlook (abonnement iCal)
--
-- Chaque professionnel reçoit un jeton secret. L'URL /api/agenda/<jeton> renvoie ses
-- rendez-vous au format iCalendar ; Google Agenda et Outlook s'y abonnent et se
-- mettent à jour automatiquement (toutes les quelques heures, selon le service).

-- 1. Jeton secret par professionnel
ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS calendar_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS professionals_calendar_token_idx
  ON professionals (calendar_token);

-- 2. Lecture du flux par jeton (appelée sans session par l'API du site)
--    SECURITY DEFINER : contourne la RLS, mais ne renvoie que les RDV du pro
--    dont le jeton correspond, et seulement les colonnes utiles au calendrier.
CREATE OR REPLACE FUNCTION get_calendar_feed(p_token uuid)
RETURNS TABLE (
  id text,
  date_heure timestamptz,
  duree_minutes integer,
  patient_name text,
  statut text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id::text, a.date_heure::timestamptz, a.duree_minutes::integer, a.patient_name::text, a.statut::text
  FROM appointments a
  JOIN professionals p ON p.id = a.professional_id
  WHERE p.calendar_token = p_token
    AND a.date_heure::timestamptz > now() - interval '90 days'
  ORDER BY a.date_heure;
$$;

REVOKE ALL ON FUNCTION get_calendar_feed(uuid) FROM public;
GRANT EXECUTE ON FUNCTION get_calendar_feed(uuid) TO anon, authenticated;
