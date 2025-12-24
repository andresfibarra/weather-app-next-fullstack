


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



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrement_display_order"("uid" "uuid", "threshold" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update user_saved_locations
  set display_order = display_order - 1
  where user_id = uid
    and display_order > threshold;
end;
$$;


ALTER FUNCTION "public"."decrement_display_order"("uid" "uuid", "threshold" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reorder_user_locations"("p_user_id" "uuid", "p_moved_id" "uuid", "p_target_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_moved_display_order integer;
  v_target_display_order integer;
  v_min_order integer;
  v_max_order integer;
begin
  -- Get the display orders for both locations
  select display_order into v_moved_display_order
  from user_saved_locations
  where id = p_moved_id and user_id = p_user_id;

  select display_order into v_target_display_order
  from user_saved_locations
  where id = p_target_id and user_id = p_user_id; 

  -- Validate that both locations exist
  if v_moved_display_order is null or v_target_display_order is null then
    raise exception 'One or both location IDs not found';
  end if; 

  -- if they're the same, return
  if v_moved_display_order = v_target_display_order then
    return; 
  end if;

  -- calculate min and max for the range
  v_min_order := least(v_moved_display_order, v_target_display_order);
  v_max_order := greatest(v_moved_display_order, v_target_display_order); 

  -- Case 1: Moving to a higher display_order (moved < target)
  -- Decrement display_order for cities in between
  if v_moved_display_order < v_target_display_order then
    update user_saved_locations
    set display_order = display_order - 1
    where user_id = p_user_id
      and display_order > v_min_order
      and display_order <= v_max_order
      and id != p_moved_id;
  
  -- Case 2: Moving to a lower display_order (moved > target)
  -- Increment display_order for cities in between
  else
    update user_saved_locations
    set display_order = display_order + 1
    where user_id = p_user_id
      and display_order >= v_min_order
      and display_order < v_max_order
      and id != p_moved_id;
  end if;
  
  -- Set the moved city's display_order to the target's display_order
  update user_saved_locations
  set display_order = v_target_display_order
  where id = p_moved_id and user_id = p_user_id;
end;
$$;


ALTER FUNCTION "public"."reorder_user_locations"("p_user_id" "uuid", "p_moved_id" "uuid", "p_target_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "location" character varying(255) NOT NULL,
    "state_code" character varying(10),
    "country_code" character varying(3) NOT NULL,
    "time_zone_abbreviation" "text" NOT NULL,
    "latitude" numeric(10,8) NOT NULL,
    "longitude" numeric(11,8) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_saved_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "saved_at" timestamp with time zone DEFAULT "now"(),
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."user_saved_locations" OWNER TO "postgres";


ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_location_state_code_country_code_key" UNIQUE ("location", "state_code", "country_code");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_saved_locations"
    ADD CONSTRAINT "user_saved_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_saved_locations"
    ADD CONSTRAINT "user_saved_locations_user_id_location_id_key" UNIQUE ("user_id", "location_id");



CREATE INDEX "idx_user_saved_locations_user" ON "public"."user_saved_locations" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."user_saved_locations"
    ADD CONSTRAINT "user_saved_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE CASCADE;



CREATE POLICY "Enable delete for users based on user_id" ON "public"."user_saved_locations" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."locations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."user_saved_locations" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."locations" FOR SELECT USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."user_saved_locations" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_saved_locations" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."decrement_display_order"("uid" "uuid", "threshold" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_display_order"("uid" "uuid", "threshold" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_display_order"("uid" "uuid", "threshold" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."reorder_user_locations"("p_user_id" "uuid", "p_moved_id" "uuid", "p_target_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_user_locations"("p_user_id" "uuid", "p_moved_id" "uuid", "p_target_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_user_locations"("p_user_id" "uuid", "p_moved_id" "uuid", "p_target_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."user_saved_locations" TO "anon";
GRANT ALL ON TABLE "public"."user_saved_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."user_saved_locations" TO "service_role";









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


