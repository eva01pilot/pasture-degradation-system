<template>
  <DefaultLayout
    v-model:additional-drawer-open="additionalDrawerOpen"
    v-model:dashboard-open="dashboardOpen"
    v-model:default-drawer-open="defaultDrawerOpen"
    page-class="grid grid-cols-"
  >
    <template #navbar>
      <div class="w-full flex items-center text-xl">
        <span class=""> DEGRABALLS </span>
      </div>
    </template>
    <template #drawer-title>Полигоны</template>
    <template #drawer-additional>
      <PolygonAnalytics
        v-if="selectedPolygon?.analytics"
        :analytics="selectedPolygon?.analytics[0]"
      />
    </template>
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
import { ref } from "vue";
import PolygonAnalytics from "../components/polygon/PolygonAnalytics.vue";

const map = useTemplateRef("map");

const polygonStore = usePolygonsStore();
const { selectedPolygon } = storeToRefs(polygonStore);

const defaultDrawerOpen = ref(true);
const additionalDrawerOpen = ref(false);
const dashboardOpen = ref(false);

const goToPolygon = (poly: AppPolygon) => {
  polygonStore.selectedPolygon = poly;
  polygonStore.fetchPolygonData();
  additionalDrawerOpen.value = true;
  dashboardOpen.value = true;
};
</script>
