import mongoose from "mongoose";

// Pre-register all Mongoose schemas into memory to prevent MissingSchemaError on populates
import "../models/User.js";
import "../models/Vehicle.js";
import "../models/ParkingLot.js";
import "../models/ParkingSlot.js";
import "../models/ParkingSession.js";
import "../models/SecurityIncident.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/where_did_i_park";

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 15,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 12000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 12000,
      maxIdleTimeMS: 45000,
      retryWrites: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }

  return cached.conn;
}
