export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server-side
  if (process.server) return

  // Check if user is authenticated
  const userData = localStorage.getItem('userData')
  const authToken = localStorage.getItem('authToken')
  
  // If accessing protected routes without authentication, redirect to login
  if (to.path === '/Main' && !userData) {
    return navigateTo('/Login')
  }
  
  // If accessing login/register while already authenticated, redirect to main
  if ((to.path === '/Login' || to.path === '/Register') && userData) {
    return navigateTo('/Main')
  }
}) 