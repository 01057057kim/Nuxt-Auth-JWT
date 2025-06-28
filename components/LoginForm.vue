<template>
    <div class="bg-orange-100 p-10 flex flex-col items-start justify-center">
        <h1 class="mb-4 text-2xl font-bold">Login</h1>
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
            <div>
                <label for="username">Username: </label>
                <input 
                    id="username"
                    v-model="formData.username"
                    type="text" 
                    placeholder="Input Username" 
                    class="border-2 p-2"
                    required
                >
            </div>
            <div>
                <label for="password">Password: </label>
                <input 
                    id="password"
                    v-model="formData.password"
                    type="password" 
                    placeholder="Input Password" 
                    class="border-2 p-2"
                    required
                >
            </div>
            <div v-if="message" :class="messageClass" class="text-sm">
                {{ message }}
            </div>
            <div class="flex gap-5">
                <button type="submit" :disabled="loading" class="border-2 p-2">
                    {{ loading ? 'Logging in...' : 'Login' }}
                </button>
                <NuxtLink to="/" class="border-2 p-2">Back</NuxtLink>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface User {
    username: string
    email: string
    createdAt: string
    updatedAt: string
}

interface LoginResponse {
    success: boolean
    message: string
    user?: User
}

interface CsrfResponse {
    csrfToken: string
}

const formData = reactive({
    username: '',
    password: ''
})

const loading = ref(false)
const message = ref('')
const messageClass = ref('')

const handleLogin = async () => {
    loading.value = true
    message.value = ''
    
    try {
        const csrfResponse = await $fetch<CsrfResponse>('/api/csrf-token')
        const csrfToken = csrfResponse.csrfToken

        const response = await $fetch<LoginResponse>('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: formData
        })
        
        if (response.success) {
            message.value = response.message
            messageClass.value = 'text-green-600'
            
            // store user data in localStorage For JWT
            if (response.user) {
                localStorage.setItem('userData', JSON.stringify(response.user))
            }
            
            setTimeout(() => {
                navigateTo('/Main')
            }, 1000)
        } else {
            message.value = response.message
            messageClass.value = 'text-red-600'
        }
    } catch (error: any) {
        console.error('Login error:', error)
        message.value = error.data?.message || 'An error occurred during login'
        messageClass.value = 'text-red-600'
    } finally {
        loading.value = false
    }
}
</script>