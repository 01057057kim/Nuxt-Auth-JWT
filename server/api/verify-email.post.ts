import clientPromise from "~/server/utils/mongodb";
import { readBody } from "h3";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, code } = body;

  if (!email || !code) {
    return { success: false, message: "Email and code are required." };
  }

  const client = await clientPromise;
  const db = client.db("auth-nuxt");
  const users = db.collection("users");

  const user = await users.findOne({ email });
  if (!user) {
    return { success: false, message: "User not found." };
  }

  if (user.emailVerified) {
    return { success: false, message: "Email already verified." };
  }

  if (!user.verificationCode || !user.verificationCodeExpires) {
    return { success: false, message: "No verification code found. Please register again." };
  }

  if (user.verificationCode !== code) {
    return { success: false, message: "Invalid verification code." };
  }

  if (new Date() > new Date(user.verificationCodeExpires)) {
    return { success: false, message: "Verification code expired. Please register again." };
  }

  await users.updateOne(
    { email },
    {
      $set: { emailVerified: true },
      $unset: { verificationCode: "", verificationCodeExpires: "" }
    }
  );

  return { success: true, message: "Email verified successfully!" };
}); 