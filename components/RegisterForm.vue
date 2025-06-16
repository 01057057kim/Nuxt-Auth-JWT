<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { validatePassword } from '../utils/validatePassword'

const form = ref({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const success = ref('')
const error = ref('')
const passwordErrors = ref<string[]>([])
const recaptchaReady = ref(false)

const config = useRuntimeConfig()

const csrfToken = ref('');

const isSubmitting = ref(false);


onMounted(async () => {
    if (process.client) {
        const checkGrecaptcha = setInterval(() => {
            // @ts-ignore
            if (window.grecaptcha) {
                recaptchaReady.value = true;
                clearInterval(checkGrecaptcha);
            }
        }, 100);

        try {
            const csrfRes = await $fetch<{ csrfToken: string }>('/api/csrf-token', {
                credentials: 'include'
            });
            csrfToken.value = csrfRes.csrfToken;
        } catch (err) {
            console.error('Failed to fetch CSRF token:', err);
            error.value = 'Failed to initialize CSRF protection';
        }
    }
});

async function handleRegisterForm() {
    success.value = '';
    error.value = '';
    passwordErrors.value = [];

    const payload = {
        username: form.value.username.trim(),
        email: form.value.email.trim(),
        password: form.value.password.trim(),
        confirmPassword: form.value.confirmPassword.trim()
    };

    const validation = validatePassword(payload.password);
    if (validation.length > 0) {
        passwordErrors.value = validation;
        return;
    }

    if (payload.password !== payload.confirmPassword) {
        passwordErrors.value.push('Passwords do not match');
        return;
    }

    if (!recaptchaReady.value) {
        error.value = 'reCAPTCHA not ready. Please try again later.';
        return;
    }

    if (!csrfToken.value) {
        error.value = 'CSRF token not available. Please refresh and try again.';
        return;
    }

    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
        // @ts-ignore
        const token = await window.grecaptcha.execute(config.public.recaptchaSiteKey, {
            action: 'register'
        });

        const data = await $fetch('/api/register', {
            method: 'POST',
            headers: {
                'X-CSRF-Token': csrfToken.value
            },
            body: {
                ...payload,
                recaptchaToken: token
            },
            credentials: 'include'
        });

        if (data.success) {
            success.value = data.message;
            form.value = { username: '', email: '', password: '', confirmPassword: '' };
        } else {
            error.value = data.message || 'Registration failed';
        }
    } catch (err: any) {
        error.value = err.data?.message || err.message || 'Unexpected error';
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="bg-orange-100 p-10 flex flex-col items-start justify-center">
        <h1 class="mb-4 text-2xl font-bold">Register</h1>
        <form action="" @submit.prevent="handleRegisterForm" class="flex flex-col gap-4">
            <div>
                <label for="">Username: </label>
                <input v-model="form.username" type="text" placeholder="Input Username" class="border-2 p-2 ml-14"
                    required>
            </div>
            <div>
                <label for="" class="mr-8">Email: </label>
                <input v-model="form.email" type="email" placeholder="Input Email" class="border-2 p-2 ml-14"
                    autocomplete="true" required>
            </div>
            <div>
                <label for="">Password: </label>
                <input v-model="form.password" type="password" placeholder="Input Password" class="border-2 p-2 ml-15"
                    autocomplete="new-password" required>
            </div>
            <div>
                <label for="">Confirm Password: </label>
                <input v-model="form.confirmPassword" type="password" placeholder="Confirm Password"
                    class="border-2 p-2" autocomplete="new-password" required>
                <ul v-if="passwordErrors.length" class="text-red-600 text-sm mt-4">
                    <li v-for="(msg, idx) in passwordErrors" :key="idx">{{ msg }}</li>
                </ul>
            </div>
            <div class="flex gap-5">
                <button type="submit" :disabled="isSubmitting" class="border-2 p-2 cursor-pointer">Register</button>
                <NuxtLink to="/" class="border-2 p-2">Back</NuxtLink>
            </div>
            <div>
                <p class="text-green-600 mt-4" v-if="success">{{ success }}</p>
                <p class="text-red-600 mt-4" v-if="error">{{ error }}</p>
            </div>
        </form>
    </div>
</template>