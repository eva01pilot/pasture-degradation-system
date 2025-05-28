<template>
  <Card class="">
    <template #title>
      <Input :readonly="mode === 'readonly'" v-model="model.name" />
    </template>
    <template #default>
      <div v-for="coord in model.coordinates">
        <InputNumber
          :readonly="mode === 'readonly'"
          v-model="coord[0]"
          placeholder="Широта"
        />
        <InputNumber
          :readonly="mode === 'readonly'"
          v-model="coord[1]"
          placeholder="Долгота"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { Card, Input, InputNumber, TypographyTitle } from "ant-design-vue";

const model = defineModel<{
  id: string | undefined;
  name: string | undefined;
  coordinates: number[][];
  createdAt: number | undefined;
  featureId: string;
}>({ required: true });

const props = defineProps<{
  mode: "readonly" | "edit";
}>();
</script>
