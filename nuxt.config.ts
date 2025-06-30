// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: "node-server",
  },
  runtimeConfig: {
    public: {
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
    },
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    jwtSecret: process.env.JWT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  modules: [
    "@nuxtjs/tailwindcss"
  ],
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
});
