-- Add status column to sugerencias with default 'pendiente'
ALTER TABLE sugerencias ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente';

-- Add images column to store multiple URLs (array of text)
ALTER TABLE sugerencias ADD COLUMN IF NOT EXISTS images TEXT[];

-- Update existing rows to have status 'pendiente' if null
UPDATE sugerencias SET status = 'pendiente' WHERE status IS NULL;

-- Migrate existing single image_url to images array if populated
UPDATE sugerencias 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (images IS NULL OR cardinality(images) = 0);

-- Policy Limit updates (if any strict policies existed on columns)
-- (Assuming standard RLS allows update on own rows or admins)
