import { FullComment, Post, User } from "@/types/posts";
import { faker } from "@faker-js/faker";

function getFakePost(): Post {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.slug(),
    author_id: faker.string.uuid(),
    content: faker.lorem.paragraphs(),
    created_at: faker.date.anytime(),
    is_deleted: false,
    total_comment_count: faker.number.int({ min: 0, max: 10 }),
    score: faker.number.int({ max: 200 }),
  };
}

function getFakeComment(postID: string, depth: number = 0): FullComment {
  depth++;

  const uuid = faker.string.uuid();
  const author: User = {
    id: faker.string.uuid(),
    name: faker.internet.username(),
  };

  const replies: FullComment[] = [];
  let reply_len = faker.number.int({ min: 0, max: 10 });
  if (depth < 3) {
    for (let i = 0; i < reply_len; i++) {
      const g = getFakeComment(postID, depth);
      replies.push(g);
    }
  } else {
    reply_len = 0;
  }

  return {
    id: uuid,
    parent_id: null,
    author_id: faker.string.uuid(),
    post_id: postID,
    content: faker.lorem.paragraph(),
    created_at: faker.date.anytime(),
    is_deleted: false,
    score: faker.number.int({ max: 200 }),
    author: author,
    reply_count: replies.length,
    replies: replies,
  };
}

const posts: Post[] = [];

// THE FUNCTIONs BELOW SHOULD BE REPLACE BY LEGIT FUNCTION
export function fetchPosts(): Post[] {
  for (let i = 0; i < 5; i++) {
    posts.push(getFakePost());
  }
  // console.log(posts);
  return posts;
}

export function fetchPost(uuid: string): Post | null {
  // console.log(posts);
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === uuid) {
      return posts[i];
    }
  }
  return getFakePost();
}

export function fetchComments(uuid: string): FullComment[] {
  let commentCount = faker.number.int({ min: 0, max: 5 });
  const comments = [];
  for (let i = 0; i < commentCount; i++) {
    comments.push(getFakeComment(uuid));
  }
  return comments;
}

export function fetchUserData(uuid: string): User {
  return {
    id: uuid,
    name: faker.internet.username(),
  };
}
