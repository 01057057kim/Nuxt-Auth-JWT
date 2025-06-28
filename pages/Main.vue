<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

const user = ref<User | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(() => {
  // Get user data from localStorage (set during login)
  const userData = localStorage.getItem('userData')
  if (userData) {
    try {
      user.value = JSON.parse(userData)
    } catch (e) {
      error.value = 'Failed to load user data'
    }
  } else {
    error.value = 'No user data found. Please login first.'
  }
  loading.value = false
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const logout = () => {
  localStorage.removeItem('userData')
  navigateTo('/Login')
}
</script>

<template>
  <div class="container min-h-screen w-full max-w-[1920px] flex flex-rows items-center justify-center mx-auto">
    <div class="bg-orange-100 p-10 flex flex-col items-start justify-center">
      <h1 class="mb-4 text-2xl font-bold">Welcome to Your Dashboard</h1>
      
      <div v-if="loading" class="text-lg">
        Loading...
      </div>
      
      <div v-else-if="error" class="text-lg text-red-600">
        {{ error }}
        <div class="mt-4">
          <NuxtLink to="/Login" class="border-2 p-2">Go to Login</NuxtLink>
        </div>
      </div>
      
      <div v-else-if="user" class="flex flex-col gap-4">
        <div>
          <label class="font-bold">Username: </label>
          <span>{{ user.username }}</span>
        </div>
        
        <div>
          <label class="font-bold">Email: </label>
          <span>{{ user.email }}</span>
        </div>
        
        <div>
          <label class="font-bold">Password: </label>
          <span>••••••••••••••••</span>
        </div>
        
        <div>
          <label class="font-bold">Account Created: </label>
          <span>{{ formatDate(user.createdAt) }}</span>
        </div>
        
        <div>
          <label class="font-bold">Last Updated: </label>
          <span>{{ formatDate(user.updatedAt) }}</span>
        </div>
        
        <div class="flex gap-5 mt-4">
          <button @click="logout" class="border-2 p-2">Logout</button>
          <NuxtLink to="/" class="border-2 p-2">Back to Home</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template> 