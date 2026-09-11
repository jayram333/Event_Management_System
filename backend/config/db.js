const mongoose = require("mongoose");
const dns = require("dns");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MongoDB Connection Error: MONGO_URI is missing from environment variables.");
      return;
    }

    if (cached.conn && mongoose.connection.readyState === 1) {
      return cached.conn;
    }

    if (!cached.promise) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch (dnsErr) {
        // Ignore if DNS override fails
      }

      const opts = {
        serverSelectionTimeoutMS: 10000,
        family: 4,
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB Connection Error:", error.message);
  }
};

module.exports = connectDB;