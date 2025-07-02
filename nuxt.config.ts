// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: "node-server",
  },
  app: {
    head: {
      title: 'Auth JWT & reCAPTCHA Template',
      meta: [
        { name: 'description', content: 'A full-stack Nuxt 3 + Nitro template for secure authentication using JWT, Google OAuth, and reCAPTCHA v3. Includes best practices for security, user management, and modern web development.' },
        { name: 'keywords', content: 'nuxt3, nitro, jwt, authentication, auth, reCAPTCHA, google oauth, security, full stack, template, login, register, mfa, csrf, xss' },
        // Open Graph
        { property: 'og:title', content: 'Auth JWT & reCAPTCHA Template' },
        { property: 'og:description', content: 'A full-stack Nuxt 3 + Nitro template for secure authentication using JWT, Google OAuth, and reCAPTCHA v3.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://nuxt-auth-jwt.onrender.com' },
        { property: 'og:image', content: 'https://nuxt-auth-jwt.onrender.com/og-image.png' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Auth JWT & reCAPTCHA Template' },
        { name: 'twitter:description', content: 'A full-stack Nuxt 3 + Nitro template for secure authentication using JWT, Google OAuth, and reCAPTCHA v3.' },
        { name: 'twitter:image', content: 'https://nuxt-auth-jwt.onrender.com/og-image.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET, 
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
  
    public: {
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google',
    }
  },
  modules: [
    "@nuxtjs/tailwindcss"
  ],
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
});
