<template>
  <DefaultLayout page-class="grid grid-cols-">
    <template #drawer-title>Полигоны</template>
    <template #drawer-default>
      <PolygonList class="min-w-64" @go-to="goToPolygon" />
    </template>
    <template #default>
      <Map ref="map" class="h-full w-full" />
    </template>
    <template #dashboard>
      <PolygonDashboard />
    </template>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import DefaultLayout from "../components/layout/DefaultLayout.vue";
import Map from "../components/Map.vue";
import PolygonList from "../components/polygon/PolygonList.vue";
import { usePolygonsStore, type AppPolygon } from "../store/polygons";
import PolygonDashboard from "../components/polygon/PolygonDashboard.vue";
import { watch } from "vue";
import { storeToRefs } from "pinia";

const map = useTemplateRef("map");
const polygonStore = usePolygonsStore();

const { selectedPolygon } = storeToRefs(polygonStore);

const goToPolygon = (poly: AppPolygon) => {
  map.value?.map?.goToPolygon(poly);
  polygonStore.selectedPolygon = poly;
};

watch(
  [() => selectedPolygon.value, () => selectedPolygon.value?.analytics],
  (newVal, oldVal) => {
    if (oldVal[1] !== undefined) {
      map.value?.map?.removePolygonHeatmap(oldVal[0]!);
    }
    if (newVal !== undefined) {
      map.value?.map?.addPolygonHeatmap(newVal[0]!);
    }
  },
  {
    immediate: true,
  },
);
</script>
