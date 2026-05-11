-- Trigger để cập nhật score cho bảng posts khi có thay đổi trong post_votes
CREATE OR REPLACE FUNCTION public.update_post_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET score = score + NEW.value WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.posts SET score = score - OLD.value + NEW.value WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET score = score - OLD.value WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_score_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.post_votes
FOR EACH ROW EXECUTE FUNCTION public.update_post_score();


-- Trigger để cập nhật score cho bảng comments khi có thay đổi trong comment_votes
CREATE OR REPLACE FUNCTION public.update_comment_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET score = score + NEW.value WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.comments SET score = score - OLD.value + NEW.value WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET score = score - OLD.value WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_score_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
FOR EACH ROW EXECUTE FUNCTION public.update_comment_score();


-- Trigger để cập nhật total_comment_count (cho posts) và reply_count (cho comments) khi có thay đổi trong bảng comments
CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Xử lý Insert
  IF TG_OP = 'INSERT' THEN
    -- Tăng tổng số comment của post
    UPDATE public.posts SET total_comment_count = total_comment_count + 1 WHERE id = NEW.post_id;
    -- Nếu đây là comment reply, tăng số lượng reply của comment cha
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE public.comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    END IF;
    
  -- Xử lý Delete (Xóa cứng trong database)
  ELSIF TG_OP = 'DELETE' THEN
    -- Giảm tổng số comment của post
    UPDATE public.posts SET total_comment_count = total_comment_count - 1 WHERE id = OLD.post_id;
    -- Nếu có comment cha, giảm số lượng reply của comment cha
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE public.comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
    END IF;
    
  -- Xử lý Update (Ví dụ: soft delete khi thay đổi is_deleted)
  ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted IS DISTINCT FROM NEW.is_deleted THEN
    IF NEW.is_deleted = true THEN
      -- Nếu chuyển sang is_deleted = true thì coi như delete
      UPDATE public.posts SET total_comment_count = total_comment_count - 1 WHERE id = NEW.post_id;
      IF NEW.parent_id IS NOT NULL THEN
        UPDATE public.comments SET reply_count = reply_count - 1 WHERE id = NEW.parent_id;
      END IF;
    ELSE
      -- Nếu chuyển từ is_deleted = true sang false thì coi như insert
      UPDATE public.posts SET total_comment_count = total_comment_count + 1 WHERE id = NEW.post_id;
      IF NEW.parent_id IS NOT NULL THEN
        UPDATE public.comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();
