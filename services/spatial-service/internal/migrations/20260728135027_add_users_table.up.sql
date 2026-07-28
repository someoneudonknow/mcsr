-- create "users" table
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL DEFAULT uuidv7(),
  "created_at" timestamptz NULL,
  "updated_at" timestamptz NULL,
  "deleted_at" timestamptz NULL,
  "external_id" text NOT NULL,
  "email" text NULL,
  "user_name" text NULL,
  "active" boolean NULL DEFAULT true,
  PRIMARY KEY ("id")
);
-- create index "idx_users_deleted_at" to table: "users"
CREATE INDEX "idx_users_deleted_at" ON "public"."users" ("deleted_at");
-- create index "idx_users_email" to table: "users"
CREATE UNIQUE INDEX "idx_users_email" ON "public"."users" ("email");
-- create index "idx_users_external_id" to table: "users"
CREATE UNIQUE INDEX "idx_users_external_id" ON "public"."users" ("external_id");
