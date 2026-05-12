"use client";

import { useState, useEffect, useRef } from "react";
import { PostJoinAuthor } from "@/types/db_schema";
import PostCard from "./PostCard";
import PostActionBar from "./PostActionBar";
import { fetchPostJoinAuthorRows, SortOrder } from "@/lib/actions/data";
import { getPostVoteStates, VoteState } from "@/lib/actions/updownvote";
import { IconLoader2 } from "@tabler/icons-react";

interface Props {
  initialPosts: PostJoinAuthor[];
  initialCursor: string | null;
  initialVoteStates: Record<string, VoteState>;
  sort: SortOrder;
}

export default function InfinitePostList({
  initialPosts,
  initialCursor,
  initialVoteStates,
  sort,
}: Props) {
  const [posts, setPosts] = useState<PostJoinAuthor[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [voteStates, setVoteStates] = useState<Record<string, VoteState>>(initialVoteStates);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Sync state with props when sort changes (Server Component re-renders)
  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialCursor);
    setVoteStates(initialVoteStates);
  }, [initialPosts, initialCursor, initialVoteStates, sort]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && cursor && !isLoading) {
          setIsLoading(true);
          const res = await fetchPostJoinAuthorRows(cursor, 10, sort);
          if (res.is_success) {
            const newPosts = res.data.posts;
            
            // Fetch vote states for new posts
            const newPostIds = newPosts.map(p => p.id);
            const votesRes = await getPostVoteStates(newPostIds);
            
            if (votesRes.is_success) {
              setVoteStates(prev => ({ ...prev, ...votesRes.data }));
            }

            setPosts((prev) => {
              const filteredNewPosts = newPosts.filter(
                (newP) => !prev.some((oldP) => oldP.id === newP.id),
              );
              return [...prev, ...filteredNewPosts];
            });
            setCursor(res.data.nextCursor);
          }
          setIsLoading(false);
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [cursor, isLoading, sort]);

  return (
    <div className="flex flex-col gap-y-5">
      {posts.map((p, i) => (
        <PostCard post={p} key={`${p.id}-${i}`}>
          <PostActionBar post={p} voteState={voteStates[p.id] || "not-voted"} />
        </PostCard>
      ))}

      {cursor && (
        <div ref={loaderRef} className="flex justify-center py-10">
          <IconLoader2
            className="animate-spin text-muted-foreground"
            size={32}
          />
        </div>
      )}

      {!cursor && posts.length > 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm font-medium">
          You've reached the end of the internet.
        </div>
      )}
    </div>
  );
}
