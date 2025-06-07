CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"polygon_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"degradation_level" varchar(64),
	"area_affected" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_id" uuid NOT NULL,
	"type" varchar(32) NOT NULL,
	"path" text NOT NULL,
	"size" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "polygons" (
	"featureId" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"coordinates" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"color" varchar(255),
	CONSTRAINT "polygons_featureId_unique" UNIQUE("featureId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keycloak_id" varchar(255) NOT NULL,
	"email" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_keycloak_id_unique" UNIQUE("keycloak_id")
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_polygon_id_polygons_featureId_fk" FOREIGN KEY ("polygon_id") REFERENCES "public"."polygons"("featureId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "polygons" ADD CONSTRAINT "polygons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;