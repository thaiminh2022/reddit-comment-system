-- 1. Tạo bảng Profiles (Lưu thông tin user công khai)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Tạo bảng Posts
CREATE TABLE public.posts (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  is_deleted boolean DEFAULT false NOT NULL,
  total_comment_count integer DEFAULT 0 NOT NULL,
  score integer DEFAULT 0 NOT NULL
);

-- 3. Tạo bảng Comments (Hỗ trợ nested comments)
CREATE TABLE public.comments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  reply_count integer DEFAULT 0 NOT NULL,
  is_deleted boolean DEFAULT false NOT NULL,
  score integer DEFAULT 0 NOT NULL
);

-- 4. Tạo bảng PostVotes
CREATE TABLE public.post_votes (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  value integer CHECK (value IN (-1, 1)) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 5. Tạo bảng CommentVotes
CREATE TABLE public.comment_votes (
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  value integer CHECK (value IN (-1, 1)) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (comment_id, user_id)
);

-- 6. Kích hoạt Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- Policies: Ai cũng xem được, chỉ Authenticated mới được tạo/sửa
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can manage own post votes" ON public.post_votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own comment votes" ON public.comment_votes FOR ALL USING (auth.uid() = user_id);