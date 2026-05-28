-- À exécuter dans l'éditeur SQL de Supabase
CREATE TABLE IF NOT EXISTS patient_dossiers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL,
  pro_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'initial',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS patient_dossiers_unique
  ON patient_dossiers (patient_id, pro_id, type);

ALTER TABLE patient_dossiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pros_manage_dossiers" ON patient_dossiers
  FOR ALL TO authenticated
  USING (auth.uid() = pro_id)
  WITH CHECK (auth.uid() = pro_id);
