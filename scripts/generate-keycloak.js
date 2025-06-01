const fs = require("fs");
const path = require("path");

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
    // Frontend Client
    {
      clientId: process.env.FRONTEND_CLIENT_ID,
      enabled: true,
      protocol: "openid-connect",
      publicClient: true,
      redirectUris: [process.env.FRONTEND_CLIENT_REDIRECT],
      webOrigins: [process.env.FRONTEND_CLIENT_REDIRECT.replace("/*", "")],
      defaultClientScopes: ["web-origins", "profile", "email", "aud-scope"],
    },

    // Backend API Client
    {
      clientId: process.env.BACKEND_CLIENT_ID,
      enabled: true,
      protocol: "openid-connect",
      publicClient: false,
      bearerOnly: true, // Used for resource protection only
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

  clientScopes: [
    {
      name: "aud-scope",
      protocol: "openid-connect",
      protocolMappers: [
        {
          name: "aud",
          protocol: "openid-connect",
          protocolMapper: "oidc-hardcoded-claim-mapper",
          consentRequired: false,
          config: {
            "claim.name": "aud",
            "claim.value": process.env.BACKEND_CLIENT_ID,
            "jsonType.label": "String",
            "access.token.claim": "true",
            "id.token.claim": "true",
          },
        },
      ],
    },
  ],
};

fs.mkdirSync("./realm-import", { recursive: true });

fs.writeFileSync(
  "./realm-import/realm-export.json",
  JSON.stringify(realm, null, 2),
);

console.log("✅ Realm config generated from .env");
