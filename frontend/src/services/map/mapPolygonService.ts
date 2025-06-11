import { appPolygonToFeature, type AppPolygon } from "../../store/polygons";
import { MapService } from "./mapService";

export class UserPolygonService {
  mapService: MapService;

  constructor(mapService: MapService) {
    this.mapService = mapService;
  }

  private featureToId(featureId: string) {
    return `polygon-${featureId}`;
  }

  addPolygon(polygon: AppPolygon) {
    this.mapService.addLayer({
      id: this.featureToId(polygon.featureId),
      layer: {
        id: this.featureToId(polygon.featureId),
        type: "fill",
        source: this.featureToId(polygon.featureId),
        paint: {
          "fill-color": polygon.color,
          "fill-opacity": 0.9,
        },
      },
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [appPolygonToFeature(polygon)],
        },
      },
    });
    console.log(this.mapService.getLayer(this.featureToId(polygon.featureId)));
  }

  removePolygon(polygon: AppPolygon) {
    this.mapService.removeLayer(this.featureToId(polygon.featureId));
  }

  updatePolygon(polygon: AppPolygon) {
    const layer = this.mapService.getLayer(this.featureToId(polygon.featureId));

    if (
      layer?.source.type === "geojson" &&
      typeof layer.source.data !== "string" &&
      "type" in layer.source.data &&
      layer.source.data.type === "FeatureCollection"
    ) {
      layer.source.data.features = [appPolygonToFeature(polygon)];
    }
  }
}
