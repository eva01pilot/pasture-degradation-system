import { type AppPolygon } from "../../store/polygons";
import type { UserPolygonService } from "./mapPolygonService";
import type { UserRasterService } from "./mapRasterService";
import type { MapService } from "./mapService";

export class PolygonRasterAnalytics {
  private mapPolygonService: UserPolygonService;
  private mapRasterService: UserRasterService;
  private mapService: MapService;

  private selectedPolygon: AppPolygon | null = null;
  private rasterAnalytics: { url: string; date: string }[] = [];
  private visibleRasterIndex: number | null = null;

  constructor(
    mapPolygonService: UserPolygonService,
    mapRasterService: UserRasterService,
    mapService: MapService,
  ) {
    this.mapPolygonService = mapPolygonService;
    this.mapRasterService = mapRasterService;
    this.mapService = mapService;
  }

  switchToPolygon(polygon: AppPolygon) {
    this.clearRasters();

    this.selectedPolygon = polygon;
    this.visibleRasterIndex = null;

    if (this.rasterAnalytics.length) {
      this.setRasterAnalytics(this.rasterAnalytics);
    }
  }

  setRasterAnalytics(rasterAnalytics: { url: string; date: string }[]) {
    if (!this.selectedPolygon) return;

    this.clearRasters();

    this.rasterAnalytics = rasterAnalytics;

    rasterAnalytics.forEach((r) => {
      const id = this.getRasterId(r.date);
      this.mapRasterService.addRaster(
        id,
        r.url,
        this.selectedPolygon!.coordinates,
      );
    });

    this.visibleRasterIndex = rasterAnalytics.length > 0 ? 0 : null;
  }

  switchRasterByIndex(index: number) {
    if (
      !this.selectedPolygon ||
      index < 0 ||
      index >= this.rasterAnalytics.length
    ) {
      return;
    }

    const previousId =
      this.visibleRasterIndex !== null
        ? this.getRasterId(this.rasterAnalytics[this.visibleRasterIndex].date)
        : null;
    const nextId = this.getRasterId(this.rasterAnalytics[index].date);

    if (previousId) {
      this.mapService.hideLayer(previousId);
    }

    this.mapService.showLayer(nextId);
    this.visibleRasterIndex = index;
  }

  clearRasters() {
    if (!this.selectedPolygon || !this.rasterAnalytics.length) return;

    this.rasterAnalytics.forEach((r) => {
      const id = this.getRasterId(r.date);
      this.mapRasterService.removeRaster(id);
    });

    this.rasterAnalytics = [];
    this.visibleRasterIndex = null;
  }

  private getRasterId(date: string): string {
    return `raster-${this.selectedPolygon?.featureId}-${date}`;
  }

  getSelectedPolygon() {
    return this.selectedPolygon;
  }

  getVisibleRaster() {
    if (
      this.visibleRasterIndex !== null &&
      this.visibleRasterIndex < this.rasterAnalytics.length
    ) {
      return this.rasterAnalytics[this.visibleRasterIndex];
    }
    return null;
  }
}
