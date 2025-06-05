<script setup lang="ts">
import { ref } from 'vue'
import { useFetch } from '#app';

const form = ref({
    username: '',
    email: '',
    password: '',
})

const success = ref('')
const error = ref('')

async function handleRegisterForm() {
    success.value = ''
    error.value = ''

    try {
        const data = await $fetch('/api/register', {
            method: 'POST',
            body: form.value
        })

        if (data.success) {
            success.value = data.message
            form.value = { username: '', email: '', password: '' }
        } else {
            error.value = data.message || 'Registration failed'
            form.value = { username: '', email: '', password: '' }
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Unexpected error'
    }
}

</script>
<template>
    <div class="bg-orange-100 p-10 flex flex-col items-start justify-center">
        <h1 class="mb-4 text-2xl font-bold">Register</h1>
        <form action="" @submit.prevent="handleRegisterForm" class="flex flex-col gap-4">
            <div>
                <label for="">Username: </label>
                <input v-model="form.username" type="text" placeholder="Input Username" class="border-2 p-2">
            </div>
            <div>
                <label for="" class="mr-8">Email: </label>
                <input v-model="form.email" type="email" placeholder="Input Email" class="border-2 p-2">
            </div>
            <div>
                <label for="">Password: </label>
                <input v-model="form.password" type="password" placeholder="Input Password" class="border-2 p-2">
            </div>
            <div class="flex gap-5">
                <button type="submit" class="border-2 p-2 cursor-pointer">Register</button>
                <NuxtLink to="/" class="border-2 p-2">Back</NuxtLink>
            </div>
            <div>
                <p class="text-green-600 mt-4" v-if="success">{{ success }}</p>
                <p class="text-red-600 mt-4" v-if="error">{{ error }}</p>
            </div>
        </form>
    </div>
</template>