import { eq } from "drizzle-orm";
import { db } from "../../db";
import { analyses, files, polygons, users } from "../../db/schema";
import { protectedProcedure, t } from "../base";
import {
  analyzePolygonPythonResponseSchema,
  analyzePolygonRequestSchema,
  polygonUpdateParamsSchema,
  polygonRequestAnalyticsSchema,
  polygonUpdateSchema,
} from "../validation/polygon";
import { TRPCError } from "@trpc/server";
import { polygonCreateSchema } from "../validation/polygon";
import { minioClient } from "../..";
import { base64toBuffer } from "../../utils/base64toBuffer";
import { uploadFileToBucket } from "../../services/fileUpload";
import {
  getPolygonsResultSchema,
  analyzePolygonResultSchema,
  getPolygonAnalyticsResultSchema,
  updatePolygonResultSchema,
  createPolygonResultSchema,
} from "../validation/polygon.output";
import { z } from "zod";
import path from "path";
export const polygonRouter = t.router({
  getPolygons: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/polygons" } })
    .input(z.undefined())
    .output(getPolygonsResultSchema)
    .query(async ({ ctx, input }) => {
      const userID = ctx.userID;

      const allPolygons = await db
        .select()
        .from(polygons)
        .where(eq(polygons.createdBy, userID));

      return { polygons: allPolygons };
    }),
  analyzePolygon: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/polygons/analyze" } })
    .input(analyzePolygonRequestSchema)
    .output(analyzePolygonResultSchema)
    .query(async ({ ctx, input }) => {
      const req = ctx.req;
      const res = await fetch("http://python-api:3001/analyze", {
        method: "POST",
        body: JSON.stringify(input),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      const parsed = analyzePolygonPythonResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const dbRes = await db
        .insert(analyses)
        .values({
          polygonId: input.polygonId,
          analysis_date: new Date(parsed.data.metrics.analysis_date),
          coordinates_count: parsed.data.metrics.coordinates_count,
          area_hectares: parsed.data.metrics.area_hectares,
          degradation_risk: parsed.data.metrics.degradation_risk,
          ndvi_mean: parsed.data.metrics.ndvi_mean,
          ndvi_std: parsed.data.metrics.ndvi_std,
          soil_moisture: parsed.data.metrics.soil_moisture,
          vegetation_coverage: parsed.data.metrics.vegetation_coverage,
        })
        .returning({ id: analyses.id });

      const { buffer, extension, mimeType } = base64toBuffer(
        parsed.data.image_base64,
      );

      const bucket = process.env.MINIO_RESULTS_BUCKET;
      const filename = `${input.polygonId}/${parsed.data.metrics.analysis_date}.${extension}`;

      await uploadFileToBucket(bucket!, filename, mimeType, buffer);
      const analysisID = dbRes[0].id;

      const path = `http://${process.env.DOMAIN}/minio/${bucket}/${encodeURIComponent(filename)}`;

      await db.insert(files).values({
        analysisId: analysisID,
        path,
        type: mimeType,
        createdAt: new Date(),
        size: buffer.length,
      });

      return { success: true };
    }),
  getPolygonAnalytics: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/polygons/analyze" } })
    .input(polygonRequestAnalyticsSchema)
    .output(getPolygonAnalyticsResultSchema)
    .query(async (opts) => {
      const res = await db
        .select({
          ndvi_mean: analyses.ndvi_mean,
          ndvi_std: analyses.ndvi_std,
          rasterFile: files.path,
          degradation_risk: analyses.degradation_risk,
          vegetation_coverage: analyses.vegetation_coverage,
          soil_moisture: analyses.soil_moisture,
          area_hectares: analyses.area_hectares,
          analysis_date: analyses.analysis_date,
          coordinates_count: analyses.coordinates_count,
        })
        .from(analyses)
        .where(eq(analyses.polygonId, opts.input.id))
        .innerJoin(files, eq(analyses.id, files.analysisId));

      return res;
    }),
  updatePolygon: protectedProcedure
    .meta({ openapi: { method: "PUT", path: "/polygons/{featureId}" } })
    .input(polygonUpdateSchema)
    .output(updatePolygonResultSchema)
    .mutation(async (opts) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.keycloakId, opts.ctx.userID));

      const dbRes = await db
        .update(polygons)
        .set({
          coordinates: opts.input.coordinates,
          createdBy: user.at(0)?.keycloakId,
          createdAt: new Date(),
          featureId: opts.input.featureId,
          name: opts.input.name,
        })
        .where(eq(polygons.featureId, opts.input.featureId));
      return { success: true };
    }),
  createPolygon: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/polygons" } })
    .input(polygonCreateSchema)
    .output(createPolygonResultSchema)
    .mutation(async (opts) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.keycloakId, opts.ctx.userID));

      const dbRes = await db.insert(polygons).values({
        coordinates: opts.input.coordinates,
        createdBy: user[0]?.keycloakId,
        createdAt: new Date(),
        featureId: opts.input.featureId,
        name: opts.input.name,
        color: opts.input.color,
      });
      return { success: true };
    }),
});
