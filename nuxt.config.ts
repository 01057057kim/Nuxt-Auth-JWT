// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'node-server'
  },
  modules: ['@nuxtjs/tailwindcss'],
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true }
})
