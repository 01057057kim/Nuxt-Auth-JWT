<script setup lang="ts">
import { ref, onMounted } from 'vue'

const form = ref({
    username: '',
    email: '',
    password: ''
})

const success = ref('')
const error = ref('')
const recaptchaReady = ref(false)

const config = useRuntimeConfig()

onMounted(() => {
    if (process.client) {
        const checkGrecaptcha = setInterval(() => {
            // @ts-ignore
            if (window.grecaptcha) {
                recaptchaReady.value = true
                clearInterval(checkGrecaptcha)
            }
        }, 100)
    }
})

async function handleRegisterForm() {
    success.value = ''
    error.value = ''

    const payload = {
        username: form.value.username.trim(),
        email: form.value.email.trim(),
        password: form.value.password.trim()
    }

    if (!recaptchaReady.value) {
        error.value = 'reCAPTCHA not ready. Please try again later.'
        return
    }

    try {
        // @ts-ignore
        const token = await window.grecaptcha.execute(config.public.recaptchaSiteKey, {
            action: 'register'
        })

        const data = await $fetch('/api/register', {
            method: 'POST',
            body: {
                ...payload,
                recaptchaToken: token
            }
        })

        if (data.success) {
            success.value = data.message
            form.value = { username: '', email: '', password: '' }
        } else {
            error.value = data.message || 'Registration failed'
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
                <input v-model="form.username" type="text" placeholder="Input Username" class="border-2 p-2" required>
            </div>
            <div>
                <label for="" class="mr-8">Email: </label>
                <input v-model="form.email" type="email" placeholder="Input Email" class="border-2 p-2"
                    autocomplete="true" required>
            </div>
            <div>
                <label for="">Password: </label>
                <input v-model="form.password" type="password" placeholder="Input Password" class="border-2 p-2"
                    autocomplete="new-password" required>
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