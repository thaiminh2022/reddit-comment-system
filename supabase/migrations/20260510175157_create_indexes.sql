-- 1. Index cho Foreign Keys (Tối ưu hóa JOIN và CASCADE delete)
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);

-- 2. Index cho việc sắp xếp dữ liệu (Tối ưu hóa ORDER BY và Pagination)
-- Sắp xếp bài viết mới nhất
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
-- Sắp xếp bài viết nổi bật / nhiều điểm nhất
CREATE INDEX IF NOT EXISTS idx_posts_score ON public.posts(score DESC);

-- Sắp xếp bình luận mới nhất
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
-- Sắp xếp bình luận nổi bật / nhiều điểm nhất
CREATE INDEX IF NOT EXISTS idx_comments_score ON public.comments(score DESC);

-- 3. Index cho Full-Text Search (Tối ưu hóa tìm kiếm từ khóa)
-- Tạo index GIN để tìm kiếm nhanh trên title và content của bài viết
CREATE INDEX IF NOT EXISTS idx_posts_title_content_search 
ON public.posts USING GIN (to_tsvector('english', title || ' ' || content));

-- Tạo index GIN để tìm kiếm nhanh trên nội dung của bình luận
CREATE INDEX IF NOT EXISTS idx_comments_content_search 
ON public.comments USING GIN (to_tsvector('english', content));
