-- Add unique constraint to profiles.name to ensure name-based login works correctly
ALTER TABLE public.profiles ADD CONSTRAINT profiles_name_key UNIQUE (name);
