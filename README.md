# Reddit Comment System

A focused Reddit-style discussion app built around posts, nested comments, voting, search, and fast server-rendered navigation. The goal is not to clone every Reddit feature. It is to make the core conversation loop feel sharp: write a post, sort the feed, open a thread, reply deeply, vote, search, and keep moving.

## What It Does

- Username-based entry flow backed by Supabase Auth and profiles
- Auth-protected post browsing and post creation
- Cursor-paginated post feed with infinite loading
- Nested comment threads with reply support
- Post and comment voting with persisted user vote state
- Sort modes for posts and comments: newest, hot, all-time top, yearly top, monthly top
- Search for posts and comments through indexed database columns
- Loading skeletons and pending states for route, search, sort, and infinite-scroll transitions
- Dark/light theme support
- Supabase Row Level Security policies for profiles, posts, comments, and votes

## Stack

- Next.js 16.2.1 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, RLS, and SSR helpers
- Radix UI primitives with local shadcn-style components
- Zod for runtime validation
- Faker for local demo content generation

## App Routes

| Route | Purpose |
| --- | --- |
| `/` | Username sign-in / account bootstrap |
| `/posts` | Authenticated post feed with search, sorting, theme toggle, and infinite loading |
| `/posts/create` | Create a post manually or generate placeholder content |
| `/posts/[id]` | Post detail view with votes, comment search, comment sorting, and nested replies |
| `/posts/[id]/[theard_id]` | Focused comment-thread view |

## Data Model

The Supabase schema is centered on five tables:

- `profiles`: public user identity tied to `auth.users`
- `posts`: post title, content, author, score, deletion flag, comment count
- `comments`: nested comments through `parent_id`, with per-comment score and reply count
- `post_votes`: one vote per user per post
- `comment_votes`: one vote per user per comment

Migrations live in [`supabase/migrations`](./supabase/migrations). Later migrations add uniqueness, search columns, indexes, triggers, and stricter RLS behavior.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create `.env.local` with the Supabase values required by the server and browser clients:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

For local database work, also provide the Postgres and Supabase keys your Supabase tooling requires. Do not commit real secrets.

Run the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Supabase Setup

Apply the SQL migrations in order from `supabase/migrations`, or run them through the Supabase CLI if your local environment is configured for it.

The authentication flow creates or reuses a Supabase Auth user from a submitted display name, then stores the visible identity in `profiles`. Because this flow uses the admin API to create users, `SUPABASE_SERVICE_ROLE_KEY` is required on the server.

## Scripts

```bash
pnpm dev      # Start the Next.js development server
pnpm build    # Build the production app
pnpm start    # Start the production server after building
pnpm lint     # Run ESLint
```

## Project Structure

```text
app/
  page.tsx                 # Entry and username auth
  posts/                   # Protected post routes
components/
  posts/                   # Post cards, voting, sorting, infinite feed
  posts/post_interaction/  # Comment view, comment tree, replies, comment voting
  ui/                      # Local UI primitives
lib/
  actions/                 # Server actions and data access
  comments/                # Comment sorting helpers
  posts/                   # Post sorting helpers
  supabase/                # Browser, server, and proxy Supabase clients
supabase/
  migrations/              # Database schema and policy migrations
types/
  db_schema.ts             # Zod schemas and inferred database types
```

## Notes for Contributors

This repo uses a newer Next.js version with behavior that may differ from older App Router examples. Before changing framework-level code, check the local docs in:

```text
node_modules/next/dist/docs/
```

Keep UI changes aligned with the existing component system. Prefer server components for data loading, client components for interaction, and keyed `Suspense` boundaries where search or sort params should produce visible loading feedback.
