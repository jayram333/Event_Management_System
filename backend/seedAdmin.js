const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./models/Admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await Admin.findOne({
      role: "ADMIN",
    });

    if (existingAdmin) {
      console.log("Admin already exists:");
      console.log(existingAdmin.email);

      await mongoose.connection.close();
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || "Admin";

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env"
      );
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      12
    );

    const admin = await Admin.create({
      name: adminName,
      email: adminEmail.trim().toLowerCase(),
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    });

    console.log("=================================");
    console.log("Single Admin Created Successfully");
    console.log("Admin Email:", admin.email);
    console.log("=================================");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Admin creation error:", error.message);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore connection close error
    }

    process.exit(1);
  }
};

createAdmin();