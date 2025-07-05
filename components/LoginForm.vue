<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { setAuthToken, setUserData } from '~/utils/jwt'

interface User {
    username: string
    email: string
    createdAt: string
    updatedAt: string
    loginMethod?: string
    picture?: string
}

interface LoginResponse {
    success: boolean
    message: string
    user?: User
    token?: string
}

interface CsrfResponse {
    csrfToken: string
}

const formData = reactive({
    username: '',
    password: ''
})

const loading = ref(false)
const googleLoading = ref(false)
const message = ref('')
const messageClass = ref('')

const showForgot = ref(false)
const forgotStep = ref(1) // 1: email, 2: code, 3: new password
const forgotEmail = ref('')
const forgotCode = ref('')
const forgotNewPassword = ref('')
const forgotConfirmPassword = ref('')
const forgotMessage = ref('')
const forgotMessageClass = ref('')
const forgotLoading = ref(false)

// Check for URL parameters on mount
onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
        message.value = decodeURIComponent(error)
        messageClass.value = 'text-red-600'
    }
})

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
            
            // Store user data and JWT token using utilities
            if (response.user) {
                setUserData(response.user)
            }
            if (response.token) {
                setAuthToken(response.token)
            }
            
            setTimeout(() => {
                if (response.user && response.user.username && response.user.username.toLowerCase() === 'admin') {
                    navigateTo('/Admin')
                } else {
                    navigateTo('/Main')
                }
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

const handleGoogleLogin = async () => {

    console.log('Google login start:', true)
    
    googleLoading.value = true
    message.value = ''
    try {
        // Get Google OAuth configuration from server
        const googleConfig = await $fetch('/api/google-config')
        
        const clientId = googleConfig.googleClientId
        const redirectUri = googleConfig.googleRedirectUri

        console.log('Client ID present:', !!clientId)
        console.log('Redirect URI present:', !!redirectUri)

        if (!clientId) {
            message.value = 'Google OAuth is not configured. Please contact administrator.'
            messageClass.value = 'text-red-600'
            googleLoading.value = false
            return
        }
        if (!redirectUri) {
            message.value = 'Google OAuth redirect URI is not configured.'
            messageClass.value = 'text-red-600'
            googleLoading.value = false
            return
        }
        const scope = 'email profile'
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(scope)}` +
            `&access_type=offline` +
            `&prompt=consent`

        console.log('OAuth URL built:', !!googleAuthUrl)

        window.location.href = googleAuthUrl

        console.log('Redirected:', true)
    } catch (error) {
        console.error('Google OAuth error:', error)
        message.value = 'Failed to initiate Google OAuth'
        messageClass.value = 'text-red-600'
        googleLoading.value = false
    }
}

function openForgot() {
    showForgot.value = true
    forgotStep.value = 1
    forgotEmail.value = ''
    forgotCode.value = ''
    forgotNewPassword.value = ''
    forgotConfirmPassword.value = ''
    forgotMessage.value = ''
    forgotMessageClass.value = ''
}

function closeForgot() {
    showForgot.value = false
}

async function handleForgotEmail() {
    forgotLoading.value = true
    forgotMessage.value = ''
    try {
        const res: any = await $fetch('/api/forgot-password-request', {
            method: 'POST',
            body: { email: forgotEmail.value }
        })
        forgotMessage.value = 'A reset code has been sent, Check your email.'
        forgotMessageClass.value = 'text-green-600'
        forgotStep.value = 2
    } catch (err: any) {
        forgotMessage.value = err.data?.message || err.message || 'Unexpected error'
        forgotMessageClass.value = 'text-red-600'
    } finally {
        forgotLoading.value = false
    }
}

async function handleForgotCode() {
    forgotLoading.value = true
    forgotMessage.value = ''
    try {
        const res: any = await $fetch('/api/forgot-password-check-code', {
            method: 'POST',
            body: { email: forgotEmail.value, code: forgotCode.value }
        })
        if (res.success) {
            forgotStep.value = 3
        } else {
            forgotMessage.value = res.message || 'Invalid code'
            forgotMessageClass.value = 'text-red-600'
        }
    } catch (err: any) {
        forgotMessage.value = err.data?.message || err.message || 'Unexpected error'
        forgotMessageClass.value = 'text-red-600'
    } finally {
        forgotLoading.value = false
    }
}

async function handleForgotReset() {
    forgotLoading.value = true
    forgotMessage.value = ''
    try {
        const res: any = await $fetch('/api/forgot-password-verify', {
            method: 'POST',
            body: {
                email: forgotEmail.value,
                code: forgotCode.value,
                newPassword: forgotNewPassword.value,
                confirmPassword: forgotConfirmPassword.value
            }
        })
        if (res.success) {
            forgotMessage.value = res.message
            forgotMessageClass.value = 'text-green-600'
            setTimeout(() => { showForgot.value = false }, 2000)
        } else {
            forgotMessage.value = res.message || 'Reset failed'
            forgotMessageClass.value = 'text-red-600'
        }
    } catch (err: any) {
        forgotMessage.value = err.data?.message || err.message || 'Unexpected error'
        forgotMessageClass.value = 'text-red-600'
    } finally {
        forgotLoading.value = false
    }
}
</script>
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
        <button class="mt-2 text-blue-600 underline" @click="openForgot">Forgot Password?</button>
        <div v-if="showForgot" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
                <button class="absolute top-2 right-2 text-gray-500" @click="closeForgot">&times;</button>
                <h2 class="text-xl font-bold mb-4">Forgot Password</h2>
                <form v-if="forgotStep === 1" @submit.prevent="handleForgotEmail" class="flex flex-col gap-4">
                    <input v-model="forgotEmail" type="email" placeholder="Enter your email" class="border-2 p-2" required />
                    <button type="submit" :disabled="forgotLoading" class="border-2 p-2">{{ forgotLoading ? 'Sending...' : 'Send Code' }}</button>
                </form>
                <form v-else-if="forgotStep === 2" @submit.prevent="handleForgotCode" class="flex flex-col gap-4">
                    <input v-model="forgotCode" type="text" placeholder="Enter verification code" class="border-2 p-2" required />
                    <button type="submit" :disabled="forgotLoading" class="border-2 p-2">{{ forgotLoading ? 'Checking...' : 'Verify Code' }}</button>
                </form>
                <form v-else @submit.prevent="handleForgotReset" class="flex flex-col gap-4">
                    <input v-model="forgotNewPassword" type="password" placeholder="New password" class="border-2 p-2" required />
                    <input v-model="forgotConfirmPassword" type="password" placeholder="Confirm new password" class="border-2 p-2" required />
                    <button type="submit" :disabled="forgotLoading" class="border-2 p-2">{{ forgotLoading ? 'Resetting...' : 'Reset Password' }}</button>
                </form>
                <div v-if="forgotMessage" :class="forgotMessageClass" class="mt-2">{{ forgotMessage }}</div>
            </div>
        </div>
        
        <!-- Google OAuth Button -->
        <div class="mt-6 w-full">
            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="bg-orange-100 px-2 text-gray-500">Or continue with</span>
                </div>
            </div>
            
            <div class="mt-6">
                <button 
                    @click="handleGoogleLogin" 
                    :disabled="googleLoading"
                    class="w-full flex justify-center items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {{ googleLoading ? 'Signing in...' : 'Sign in with Google' }}
                </button>
            </div>
        </div>
    </div>
</template>