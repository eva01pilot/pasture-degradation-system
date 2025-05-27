import mgl, { type IControl } from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";

const styles = [
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "active"], "true"],
        "orange",
        "blue",
      ],
      "fill-opacity": 0.1,
    },
  },
  {
    id: "gl-draw-lines",
    type: "line",
    filter: ["any", ["==", "$type", "LineString"], ["==", "$type", "Polygon"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": [
        "case",
        ["==", ["get", "active"], "true"],
        "orange",
        "blue",
      ],
      "line-dasharray": ["literal", [0.2, 2]],
      "line-width": 2,
    },
  },
  {
    id: "gl-draw-point-outer",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 7, 5],
      "circle-color": "white",
    },
  },
  {
    id: "gl-draw-point-inner",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "feature"]],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 5, 3],
      "circle-color": [
        "case",
        ["==", ["get", "active"], "true"],
        "orange",
        "blue",
      ],
    },
  },
  {
    id: "gl-draw-vertex-outer",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["==", "meta", "vertex"],
      ["!=", "mode", "simple_select"],
    ],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 7, 5],
      "circle-color": "white",
    },
  },
  {
    id: "gl-draw-vertex-inner",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["==", "meta", "vertex"],
      ["!=", "mode", "simple_select"],
    ],
    paint: {
      "circle-radius": ["case", ["==", ["get", "active"], "true"], 5, 3],
      "circle-color": "orange",
    },
  },
  {
    id: "gl-draw-midpoint",
    type: "circle",
    filter: ["all", ["==", "meta", "midpoint"]],
    paint: { "circle-radius": 3, "circle-color": "orange" },
  },
];
export class MGLMap {
  map: mgl.Map;
  constructor(container: HTMLElement) {
    this.map = new mgl.Map({
      container,
      zoom: 12,
      center: [11.39085, 47.27574],
      pitch: 70,
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
            source: "osm", // This must match the source key above
          },
        ],
      },
    });
  }

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
  }

  setupControls() {
    this.setupMapboxDraw();
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      styles,
    });

    this.map.addControl(draw as unknown as IControl, "top-right");
    this.map.addControl(
      new mgl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
    );
  }
}
