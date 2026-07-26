-- create "users" table
CREATE TABLE "public"."users" (
  "external_id" text NOT NULL,
  "email" text NULL,
  "user_name" text NULL,
  "active" boolean NULL DEFAULT true
);
-- create index "idx_users_email" to table: "users"
CREATE UNIQUE INDEX "idx_users_email" ON "public"."users" ("email");
-- create index "idx_users_external_id" to table: "users"
CREATE UNIQUE INDEX "idx_users_external_id" ON "public"."users" ("external_id");
