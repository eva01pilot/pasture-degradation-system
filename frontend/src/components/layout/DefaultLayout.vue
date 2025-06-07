<template>
  <div class="grid grid-cols-[400px_4fr]">
    <aside class="h-screen bg-white p-4 overflow-auto">
      <TypographyTitle class="" :level="2">
        <slot name="drawer-title" />
      </TypographyTitle>
      <div>
        <slot name="drawer-default" />
      </div>
    </aside>
    <main>
      <slot name="default" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { Drawer, TypographyTitle } from "ant-design-vue";
</script>
