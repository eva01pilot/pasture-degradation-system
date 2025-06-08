CREATE TYPE "public"."degradation_risk" AS ENUM('Низкий', 'Средний', 'Высокий');--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "ndvi_std" numeric;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "ndvi_mean" numeric;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "degradation_risk" "degradation_risk";--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "analysis_date" timestamp;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "vegetation_coverage" numeric;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "soil_moisture" numeric;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "area_hectares" numeric;--> statement-breakpoint
ALTER TABLE "analyses" ADD COLUMN "coordinates_count" numeric;--> statement-breakpoint
ALTER TABLE "analyses" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "analyses" DROP COLUMN "degradation_level";--> statement-breakpoint
ALTER TABLE "analyses" DROP COLUMN "area_affected";--> statement-breakpoint
ALTER TABLE "analyses" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "analyses" DROP COLUMN "created_at";