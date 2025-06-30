import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import jwt from 'jsonwebtoken'
import clientPromise from '~/server/utils/mongodb'

interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  verified_email: boolean
}

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
}

export default defineEventHandler(async (event) => {

  console.log('Callback hit:', true)
  console.log('URL:', event.path)
  console.log('Method:', event.method)

  const query = getQuery(event)
  const { code, error } = query

  console.log('Code present:', !!code)
  console.log('Error present:', !!error)

  if (error) {
    return sendRedirect(event, `/Login?error=${encodeURIComponent('Google authentication failed: ' + error)}`)
  }
  if (!code) {
    return sendRedirect(event, `/Login?error=${encodeURIComponent('No authorization code received')}`)
  }
  try {
    const codeString = code as string

    console.log('Processing code:', true)

    const config = useRuntimeConfig()
    if (!config.googleClientSecret) {
      return sendRedirect(event, `/Login?error=${encodeURIComponent('Google OAuth is not properly configured')}`)
    }
    const tokenResponse = await $fetch<GoogleTokenResponse>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code: codeString,
        client_id: config.public.googleClientId!,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleRedirectUri,
        grant_type: 'authorization_code'
      })
    })

    console.log('Access token received:', !!tokenResponse.access_token)

    const userResponse = await $fetch<GoogleUser>('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    })

    console.log('User info received:', !!userResponse.email)

    const client = await clientPromise
    const db = client.db('google')

    console.log('DB connected:', true)

    let user = await db.collection('users').findOne({ email: userResponse.email })

    console.log('User exists:', !!user)

    if (!user) {
      const newUser = {
        username: userResponse.name,
        email: userResponse.email,
        googleId: userResponse.id,
        picture: userResponse.picture,
        verified_email: userResponse.verified_email,
        createdAt: new Date(),
        updatedAt: new Date(),
        loginMethod: 'google'
      }
      const result = await db.collection('users').insertOne(newUser)
      user = { ...newUser, _id: result.insertedId }

      console.log('User created:', true)

    } else {
      if (user && !user.googleId) {
        const updateData: any = {
          googleId: userResponse.id,
          picture: userResponse.picture,
          updatedAt: new Date(),
          loginMethod: 'google'
        }
        if (!user.username || user.username !== userResponse.name) {
          updateData.username = userResponse.name
        }
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: updateData }
        )
        user = { ...user, ...updateData }

        console.log('User updated:', true)

      } else if (user) {
        if (user.username !== userResponse.name) {
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { username: userResponse.name, updatedAt: new Date() } }
          )
          user.username = userResponse.name

          console.log('Username updated:', true)

        }
      }
    }
    if (!user) {
      throw new Error('User data is missing after database operation')
    }
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        loginMethod: 'google'
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    )

    console.log('JWT generated:', !!token)

    const userData = {
      username: user.username,
      email: user.email,
      picture: user.picture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      loginMethod: 'google'
    }

    console.log('UserData ready:', !!userData.username && !!userData.email)

    const redirectUrl = `/Main?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`

    console.log('Redirecting:', true)

    return sendRedirect(event, redirectUrl)
  } catch (error: any) {
    const errorMessage = error.data?.message || error.message || 'Google authentication failed'

    console.log('Redirecting with error:', true)
    
    return sendRedirect(event, `/Login?error=${encodeURIComponent(errorMessage)}`)
  }
}) 