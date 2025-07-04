import clientPromise from "~/server/utils/mongodb";
import { readBody } from "h3";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default defineEventHandler(async (event) => {
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
    return { success: false, message: "A reset code will be sent to your email." };
  }

  // reset code and expiry
  const resetCode = crypto.randomBytes(4).toString('hex');
  const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: email,
    subject: 'Password Reset Request',
    text: `Your password reset code is: ${resetCode}\nThis code will expire in 15 minutes.`,
    html: `<div style=\"font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;\">
      <h2 style=\"color: #ff9800;\">Password Reset Request</h2>
      <p>We received a request to reset your password. Use the code below:</p>
      <div style=\"font-size: 2em; font-weight: bold; color: #333; letter-spacing: 2px; margin: 20px 0;\">${resetCode}</div>
      <p style=\"color: #888;\">This code will expire in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>`
  });

  return { success: true, message: "If the email exists, a reset code will be sent." };
}); 