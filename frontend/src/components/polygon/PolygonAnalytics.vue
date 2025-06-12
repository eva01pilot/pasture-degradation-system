<template>
  <List :data-source="datasource.rows">
    <template #renderItem="{ item }">
      <div class="grid grid-cols-2 text-wrap border-b border-b-gray-200">
        <span class="text-lg font-bold text-wrap break-words">{{
          item.title
        }}</span>
        <span class="text-lg text-wrap">{{ item.value }}</span>
      </div>
    </template>
  </List>
</template>

<script setup lang="ts">
import { List, Table, TabPane, Tabs } from "ant-design-vue";
import type { AppPolygon } from "../../store/polygons";
import { computed } from "vue";

const props = defineProps<{
  analytics: NonNullable<AppPolygon["analytics"]>[number];
}>();

const datasource = computed(() => {
  const rows = Object.keys(props.analytics)
    .filter(
      (key) => key !== "id" && key !== "polygonId" && key !== "rasterFile",
    )
    .map((key) => {
      console.log(key);
      const item = props.analytics[key as keyof typeof props.analytics];
      return {
        title: key,
        value: item,
      };
    });

  return {
    date: props.analytics.analysis_date,
    rows,
  };
});
</script>
