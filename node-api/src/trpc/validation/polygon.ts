import { z } from "zod";

export const polygonCreateSchema = z.object({
  coordinates: z.array(z.array(z.array(z.number()))),
  featureId: z.string(),
  name: z.string(),
  color: z.string(),
});
export const polygonUpdateSchema = z.object({
  coordinates: z.array(z.array(z.array(z.number()))),
  featureId: z.string(),
  name: z.string(),
  createdBy: z.string(),
  createdAt: z.string(),
  color: z.string(),
});

export const polygonUpdateParamsSchema = z.object({
  id: z.string(),
});
export const polygonRequestAnalyticsSchema = z.object({
  id: z.string(),
});

export const geometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(
    // list of rings
    z.array(
      // list of points
      z.array(z.number()), // [lon, lat]
    ),
  ),
});

export const analyzePolygonRequestSchema = z.object({
  polygonId: z.string(),
  geometry: geometrySchema,
});

export const analyzePolygonPythonResponseSchema = z.object({
  status: z.literal("success"),
  image_base64: z.string(),
  image_format: z.literal("PNG"),
  metrics: z.object({
    ndvi_mean: z.coerce.string(),
    ndvi_std: z.coerce.string(),
    degradation_risk: z.enum(["Низкий", "Средний", "Высокий"]),
    vegetation_coverage: z.coerce.string(),
    soil_moisture: z.coerce.string(),
    area_hectares: z.coerce.string(),
    analysis_date: z.coerce.string(), // assuming Unix timestamp; use z.string() if ISO string
    coordinates_count: z.coerce.string(),
  }),
});
