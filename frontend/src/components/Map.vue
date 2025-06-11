<script setup lang="ts">
import { onMounted } from "vue";
import { useTemplateRef } from "vue";
import { MGLMap } from "../lib/map";
import { usePolygonsStore } from "../store/polygons";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { shallowRef } from "vue";
import { useMapStore } from "../store/map";

const mapRef = useTemplateRef("mapRef");

const polygonStore = usePolygonsStore();
const { polygons } = storeToRefs(polygonStore);

const mapStore = useMapStore();

onMounted(() => {
  if (!mapRef.value) return;
  mapStore.addMap(mapRef.value);
});

watch(polygons, () => {
  polygons.value.forEach((poly) => {
    mapStore.mapPolygonService.addPolygon(poly);
  });
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
