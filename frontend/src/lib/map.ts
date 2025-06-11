import mgl, { type IControl } from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  MAPBOXGL_DRAW_STYLES,
  NewSimpleSelect,
  SingleSelectMode,
} from "./mapgoxgl-draw-config";
import {
  appPolygonToFeature,
  getBoundingBox,
  getRasterBounds,
  type AppPolygon,
} from "../store/polygons";

export class MGLMap {
  map: mgl.Map;
  drawCtrl: MapboxDraw | null = null;
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
        polygon: false,
        trash: false,
      },
      modes: {
        ...MapboxDraw.modes,
        single_select_mode: SingleSelectMode,
        simple_select: NewSimpleSelect,
      },
      styles: MAPBOXGL_DRAW_STYLES,
    });

    this.map.addControl(this.drawCtrl as unknown as IControl);
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

  addPolygons(polygons: AppPolygon[]) {
    console.log("polys");
    polygons.forEach((poly) => {
      this.map.addSource(poly.featureId, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [appPolygonToFeature(poly)],
        },
      });

      this.map.addLayer({
        id: poly.featureId,
        type: "fill",
        source: poly.featureId,
        paint: {
          "fill-color": poly.color,
          "fill-opacity": 0.9,
        },
      });
    });
  }

  removePolygons(polygons: AppPolygon[]) {
    polygons.forEach((poly) => {
      if (this.map.getLayer(poly.featureId))
        this.map.removeLayer(poly.featureId);
      if (this.map.getSource(poly.featureId))
        this.map.removeSource(poly.featureId);
    });
  }
  goToPolygon(polygon: AppPolygon) {
    const coordinates = polygon.coordinates[0];
    const bbox = getBoundingBox(coordinates);
    this.map.fitBounds(bbox!);
  }

  addPolygonHeatmap(polygon: AppPolygon) {
    console.log("heatmap");
    const latestRaster = polygon.analytics?.at(-1);
    if (!latestRaster?.rasterFile) return;
    this.map.addSource(
      `heatmap-${polygon.featureId}-${latestRaster.analysis_date}`,
      {
        type: "image",
        url: latestRaster.rasterFile,
        coordinates: getRasterBounds(polygon.coordinates),
      },
    );

    this.map.addLayer({
      type: "raster",
      source: `heatmap-${polygon.featureId}-${latestRaster.analysis_date}`,
      id: `heatmap-${polygon.featureId}-${latestRaster.analysis_date}`,
    });
  }
  removePolygonHeatmap(polygon: AppPolygon) {
    const latestRaster = polygon.analytics?.at(-1);
    if (!latestRaster?.rasterFile) return;

    this.map.removeLayer(
      `heatmap-${polygon.featureId}-${latestRaster.analysis_date}`,
    );
  }
}
