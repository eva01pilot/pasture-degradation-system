<template>
  <div class="flex flex-col h-full">
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
    <div class="grow overflow-hidden">
      <PolygonCharts
        v-if="selectedPolygon?.analytics"
        class="h-full w-full overflow-hidden"
        :analytics-data="selectedPolygon?.analytics"
      />
    </div>
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
const items = computed(() => {
  return selectedPolygon.value?.coordinates.map((ring, i) => ({
    label: `Кольцо ${i}`,
    content: ring,
  }));
});
</script>
