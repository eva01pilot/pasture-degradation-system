import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Keycloak from "keycloak-js";

import "ant-design-vue/dist/reset.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import { routes } from "vue-router/auto-routes";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../node-api/src/trpc/router";

let token = "";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_BASE_URL,
      headers: () => {
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_BASE_URL,
  realm: import.meta.env.VITE_REALM_NAME,
  clientId: import.meta.env.VITE_FRONTEND_CLIENT_ID,
});

const pinia = createPinia();

export const logout = () => {
  localStorage.removeItem("keycloakToken");
  keycloak.clearToken();
  keycloak.logout();
};

function refreshToken() {
  keycloak
    .updateToken(90)
    .then((success) => {
      if (success && keycloak.token) {
        token = keycloak.token;
      }
    })
    .catch(() => {
      keycloak.clearToken();
      keycloak.logout();
    });
}
keycloak.init({ onLoad: "login-required" }).then(async (auth) => {
  if (!auth) {
    window.location.reload();
  } else {
    if (!keycloak.token) return;
    token = keycloak.token;
    startRender();
  }
  setInterval(() => {
    refreshToken();
  }, 30000);
});

function startRender() {
  const app = createApp(App);
  const router = createAutoRouter();
  app.use(router);
  app.use(pinia);
  app.mount("#app");
}

function createAutoRouter() {
  const router = createRouter({
    history: createWebHistory(),
    // pass the generated routes written by the plugin 🤖
    routes,
  });
  return router;
}
