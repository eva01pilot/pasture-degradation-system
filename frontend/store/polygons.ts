import { defineStore } from "pinia";
import { watch } from "vue";
import { computed } from "vue";
import { ref } from "vue";
export type Polygon = {
  id: string | undefined;
  name: string | undefined;
  coordinates: number[][];
  createdAt: number | undefined;
  featureId: string;
}[];
export const usePolygonsStore = defineStore("polygons", () => {
  const polygons = ref<Polygon[]>();

  const addPolygon = (polygon: Polygon) => {
    polygons.value.push(polygon);
  };

  return { polygons, addPolygon };
});
