<template>
  <Card
    :data-active="active"
    class="data-[active=true]:!border-2 data-[active=true]:!border-green-500"
  >
    <template #title>
      <TypographyTitle :level="5">{{ model.name }}</TypographyTitle>
    </template>
    <template #default>
      <div ref="canvasContainer" class="h-64 w-full">
        <canvas class="w-full h-auto" ref="polygonCanvas"></canvas>
      </div>
    </template>
    <template #actions>
      <slot name="actions" :polygon="model" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Button, Card, Table, TypographyTitle } from "ant-design-vue";
import type { AppPolygon } from "../../../store/polygons";
import { computed } from "vue";
import { useTemplateRef } from "vue";
import { onMounted } from "vue";

import { useElementSize } from "@vueuse/core";
import { watch } from "vue";

const model = defineModel<AppPolygon>({ required: true });

const props = defineProps<{
  active: boolean;
}>();

const emit = defineEmits<{
  editClicked: [AppPolygon];
}>();

const polygonCanvas = useTemplateRef("polygonCanvas");
const canvasContainer = useTemplateRef("canvasContainer");
const { width, height } = useElementSize(polygonCanvas);

const { width: canvasContainerWidth, height: canvasContainerHeight } =
  useElementSize(canvasContainer);

function normalizeCoordinatesToCanvas(
  coordinates: number[][][],
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 10,
): number[][][] {
  if (canvasWidth <= 0 || canvasHeight <= 0) return [];

  // Find bounds
  const allCoords = coordinates.flat(1);
  const lons = allCoords.map((coord) => coord[0]);
  const lats = allCoords.map((coord) => coord[1]);

  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Calculate aspect ratio-preserving scale
  const mapWidth = maxLon - minLon;
  const mapHeight = maxLat - minLat;

  const scale = Math.min(
    (canvasWidth - padding * 2) / (mapWidth || 1),
    (canvasHeight - padding * 2) / (mapHeight || 1),
  );

  // Normalize coordinates
  return coordinates.map((ring) =>
    ring.map(([lon, lat]) => {
      const x = padding + (lon - minLon) * scale;
      const y = canvasHeight - padding - (lat - minLat) * scale; // Flip Y
      return [x, y];
    }),
  );
}
function drawPolygon() {
  if (!polygonCanvas.value) return;

  polygonCanvas.value.width = Number(canvasContainerWidth.value.toFixed(0));
  polygonCanvas.value.height = Number(canvasContainerHeight.value.toFixed(0));

  const ctx = polygonCanvas.value.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, polygonCanvas.value.width, polygonCanvas.value.height);

  const normalized = normalizeCoordinatesToCanvas(
    model.value.coordinates,
    canvasContainerWidth.value,
    canvasContainerHeight.value,
  );
  console.log(normalized);

  if (normalized.length === 0) return;

  ctx.fillStyle = model.value.color;
  console.log(ctx);
  ctx.beginPath();

  normalized.forEach((ring) => {
    if (ring.length < 2) return;

    const [startX, startY] = ring[0];
    ctx.moveTo(startX, startY);

    for (let i = 1; i < ring.length; i++) {
      const [x, y] = ring[i];
      console.log(x, y);
      ctx.lineTo(x, y);
    }

    ctx.closePath();
  });

  ctx.fill();
}

watch(
  [
    () => canvasContainerWidth.value,
    () => canvasContainerHeight.value,
    () => model.value.coordinates,
  ],
  () => drawPolygon(),
  { immediate: true },
);
</script>
