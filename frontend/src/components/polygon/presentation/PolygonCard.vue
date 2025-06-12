<template>
  <Card
    :data-active="active"
    class="data-[active=true]:!border-2 data-[active=true]:!border-green-500"
  >
    <template #title>
      <TypographyTitle :level="5">{{ polygon.name }}</TypographyTitle>
    </template>
    <template #default>
      <div class="flex flex-col w-full">
        <div ref="canvasContainer" class="w-32 self-end">
          <canvas class="w-full h-auto" ref="polygonCanvas"></canvas>
        </div>

        <Tabs type="card">
          <TabPane
            v-for="(ring, i) in datasources"
            :key="`ring-${i}`"
            :tab="`Кольцо ${i}`"
          >
            <Table size="small" :columns :data-source="ring" />
          </TabPane>
        </Tabs>
      </div>
    </template>
    <template #actions>
      <slot name="actions" :polygon />
    </template>
  </Card>
</template>

<script setup lang="ts">
import {
  Button,
  Card,
  Table,
  TabPane,
  Tabs,
  TypographyTitle,
} from "ant-design-vue";
import type { AppPolygon } from "../../../store/polygons";
import { computed } from "vue";
import { useTemplateRef } from "vue";
import { onMounted } from "vue";

import { useElementSize } from "@vueuse/core";
import { watch } from "vue";
import { normalizeCoordinatesToCanvas } from "../../../lib/utils";

const props = defineProps<{
  active: boolean;
  polygon: AppPolygon;
}>();

const polygonCanvas = useTemplateRef("polygonCanvas");
const canvasContainer = useTemplateRef("canvasContainer");

const { width: canvasContainerWidth, height: canvasContainerHeight } =
  useElementSize(canvasContainer);

function drawPolygon() {
  if (!polygonCanvas.value) return;

  polygonCanvas.value.width = Number(canvasContainerWidth.value.toFixed(0));
  polygonCanvas.value.height = Number(canvasContainerHeight.value.toFixed(0));

  const ctx = polygonCanvas.value.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, polygonCanvas.value.width, polygonCanvas.value.height);

  const normalized = normalizeCoordinatesToCanvas(
    props.polygon.coordinates,
    canvasContainerWidth.value,
    canvasContainerHeight.value,
  );

  if (normalized.length === 0) return;

  ctx.fillStyle = props.polygon.color;
  ctx.beginPath();

  normalized.forEach((ring) => {
    if (ring.length < 2) return;

    const [startX, startY] = ring[0];
    ctx.moveTo(startX, startY);

    for (let i = 1; i < ring.length; i++) {
      const [x, y] = ring[i];
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
    () => props.polygon.coordinates,
  ],
  () => drawPolygon(),
  { immediate: true },
);

const datasources = computed(() => {
  return props.polygon?.coordinates.map((ring, ringIdx) =>
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
</script>
