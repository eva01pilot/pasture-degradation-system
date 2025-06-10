<template>
  <div class="flex flex-col h-screen">
    <nav class="h-14 bg-white shadow px-4 flex items-center">
      <slot name="navbar" />
    </nav>
    <div class="flex flex-grow overflow-hidden">
      <aside
        class="min-w-96 bg-white p-4 overflow-y-auto border-r border-r-gray-200"
      >
        <TypographyTitle :class="pageClass" :level="2">
          <slot name="drawer-title" />
        </TypographyTitle>
        <div>
          <slot name="drawer-default" />
        </div>
      </aside>
      <div class="flex flex-col flex-grow">
        <main class="flex-grow relative overflow-hidden">
          <slot name="default" />
        </main>
        <section
          class="h-128 bg-white overflow-auto p-4 border-r-gray-200 border-r"
        >
          <slot name="dashboard" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Drawer, TypographyTitle } from "ant-design-vue";

defineProps<{ pageClass: string }>();
</script>
