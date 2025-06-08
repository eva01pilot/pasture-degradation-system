// drizzle/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  jsonb,
  integer,
  primaryKey,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  keycloakId: varchar("keycloak_id", { length: 255 }).notNull().unique(),
  username: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const polygons = pgTable("polygons", {
  featureId: varchar("featureId", { length: 255 }).primaryKey().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  coordinates: jsonb("coordinates").notNull(), // [[lng, lat], ...]
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  color: varchar("color", { length: 255 }).notNull(),
});

export const degradationRiskEnum = pgEnum("degradation_risk", [
  "Низкий",
  "Средний",
  "Высокий",
]);
export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  polygonId: varchar("polygon_id")
    .notNull()
    .references(() => polygons.featureId),
  ndvi_std: numeric(),
  ndvi_mean: numeric(),
  degradation_risk: degradationRiskEnum(),
  analysis_date: timestamp("analysis_date"),
  vegetation_coverage: numeric(),
  soil_moisture: numeric(),
  area_hectares: numeric(),
  coordinates_count: numeric(),
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  analysisId: uuid("analysis_id")
    .notNull()
    .references(() => analyses.id),
  type: varchar("type", { length: 32 }).notNull(), // e.g., 'tif', 'png', 'meta'
  path: text("path").notNull(), // MinIO object path, e.g., results/polygon/date/file
  size: integer("size"), // bytes
  createdAt: timestamp("created_at").defaultNow(),
});
