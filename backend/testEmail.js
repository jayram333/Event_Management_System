require("dotenv").config();
const { verifyEmailConnection } = require("./services/emailService");
const testEmail = async () => {
  try {
    await verifyEmailConnection();
    console.log("Nodemailer test completed successfully.");
  } catch (error) {
    console.error("Nodemailer connection error:");
    console.error(error.message);
  }
};

testEmail();