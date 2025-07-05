import clientPromise from "~/server/utils/mongodb";
import { readBody } from "h3";
import bcrypt from "bcrypt";
import { validatePassword } from "../../utils/validatePassword";
import nodemailer from "nodemailer";
import rateLimit from '~/server/middleware/rateLimit'
import { passwordChangedTemplate } from '~/server/utils/emailTemplates'

export default defineEventHandler(async (event) => {
  await rateLimit(event)
  const body = await readBody(event);
  const { email, code, newPassword, confirmPassword } = body;

  if (!email || !code || !newPassword || !confirmPassword) {
    return { success: false, message: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  const passwordErrors = validatePassword(newPassword);
  if (passwordErrors.length > 0) {
    return { success: false, message: passwordErrors.join(', ') };
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

  const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
  const hashed = await bcrypt.hash(newPassword, saltRounds);

  await users.updateOne(
    { email },
    {
      $set: { password: hashed },
      $unset: { resetCode: "", resetCodeExpires: "" }
    }
  );

  // Send success email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const { subject, text, html } = passwordChangedTemplate()
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: email,
    subject,
    text,
    html
  });

  return { success: true, message: "Password changed successfully!" };
}); 