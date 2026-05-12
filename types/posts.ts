import { UserRow } from "./db_schema";

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
  parent: Comment | null;
  author: Profile;
  content: string;
  created_at: Date;
  reply_count: number;
  score: number;
  is_deleted: boolean;
  replies: Comment[];
};

export type CommentRoot = Omit<Comment, "parent">;

