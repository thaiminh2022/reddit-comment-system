import * as z from "zod";

const UserSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
});

export const UserInsertSchema = UserSchema.omit({ id: true });
export const PostSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(200),
  author_id: z.uuid(),
  content: z.string().trim().min(1).max(10000),
  created_at: z.coerce.date(),
  is_deleted: z.boolean(),
  total_comment_count: z.int().min(0),
  score: z.int(),
});

export const PostInsertSchema = PostSchema.omit({
  id: true,
  created_at: true,
  is_deleted: true,
  total_comment_count: true,
  score: true,
});

const PostVoteSchema = z.object({
  post_id: z.uuid(),
  user_id: z.uuid(),
  value: z.union([z.literal(-1), z.literal(1), z.literal(0)]),
  created_at: z.coerce.date(),
});

export const PostVoteInsertSchema = PostVoteSchema.omit({ created_at: true });

const CommentSchema = z.object({
  id: z.uuid(),
  parent_id: z.uuid().nullable(),
  post_id: z.uuid(),
  author_id: z.uuid().nullable(),
  content: z.string().trim().min(1).max(10000),
  created_at: z.coerce.date(),
  is_deleted: z.boolean(),
  reply_count: z.int().min(0),
  score: z.int(),
});

export const CommentInsertSchema = CommentSchema.omit({
  id: true,
  author_id: true,
  created_at: true,
  is_deleted: true,
  reply_count: true,
  score: true,
}).extend({
  author_id: z.uuid(),
});

const CommentVoteSchema = z.object({
  comment_id: z.uuid(),
  user_id: z.uuid(),
  value: z.union([z.literal(-1), z.literal(1)]),
  created_at: z.coerce.date(),
});

export const CommentVoteInsertSchema = CommentVoteSchema.omit({
  created_at: true,
});

export type UserRow = z.infer<typeof UserSchema>;
export type CommentRow = z.infer<typeof CommentSchema>;
export type CommentInsert = z.infer<typeof CommentInsertSchema>;

export type PostVoteRow = z.infer<typeof PostVoteSchema>;
export type PostVoteInsert = z.infer<typeof PostVoteInsertSchema>;

export type CommentVoteRow = z.infer<typeof CommentVoteSchema>;
export type CommentVoteInsert = z.infer<typeof CommentVoteInsertSchema>;

export type PostRow = z.infer<typeof PostSchema>;
export type PostInsert = z.infer<typeof PostInsertSchema>;

export type PostJoinAuthor = PostRow & {
  author: UserRow | null;
};

export type CommentJoinAuthor = CommentRow & {
  author: UserRow | null;
};
