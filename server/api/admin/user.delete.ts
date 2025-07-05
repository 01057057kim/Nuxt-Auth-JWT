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
  // Get user id
  const body = await readBody(event);
  const { id } = body;
  if (!id) throw createError({ statusCode: 400, statusMessage: 'User id required' });
  // Prevent admin from deleting self
  const client = await clientPromise;
  const db = client.db("auth-nuxt");
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
  if (user && user.username && user.username.toLowerCase() === 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Cannot delete admin user' });
  }
  await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  return { success: true, message: 'User deleted.' };
}); 