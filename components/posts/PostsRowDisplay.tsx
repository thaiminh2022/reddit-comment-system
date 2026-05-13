import { fetchPostJoinAuthorRows } from "@/lib/actions/data";
import { getPostVoteStates } from "@/lib/actions/updownvote";
import InfinitePostList from "./InfinitePostList";
import { PostSort } from "@/lib/posts/sort";

interface Props {
  sort: PostSort;
  search?: string;
}

export default async function PostRowDisplay({ sort, search }: Props) {
  const pageSize = 10;
  // Fetch initial posts on the server using cursor-based logic
  const postsRes = await fetchPostJoinAuthorRows(
    undefined,
    pageSize,
    sort,
    search,
  );
  if (!postsRes.is_success) {
    return (
      <div className="rounded-md p-2  bg-red-100">
        Error fetching posts: {postsRes.message}
      </div>
    );
  }

  const { posts, nextCursor } = postsRes.data;

  // Fetch vote states for initial posts
  const postIds = posts.map((p) => p.id);
  const voteStatesRes = await getPostVoteStates(postIds);
  const initialVoteStates = voteStatesRes.is_success ? voteStatesRes.data : {};

  return (
    <>
      {posts.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {search ? `No posts matching "${search}"` : "No posts found."}
        </div>
      ) : (
        <InfinitePostList
          initialPosts={posts}
          initialCursor={nextCursor}
          initialVoteStates={initialVoteStates}
          sort={sort}
          search={search}
        />
      )}
    </>
  );
}
