<template>
  <TypographyTitle class="text-lg!" :level="1">{{
    selectedPolygon?.name
  }}</TypographyTitle>
  <Button
    v-if="selectedPolygon"
    @click="
      polygonStore.analyze(
        selectedPolygon?.coordinates,
        selectedPolygon?.featureId,
      )
    "
  >
    Проанализировать полигон
  </Button>
  <div class="grid grid-cols-3 gap-3">
    <Tabs type="card">
      <TabPane
        v-for="(ring, i) in datasources"
        :key="`ring-${i}`"
        :tab="`Кольцо ${i}`"
      >
        <Table size="small" :columns :data-source="ring" />
      </TabPane>
    </Tabs>
    <PolygonAnalytics
      v-if="selectedPolygon?.analytics"
      :analytics="selectedPolygon?.analytics"
    />
    <PolygonCharts
      v-if="selectedPolygon?.analytics"
      :analytics-data="selectedPolygon?.analytics"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Button,
  Divider,
  Table,
  TabPane,
  Tabs,
  TypographyParagraph,
  TypographyTitle,
} from "ant-design-vue";
import { usePolygonsStore } from "../../store/polygons";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import PolygonAnalytics from "./PolygonAnalytics.vue";
import PolygonCharts from "./PolygonCharts.vue";

const polygonStore = usePolygonsStore();
const { selectedPolygon } = storeToRefs(polygonStore);

const datasources = computed(() => {
  return selectedPolygon.value?.coordinates.map((ring, ringIdx) =>
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
const items = computed(() => {
  return selectedPolygon.value?.coordinates.map((ring, i) => ({
    label: `Кольцо ${i}`,
    content: ring,
  }));
});
</script>
