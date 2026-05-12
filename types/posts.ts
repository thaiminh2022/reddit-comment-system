export type Profile = {
  id: string;
  name: string;
};

export type Post = {
  id: string;
  title: string;
  author: Profile;
  content: string;
  created_at: Date;
  is_deleted: boolean;
  total_comment_count: number;
  score: number;
  comments: CommentRoot[];
};

export type Comment = {
  id: string;
  parent_id: string | null;
  author: Profile;
  content: string;
  created_at: Date;
  reply_count: number;
  score: number;
  is_deleted: boolean;
  replies: Comment[];
  has_more?: boolean; // Indicates if there are deeper replies not fetched
};

export type CommentRoot = Comment;

export type PaginatedPosts = {
  posts: Post[];
  nextCursor: string | null;
  pageSize: number;
};

