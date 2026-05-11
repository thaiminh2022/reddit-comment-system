import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const REALISTIC_POSTS = [
  {
    title: "What are some 'life hacks' that actually work?",
    content: "I've tried a lot of these and most are garbage. What are some that you actually use in your daily life?",
    category: "AskReddit",
  },
  {
    title: "Why Rust is becoming the go-to language for systems programming",
    content: "With memory safety guarantees and high performance, Rust is slowly replacing C++ in many critical systems. Let's discuss why.",
    category: "Programming",
  },
  {
    title: "Just finished Elden Ring: Shadow of the Erdtree. WOW.",
    content: "No spoilers here, but FromSoftware really outdid themselves this time. The level design is insane.",
    category: "Gaming",
  },
  {
    title: "The best way to cook a steak at home (Reverse Sear)",
    content: "If you're still just throwing steaks in a pan, you're doing it wrong. Here is a guide on the reverse sear method.",
    category: "Cooking",
  },
  {
    title: "Is it still worth moving to San Francisco in 2026?",
    content: "I have a job offer in the city but the rent is still crazy. Is the tech scene still worth the cost of living?",
    category: "TechNews",
  },
];

const REALISTIC_COMMENTS = [
  "This is actually super helpful, thanks for sharing!",
  "I tried this last week and it didn't work for me. Maybe I did something wrong?",
  "Can someone explain why this is better than the traditional way?",
  "Completely agree with the author here. It's a game changer.",
  "Hot take: I think this is overrated. There are better alternatives.",
  "Wait, I thought this was common knowledge? I've been doing this for years.",
  "Thanks for the detailed breakdown, I've been looking for something like this.",
  "Does this work for beginners or do you need some prior experience?",
];

async function seed() {
  console.log("🚀 Starting seeding...");

  // 1. Create Users & Profiles
  const users = [];
  for (let i = 0; i < 10; i++) {
    const email = faker.internet.email();
    const password = "password123";
    const name = faker.internet.username();

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error(`Error creating auth user: ${authError.message}`);
      continue;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.user.id,
      name,
    });

    if (profileError) {
      console.error(`Error creating profile: ${profileError.message}`);
      continue;
    }

    users.push(authUser.user);
  }

  console.log(`✅ Created ${users.length} users and profiles.`);

  // 2. Create Posts
  const posts = [];
  for (const p of REALISTIC_POSTS) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: randomUser.id,
        title: p.title,
        content: p.content,
        score: faker.number.int({ min: 10, max: 1000 }),
      })
      .select()
      .single();

    if (postError) {
      console.error(`Error creating post: ${postError.message}`);
      continue;
    }
    posts.push(post);
  }

  console.log(`✅ Created ${posts.length} posts.`);

  // 3. Create Comments
  for (const post of posts) {
    const commentCount = faker.number.int({ min: 3, max: 8 });
    const topLevelComments = [];

    for (let i = 0; i < commentCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const { data: comment, error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          author_id: randomUser.id,
          content: REALISTIC_COMMENTS[Math.floor(Math.random() * REALISTIC_COMMENTS.length)],
          score: faker.number.int({ min: -5, max: 200 }),
        })
        .select()
        .single();

      if (commentError) {
        console.error(`Error creating comment: ${commentError.message}`);
        continue;
      }
      topLevelComments.push(comment);
    }

    // Add some replies
    for (const parentComment of topLevelComments) {
      if (Math.random() > 0.5) {
        const replyCount = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < replyCount; j++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          await supabase.from("comments").insert({
            post_id: post.id,
            parent_id: parentComment.id,
            author_id: randomUser.id,
            content: REALISTIC_COMMENTS[Math.floor(Math.random() * REALISTIC_COMMENTS.length)],
            score: faker.number.int({ min: 0, max: 50 }),
          });
        }
      }
    }
  }

  console.log("✅ Created comments and replies.");
  console.log("🎉 Seeding completed!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
