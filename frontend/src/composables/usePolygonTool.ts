import { ref } from "vue";
import type { Ref } from "vue";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { Map as MapboxMap } from "mapbox-gl";
import type { Feature, Polygon as GeoPolygon } from "geojson";

export interface AppPolygon {
  id?: string;
  name: string;
  coordinates: number[][][];
  createdAt?: number;
  featureId?: string;
}

export function usePolygonTool({
  polygons,
  selectedPolygon,
}: {
  polygons: Ref<AppPolygon[]>;
  selectedPolygon: Ref<AppPolygon | null>;
}) {
  const draw = ref<MapboxDraw | null>(null);
  const map = ref<MapboxMap | null>(null);

  // === Bind draw tool and map
  const setDrawTool = (drawInstance: MapboxDraw, mapInstance: MapboxMap) => {
    draw.value = drawInstance;
    map.value = mapInstance;
    setupMapListeners();
  };

  const setupMapListeners = () => {
    if (!map.value) return;

    map.value.on("draw.create", (e: { features: Feature[] }) => {
      const f = e.features[0];
      if (!f || f.geometry.type !== "Polygon") return;

      const polygon: AppPolygon = {
        id: crypto.randomUUID(),
        name: "New Polygon",
        coordinates: (f.geometry as GeoPolygon).coordinates,
        createdAt: Date.now(),
        featureId: f.id as string,
      };

      polygons.value.push(polygon);
      selectedPolygon.value = null;
    });

    map.value.on("draw.selectionchange", (e: { features: Feature[] }) => {
      const f = e.features[0];
      if (!f || f.geometry.type !== "Polygon") {
        selectedPolygon.value = null;
        return;
      }

      selectedPolygon.value = {
        id: f.id as string,
        name: "Selected",
        coordinates: (f.geometry as GeoPolygon).coordinates,
        featureId: f.id as string,
      };
    });

    map.value.on("draw.update", (e: { features: Feature[] }) => {
      for (const f of e.features) {
        if (f.geometry.type !== "Polygon") continue;
        polygons.value = polygons.value.map((p) =>
          p.featureId === f.id
            ? { ...p, coordinates: (f.geometry as GeoPolygon).coordinates }
            : p,
        );
      }
    });
  };

  // === Drawing interaction
  const startCreatePolygon = () => {
    draw.value?.changeMode("draw_polygon");
  };

  const cancelDrawing = () => {
    draw.value?.changeMode("simple_select", { featureIds: [] });
  };

  const setSelected = (polygon: AppPolygon) => {
    selectedPolygon.value = polygon;
    if (polygon.featureId) {
      draw.value?.changeMode("direct_select", { featureId: polygon.featureId });
    }
  };

  const clearSelected = () => {
    selectedPolygon.value = null;
    draw.value?.changeMode("simple_select", { featureIds: [] });
  };

  const updatePolygon = (polygon: AppPolygon) => {
    polygons.value = polygons.value.map((p) =>
      p.id === polygon.id ? polygon : p,
    );
  };

  return {
    polygons,
    selectedPolygon,
    startCreatePolygon,
    cancelDrawing,
    setSelected,
    clearSelected,
    updatePolygon,
    setDrawTool,
  };
}
