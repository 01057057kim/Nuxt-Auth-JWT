import clientPromise from "../utils/mongodb";

export default defineEventHandler(async () => {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });

    return { success: true, message: "MongoDB connection successful!" };
  } catch (error) {
    return {
      success: false,
      message: "MongoDB connection failed",
      error: error,
    };
  }
});
