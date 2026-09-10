const nodemailer = require("nodemailer");

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error("Email configuration missing. Please ensure EMAIL_USER and EMAIL_PASSWORD are configured.");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    tls: {
      minVersion: "TLSv1.2",
      servername: "smtp.gmail.com",
      rejectUnauthorized: false,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });
};

const sendOtpEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Event Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Event Management System - Email Verification OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align:center; color: #4f46e5;">Event Management System</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering with our Event Management System.</p>
        <p>Your email verification OTP is:</p>
        <div style="text-align:center; font-size:32px; font-weight:bold; letter-spacing:8px; padding:15px; margin:20px 0; background:#f3f4f6; border-radius:8px; color: #111827;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>Please do not share this OTP with anyone.</p>
        <p>If you did not register for this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="text-align:center; color: #6b7280; font-size: 0.85rem;">Event Management System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetOtpEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Event Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Event Management System - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="text-align:center; color: #4f46e5;">Event Management System</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password.</p>
        <p>Your password reset OTP is:</p>
        <div style="text-align:center; font-size:32px; font-weight:bold; letter-spacing:8px; padding:15px; margin:20px 0; background:#f3f4f6; border-radius:8px; color: #dc2626;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
        <p style="text-align:center; color: #6b7280; font-size: 0.85rem;">Event Management System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email SMTP connection successful");
  } catch (err) {
    console.error("Email SMTP verification warning:", err.message);
  }
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetOtpEmail,
  verifyEmailConnection,
};