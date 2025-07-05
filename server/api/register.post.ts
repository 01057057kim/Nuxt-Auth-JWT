import clientPromise from "~/server/utils/mongodb";
import bcrypt from "bcrypt";
import { H3Event, getCookie, readBody, createError } from "h3";
import validator from "validator";
import { validatePassword } from "../../utils/validatePassword";
import Tokens from "csrf";
import nodemailer from "nodemailer";
import crypto from "crypto";
import rateLimit from '~/server/middleware/rateLimit'
import { verificationEmailTemplate } from '~/server/utils/emailTemplates'

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}
const tokens = new Tokens();

export default defineEventHandler(async (event: H3Event) => {
  await rateLimit(event)

  setHeader(
    event,
    "Access-Control-Allow-Origin",
    event.req.headers.origin || "*"
  );
  setHeader(event, "Access-Control-Allow-Methods", "POST");
  setHeader(
    event,
    "Access-Control-Allow-Headers",
    "Content-Type, X-CSRF-Token"
  );
  setHeader(event, "Access-Control-Allow-Credentials", "true");

  try {
    console.log("[Register] Register API called");

    const body = await readBody(event);
    const csrfSecret = getCookie(event, "csrfSecret");
    const csrfToken = event.req.headers["x-csrf-token"];
    const token = body.recaptchaToken;
    const config = useRuntimeConfig();
    
    // Try to get reCAPTCHA secret from runtime config or directly from process.env
    const recaptchaSecretKey = config.recaptchaSecretKey || process.env.RECAPTCHA_SECRET_KEY;
    
    console.log("reCAPTCHA secret from config:", recaptchaSecretKey);
    console.log("reCAPTCHA secret available:", !!recaptchaSecretKey);
    console.log("reCAPTCHA secret length:", recaptchaSecretKey ? recaptchaSecretKey.length : 0);
    console.log("reCAPTCHA secret source:", config.recaptchaSecretKey ? "runtime config" : "process.env");

    console.log(
      "[Register] Verifying CSRF - Secret:",
      csrfSecret,
      "Token:",
      csrfToken
    );

    // CRSF Verification
    if (
      !csrfSecret ||
      typeof csrfToken !== "string" ||
      !tokens.verify(csrfSecret, csrfToken)
    ) {
      console.warn("[Register] CSRF verification failed");
      throw createError({
        statusCode: 403,
        statusMessage: "Invalid CSRF token",
      });
    }

    console.log("[Register] CSRF verification successful");
    console.log("[Register] reCAPTCHA token received:", token);

    if (!token || typeof token !== "string") {
      return { success: false, message: "reCAPTCHA token missing or invalid" };
    }

    console.log(
      "[Register] Using reCAPTCHA secret:",
      !!config.recaptchaSecretKey ? "exists" : "missing"
    );
    
    if (!recaptchaSecretKey) {
      console.error("[Register] RECAPTCHA_SECRET_KEY environment variable is not set!");
      throw createError({
        statusCode: 500,
        statusMessage: "Server configuration error: reCAPTCHA secret not configured",
      });
    }
    
    // Validate reCAPTCHA
    const recaptchaRes = await $fetch<RecaptchaResponse>(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret: recaptchaSecretKey,
          response: token,
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("[Register] reCAPTCHA response:", recaptchaRes);

    if (!recaptchaRes.success || (recaptchaRes.score ?? 0) < 0.5) {
      console.log("[Register] reCAPTCHA verification failed or suspicious");
      return {
        success: false,
        message:
          "reCAPTCHA verification failed or suspicious activity detected.",
      };
    }
    console.log("[Register] reCAPTCHA verified successfully!");
    console.log("[Register] Score:", recaptchaRes.score);
    console.log("[Register] Action:", recaptchaRes.action);
    console.log("[Register] Hostname:", recaptchaRes.hostname);

    // Validate input fields
    const email = validator.normalizeEmail(body.email || "") || "";
    const username = validator.trim(validator.escape(body.username || ""));
    const password = validator.trim(body.password || "");
    const errors = validatePassword(password);

    if (!email || !username || !password) {
      console.log("[Register] Validation failed: missing required fields");
      return {
        success: false,
        message: "Email, username, and password are required.",
      };
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: errors.join(", "),
      };
    }

    if (username.toLowerCase() === 'admin') {
      return {
        success: false,
        message: "Username 'admin' is reserved. Please choose another username."
      };
    }

    // encrypt password
    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    if (isNaN(saltRounds)) {
      console.error("SALT ERROR");
    }

    // connect to MongoDB Atlas
    console.log("[Register] Attempting to connect to MongoDB");
    const client = await clientPromise;
    console.log("[Register] MongoDB connection successful");

    const db = client.db("auth-nuxt");
    const users = db.collection("users");

    console.log("[Register] Checking for existing users");
    const checkEmailExist = await users.findOne({ email });
    const checkUsernameExist = await users.findOne({ username });

    // check email and username exist or not
    if (checkEmailExist) {
      console.log("[Register] Email already exists");
      return { success: false, message: "Email already registered" };
    }

    if (checkUsernameExist) {
      console.log("[Register] Username already exists");
      return { success: false, message: "Username already registered" };
    }

    console.log("[Register] Hashing password...");
    const hashed = await bcrypt.hash(password, saltRounds);

    // alphanumeric, 8 chars verification code
    const verificationCode = crypto.randomBytes(4).toString('hex');
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log("[Register] Inserting new user...");
    await users.insertOne({
      username,
      email,
      password: hashed,
      createdAt: new Date(),
      loginMethod: 'username',
      emailVerified: false,
      verificationCode,
      verificationCodeExpires
    });

    // Send verification email
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

    console.log("[Register] User registered successfully!");
    return { success: true, message: "Registered successfully!" };
  } catch (error: any) {
    console.error("Register API error:", error);
    console.error("Error stack:", error.stack);

    const isDevelopment = process.env.NODE_ENV === "development";
    return {
      success: false,
      message: isDevelopment
        ? `Error: ${error.message}`
        : "Internal Server Error",
      ...(isDevelopment && { error: error.message, stack: error.stack }),
    };
  }
});
