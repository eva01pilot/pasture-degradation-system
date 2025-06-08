import { defineStore } from "pinia";
import { ref } from "vue";

import type { Position } from "geojson";
import type { App } from "vue";
import { trpc } from "../main";

export interface AppPolygonAnalytics {
  ndvi_mean: number;
  ndvi_std: number;
  degradation_risk: "Низкий" | "Средний" | "Высокий";
  vegetation_coverage: number;
  soil_moisture: number;
  area_hectares: number;
  analysis_date: number;
  coordinates_count: number;
}

export interface AppPolygon {
  name: string;
  coordinates: Position[][];
  createdAt?: string;
  featureId: string;
  createdBy?: string;
  color: string;

  analytics?: AppPolygonAnalytics;
}

export const appPolygonToFeature = (
  poly: AppPolygon,
): GeoJSON.Feature<GeoJSON.Polygon> => {
  return {
    type: "Feature",
    id: poly.featureId,
    geometry: {
      coordinates: poly.coordinates,
      type: "Polygon",
    },
    properties: {},
  };
};
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
    trpc.polygon.createPolygon.mutate(polygon);
  };

  const editPolygonFromFeature = async (
    feature: GeoJSON.Feature<GeoJSON.Polygon>,
  ) => {
    const polygon = polygons.value.find((p) => p.featureId === feature.id);
    if (!polygon) return;
    if (!polygon.createdAt || !polygon.createdBy) return;
    polygon.name = `Полигон ${feature.id}`;
    polygon.coordinates = feature.geometry.coordinates;
    polygon.featureId = String(feature.id);

    await trpc.polygon.updatePolygon.mutate({
      ...polygon,
      createdAt: polygon.createdAt,
      createdBy: polygon.createdBy,
    });
  };
  const analyze = async (
    coordinates: AppPolygon["coordinates"],
    polygonID: string,
  ) => {
    await trpc.polygon.analyzePolygon.query({
      polygonId: polygonID,
      geometry: {
        type: "Polygon",
        coordinates,
      },
    });

    const analytics = await trpc.polygon.getPolygonAnalytics.query({
      id: polygonID,
    });
  };

  const fetchPolygonData = async () => {
    const res = await trpc.polygon.getPolygons.query();
    polygons.value = res.polygons as AppPolygon[];
  };

  return {
    polygons,
    addPolygon,
    addPolygonFromFeature,
    editPolygonFromFeature,
    fetchPolygonData,
    analyze,
  };
});
