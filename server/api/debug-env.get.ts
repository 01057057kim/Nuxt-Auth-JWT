export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  const isDevelopment = process.env.NODE_ENV === "development";
  
  return {
    environment: process.env.NODE_ENV,
    isDevelopment,
    config: {
      jwtSecret: {
        exists: !!(config.jwtSecret || process.env.JWT_SECRET),
        length: (config.jwtSecret || process.env.JWT_SECRET || "").length,
        preview: (config.jwtSecret || process.env.JWT_SECRET) ? `${(config.jwtSecret || process.env.JWT_SECRET || "").substring(0, 10)}...` : "undefined",
        source: config.jwtSecret ? "runtime config" : (process.env.JWT_SECRET ? "process.env" : "not found")
      },
      recaptchaSecretKey: {
        exists: !!(config.recaptchaSecretKey || process.env.RECAPTCHA_SECRET_KEY),
        length: (config.recaptchaSecretKey || process.env.RECAPTCHA_SECRET_KEY || "").length,
        preview: (config.recaptchaSecretKey || process.env.RECAPTCHA_SECRET_KEY) ? `${(config.recaptchaSecretKey || process.env.RECAPTCHA_SECRET_KEY || "").substring(0, 10)}...` : "undefined",
        source: config.recaptchaSecretKey ? "runtime config" : (process.env.RECAPTCHA_SECRET_KEY ? "process.env" : "not found")
      },
      googleClientId: {
        exists: !!config.public.googleClientId,
        preview: config.public.googleClientId ? `${config.public.googleClientId.substring(0, 20)}...` : "undefined"
      },
      googleClientSecret: {
        exists: !!(config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET),
        length: (config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "").length,
        preview: (config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET) ? `${(config.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || "").substring(0, 10)}...` : "undefined",
        source: config.googleClientSecret ? "runtime config" : (process.env.GOOGLE_CLIENT_SECRET ? "process.env" : "not found")
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
    rawEnv: {
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
      RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ? "SET" : "NOT SET",
      NUXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY ? "SET" : "NOT SET",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
      MONGODB_URI: process.env.MONGODB_URI ? "SET" : "NOT SET",
      SALT_ROUNDS: process.env.SALT_ROUNDS || "10 (default)"
    },
    // Additional debugging info
    processEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('JWT') || 
      key.includes('RECAPTCHA') || 
      key.includes('GOOGLE') || 
      key.includes('MONGODB') ||
      key.includes('NODE_ENV')
    ),
    configKeys: Object.keys(config),
    publicConfigKeys: Object.keys(config.public || {})
  };
}); 