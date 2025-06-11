import { defineStore, storeToRefs } from "pinia";
import { MapService } from "../services/map/mapService";
import { PolygonRasterAnalytics } from "../services/map/polygonRasterAnalytics";
import { UserPolygonService } from "../services/map/mapPolygonService";
import { UserRasterService } from "../services/map/mapRasterService";
import { usePolygonsStore } from "./polygons";
import { watch } from "vue";

export const useMapStore = defineStore("map", () => {
  const map = new MapService();
  const mapPolygonService = new UserPolygonService(map);
  const mapRasterService = new UserRasterService(map);

  const polygonStore = usePolygonsStore();

  const { selectedPolygon } = storeToRefs(polygonStore);
  const polygonAnalyticsService = new PolygonRasterAnalytics(
    mapPolygonService,
    mapRasterService,
    map,
  );

  const addMap = (el: HTMLElement) => {
    map.initMap(el, [10, 40]).setupNavigationControl();
  };

  watch(
    selectedPolygon,
    (poly) => {
      if (!poly) return;
      polygonAnalyticsService.switchToPolygon(poly);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => selectedPolygon.value?.analytics,
    (val) => {
      if (!val) return;
      polygonAnalyticsService.setRasterAnalytics(
        val.map((v) => ({ date: v.analysis_date!, url: v.rasterFile! })),
      );
    },
  );

  return { addMap };
});
