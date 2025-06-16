import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

if (!uri) {
  throw new Error("Error to laod Mongo URI to .env (check the uri on env)");
}
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

console.log("[MongoDB] NODE_ENV:", process.env.NODE_ENV);
console.log("[MongoDB] MongoDB URI exists:", !!uri);

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
