import { createMachine, setup, assign } from "xstate";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { Feature, Polygon as GeoPolygon, Position } from "geojson";

export interface AppPolygon {
  name: string;
  coordinates: Position[][];
  createdAt?: string;
  featureId: string;
  createdBy?: string;
  color: string;
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
