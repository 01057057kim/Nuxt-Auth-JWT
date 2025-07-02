export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  // Get Google Client ID from runtime config or process.env
  const googleClientId = config.public.googleClientId || process.env.GOOGLE_CLIENT_ID;
  const googleRedirectUri = config.public.googleRedirectUri || process.env.GOOGLE_REDIRECT_URI || 'https://nuxt-auth-jwt.onrender.com/api/auth/callback/google';
  
  return {
    googleClientId,
    googleRedirectUri,
    isConfigured: !!googleClientId
  };
}); 