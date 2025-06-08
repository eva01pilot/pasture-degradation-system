import { initTRPC, TRPCError } from "@trpc/server";
import { FastifyRequest } from "fastify";
import { polygonRouter } from "./routers/polygon";
import { userRouter } from "./routers/user";
import { t } from "./base";

export const appRouter = t.router({
  polygon: polygonRouter,
  user: userRouter,
});

// Export router type for use in server and frontend
export type AppRouter = typeof appRouter;
