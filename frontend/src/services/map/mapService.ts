import maplibre from "maplibre-gl";
export class MapService {
  map: maplibre.Map | null = null;
  layers: {
    id: string;
    source: maplibre.SourceSpecification;
    layer: maplibre.LayerSpecification;
  }[] = [];

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

  addLayer(layer: {
    id: string;
    source: maplibre.SourceSpecification;
    layer: maplibre.LayerSpecification;
  }) {
    this.map?.addSource(layer.id, layer.source);
    this.map?.addLayer(layer.layer);
    this.layers.push(layer);
  }

  removeLayer(id: string) {
    this.map?.removeSource(id);
    this.map?.removeLayer(id);
    this.layers.splice(
      this.layers.findIndex((l) => l.id === id),
      1,
    );
  }

  getLayer(id: string) {
    return this.layers.find((l) => l.id === id);
  }

  hideLayer(id: string) {
    this.map?.setLayoutProperty(id, "visibility", "none");
  }
  showLayer(id: string) {
    this.map?.setLayoutProperty(id, "visibility", "visible");
  }

  toggleLayer(id: string) {
    const visibility = this.map?.getLayoutProperty(id, "visibility");
    if (visibility === "visible") {
      return this.hideLayer(id);
    }
    return this.showLayer(id);
  }
}
