import clientPromise from "~/server/utils/mongodb";
import { getHeader, createError, getQuery } from "h3";
import jwt from 'jsonwebtoken';

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
  // Pagination and search
  const query = getQuery(event);
  const search = (query.search || '').toString().trim();
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 10;
  const filter: any = {};
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  const client = await clientPromise;
  const db = client.db("auth-nuxt");
  const usersCol = db.collection("users");
  const total = await usersCol.countDocuments(filter);
  const users = await usersCol.find(filter, { projection: { password: 0, verificationCode: 0, verificationCodeExpires: 0, resetCode: 0, resetCodeExpires: 0 } })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
  return { success: true, users, total };
}); 