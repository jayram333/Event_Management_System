const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MongoDB Connection Error: MONGO_URI is missing from environment variables.");
      return;
    }

    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (dnsErr) {
      // Ignore if DNS override fails
    }

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
  }
};

module.exports = connectDB;