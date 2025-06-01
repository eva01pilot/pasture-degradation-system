<template>
  <Card class="">
    <template #title>
      <TypographyTitle :level="5">{{ model.name }}</TypographyTitle>
    </template>
    <template #default>
      <Table
        v-for="datasource in datasources"
        size="small"
        :data-source="datasource"
        :pagination="{ pageSize: 5 }"
        :columns
      />
    </template>
    <template #actions>
      <Button @click="emit('editClicked', model)">Редактировать</Button>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Button, Card, Table, TypographyTitle } from "ant-design-vue";
import type { AppPolygon } from "../../../lib/polygonMachine";
import { computed } from "vue";

const model = defineModel<AppPolygon>({ required: true });

const props = defineProps<{
  mode: "readonly" | "edit";
}>();

const emit = defineEmits<{
  editClicked: [AppPolygon];
}>();

const datasources = computed(() => {
  return model.value.coordinates.map((ring, ringIdx) =>
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
