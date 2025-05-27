<script setup lang="ts">
import maplibregl, { type IControl } from "maplibre-gl";
import { onMounted } from "vue";
import { useTemplateRef } from "vue";
import { MGLMap } from "../lib/map";

const mapRef = useTemplateRef("mapRef");
onMounted(() => {
  if (!mapRef.value) return;
  const map = new MGLMap(mapRef.value);
  map.setupControls();
});
</script>

<template>
  <div ref="mapRef"></div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
