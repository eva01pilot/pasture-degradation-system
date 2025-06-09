import Fastify from "fastify";
import { verifyKeycloakToken } from "./auth/keycloak";
import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import * as Minio from "minio";
import { appRouter } from "./trpc/router";
import cors from "@fastify/cors";
import {
  createOpenApiHttpHandler,
  fastifyTRPCOpenApiPlugin,
} from "trpc-to-openapi";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import { openApiDocument } from "./trpc/router";

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
  prefix: "/trpc",
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

await app.register(fastifyTRPCOpenApiPlugin, { router: appRouter });

app.get("/openapi.json", () => openApiDocument);
await app.register(fastifySwagger, {
  mode: "static",
  specification: { document: openApiDocument },
});
await app.register(fastifySwaggerUI, {
  routePrefix: "/documentation",
  indexPrefix: "/api",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },

  transformSpecificationClone: true,
});
app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
  app.swagger();
});
