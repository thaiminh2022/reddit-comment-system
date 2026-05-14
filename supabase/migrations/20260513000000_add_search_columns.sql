-- Add generated column for post search
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS title_content_search tsvector 
GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED;

-- Add generated column for comment search
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS content_search tsvector 
GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Re-create indexes on the new columns
DROP INDEX IF EXISTS idx_posts_title_content_search;
CREATE INDEX idx_posts_title_content_search ON public.posts USING GIN (title_content_search);

DROP INDEX IF EXISTS idx_comments_content_search;
CREATE INDEX idx_comments_content_search ON public.comments USING GIN (content_search);
