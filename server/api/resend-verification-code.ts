import clientPromise from "~/server/utils/mongodb";
import { readBody } from "h3";
import nodemailer from "nodemailer";
import crypto from "crypto";
import rateLimit from '~/server/middleware/rateLimit'
import { verificationEmailTemplate } from '~/server/utils/emailTemplates'

export default defineEventHandler(async (event) => {
  await rateLimit(event)
  const body = await readBody(event);
  const { email } = body;
  if (!email) {
    return { success: false, message: "Email is required." };
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
  // Generate new code and expiry
  const verificationCode = crypto.randomBytes(4).toString('hex');
  const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
  await users.updateOne(
    { email },
    { $set: { verificationCode, verificationCodeExpires } }
  );
  // Send email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const { subject, text, html } = verificationEmailTemplate(verificationCode)
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: email,
    subject,
    text,
    html
  });
  return { success: true, message: "Verification code resent. Please check your email." };
}); 