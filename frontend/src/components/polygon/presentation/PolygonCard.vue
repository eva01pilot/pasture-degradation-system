<template>
  <Card class="">
    <template #title>
      <TypographyTitle :level="5">{{ model.name }}</TypographyTitle>
    </template>
    <template #default>
      <div class="grid grid-cols-[96px_1fr]">
        <div>
          <canvas
            width="96"
            height="48"
            class="h-full w-full"
            ref="polygonCanvas"
          ></canvas>
        </div>
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

const model = defineModel<AppPolygon>({ required: true });

const props = defineProps<{
  mode: "readonly" | "edit";
}>();

const emit = defineEmits<{
  editClicked: [AppPolygon];
}>();

const datasources = computed(() => {
  return model.value.coordinates.map((ring, ringIdx) =>
    ring.map((coord, coordIdx) => ({
      key: `${ringIdx}-${coordIdx}`,
      lat: coord[0],
      lon: coord[1],
    })),
  );
});

const columns = [
  {
    title: "Широта",
    dataIndex: "lat",
    key: "lat",
  },
  {
    title: "Долгота",
    dataIndex: "lon",
    key: "lon",
  },
];

const polygonCanvas = useTemplateRef("polygonCanvas");
const { width, height } = useElementSize(polygonCanvas);
const coordinateSpaceToCanvas = computed(() => {
  return model.value.coordinates.map((ring) =>
    ring.map((pos) => {
      const lat = pos[0];
      const lon = pos[0];

      const x = (lon + 90) / 180;
      const y = (lat + 180) / 360;

      const xFit = x * width.value;
      const yFit = y * height.value;

      return [xFit, yFit];
    }),
  );
});

function normalizeCoordinatesToCanvas(
  coordinates: number[][][],
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 0,
  flipY: boolean = true,
): number[][][] {
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  coordinates.forEach((ring) => {
    ring.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
  });

  const mapWidth = maxX - minX;
  const mapHeight = maxY - minY;

  const scaleX = (canvasWidth - 2 * padding) / mapWidth;
  const scaleY = (canvasHeight - 2 * padding) / mapHeight;
  const scale = Math.min(scaleX, scaleY); // uniform scaling

  const offsetX = padding - minX * scale;
  const offsetY = flipY
    ? canvasHeight - padding + minY * scale // flipped Y
    : padding - minY * scale;

  const normalized = coordinates.map((ring) =>
    ring.map(([x, y]) => {
      const newX = x * scale + offsetX;
      const newY = flipY
        ? -y * scale + offsetY // flip Y if needed
        : y * scale + offsetY;
      return [newX, newY];
    }),
  );

  return normalized;
}

onMounted(() => {
  if (!polygonCanvas.value) return;
  const normalized = normalizeCoordinatesToCanvas(
    model.value.coordinates,
    width.value,
    height.value,
  );
  const ctx = polygonCanvas.value.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = model.value.color;
  ctx.beginPath(); // Only once for the whole shape

  normalized.forEach((ring) => {
    if (ring.length < 2) return;

    // Start from the first point
    const [startX, startY] = ring[0];
    ctx.moveTo(startX, startY);

    // Draw lines to the rest
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = ring[i];
      ctx.lineTo(x, y);
    }

    // Optionally close the ring (if not closed already)
    ctx.closePath();
  });

  ctx.fill(); // Fill after all rings
});
</script>
