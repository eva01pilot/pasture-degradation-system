<script setup lang="ts">
import { onMounted } from "vue";
import { useTemplateRef } from "vue";
import { MGLMap } from "../lib/map";
import { usePolygonsStore } from "../store/polygons";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { shallowRef } from "vue";
import { appPolygonToFeature } from "../lib/polygonMachine";
import { getRandomVibrantColor } from "../lib/utils";

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
    oldPolygons.forEach((poly) => {
      if (map.value?.map.getLayer(poly.featureId))
        map.value?.map.removeLayer(poly.featureId);
      if (map.value?.map.getSource(poly.featureId))
        map.value?.map.removeSource(poly.featureId);
    });
    console.log(newPolygons);
    newPolygons.forEach((poly) => {
      map.value?.map.addSource(poly.featureId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [appPolygonToFeature(poly)],
        },
      });

      map.value?.map.addLayer({
        id: poly.featureId,
        type: "fill",
        source: poly.featureId,
        paint: {
          "fill-color": getRandomVibrantColor(),
          "fill-opacity": 0.9,
        },
      });
    });
  },
  { deep: true },
);
</script>

<template>
  <div ref="mapRef"></div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
