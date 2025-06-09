import { z } from "zod";
export const getPolygonsResultSchema = z.object({
  polygons: z.array(
    z.object({
      featureId: z.string(),
      name: z.string(),
      coordinates: z.unknown(),
      createdBy: z.string(),
      createdAt: z.coerce.date(),
      color: z.string(),
    }),
  ),
});

export const analyzePolygonResultSchema = z.object({
  success: z.literal(true),
});

const fileSchema = z.object({
  id: z.string(),
  analysisId: z.string(),
  type: z.string(),
  path: z.string(),
  size: z.number().nullable(),
  createdAt: z.coerce.date().nullable(),
});

const analysisSchema = z.object({
  id: z.string(),
  polygonId: z.string(),
  ndvi_std: z.string().nullable(),
  ndvi_mean: z.string().nullable(),
  degradation_risk: z.enum(["Низкий", "Средний", "Высокий"]).nullable(),
  analysis_date: z.coerce.date().nullable(),
  vegetation_coverage: z.string().nullable(),
  soil_moisture: z.string().nullable(),
  area_hectares: z.string().nullable(),
  coordinates_count: z.string().nullable(),
});

export const getPolygonAnalyticsResultSchema = z.array(
  z.object({
    analyses: analysisSchema,
    files: fileSchema,
  }),
);

export const updatePolygonResultSchema = z.object({
  success: z.literal(true),
});
export const createPolygonResultSchema = z.object({
  success: z.literal(true),
});
