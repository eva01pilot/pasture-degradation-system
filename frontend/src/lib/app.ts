import maplibre from "maplibre-gl";
export class App {
  map: maplibre.Map | null = null;

  initMap(container: HTMLElement, center: maplibre.LngLatLike) {
    this.map = new maplibre.Map({
      container,
      zoom: 12,
      center: center,
      hash: true,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
    });
    return this;
  }

  setupNavigationControl() {
    this.map?.addControl(
      new maplibre.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
    );
    return this;
  }
}
