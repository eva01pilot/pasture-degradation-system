<script setup lang="ts">
import { onMounted } from "vue";
import { useTemplateRef } from "vue";
import { MGLMap } from "../lib/map";
import { usePolygonsStore } from "../store/polygons";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { shallowRef } from "vue";

const mapRef = useTemplateRef("mapRef");

const polygonStore = usePolygonsStore();
const { polygons } = storeToRefs(polygonStore);

const map = shallowRef<MGLMap>();

onMounted(() => {
  if (!mapRef.value) return;
  map.value = new MGLMap(mapRef.value);
});

watch(
  polygons,
  (newPolygons, oldPolygons) => {
    map.value?.removePolygons(oldPolygons);
    map.value?.addPolygons(newPolygons);
  },
  { deep: true },
);

defineExpose({ map });
</script>

<template>
  <div ref="mapRef"></div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
