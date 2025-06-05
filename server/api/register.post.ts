import clientPromise from "~/server/utils/mongodb";
import bcrypt from "bcrypt";
import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Access-Control-Allow-Methods", "POST");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type");

  try {
    console.log("Register API called");

    const body = await readBody(event);
    console.log("Request body received:", {
      hasEmail: !!body.email,
      hasUsername: !!body.username,
      hasPassword: !!body.password,
    });

    const { email, username, password } = body;

    if (!email || !username || !password) {
      console.log("Validation failed: missing required fields");
      return {
        success: false,
        message: "Email, username, and password are required.",
      };
    }

    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    if (isNaN(saltRounds)) {
      console.error("SALT ERROR");
    }

    console.log("Attempting to connect to MongoDB");
    const client = await clientPromise;
    console.log("MongoDB connection successful");

    const db = client.db("auth-nuxt");
    const users = db.collection("users");

    console.log("Checking for existing users");
    const checkEmailExist = await users.findOne({ email: email.toLowerCase() });
    const checkUsernameExist = await users.findOne({ username });

    if (checkEmailExist) {
      console.log("Email already exists");
      return { success: false, message: "Email already registered" };
    }

    if (checkUsernameExist) {
      console.log("Username already exists");
      return { success: false, message: "Username already registered" };
    }

    console.log("Hashing password...");
    const hashed = await bcrypt.hash(password, saltRounds);

    console.log("Inserting new user...");
    await users.insertOne({
      username,
      email: email.toLowerCase(),
      password: hashed,
      createdAt: new Date(),
    });

    console.log("User registered successfully!");
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
