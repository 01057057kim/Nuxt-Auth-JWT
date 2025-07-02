export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  const isDevelopment = process.env.NODE_ENV === "development";
  
  return {
    environment: process.env.NODE_ENV,
    isDevelopment,
    config: {
      jwtSecret: {
        exists: !!config.jwtSecret,
        length: config.jwtSecret ? config.jwtSecret.length : 0,
        preview: config.jwtSecret ? `${config.jwtSecret.substring(0, 10)}...` : "undefined"
      },
      recaptchaSecretKey: {
        exists: !!config.recaptchaSecretKey,
        length: config.recaptchaSecretKey ? config.recaptchaSecretKey.length : 0,
        preview: config.recaptchaSecretKey ? `${config.recaptchaSecretKey.substring(0, 10)}...` : "undefined"
      },
      googleClientId: {
        exists: !!config.public.googleClientId,
        preview: config.public.googleClientId ? `${config.public.googleClientId.substring(0, 20)}...` : "undefined"
      },
      googleClientSecret: {
        exists: !!config.googleClientSecret,
        length: config.googleClientSecret ? config.googleClientSecret.length : 0,
        preview: config.googleClientSecret ? `${config.googleClientSecret.substring(0, 10)}...` : "undefined"
      },
      recaptchaSiteKey: {
        exists: !!config.public.recaptchaSiteKey,
        preview: config.public.recaptchaSiteKey ? `${config.public.recaptchaSiteKey.substring(0, 20)}...` : "undefined"
      },
      mongodbUri: {
        exists: !!process.env.MONGODB_URI,
        preview: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 30)}...` : "undefined"
      }
    },
    rawEnv: isDevelopment ? {
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
      RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ? "SET" : "NOT SET",
      NUXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY ? "SET" : "NOT SET",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
      MONGODB_URI: process.env.MONGODB_URI ? "SET" : "NOT SET",
      SALT_ROUNDS: process.env.SALT_ROUNDS || "10 (default)"
    } : "Environment variables hidden in production"
  };
}); 