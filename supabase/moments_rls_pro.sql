-- Permet aux professionnels de santé de lire les moments
-- des patients qui leur sont liés via patient_professional_links

CREATE POLICY "pros_read_linked_patient_moments" ON moments
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM patient_professional_links
      WHERE professional_id = auth.uid()
        AND patient_id = user_id
    )
  );
