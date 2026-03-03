-- Add update_for_slug to items table for tracking update suggestions
ALTER TABLE items ADD COLUMN IF NOT EXISTS update_for_slug text;
