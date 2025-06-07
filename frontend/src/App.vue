<script setup lang="ts">
import { onMounted } from "vue";
import DefaultLayout from "./components/layout/DefaultLayout.vue";
import LeafletMap from "./components/LeafletMap.vue";
import PolygonList from "./components/polygon/PolygonList.vue";
import { api } from "./main";

onMounted(async () => {
  await api.instance.post("/user/signup");
});
</script>

<template>
  <DefaultLayout>
    <template #drawer-title>Полигоны</template>
    <template #drawer-default>
      <PolygonList class="min-w-64" />
    </template>
    <template #default>
      <LeafletMap class="h-full w-full" />
    </template>
  </DefaultLayout>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
