


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_comment_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_deleted = false THEN
      UPDATE public.posts
      SET total_comment_count = total_comment_count + 1
      WHERE id = NEW.post_id;

      IF NEW.parent_id IS NOT NULL THEN
        UPDATE public.comments
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_id;
      END IF;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_deleted = false THEN
      UPDATE public.posts
      SET total_comment_count = GREATEST(total_comment_count - 1, 0)
      WHERE id = OLD.post_id;

      IF OLD.parent_id IS NOT NULL THEN
        UPDATE public.comments
        SET reply_count = GREATEST(reply_count - 1, 0)
        WHERE id = OLD.parent_id;
      END IF;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Case 1: soft delete / restore
    IF OLD.is_deleted IS DISTINCT FROM NEW.is_deleted THEN
      IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
        UPDATE public.posts
        SET total_comment_count = GREATEST(total_comment_count - 1, 0)
        WHERE id = OLD.post_id;

        IF OLD.parent_id IS NOT NULL THEN
          UPDATE public.comments
          SET reply_count = GREATEST(reply_count - 1, 0)
          WHERE id = OLD.parent_id;
        END IF;

      ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
        UPDATE public.posts
        SET total_comment_count = total_comment_count + 1
        WHERE id = NEW.post_id;

        IF NEW.parent_id IS NOT NULL THEN
          UPDATE public.comments
          SET reply_count = reply_count + 1
          WHERE id = NEW.parent_id;
        END IF;
      END IF;
    END IF;

    -- Case 2: active comment moved to another post
    IF NEW.is_deleted = false
       AND OLD.post_id IS DISTINCT FROM NEW.post_id THEN
      UPDATE public.posts
      SET total_comment_count = GREATEST(total_comment_count - 1, 0)
      WHERE id = OLD.post_id;

      UPDATE public.posts
      SET total_comment_count = total_comment_count + 1
      WHERE id = NEW.post_id;
    END IF;

    -- Case 3: active comment moved to another parent
    IF NEW.is_deleted = false
       AND OLD.parent_id IS DISTINCT FROM NEW.parent_id THEN
      IF OLD.parent_id IS NOT NULL THEN
        UPDATE public.comments
        SET reply_count = GREATEST(reply_count - 1, 0)
        WHERE id = OLD.parent_id;
      END IF;

      IF NEW.parent_id IS NOT NULL THEN
        UPDATE public.comments
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_comment_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_comment_score"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments
    SET score = COALESCE(score, 0) + NEW.value
    WHERE id = NEW.comment_id;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.comment_id IS DISTINCT FROM NEW.comment_id THEN
      UPDATE public.comments
      SET score = COALESCE(score, 0) - OLD.value
      WHERE id = OLD.comment_id;

      UPDATE public.comments
      SET score = COALESCE(score, 0) + NEW.value
      WHERE id = NEW.comment_id;
    ELSE
      UPDATE public.comments
      SET score = COALESCE(score, 0) - OLD.value + NEW.value
      WHERE id = NEW.comment_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments
    SET score = COALESCE(score, 0) - OLD.value
    WHERE id = OLD.comment_id;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_comment_score"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_post_score"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET score = score + NEW.value WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.posts SET score = score - OLD.value + NEW.value WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET score = score - OLD.value WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_post_score"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comment_votes" (
    "comment_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "comment_votes_value_check" CHECK (("value" = ANY (ARRAY['-1'::integer, 1])))
);


ALTER TABLE "public"."comment_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent_id" "uuid",
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reply_count" integer DEFAULT 0 NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "score" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post_votes" (
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "post_votes_value_check" CHECK (("value" = ANY (ARRAY['-1'::integer, 1])))
);


ALTER TABLE "public"."post_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL,
    "total_comment_count" integer DEFAULT 0 NOT NULL,
    "score" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comment_votes"
    ADD CONSTRAINT "comment_votes_pkey" PRIMARY KEY ("comment_id", "user_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_votes"
    ADD CONSTRAINT "post_votes_pkey" PRIMARY KEY ("post_id", "user_id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "update_comment_counts_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_comment_counts"();



CREATE OR REPLACE TRIGGER "update_comment_score_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."comment_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_comment_score"();



CREATE OR REPLACE TRIGGER "update_post_score_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."post_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_post_score"();



ALTER TABLE ONLY "public"."comment_votes"
    ADD CONSTRAINT "comment_votes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_votes"
    ADD CONSTRAINT "comment_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_votes"
    ADD CONSTRAINT "post_votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post_votes"
    ADD CONSTRAINT "post_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can create comments" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authenticated users can create posts" ON "public"."posts" FOR INSERT WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Comments are viewable by everyone" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Posts are viewable by everyone" ON "public"."posts" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can delete own comments" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can delete own posts" ON "public"."posts" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can manage own comment votes" ON "public"."comment_votes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own post votes" ON "public"."post_votes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own comments" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can update own posts" ON "public"."posts" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Votes are viewable by everyone" ON "public"."comment_votes" FOR SELECT USING (true);



CREATE POLICY "Votes are viewable by everyone" ON "public"."post_votes" FOR SELECT USING (true);



ALTER TABLE "public"."comment_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."update_comment_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comment_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comment_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_comment_score"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_comment_score"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_comment_score"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_post_score"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_post_score"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_post_score"() TO "service_role";


















GRANT ALL ON TABLE "public"."comment_votes" TO "anon";
GRANT ALL ON TABLE "public"."comment_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_votes" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."post_votes" TO "anon";
GRANT ALL ON TABLE "public"."post_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."post_votes" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


