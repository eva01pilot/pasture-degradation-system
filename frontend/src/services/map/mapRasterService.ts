import { getRasterBounds } from "../../store/polygons";
import { MapService } from "./mapService";

export class UserRasterService {
  mapService: MapService;

  constructor(mapService: MapService) {
    this.mapService = mapService;
  }

  addRaster(id: string, link: string, coordinates: number[][][]) {
    this.mapService.addLayer({
      id,
      layer: {
        id,
        type: "raster",
        source: id,
      },
      source: {
        type: "image",
        url: link,
        coordinates: getRasterBounds(coordinates),
      },
    });
  }

  removeRaster(id: string) {
    this.mapService.removeLayer(id);
  }

  updateRaster(id: string, link: string, coordinates: number[][][]) {
    const layer = this.mapService.getLayer(id);

    if (layer?.source.type === "image") {
      layer.source.coordinates = getRasterBounds(coordinates);
      layer.source.url = link;
    }
  }
}
