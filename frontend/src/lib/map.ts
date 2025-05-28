import mgl, { type Feature, type IControl } from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MAPBOXGL_DRAW_STYLES, SingleSelectMode } from "./mapgoxgl-draw-config";

export class MGLMap {
  map: mgl.Map;
  drawCtrl: MapboxDraw | null = null;
  private onFeatureCreateCB: ((opts: { features: Array<Feature> }) => any)[] =
    [];
  private onFeatureDeleteCB: ((opts: { features: Array<Feature> }) => any)[] =
    [];
  private onFeatureUpdateCB: ((opts: {
    features: Array<Feature>;
    action: "move" | "change_coordinates";
  }) => any)[] = [];
  private onSelectionChangeCB: ((opts: { features: Array<Feature> }) => any)[] =
    [];
  private onModeChangeCB: ((opts: {
    mode: "single_select_mode" | "direct_select" | "draw_polygon";
  }) => any)[] = [];
  constructor(container: HTMLElement) {
    this.map = new mgl.Map({
      container,
      zoom: 12,
      center: [11.39085, 47.27574],
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
    this.setupControls();
    this.setupMapboxDraw();
  }

  addOnFeatureUpdate() {}

  private setupMapboxDraw() {
    //@ts-expect-error of open-source
    MapboxDraw.constants.classes.CANVAS = "maplibregl-canvas" as any;
    //@ts-expect-error of open-source
    MapboxDraw.constants.classes.CONTROL_BASE = "maplibregl-ctrl";
    //@ts-expect-error of open-source
    MapboxDraw.constants.classes.CONTROL_PREFIX = "maplibregl-ctrl-";
    //@ts-expect-error of open-source
    MapboxDraw.constants.classes.CONTROL_GROUP = "maplibregl-ctrl-group";
    //@ts-expect-error of open-source
    MapboxDraw.constants.classes.ATTRIBUTION = "maplibregl-ctrl-attrib";
    this.drawCtrl = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      modes: {
        ...MapboxDraw.modes,
        single_select_mode: SingleSelectMode,
      },
      styles: MAPBOXGL_DRAW_STYLES,
    });
  }

  setupControls() {
    this.map.addControl(
      new mgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
    );
  }
}
