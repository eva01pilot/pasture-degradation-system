import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { protectedProcedure, publicProcedure, t } from "../base";
import { TRPCError } from "@trpc/server";
import { verifyKeycloakToken } from "../../auth/keycloak";
export const userRouter = t.router({
  signUp: publicProcedure.mutation(async (opts) => {
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
      const newUser = await db.insert(users).values({
        keycloakId: userID,
        createdAt: new Date(),
        id: userID,
        username: userID,
      });
      return newUser;
    }

    return user;
  }),
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const userID = ctx.userID;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.keycloakId, userID));
    return user;
  }),
});
