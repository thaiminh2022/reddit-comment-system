ALTER POLICY "Authenticated users can create posts"
ON public.posts
WITH CHECK (auth.uid() = author_id);

ALTER POLICY "Authenticated users can create comments"
ON public.comments
WITH CHECK (auth.uid() = author_id);

ALTER POLICY "Users can manage own post votes"
ON public.post_votes
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can manage own comment votes"
ON public.comment_votes
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
