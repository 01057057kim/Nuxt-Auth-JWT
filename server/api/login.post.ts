import clientPromise from "~/server/utils/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { H3Event, getCookie, readBody, createError } from "h3";
import validator from "validator";
import Tokens from "csrf";

const tokens = new Tokens();

export default defineEventHandler(async (event: H3Event) => {
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
    console.log("[Login] Login API called");

    const body = await readBody(event);
    const csrfSecret = getCookie(event, "csrfSecret");
    const csrfToken = event.req.headers["x-csrf-token"];

    console.log(
      "[Login] Verifying CSRF - Secret:",
      csrfSecret,
      "Token:",
      csrfToken
    );

    // CSRF verification
    if (
      !csrfSecret ||
      typeof csrfToken !== "string" ||
      !tokens.verify(csrfSecret, csrfToken)
    ) {
      console.warn("[Login] CSRF verification failed");
      throw createError({
        statusCode: 403,
        statusMessage: "Invalid CSRF token",
      });
    }

    console.log("[Login] CSRF verification successful");

    // validate input fields
    const username = validator.trim(validator.escape(body.username || ""));
    const password = validator.trim(body.password || "");

    if (!username || !password) {
      console.log("[Login] Validation failed: missing required fields");
      return {
        success: false,
        message: "Username and password are required.",
      };
    }

    // connect to MongoDB
    console.log("[Login] Attempting to connect to MongoDB");
    const client = await clientPromise;
    console.log("[Login] MongoDB connection successful");

    const db = client.db("auth-nuxt");
    const users = db.collection("users");

    console.log("[Login] Searching for user:", username);
    const user = await users.findOne({ username });

    if (!user) {
      console.log("[Login] User not found");
      return { success: false, message: "Invalid username or password" };
    }

    console.log("[Login] User found, verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("[Login] Invalid password");
      return { success: false, message: "Invalid username or password" };
    }

    console.log("[Login] Login successful! Generating JWT token...");
    
    // Generate JWT token
    const config = useRuntimeConfig();
    
    // Try to get JWT secret from runtime config or directly from process.env
    const jwtSecret = config.jwtSecret || process.env.JWT_SECRET;
    
    // Debug: Check if JWT secret is available
    console.log("[Login] JWT Secret available:", !!jwtSecret);
    console.log("[Login] JWT Secret length:", jwtSecret ? jwtSecret.length : 0);
    console.log("[Login] JWT Secret source:", config.jwtSecret ? "runtime config" : "process.env");
    
    if (!jwtSecret) {
      console.error("[Login] JWT_SECRET environment variable is not set!");
      throw createError({
        statusCode: 500,
        statusMessage: "Server configuration error: JWT secret not configured",
      });
    }
    
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        username: user.username,
        loginMethod: user.loginMethod || 'username'
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    return {
      success: true,
      message: "Login successful!",
      token,
      user: {
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || user.createdAt,
        loginMethod: user.loginMethod || 'username'
      }
    };
  } catch (error: any) {
    console.error("Login API error:", error);
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