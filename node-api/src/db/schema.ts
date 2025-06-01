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
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  keycloakId: varchar("keycloak_id", { length: 255 }).notNull().unique(),
  username: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const polygons = pgTable("polygons", {
  featureId: varchar("featureId", { length: 255 }).primaryKey().unique(),
  name: varchar("name", { length: 255 }),
  coordinates: jsonb("coordinates").notNull(), // [[lng, lat], ...]
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  polygonId: uuid("polygon_id")
    .notNull()
    .references(() => polygons.id),
  date: timestamp("date").notNull(),
  degradationLevel: varchar("degradation_level", { length: 64 }),
  areaAffected: integer("area_affected"), // in hectares maybe
  metadata: jsonb("metadata"), // Any additional NDVI stats, etc.
  createdAt: timestamp("created_at").defaultNow(),
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
