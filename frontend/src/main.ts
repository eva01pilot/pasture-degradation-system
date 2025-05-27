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
import { Api } from "./services/api";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_BASE_URL,
  realm: import.meta.env.VITE_REALM_NAME,
  clientId: import.meta.env.VITE_DEV_CLIENT_ID,
});

const pinia = createPinia();
const api = new Api();

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
        api.setToken(keycloak.token);
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
    api.setToken(keycloak.token);
    startRender();
    //const userStore = useUserStoreModule.useUserStore();
    //userStore.getMe();
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
