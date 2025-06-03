import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  console.log('Hello World from backend!')
  return { message: 'Hello from backend!' }
})
