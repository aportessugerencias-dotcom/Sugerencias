-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default areas
INSERT INTO areas (name) VALUES
('Campo'),
('Juegos'),
('Electricidad'),
('Baños'),
('Pileta'),
('Quincho'),
('Luminaria')
ON CONFLICT (name) DO NOTHING;

-- Add area_id to sugerencias
ALTER TABLE sugerencias ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id);

-- Enable RLS on areas
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Allow read access to areas for everyone (anon and authenticated)
CREATE POLICY "Public read access" ON areas
  FOR SELECT TO anon, authenticated USING (true);

-- Allow insert/update/delete access to areas only for superadmin
CREATE POLICY "Superadmin full access" ON areas
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );
