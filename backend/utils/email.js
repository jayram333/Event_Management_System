const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("Email configuration is missing in .env");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },

    tls: {
      minVersion: "TLSv1.2",
    },
  });
};

const sendVerificationOtp = async ({
  email,
  name,
  otp,
}) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Event Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP - Event Management System",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 20px;
      ">

        <h2>Email Verification</h2>

        <p>Hello ${name},</p>

        <p>
          Thank you for registering with the Event Management System.
        </p>

        <p>
          Your email verification OTP is:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 15px;
          text-align: center;
          background: #f3f4f6;
          border-radius: 8px;
        ">
          ${otp}
        </div>

        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p>
          Do not share this OTP with anyone.
        </p>

        <p>
          If you did not create this account, please ignore this email.
        </p>

        <hr>

        <p>
          Event Management System
        </p>

      </div>
    `,
  });
};

module.exports = {
  sendVerificationOtp,
};