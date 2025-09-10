import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var myMongoose: MongooseCache | undefined;
}

let cached = global.myMongoose;

if (!cached) {
  cached = global.myMongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      // Import all models to ensure they are registered
      require("@/lib/models/user");
      require("@/lib/models/vehicle");
      require("@/lib/models/route");
      require("@/lib/models/stop");
      require("@/lib/models/schedule");
      require("@/lib/models/trip");
      require("@/lib/models/requisition");

      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
