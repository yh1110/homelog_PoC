-- Migration: Add manufacturer, model_number, and official_page fields to items table
-- Date: 2025-11-02
-- Purpose: Support auto-extracted product information from images

-- Add new columns to items table
ALTER TABLE items
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS model_number TEXT,
ADD COLUMN IF NOT EXISTS official_page TEXT;

-- Note: These columns are optional and will be populated via the auto-fill feature
-- when users upload product images that are processed by the Dify workflow.
