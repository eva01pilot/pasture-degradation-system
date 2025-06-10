<template>
  <Tabs type="card">
    <TabPane v-for="tab in tabs" :key="tab.key" :tab="tab.title">
      <div class="chart-container">
        <canvas
          :ref="(el) => setChartRef(el as HTMLCanvasElement, tab.key)"
        ></canvas>
      </div>
    </TabPane>
  </Tabs>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { AppPolygonAnalytics } from "../../store/polygons";
import Chart from "chart.js/auto";
import { TabPane, Tabs } from "ant-design-vue";
import { watch } from "vue";
import { onBeforeUnmount } from "vue";
import { shallowRef } from "vue";

interface ChartTab {
  key: string;
  title: string;
  dataKey: keyof AppPolygonAnalytics;
  color: string;
  unit?: string;
}

const props = defineProps<{
  analyticsData: AppPolygonAnalytics[];
}>();

const chartInstances = shallowRef<Record<string, Chart>>({});

const tabs: ChartTab[] = [
  {
    key: "ndvi_mean",
    title: "NDVI (среднее)",
    dataKey: "ndvi_mean",
    color: "#52c41a",
  },
  {
    key: "ndvi_std",
    title: "NDVI (отклонение)",
    dataKey: "ndvi_std",
    color: "#faad14",
  },
  {
    key: "vegetation_coverage",
    title: "Покрытие растительностью",
    dataKey: "vegetation_coverage",
    color: "#389e0d",
    unit: "%",
  },
  {
    key: "soil_moisture",
    title: "Влажность почвы",
    dataKey: "soil_moisture",
    color: "#096dd9",
  },
  {
    key: "area_hectares",
    title: "Площадь (га)",
    dataKey: "area_hectares",
    color: "#597ef7",
    unit: " га",
  },
];

const setChartRef = (el: HTMLCanvasElement | null, tabKey: string) => {
  if (!el) return;

  if (chartInstances.value[tabKey]) {
    chartInstances.value[tabKey].destroy();
  }

  const tabConfig = tabs.find((t) => t.key === tabKey);
  if (!tabConfig) return;

  chartInstances.value[tabKey] = new Chart(el, getChartConfig(tabConfig));
};

const getChartConfig = (tab: ChartTab) => {
  const filteredData = props.analyticsData
    .filter((item) => item.analysis_date && item[tab.dataKey] !== null)
    .sort(
      (a, b) =>
        new Date(a.analysis_date!).getTime() -
        new Date(b.analysis_date!).getTime(),
    );

  return {
    type: "line",
    data: {
      labels: filteredData.map((item) =>
        new Date(item.analysis_date!).toLocaleDateString(),
      ),
      datasets: [
        {
          label: tab.title,
          data: filteredData.map((item) =>
            parseFloat(item[tab.dataKey] as string),
          ),
          borderColor: tab.color,
          backgroundColor: `${tab.color}20`,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              return `${tab.title}: ${value}${tab.unit || ""}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: tab.dataKey === "vegetation_coverage",
          title: {
            display: true,
            text: tab.unit ? `Значение (${tab.unit})` : "Значение",
          },
        },
        x: {
          title: {
            display: true,
            text: "Дата анализа",
          },
        },
      },
    },
  };
};

// Update charts when data changes
watch(
  () => props.analyticsData,
  () => {
    Object.keys(chartInstances.value).forEach((key) => {
      const tab = tabs.find((t) => t.key === key);
      if (tab && chartInstances.value[key]) {
        chartInstances.value[key].data = getChartConfig(tab).data;
        chartInstances.value[key].update();
      }
    });
  },
  { deep: true },
);

onBeforeUnmount(() => {
  Object.values(chartInstances.value).forEach((chart) => chart.destroy());
});
</script>
