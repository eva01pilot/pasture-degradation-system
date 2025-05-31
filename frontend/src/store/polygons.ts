import { defineStore } from "pinia";
import { reactive, watch } from "vue";
import { computed } from "vue";
import { ref } from "vue";
import { useMachine } from "@xstate/vue";
import { type AppPolygon } from "../lib/polygonMachine";
import { watchEffect } from "vue";
import type { Feature } from "maplibre-gl";
export const usePolygonsStore = defineStore("polygons", () => {
  const polygons = ref<AppPolygon[]>([]);

  const addPolygon = (polygon: AppPolygon) => {
    polygons.value.push(polygon);
  };

  const addPolygonFromFeature = (feature: GeoJSON.Feature<GeoJSON.Polygon>) => {
    polygons.value.push({
      id: String(feature.id),
      name: "",
      coordinates: feature.geometry.coordinates,
      featureId: String(feature.id),
    });
  };

  return { polygons, addPolygon, addPolygonFromFeature };
});
