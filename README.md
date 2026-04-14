# Reddit comment system

This is an attempt to clone the reddit comment system for a school project using nextjs + supabase.

## Dependencies & Dev tools

- This project use pnpm for package manager.
- Tailwind 4, shadcn.
- Supabase (duh)
- Vercel

## Development steps

### Cloning & checkout

Run this command to clone the project

```bash
git clone https://github.com/thaiminh2022/reddit-comment-system.git
```

After cloning, checkout the dev branch and install all dependencies

```bash
git switch dev
pnpm install
```

### .Env

Since this project use supabase as a backend, it's need to have an .env file

1. Create a file name .env.local at the root of the project
2. Fill out all the values (for collaborators checkout the message in the group chat)

```
SUPABASE_ANON_KEY=
SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
POSTGRES_DATABASE=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_PRISMA_URL=
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
SUPABASE_JWT_SECRET=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Running the project

```bash
pnpm dev
```
