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
