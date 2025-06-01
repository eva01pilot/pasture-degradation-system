import Fastify from "fastify";
import { db } from "./db";
import { polygons, users } from "./db/schema";
import {
  polygonCreateSchema,
  polygonUpdateParamsSchema,
  polygonUpdateSchema,
} from "./validation/polygon";
import { verifyKeycloakToken } from "./auth/keycloak";
import { eq } from "drizzle-orm";

const app = Fastify();
const PORT = 3000;

app.get("/polygons", async () => {
  const allPolygons = await db.select().from(polygons);
  return { allPolygons };
});

app.post("/user/signup", async (req, res) => {
  const claims = await verifyKeycloakToken(req.headers.authorization!);
  const userID = claims.sub;
  if (!userID) {
    return res.code(401).send();
  }

  const userRes = await db
    .select()
    .from(users)
    .where(eq(users.keycloakId, userID));

  const user = userRes.at(0);
  if (!user) {
    await db.insert(users).values({
      keycloakId: userID,
      createdAt: new Date(),
      id: userID,
      username: userID,
    });
    return {
      status: "success",
    };
  }

  return {
    status: "success",
  };
});

app.get("/user/me", async (req, res) => {
  const claims = await verifyKeycloakToken(req.headers.authorization!);
  const userID = claims.sub;
  if (!userID) {
    return res.code(401).send();
  }
  const user = await db
    .select()
    .from(users)
    .where(eq(users.keycloakId, userID));
  return { user, userID };
});

app.post("/polygons", async (req, res) => {
  const params = polygonCreateSchema.safeParse(req.body);
  if (params.error) {
    return res.code(400).send({ error: "Неправильная форма данных" });
  }

  const claims = await verifyKeycloakToken(req.headers.authorization!);
  const userID = claims.sub;
  if (!userID) {
    return res.code(401).send();
  }
  const user = await db
    .select()
    .from(users)
    .where(eq(users.keycloakId, userID));

  const dbRes = await db.insert(polygons).values({
    coordinates: params.data.coordinates,
    createdBy: user.at(0)?.keycloakId,
    createdAt: new Date(),
    featureId: params.data.featureId,
    name: params.data.name,
  });

  return res.send(dbRes);
});

app.put("/polygons/:id", async (req, res) => {
  const params = polygonUpdateParamsSchema.safeParse(req.params);
  if (params.error) {
    return res.code(400).send({ error: "Неправильная форма данных" });
  }
  const body = polygonUpdateSchema.safeParse(req.body);
  if (body.error) {
    return res.code(400).send({ error: "Неправильная форма данных" });
  }

  const claims = await verifyKeycloakToken(req.headers.authorization!);
  const userID = claims.sub;
  if (!userID) {
    return res.code(401).send();
  }
  const user = await db
    .select()
    .from(users)
    .where(eq(users.keycloakId, userID));

  const dbRes = await db
    .update(polygons)
    .set({
      coordinates: body.data.coordinates,
      createdBy: user.at(0)?.keycloakId,
      createdAt: new Date(),
      featureId: body.data.featureId,
      name: body.data.featureId,
    })
    .where(eq(polygons.featureId, params.data.id));

  return res.send(dbRes);
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
