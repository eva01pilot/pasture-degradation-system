import { createRemoteJWKSet, jwtVerify } from "jose";

const keycloakIssuer = `http://${process.env.DOMAIN}/auth/realms/${process.env.REALM_NAME}`; // update to your realm
const keycloakIssuerInternal = `http://caddy/auth/realms/${process.env.REALM_NAME}`; // update to your realm
const keycloakClientId = process.env.BACKEND_CLIENT_ID;

const JWKS = createRemoteJWKSet(
  new URL(`${keycloakIssuerInternal}/protocol/openid-connect/certs`),
);

export async function verifyKeycloakToken(authorizationHeader: string) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authorizationHeader.split(" ")[1];

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: keycloakIssuer,
    audience: keycloakClientId,
  });

  return payload; // decoded claims
}
