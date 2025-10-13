-- Migration script to simplify the wallpaper schema
-- This script removes all unnecessary tables and columns, keeping only:
-- - wallpaper name (title)
-- - upload date (created_at) 
-- - resolution (width, height)

-- Drop all foreign key constraints and related tables first
DROP TABLE IF EXISTS wallpaper_tags CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS downloads CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create simplified wallpapers table
DROP TABLE IF EXISTS wallpapers CASCADE;
CREATE TABLE wallpapers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index on created_at for sorting
CREATE INDEX idx_wallpapers_created_at ON wallpapers(created_at DESC);

-- Example of inserting simplified wallpaper data
-- INSERT INTO wallpapers (id, title, width, height) VALUES 
-- ('sample1', 'Beautiful Sunset', 1920, 1080),
-- ('sample2', 'Ocean Waves', 2560, 1440),
-- ('sample3', 'Mountain Vista', 3840, 2160);