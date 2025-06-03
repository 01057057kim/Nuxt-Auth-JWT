<script setup lang="ts">
</script>
<template>
  <div class="container min-h-screen w-full max-w-[1920px] flex flex-col items-center justify-start mx-auto p-10">
    <h1 class="text-2xl font-bold">This is the Home Page</h1>
    <div class="flex gap-4 mt-4">
      <NuxtLink to="/Login" class="text-blue-500 underline">Login</NuxtLink>
      <NuxtLink to="/Register" class="text-blue-500 underline">Register</NuxtLink>
    </div>
  </div>
</template>
