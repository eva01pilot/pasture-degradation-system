import type { Position } from "geojson";

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

  analytics: AppPolygonAnalytics;
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
