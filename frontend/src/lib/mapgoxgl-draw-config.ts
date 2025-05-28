import MapboxDraw, { type MapMouseEvent } from "@mapbox/mapbox-gl-draw";

export const SingleSelectMode = { ...MapboxDraw.modes.simple_select };

SingleSelectMode.onClick = function (state: any, evt: MapMouseEvent) {
  // Check if the shift key was pressed
  const originalEvent = evt.originalEvent;
  if (originalEvent.shiftKey) {
    // Create a new MouseEvent with shiftKey set to false
    evt.originalEvent = new MouseEvent(originalEvent.type, {
      bubbles: originalEvent.bubbles,
      cancelable: originalEvent.cancelable,
      view: originalEvent.view,
      detail: originalEvent.detail,
      screenX: originalEvent.screenX,
      screenY: originalEvent.screenY,
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
      ctrlKey: originalEvent.ctrlKey,
      altKey: originalEvent.altKey,
      shiftKey: false, // Force shiftKey to be false
      metaKey: originalEvent.metaKey,
      button: originalEvent.button,
      relatedTarget: originalEvent.relatedTarget,
    });
  }
  MapboxDraw.modes.simple_select.onClick?.call(this, state, evt);
};

export const MAPBOXGL_DRAW_STYLES = [
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
