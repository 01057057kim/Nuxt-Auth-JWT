import clientPromise from "~/server/utils/mongodb";
import bcrypt from "bcrypt";
import { H3Event } from "h3";

const saltRounds = Number(process.env.SALT_ROUNDS); //encrypt key

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event);

    const { email, username, password } = body;

    if (!email || !username || !password) {
      return {
        success: false,
        message: "Email, username, and password are required.",
      };
    }

    const client = await clientPromise;
    const db = client.db("auth-nuxt");
    const users = db.collection("users");

    const checkEmailExist = await users.findOne({ email: email.toLowerCase() });
    const checkUsernameExist = await users.findOne({ username });

    if (checkEmailExist) {
      return { success: false, message: "Email already registered" }; // Check email exist
    }
    if (checkUsernameExist) {
      return { success: false, message: "Username already registered" }; // Check username exist
    }

    const hashed = await bcrypt.hash(password, saltRounds); // encrypt password for sefety

    await users.insertOne({
      username,
      email: email.toLowerCase(),
      password: hashed,
      createdAt: new Date(),
    });

    return { success: true, message: "Registered successfully!" };
  } catch (error: unknown) {
    // error and unknow error handleing
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Unknown error" };
  }
});
