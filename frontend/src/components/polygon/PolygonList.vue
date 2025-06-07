<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <Button class="w-full" @click="createPopupOpen = true"
      >Create Polygon
    </Button>
    <PolygonCard
      v-for="(polygon, i) in polygons"
      mode="edit"
      v-model="polygons[i]"
      @edit-clicked="
        (e) => (editPopupOpen = { open: true, feature: appPolygonToFeature(e) })
      "
    >
    </PolygonCard>
    <CreatePolygonPopup
      v-if="createPopupOpen"
      :center="[10, 40]"
      @created="
        (e, color) => {
          polygonStore.addPolygonFromFeature(e, color);
          createPopupOpen = false;
        }
      "
    />

    <EditPolygonPopup
      v-if="editPopupOpen.feature && editPopupOpen.open"
      :center="
        centroid(editPopupOpen.feature).geometry.coordinates as [number, number]
      "
      :feature="editPopupOpen.feature"
      @updated="
        (e) => {
          polygonStore.editPolygonFromFeature(e);
          editPopupOpen.open = false;
          editPopupOpen.feature = null;
        }
      "
      @close="
        () => {
          editPopupOpen.open = false;
          editPopupOpen.feature = null;
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { usePolygonsStore } from "../../store/polygons";
import PolygonCard from "./presentation/PolygonCard.vue";
import { Button } from "ant-design-vue";
import CreatePolygonPopup from "../map/CreatePolygonPopup.vue";
import { ref } from "vue";
import EditPolygonPopup from "../map/EditPolygonPopup.vue";
import { appPolygonToFeature } from "../../lib/polygonMachine";
import { onMounted } from "vue";
import { centroid } from "@turf/turf";

const polygonStore = usePolygonsStore();
const { polygons } = storeToRefs(polygonStore);

const createPopupOpen = ref(false);
const editPopupOpen = ref<{
  open: boolean;
  feature: GeoJSON.Feature<GeoJSON.Polygon> | null;
}>({
  open: false,
  feature: null,
});

const onEditClicked = () => {};

onMounted(() => {
  polygonStore.fetchPolygonData();
});
</script>
