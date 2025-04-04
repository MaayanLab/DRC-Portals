set statement_timeout = 0;
-- Step 1: Check and Create Index on Anatomy Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'anatomy' AND indexname = 'idx_anatomy_search') THEN
        CREATE INDEX idx_anatomy_search ON c2m2.anatomy USING gin(to_tsvector('english', name || ' ' || description));
    END IF;
END $$;

-- Step 2: Check and Create Index on Disease Table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'disease' AND indexname = 'idx_disease_search') THEN
        CREATE INDEX idx_disease_search ON c2m2.disease USING gin(to_tsvector('english', name || ' ' || description));
    END IF;
END $$;

-- Step 3: Add a Generated Column to fl2_biosample for Anatomy and Disease
ALTER TABLE c2m2.fl2_biosample
ADD COLUMN IF NOT EXISTS searchable tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(anatomy.name, '') || ' ' || coalesce(anatomy.description, '')) ||
    to_tsvector('english', coalesce(disease.name, '') || ' ' || coalesce(disease.description, ''))
) STORED;

-- Step 4: Update the Generated Column for Anatomy and Disease
UPDATE c2m2.fl2_biosample
SET searchable = (
    to_tsvector('english', coalesce(anatomy.name, '') || ' ' || coalesce(anatomy.description, '')) ||
    to_tsvector('english', coalesce(disease.name, '') || ' ' || coalesce(disease.description, ''))
)
FROM c2m2.anatomy, c2m2.disease
WHERE c2m2.fl2_biosample.anatomy = c2m2.anatomy.id
  AND c2m2.fl2_biosample.disease = c2m2.disease.id;

-- Step 5: Check and Create Index on the Searchable Column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'c2m2.fl2_biosample' AND indexname = 'idx_searchable') THEN
        CREATE INDEX idx_searchable ON c2m2.fl2_biosample USING gin(searchable);
    END IF;
END $$;

-- Step 6: Query to Search for "blood" and "diabetes"
SELECT *
FROM c2m2.fl2_biosample
WHERE searchable @@ to_tsquery('english', 'blood & diabetes');
