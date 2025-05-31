<template>
  <Card class="">
    <template #title>
      <Input :readonly="mode === 'readonly'" v-model="model.name" />
    </template>
    <template #default>
      <div v-for="ring in model.coordinates">
        <div class="grid grid-cols-3" v-for="(coord, id) in ring">
          <InputNumber
            :readonly="mode === 'readonly'"
            v-model:value="coord[0]"
            placeholder="Широта"
            string-mode
          />
          <InputNumber
            :readonly="mode === 'readonly'"
            v-model:value="coord[1]"
            placeholder="Долгота"
            string-mode
          />
          <Button @click="ring.splice(id)"> Delete </Button>
        </div>
      </div>
    </template>
    <template #actions>
      <Button v-if="mode === 'readonly'" @click="emit('changeToEdit', model)">
        Edit
      </Button>
      <Button v-else @click="emit('changeToReadonly', model)">
        Complete
      </Button>
    </template>
  </Card>
</template>

<script setup lang="ts">
import {
  Button,
  Card,
  Input,
  InputNumber,
  TypographyTitle,
} from "ant-design-vue";
import type { AppPolygon } from "../../../lib/polygonMachine";

const model = defineModel<AppPolygon>({ required: true });

const props = defineProps<{
  mode: "readonly" | "edit";
}>();

const emit = defineEmits<{
  changeToEdit: [AppPolygon];
  changeToReadonly: [AppPolygon];
  changeToCreate: [];
}>();
</script>
