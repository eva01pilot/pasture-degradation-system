<template>
  <Tabs type="card">
    <TabPane
      v-for="(analytics, i) in datasources"
      :key="`analytics-${i}`"
      :tab="`Аналитика за ${analytics.date}`"
    >
      <List :data-source="analytics.rows">
        <template #renderItem="{ item }">
          <div class="grid grid-cols-2 text-wrap">
            <span class="text-lg font-bold">{{ item.title }}</span>
            <span class="text-lg text-wrap">{{ item.value }}</span>
          </div>
        </template>
      </List>
    </TabPane>
  </Tabs>
</template>

<script setup lang="ts">
import { List, Table, TabPane, Tabs } from "ant-design-vue";
import type { AppPolygon } from "../../store/polygons";
import { computed } from "vue";

const props = defineProps<{
  analytics: NonNullable<AppPolygon["analytics"]>;
}>();

const datasources = computed(() => {
  return props.analytics.map((an) => {
    const rows = Object.keys(an)
      .filter(
        (key) => key !== "id" && key !== "polygonId" && key !== "rasterFile",
      )
      .map((key) => {
        const item = an[key as keyof typeof an];
        return {
          title: key,
          value: item,
        };
      });

    return {
      date: an.analysis_date,
      rows,
    };
  });
});
</script>
