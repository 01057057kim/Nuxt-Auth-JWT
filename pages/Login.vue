<script setup lang="ts">
import { ref } from 'vue'
import MyButton from '~/components/MyButton.vue'

const response = ref('')

async function callApi() {
  const res = await $fetch('/api/hello', { method: 'POST' })
  response.value = res.message
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 p-4 border rounded">
    <h1 class="text-xl font-bold mb-4">Login Page</h1>
    <MyButton @click="callApi">Say Hello</MyButton>
    <p v-if="response" class="mt-4 text-green-600">{{ response }}</p>
  </div>
</template>
