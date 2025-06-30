import jwt from 'jsonwebtoken'
import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // Only run middleware on protected routes
  const protectedRoutes = ['/api/protected']
  const isProtectedRoute = protectedRoutes.some(route => event.path?.startsWith(route))
  
  console.log(`[Auth Middleware] Path: ${event.path}, Protected: ${isProtectedRoute}`)
  
  if (!isProtectedRoute) {
    console.log(`[Auth Middleware] Skipping auth for: ${event.path}`)
    return
  }

  console.log(`[Auth Middleware] Checking auth for: ${event.path}`)

  // Get token from Authorization header
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    console.log(`[Auth Middleware] No token provided for: ${event.path}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'No token provided'
    })
  }

  try {
    const config = useRuntimeConfig()
    const decoded = jwt.verify(token, config.jwtSecret)
    
    // Add user info to event context
    event.context.user = decoded
    console.log(`[Auth Middleware] Auth successful for: ${event.path}`)
  } catch (error) {
    console.log(`[Auth Middleware] Invalid token for: ${event.path}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }
}) 