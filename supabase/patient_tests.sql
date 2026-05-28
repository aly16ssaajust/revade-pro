-- À exécuter dans l'éditeur SQL de Supabase
CREATE TABLE IF NOT EXISTS patient_tests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL,
  pro_id uuid NOT NULL,
  type text NOT NULL, -- 'had' | 'horn' | 'beck'
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  scores jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE patient_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pros_manage_tests" ON patient_tests
  FOR ALL TO authenticated
  USING (auth.uid() = pro_id)
  WITH CHECK (auth.uid() = pro_id);
