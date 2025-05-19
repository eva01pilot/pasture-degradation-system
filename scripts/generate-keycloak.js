const fs = require("fs");
require("dotenv").config();

const realm = {
  realm: process.env.REALM_NAME,
  enabled: true,
  users: [
    {
      username: process.env.REALM_USER,
      enabled: true,
      emailVerified: true,
      email: process.env.REALM_USER_EMAIL,
      credentials: [
        {
          type: "password",
          value: process.env.REALM_USER_PASSWORD,
          temporary: false,
        },
      ],
    },
  ],
  clients: [
    {
      clientId: process.env.DEV_CLIENT_ID,
      enabled: true,
      protocol: "openid-connect",
      publicClient: true,
      redirectUris: [process.env.DEV_CLIENT_REDIRECT],
    },
    {
      clientId: process.env.PROD_CLIENT_ID,
      enabled: true,
      protocol: "openid-connect",
      publicClient: true,
      redirectUris: [process.env.PROD_CLIENT_REDIRECT],
    },
  ],
};

fs.mkdirSync("./realm-import", { recursive: true });
fs.writeFileSync(
  "./realm-import/realm-export.json",
  JSON.stringify(realm, null, 2),
);
console.log("✅ Realm config generated from .env");
