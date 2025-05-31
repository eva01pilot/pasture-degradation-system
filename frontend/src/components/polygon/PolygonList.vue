<template>
  <div>
    <Button class="w-full" @click="createPopupOpen = true"
      >Create Polygon
    </Button>
    <PolygonCard
      v-for="(polygon, i) in polygons"
      mode="edit"
      v-model="polygons[i]"
    >
    </PolygonCard>
    <CreatePolygonPopup
      v-if="createPopupOpen"
      :center="[10, 40]"
      @created="
        (e) => {
          polygonStore.addPolygonFromFeature(e);
          createPopupOpen = false;
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { usePolygonsStore } from "../../store/polygons";
import PolygonCard from "./presentation/PolygonCard.vue";
import { computed } from "vue";
import type { AppPolygon } from "../../lib/polygonMachine";
import { Button } from "ant-design-vue";
import CreatePolygonPopup from "../map/CreatePolygonPopup.vue";
import { ref } from "vue";

const polygonStore = usePolygonsStore();
const { polygons } = storeToRefs(polygonStore);

const createPopupOpen = ref(false);
</script>
