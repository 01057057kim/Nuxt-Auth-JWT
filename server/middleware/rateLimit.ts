import { defineEventHandler, getRequestIP, createError } from 'h3'

const rateLimitStore: Record<string, { count: number, last: number }> = {}
const WINDOW = 60 * 1000 // 1 minute
const LIMIT = 20

export default defineEventHandler((event) => {
  const ip = getRequestIP(event) || 'unknown'
  const now = Date.now()
  if (!rateLimitStore[ip] || now - rateLimitStore[ip].last > WINDOW) {
    rateLimitStore[ip] = { count: 1, last: now }
  } else {
    rateLimitStore[ip].count++
    rateLimitStore[ip].last = now
  }
  if (rateLimitStore[ip].count > LIMIT) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Please try again later.' })
  }
}) 