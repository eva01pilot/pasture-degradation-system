import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { protectedProcedure, publicProcedure, t } from "../base";
import { TRPCError } from "@trpc/server";
import { verifyKeycloakToken } from "../../auth/keycloak";
import { userSignUpResultSchema } from "../validation/user.output";
import { z } from "zod";
export const userRouter = t.router({
  signUp: publicProcedure
    .meta({ openapi: { method: "POST", path: "/signup" } })
    .input(z.undefined())
    .output(userSignUpResultSchema)
    .mutation(async (opts) => {
      const claims = await verifyKeycloakToken(
        opts.ctx.req.headers.authorization!,
      );
      const userID = claims.sub;
      if (!userID) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const userRes = await db
        .select()
        .from(users)
        .where(eq(users.keycloakId, userID));

      const user = userRes.at(0);
      if (!user) {
        const newUser = await db
          .insert(users)
          .values({
            keycloakId: userID,
            createdAt: new Date(),
            id: userID,
            username: userID,
          })
          .returning({
            id: users.id,
            keycloakId: users.keycloakId,
            username: users.username,
            createdAt: users.createdAt,
          });
        return newUser[0];
      }

      return user;
    }),
  getMe: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/user/me" } })
    .input(z.undefined())
    .output(userSignUpResultSchema)
    .query(async ({ ctx }) => {
      const userID = ctx.userID;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.keycloakId, userID));
      return user[0];
    }),
});
