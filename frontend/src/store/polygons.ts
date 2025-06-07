import { defineStore } from "pinia";
import { ref } from "vue";
import { type AppPolygon } from "../lib/polygonMachine";
import { api } from "../main";
export const usePolygonsStore = defineStore("polygons", () => {
  const polygons = ref<AppPolygon[]>([]);

  const addPolygon = (polygon: AppPolygon) => {
    polygons.value.push(polygon);
  };

  const addPolygonFromFeature = (
    feature: GeoJSON.Feature<GeoJSON.Polygon>,
    color: string,
  ) => {
    const polygon = {
      id: String(feature.id),
      name: `Полигон ${feature.id}`,
      coordinates: feature.geometry.coordinates,
      featureId: String(feature.id),
      color,
    };
    polygons.value.push(polygon);
    api.instance.post("/polygons", polygon);
  };

  const editPolygonFromFeature = async (
    feature: GeoJSON.Feature<GeoJSON.Polygon>,
  ) => {
    const polygon = polygons.value.find((p) => p.featureId === feature.id);
    if (!polygon) return;
    polygon.name = `Полигон ${feature.id}`;
    polygon.coordinates = feature.geometry.coordinates;
    polygon.featureId = String(feature.id);

    await api.instance.put(`/polygons/${feature.id}`, polygon);
  };

  const fetchPolygonData = async () => {
    const res = await api.instance.get<{ allPolygons: AppPolygon[] }>(
      "polygons",
    );
    polygons.value = res.data.allPolygons;
  };

  return {
    polygons,
    addPolygon,
    addPolygonFromFeature,
    editPolygonFromFeature,
    fetchPolygonData,
  };
});
