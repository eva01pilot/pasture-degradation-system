import Fastify from "fastify";
import { db } from "./db";
import { users } from "./db/schema";

const app = Fastify();
const PORT = 3000;

app.get("/api/hello", async () => {
  const allUsers = await db.select().from(users);
  return { allUsers };
});

app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});
