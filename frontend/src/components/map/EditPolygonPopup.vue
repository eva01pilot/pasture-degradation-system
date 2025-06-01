<script setup lang="ts">
import { onMounted } from "vue";
import { useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import mgl, { Map, type Feature, type IControl } from "maplibre-gl";
import { shallowRef } from "vue";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MAPBOXGL_DRAW_STYLES } from "../../lib/mapgoxgl-draw-config";
import { Input, Modal } from "ant-design-vue";
import { ref } from "vue";
import { onUnmounted } from "vue";

const props = defineProps<{
  center: [number, number];
  feature: GeoJSON.Feature<GeoJSON.Polygon>;
}>();

const mapRef = useTemplateRef("mapRef");

const emit = defineEmits<{
  updated: [GeoJSON.Feature<GeoJSON.Polygon>];
  close: [];
}>();

const setupMap = () => {
  if (!mapRef.value) return;
  map.value = new mgl.Map({
    container: mapRef.value,
    zoom: 12,
    center: props.center,
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

  map.value.addControl(
    new mgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    }),
  );
};

const setupDraw = () => {
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
  draw.value = new MapboxDraw({
    displayControlsDefault: false,
    modes: {
      simple_select: MapboxDraw.modes.simple_select,
      direct_select: MapboxDraw.modes.direct_select,
    },
    styles: MAPBOXGL_DRAW_STYLES,
  });

  map.value?.addControl(draw.value as unknown as IControl);
};

const map = shallowRef<Map>();
const draw = shallowRef<MapboxDraw>();
const feature = ref(props.feature);

onMounted(() => {
  if (!mapRef.value) return;
  setupMap();
  setupDraw();

  const feat = draw.value?.add(props.feature);

  if (!feat) return;
  draw.value?.changeMode("direct_select", {
    featureId: String(feat[0]),
  });

  map.value?.on(
    "draw.update",
    ({ features }: { features: GeoJSON.Feature<GeoJSON.Polygon>[] }) => {
      feature.value = features[0];
    },
  );
});

onUnmounted(() => {
  map.value?.remove();
});
</script>

<template>
  <Modal
    @ok="emit('updated', feature)"
    @cancel="emit('close')"
    :open="true"
    wrap-class-name="full-modal"
    width="100%"
  >
    <div ref="mapRef" class="w-full h-full"></div>
  </Modal>
</template>
<style>
.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
  }
}
</style>
