# Vercel Environment Variables Setup

This document lists every environment variable required by the **Event Management System** source code for production deployment on Vercel.

> [!SECURITY NOTICE]
> **No secret values are stored in source code or repository files.**
> All secrets and configuration values must be added manually in the Vercel Dashboard for each respective project.

---

## 1. FRONTEND ENVIRONMENT VARIABLES

**Project**: Frontend Vercel Project (`frontend/`)

| Variable Name | Required | Purpose | Vercel Project Setup |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **Yes** | Specifies the base URL of the deployed Vercel backend. | Added in **Frontend Project Settings** → **Environment Variables**. Format: `https://<your-backend-project>.vercel.app` *(Do NOT append `/api` at the end)*. |

---

## 2. BACKEND ENVIRONMENT VARIABLES

**Project**: Backend Vercel Project (`backend/`)

| Variable Name | Required | Purpose | Vercel Project Setup |
| :--- | :--- | :--- | :--- |
| `MONGO_URI` | **Yes** | MongoDB Atlas Connection String (`mongodb+srv://...`). | Added in **Backend Project Settings** → **Environment Variables**. |
| `JWT_SECRET` | **Yes** | Secret key for signing and verifying JSON Web Tokens (JWT) for authentication across Admin, Organizer, and User roles. | Added in **Backend Project Settings** → **Environment Variables**. |
| `EMAIL_USER` | **Yes** | Gmail address used by Nodemailer to send OTP verification & password reset emails. | Added in **Backend Project Settings** → **Environment Variables**. Example: `your-email@gmail.com` |
| `EMAIL_PASSWORD` | **Yes** | Google **App Password** generated from Google Account Security settings (2FA required). | Added in **Backend Project Settings** → **Environment Variables**. |
| `ADMIN_EMAIL` | **Yes** | Initial Admin account email used by `seedAdmin.js` (`pulakalasriram@gmail.com`). | Added in **Backend Project Settings** → **Environment Variables**. |
| `ADMIN_PASSWORD` | **Yes** | Initial password for the Admin account when running seed script. | Added in **Backend Project Settings** → **Environment Variables**. |
| `ADMIN_NAME` | Optional | Display name for the Admin account (Defaults to `"Admin"` if omitted). | Added in **Backend Project Settings** → **Environment Variables**. |
| `CLIENT_URL` | **Yes** | Deployed Frontend Vercel production URL used for CORS authorization and Socket.IO origin configuration. | Added in **Backend Project Settings** → **Environment Variables**. Format: `https://<your-frontend-project>.vercel.app` |
| `PORT` | Optional | HTTP port for local development (`server.listen`). Not used by Vercel serverless execution. | Optional / Default is `5000`. |

---

## How to Set Up in Vercel Dashboard

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Select your project (**Frontend** or **Backend**).
3. Navigate to **Settings** → **Environment Variables**.
4. Key in the **Key** (e.g. `MONGO_URI`) and **Value** (your secret value).
5. Select environments: **Production**, **Preview**, **Development**.
6. Click **Save**.
7. **Redeploy** the project if environment variables were added after deployment.
