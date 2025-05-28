import KcAdminClient from "@keycloak/keycloak-admin-client";
import dotenv from "dotenv";
import path from "path";
import { db } from "../db/index";
import { users } from "../db/schema";
import { fileURLToPath } from "url";

// Required if using ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
const kcAdminClient = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_BASE_URL,
});

const main = async () => {
  await kcAdminClient.auth({
    username: process.env.KEYCLOAK_ADMIN,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD,
    grantType: "password",
    clientId: "admin-cli",
  });
  const usersAll = await kcAdminClient.users.find();
  usersAll.forEach(async (user) => {
    await db
      .insert(users)
      .values({
        email: user.email!,
        keycloakId: user.id!,
        id: user.id,
      })
      .onConflictDoUpdate({
        target: users.keycloakId,
        set: { id: user.id, email: user.email, keycloakId: user.id },
      });
  });
  console.log(await db.select().from(users));
};

main();
