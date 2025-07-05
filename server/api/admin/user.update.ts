import clientPromise from "~/server/utils/mongodb";
import { getHeader, readBody, createError } from "h3";
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  // Check JWT and admin
  const auth = getHeader(event, 'authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' });
  }
  if (!decoded || !decoded.username || decoded.username.toLowerCase() !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }
  // Get user id and new data
  const body = await readBody(event);
  const { id, username, email } = body;
  if (!id || !username || !email) throw createError({ statusCode: 400, statusMessage: 'All fields required' });
  // Prevent changing username to 'admin' unless it's the admin user
  if (username.toLowerCase() === 'admin') {
    // Only allow if updating the admin user
    const client = await clientPromise;
    const db = client.db("auth-nuxt");
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!user || user.username.toLowerCase() !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Cannot set username to admin' });
    }
  }
  // Update user
  const client = await clientPromise;
  const db = client.db("auth-nuxt");
  await db.collection("users").updateOne(
    { _id: new ObjectId(id) },
    { $set: { username, email } }
  );
  return { success: true, message: 'User updated.' };
}); 