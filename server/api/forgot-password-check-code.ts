import clientPromise from "~/server/utils/mongodb";
import { readBody } from "h3";
import rateLimit from '~/server/middleware/rateLimit'

export default defineEventHandler(async (event) => {
  await rateLimit(event)
  const body = await readBody(event);
  const { email, code } = body;

  if (!email || !code) {
    return { success: false, message: "Email and code are required." };
  }

  const client = await clientPromise;
  const db = client.db("auth-nuxt");
  const users = db.collection("users");

  const user = await users.findOne({ email });
  if (!user || !user.resetCode || !user.resetCodeExpires) {
    return { success: false, message: "Invalid or expired reset code." };
  }

  if (user.resetCode !== code) {
    return { success: false, message: "Invalid reset code." };
  }

  if (new Date() > new Date(user.resetCodeExpires)) {
    return { success: false, message: "Reset code expired. Please request again." };
  }

  return { success: true, message: "Code is valid." };
}); 