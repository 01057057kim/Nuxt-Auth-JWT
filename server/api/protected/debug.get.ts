import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // User info is available from the auth middleware
  const user = event.context.user
  
  return {
    success: true,
    message: 'Debug info from JWT token',
    user: user,
    userId: user?.userId,
    userIdType: typeof user?.userId,
    timestamp: new Date().toISOString()
  }
}) 