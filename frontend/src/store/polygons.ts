import { defineStore } from "pinia";
import { ref } from "vue";

import mgl from "maplibre-gl";
import type { Position } from "geojson";
import type { App } from "vue";
import { trpc } from "../main";

export interface AppPolygonAnalytics {
  ndvi_mean: string | null;
  ndvi_std: string | null;
  degradation_risk: "Низкий" | "Средний" | "Высокий" | null;
  vegetation_coverage: string | null;
  soil_moisture: string | null;
  area_hectares: string | null;
  analysis_date: string | null;
  coordinates_count: string | null;
  rasterFile: string | null;
}

export interface AppPolygon {
  name: string;
  coordinates: Position[][];
  createdAt?: string;
  featureId: string;
  createdBy?: string;
  color: string;

  analytics?: AppPolygonAnalytics[];
}

export function getRasterBounds(
  coordinates: number[][][],
): [[number, number], [number, number], [number, number], [number, number]] {
  if (!coordinates.length || !coordinates[0].length) {
    throw new Error("Invalid polygon coordinates");
  }

  let minLon = Infinity,
    maxLon = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  // Check all points (including holes)
  coordinates.forEach((ring) => {
    ring.forEach(([lon, lat]) => {
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
  });

  return [
    [minLon, minLat], // Southwest
    [maxLon, minLat], // Southeast
    [maxLon, maxLat], // Northeast
    [minLon, maxLat], // Northwest
  ];
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
export function getBoundingBox(coordinates: number[][]) {
  let bounds: {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
  } = {};

  for (let i = 0; i < coordinates.length; i++) {
    let longitude = coordinates[i][0];
    let latitude = coordinates[i][1];
    if (bounds.xMin && bounds.xMax && bounds.yMin && bounds.yMax) {
      bounds.xMin = bounds.xMin < longitude ? bounds.xMin : longitude;
      bounds.xMax = bounds.xMax > longitude ? bounds.xMax : longitude;
      bounds.yMin = bounds.yMin < latitude ? bounds.yMin : latitude;
      bounds.yMax = bounds.yMax > latitude ? bounds.yMax : latitude;
    } else {
      bounds.xMin = longitude;
      bounds.xMax = longitude;
      bounds.yMin = latitude;
      bounds.yMax = latitude;
    }
  }
  if (bounds.xMin && bounds.xMax && bounds.yMin && bounds.yMax) {
    return new mgl.LngLatBounds(
      new mgl.LngLat(bounds.xMin, bounds.yMin),
      new mgl.LngLat(bounds.xMax, bounds.yMax),
    );
  }
  return undefined;
}
export const usePolygonsStore = defineStore("polygons", () => {
  const polygons = ref<AppPolygon[]>([]);
  const selectedPolygon = ref<AppPolygon>();

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
    fetchAnalytics();
  };

  const fetchAnalytics = async () => {
    if (!selectedPolygon.value) return;
    const analytics = await trpc.polygon.getPolygonAnalytics.query({
      id: selectedPolygon.value.featureId,
    });
    selectedPolygon.value.analytics = analytics.map((an) => ({
      ...an,
    }));
  };

  const fetchPolygonData = async () => {
    const res = await trpc.polygon.getPolygons.query();
    polygons.value = res.polygons as AppPolygon[];
    selectedPolygon.value = polygons.value.at(0);
    fetchAnalytics();
  };

  return {
    polygons,
    addPolygon,
    addPolygonFromFeature,
    editPolygonFromFeature,
    fetchPolygonData,
    analyze,
    selectedPolygon,
  };
});
