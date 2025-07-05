import clientPromise from "~/server/utils/mongodb";
import { readBody } from "h3";
import nodemailer from "nodemailer";
import crypto from "crypto";
import rateLimit from '~/server/middleware/rateLimit'
import { resetEmailTemplate } from '~/server/utils/emailTemplates'

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
  // Generate new code and expiry
  const resetCode = crypto.randomBytes(4).toString('hex');
  const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
  await users.updateOne(
    { email },
    { $set: { resetCode, resetCodeExpires } }
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
  const { subject, text, html } = resetEmailTemplate(resetCode)
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: email,
    subject,
    text,
    html
  });
  return { success: true, message: "Reset code resent. Please check your email." };
}); 