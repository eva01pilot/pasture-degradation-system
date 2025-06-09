import { z } from "zod";

export const userSignUpResultSchema = z.object({
  id: z.string(),
  keycloakId: z.string(),
  username: z.string().nullable(),
  createdAt: z.coerce.date().nullable(),
});
