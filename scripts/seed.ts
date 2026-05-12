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
  },
  {
    title: "Why Rust is becoming the go-to language for systems programming",
    content: "With memory safety guarantees and high performance, Rust is slowly replacing C++ in many critical systems. Let's discuss why.",
  },
  {
    title: "Just finished Elden Ring: Shadow of the Erdtree. WOW.",
    content: "No spoilers here, but FromSoftware really outdid themselves this time. The level design is insane.",
  },
  {
    title: "The best way to cook a steak at home (Reverse Sear)",
    content: "If you're still just throwing steaks in a pan, you're doing it wrong. Here is a guide on the reverse sear method.",
  },
  {
    title: "Is it still worth moving to San Francisco in 2026?",
    content: "I have a job offer in the city but the rent is still crazy. Is the tech scene still worth the cost of living?",
  },
  {
    title: "The paradox of choice in the streaming era",
    content: "I spend more time scrolling through Netflix than actually watching anything. Why is it so hard to just pick a movie?",
  },
  {
    title: "How to build a second brain: My 2-year journey",
    content: "Using tools like Notion and Obsidian has changed my life. Here's how I organize everything I learn.",
  },
  {
    title: "What's the most beautiful place you've ever visited?",
    content: "Looking for some travel inspiration for my next vacation. Pictures or descriptions welcome!",
  },
  {
    title: "Artificial General Intelligence: Are we closer than we think?",
    content: "With the recent breakthroughs in LLMs, some experts say AGI could be here within 5 years. What's your take?",
  },
  {
    title: "Minimalism: It's not about having less, it's about making room for more",
    content: "I've cleared out 70% of my belongings and I've never felt more free. It's a mental shift, not just a physical one.",
  },
  {
    title: "The future of remote work: Hybrid or fully remote?",
    content: "Companies are pushing for RTO, but employees want flexibility. Where do we land in 2027?",
  },
  {
    title: "SpaceX Starship: The key to Mars?",
    content: "The recent successful landing of the booster was a milestone. Can we really reach Mars by 2030?",
  },
  {
    title: "Learning a new language as an adult is hard but rewarding",
    content: "I've been learning Japanese for 6 months. It's tough, but finally understanding a manga panel is a great feeling.",
  },
  {
    title: "Coffee culture is getting out of hand",
    content: "Is a $12 latte really worth it? I feel like we've reached peak coffee snobbery.",
  },
  {
    title: "The ethics of genetic editing in 2026",
    content: "CRISPR is becoming more accessible. How do we prevent a 'Gattaca' style future?",
  },
  {
    title: "Why physical books are better than Kindles",
    content: "There's just something about the smell of paper and the feeling of turning a page that digital can't replicate.",
  },
  {
    title: "How to stay productive when you're feeling burnt out",
    content: "I've been hitting a wall lately. What are your tips for recharging without losing momentum?",
  },
  {
    title: "The rise of indie game developers",
    content: "AAA games are becoming too safe and corporate. Indie devs are where the real innovation is happening.",
  },
  {
    title: "Is social media doing more harm than good for Gen Alpha?",
    content: "Watching the 'iPad kids' grow up is concerning. How will this affect their social development?",
  },
  {
    title: "Urban gardening: How to grow food in a tiny apartment",
    content: "I have 5 tomato plants on my balcony. It's not much, but it's honest work.",
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
  "I've been saying this for years! Glad someone finally put it into words.",
  "Interesting perspective, but have you considered the environmental impact?",
  "I'm skeptical. Do you have any data to back this up?",
  "This changed my mind completely. I never thought about it that way.",
  "Can we talk about the cost though? It's not exactly accessible for everyone.",
  "I've had a similar experience. The key is to be consistent.",
  "That's a bit of a stretch, don't you think?",
  "Wow, I learned so much from this thread. Thanks everyone!",
];

async function seed() {
  console.log("🚀 Starting seeding...");

  // 1. Create Users & Profiles
  const users = [];
  for (let i = 0; i < 20; i++) {
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
  // Ensure we have at least 25 posts to test pagination (pageSize=10)
  const postsToCreate = [...REALISTIC_POSTS];
  while (postsToCreate.length < 25) {
    postsToCreate.push({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(2),
    });
  }

  for (const p of postsToCreate) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        author_id: randomUser.id,
        title: p.title,
        content: p.content,
        score: faker.number.int({ min: -10, max: 2000 }),
        created_at: faker.date.recent({ days: 30 }),
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

  // 3. Recursive Comment Seeder
  async function createCommentBranch(postId: string, parentId: string | null, currentDepth: number, maxDepth: number) {
    if (currentDepth > maxDepth) return;

    const commentCount = currentDepth === 0 ? faker.number.int({ min: 5, max: 12 }) : faker.number.int({ min: 0, max: 4 });
    
    for (let i = 0; i < commentCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const { data: comment, error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          parent_id: parentId,
          author_id: randomUser.id,
          content: REALISTIC_COMMENTS[Math.floor(Math.random() * REALISTIC_COMMENTS.length)],
          score: faker.number.int({ min: -20, max: 500 }),
          created_at: faker.date.recent({ days: 5 }),
        })
        .select()
        .single();

      if (commentError) {
        console.error(`Error creating comment: ${commentError.message}`);
        continue;
      }

      // 50% chance to have children if not at max depth
      if (Math.random() > 0.5) {
        await createCommentBranch(postId, comment.id, currentDepth + 1, maxDepth);
      }
    }
  }

  for (const post of posts) {
    // Create deep threads for 20% of posts, others just shallow
    const isDeepThread = Math.random() > 0.8;
    await createCommentBranch(post.id, null, 0, isDeepThread ? 5 : 2);
  }

  console.log("✅ Created deep-nested comments and replies.");
  console.log("🎉 Seeding completed!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
