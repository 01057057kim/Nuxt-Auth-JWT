<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits<{
    (e: 'click'): void
}>()
</script>

<template>
    <button @click="$emit('click')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        <slot>Button</slot>
    </button>
</template>
