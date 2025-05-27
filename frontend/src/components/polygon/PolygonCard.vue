<template></template>

<script setup lang="ts">
defineProps<{
  id: string | undefined;
  name: string | undefined;
  coordinates: number[][];
  createdAt: number | undefined;
  featureId: string;
}>();
</script>
