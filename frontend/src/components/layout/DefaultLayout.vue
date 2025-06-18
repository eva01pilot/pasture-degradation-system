<template>
  <div class="flex flex-col h-screen">
    <nav
      class="absolute inset-0 h-14 bg-gray-200 shadow px-4 flex items-center"
    >
      <slot name="navbar" />
    </nav>
    <div
      class="flex flex-grow overflow-hidden absolute inset-x-0 top-14 h-[calc(100vh-3.5rem)]"
    >
      <aside
        v-if="defaultDrawerOpen"
        class="w-fit bg-white p-4 overflow-y-auto border-r border-r-gray-200"
      >
        <div>
          <slot name="drawer-default" />
        </div>
      </aside>
      <aside
        v-if="additionalDrawerOpen"
        class="w-fit bg-white p-4 overflow-y-auto"
      >
        <slot name="drawer-additional" />
      </aside>
      <div class="flex flex-col flex-grow overflow-hidden relative">
        <main class="flex-grow relative overflow-hidden inset-x-0">
          <slot name="default" />
        </main>
        <section
          v-if="dashboardOpen"
          class="h-128 bg-white overflow-auto p-4 border-r-gray-200 border-r inset-x-0 bottom-0"
        >
          <slot name="dashboard" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ pageClass: string }>();
const defaultDrawerOpen = defineModel("defaultDrawerOpen", { required: true });

const additionalDrawerOpen = defineModel("additionalDrawerOpen", {
  required: true,
});

const dashboardOpen = defineModel("dashboardOpen", {
  required: true,
});
</script>
