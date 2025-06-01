import KcAdminClient from "@keycloak/keycloak-admin-client";
import { db } from "../db/index";
import { users } from "../db/schema";

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
