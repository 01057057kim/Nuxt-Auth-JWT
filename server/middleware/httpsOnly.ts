import { defineEventHandler, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  // Only enforce in production
  if (process.env.NODE_ENV === 'production') {
    const forwardedProto = event.req.headers['x-forwarded-proto']
    const isEncrypted = (event.req.connection as any)?.encrypted
    const proto = forwardedProto ? forwardedProto : (isEncrypted ? 'https' : 'http')
    if (proto !== 'https') {
      const host = event.req.headers['host']
      const url = `https://${host}${event.req.url}`
      return sendRedirect(event, url, 301)
    }
  }
}) 