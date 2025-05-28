const fs = require("fs");
require("dotenv").config();

const realm = {
  realm: process.env.REALM_NAME,
  enabled: true,
  registrationAllowed: true,
  loginWithEmailAllowed: true,
  editUsernameAllowed: true,
  resetPasswordAllowed: true,
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
      realmRoles: ["admin"],
    },
  ],
  clients: [
    {
      clientId: process.env.DEV_CLIENT_ID,
      enabled: true,
      protocol: "openid-connect",
      publicClient: true,
      redirectUris: [process.env.DEV_CLIENT_REDIRECT],
      webOrigins: [process.env.DEV_CLIENT_REDIRECT.replace("/*", "")],
    },
    {
      clientId: process.env.PROD_CLIENT_ID,
      enabled: true,
      protocol: "openid-connect",
      publicClient: true,
      redirectUris: [process.env.PROD_CLIENT_REDIRECT],
      webOrigins: [process.env.PROD_CLIENT_REDIRECT.replace("/*", "")],
    },
  ],
  roles: {
    realm: [
      { name: "admin" },
      { name: "enterprise-manager" },
      { name: "field-operator" },
      { name: "viewer" },
    ],
  },
};

fs.mkdirSync("./realm-import", { recursive: true });
fs.writeFileSync(
  "./realm-import/realm-export.json",
  JSON.stringify(realm, null, 2),
);
console.log("✅ Realm config generated from .env");
