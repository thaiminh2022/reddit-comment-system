import PostCard from "@/components/posts/PostCard";
import { fetchPosts } from "@/lib/data";

export default async function Page() {
  const posts = await fetchPosts();

  return (
    <div className="flex flex-col gap-y-5">
      {posts.map((p, i) => (
        <PostCard post={p} key={i} />
      ))}
    </div>
  );
}
