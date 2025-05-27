import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

import VueRouter from "unplugin-vue-router/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), VueRouter(), tailwindcss()],
  server: {
    host: true, // важно для Docker
    port: 5173,
    strictPort: true,
  },
});
