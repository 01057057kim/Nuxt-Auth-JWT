import { defineEventHandler } from 'h3'
import clientPromise from '~/server/utils/mongodb'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  // User info is available from the auth middleware
  const user = event.context.user
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not authenticated'
    })
  }

  try {
    // Connect to database to get fresh user data
    const client = await clientPromise
    const db = client.db("auth-nuxt")
    const users = db.collection("users")

    // Convert string userId to ObjectId
    let userData
    try {
      const objectId = new ObjectId(user.userId)
      userData = await users.findOne({ _id: objectId })
    } catch (objectIdError) {
      console.error('Invalid ObjectId:', user.userId)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid user ID format'
      })
    }
    
    if (!userData) {
      console.error('User not found in database:', user.userId)
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      user: {
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt || userData.createdAt,
        loginMethod: userData.loginMethod || 'username',
        picture: userData.picture
      }
    }
  } catch (error: any) {
    console.error('Protected user API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}) 