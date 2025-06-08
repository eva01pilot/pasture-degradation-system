import Fastify from "fastify";
import { verifyKeycloakToken } from "./auth/keycloak";
import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import * as Minio from "minio";
import { appRouter } from "./trpc/router";

const app = Fastify();
const PORT = 3000;
export const minioClient = new Minio.Client({
  endPoint: "minio",
  port: 9000,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
  useSSL: false,
});

await app.register(fastifyTRPCPlugin, {
  prefix: "/",
  trpcOptions: {
    router: appRouter,
    createContext: async ({ req }: CreateFastifyContextOptions) => {
      const authHeader = req.headers.authorization;
      let userID: string | null = null;

      if (authHeader) {
        try {
          const claims = await verifyKeycloakToken(authHeader);
          if (!claims.sub) throw new Error();
          userID = claims.sub;
        } catch (err) {}
      }

      return {
        req,
        userID,
      };
    },
  },
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
