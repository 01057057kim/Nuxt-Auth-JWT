import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // User info is available from the auth middleware
  const user = event.context.user
  
  return {
    success: true,
    message: 'JWT authentication is working!',
    user: user,
    timestamp: new Date().toISOString()
  }
}) 