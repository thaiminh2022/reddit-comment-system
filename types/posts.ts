import * as z from "zod";

const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

const PostSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  author_id: z.uuid(),
  content: z.string(),
  created_at: z.coerce.date(),
  is_deleted: z.boolean(),
  total_comment_count: z.int().min(0),
  score: z.int(),
});

const PostVoteSchema = z.object({
  post_id: z.uuid(),
  user_id: z.uuid(),
  value: z.int(),
  created_at: z.coerce.date(),
});

const CommentSchema = z.object({
  id: z.uuid(),
  parent_id: z.uuid().nullable(),
  post_id: z.uuid(),
  author_id: z.uuid(),
  content: z.string(),
  created_at: z.coerce.date(),
  is_deleted: z.boolean(),
  reply_count: z.int().min(0),
  score: z.int(),
});

const CommentVoteSchema = z.object({
  comment_id: z.uuid(),
  user_id: z.uuid(),
  value: z.int(),
  created_at: z.coerce.date(),
});

export type FullComment = z.infer<typeof FullCommentSchema>;

const FullCommentSchema: z.ZodType<
  z.infer<typeof CommentSchema> & {
    author: z.infer<typeof UserSchema>;
    replies: FullComment[];
  }
> = CommentSchema.extend({
  author: UserSchema,
  replies: z.lazy(() => z.array(FullCommentSchema)),
});

const FullPostSchema = PostSchema.extend({
  author: UserSchema,
  comments: z.array(FullCommentSchema),
});

export type User = z.infer<typeof UserSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type PostVote = z.infer<typeof PostVoteSchema>;
export type CommentVote = z.infer<typeof CommentVoteSchema>;
export type FullPost = z.infer<typeof FullPostSchema>;
export type Post = z.infer<typeof PostSchema>;
