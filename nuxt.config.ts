// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: "node-server",
  },
  runtimeConfig: {
    public: {
      recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
    },
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
  },
  modules: ["@nuxtjs/tailwindcss"],
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
});
