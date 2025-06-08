import { initTRPC, TRPCError } from "@trpc/server";
import { FastifyRequest } from "fastify";

export const t = initTRPC
  .context<{
    req: FastifyRequest;
    userID: string | null;
  }>()
  .create();

export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async (opts) => {
  if (!opts.ctx.userID) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      userID: opts.ctx.userID,
      req: opts.ctx.req,
    },
  });
});
