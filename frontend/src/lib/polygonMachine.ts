import { createMachine, setup, assign } from "xstate";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { Feature, Polygon as GeoPolygon, Position } from "geojson";

export interface AppPolygon {
  id: string;
  name: string;
  coordinates: Position[][];
  createdAt?: number;
  featureId: string;
}

export const appPolygonToFeature = (poly: AppPolygon): GeoJSON.Feature => {
  return {
    type: "Feature",
    geometry: {
      coordinates: poly.coordinates,
      type: "Polygon",
    },
    properties: {},
  };
};
