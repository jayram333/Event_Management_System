# Vercel Deployment Guide — Event Management System

This guide outlines the step-by-step procedure to deploy both the **Frontend** (React + Vite) and **Backend** (Express Serverless Functions) to **Vercel**, configured with **MongoDB Atlas** and **Gmail SMTP OTP**.

---

## Architecture Overview

- **Repository**: Single Monorepo containing `frontend/` and `backend/`.
- **Frontend Hosting**: Vercel Project 1 (Root Directory: `frontend`).
- **Backend Hosting**: Vercel Project 2 (Root Directory: `backend`).
- **Database**: MongoDB Atlas.
- **Email Service**: Google Gmail SMTP (`smtp.gmail.com:587` via Nodemailer).

---

## Step 1: GitHub Preparation

1. Ensure all latest code changes are committed and pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure Event Management System for Vercel deployment"
   git push origin main
   ```
2. Verify that `.env` files are ignored by git (`git status` must never show `.env` files being tracked).

---

## Step 2: Deploy Backend to Vercel (Project 1)

1. Open [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New...** → **Project**.
3. Import your **Event Management System** GitHub repository.
4. Name the project (e.g. `event-system-backend`).
5. Expand **Framework Preset** and select **Other** (or Node.js).
6. **Root Directory**: Click **Edit** and select `backend`.
7. Expand **Environment Variables** and enter the required backend environment variables:

   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string for JWT token generation.
   - `EMAIL_USER`: Your Gmail address (e.g., `user@gmail.com`).
   - `EMAIL_PASSWORD`: Your 16-character Google **App Password**.
   - `ADMIN_EMAIL`: `pulakalasriram@gmail.com`
   - `ADMIN_PASSWORD`: Your chosen secure password for the Admin user.
   - `ADMIN_NAME`: `Admin`
   - `CLIENT_URL`: `https://<your-frontend-project-name>.vercel.app` *(Leave placeholder until frontend is deployed, then update)*.

8. Click **Deploy**.
9. Once deployed, note down your **Backend Production URL** (e.g. `https://event-system-backend.vercel.app`).

---

## Step 3: Deploy Frontend to Vercel (Project 2)

1. Open [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New...** → **Project**.
3. Import the **same** GitHub repository.
4. Name the project (e.g. `event-system-frontend`).
5. **Framework Preset**: Select **Vite**.
6. **Root Directory**: Click **Edit** and select `frontend`.
7. Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
8. Expand **Environment Variables**:
   - `VITE_API_URL`: Your Backend Production URL (e.g. `https://event-system-backend.vercel.app`).
   
   > [!IMPORTANT]
   > Do **NOT** append `/api` to `VITE_API_URL` because the frontend API client (`api.js`) automatically prefixes `/api` to requests (preventing `/api/api/...` errors).

9. Click **Deploy**.
10. Note down your **Frontend Production URL** (e.g. `https://event-system-frontend.vercel.app`).

---

## Step 4: Update Backend `CLIENT_URL` & Redeploy

1. Go back to your **Backend Project** in Vercel.
2. Navigate to **Settings** → **Environment Variables**.
3. Update `CLIENT_URL` to match your exact **Frontend Production URL**:
   - Key: `CLIENT_URL`
   - Value: `https://event-system-frontend.vercel.app`
4. Save the variable.
5. Go to **Deployments**, click the `...` menu on the latest deployment, and select **Redeploy**.

---

## Step 5: Setting Up Gmail App Password for OTP

Google requires an **App Password** for Nodemailer SMTP authentication:

1. Log into the Google Account configured as `EMAIL_USER`.
2. Go to [Google Account Security Settings](https://myaccount.google.com/security).
3. Ensure **2-Step Verification** is turned **ON**.
4. Search for **App Passwords** in the search bar.
5. Create a new App Password named `Vercel Event System`.
6. Copy the generated 16-character password (without spaces) and set it as `EMAIL_PASSWORD` in your Vercel Backend Environment Variables.

---

## Step 6: Initializing Admin User in MongoDB Atlas

To seed the initial Admin account (`pulakalasriram@gmail.com`) into your production database:

Run the `seedAdmin.js` script locally pointing to your MongoDB Atlas connection string:
```bash
cd backend
MONGO_URI="<your-mongodb-atlas-uri>" ADMIN_EMAIL="pulakalasriram@gmail.com" ADMIN_PASSWORD="<your-admin-password>" node seedAdmin.js
```

---

## Redeployment Checklist

Whenever you change Environment Variables in Vercel:
- **Environment variables are NOT injected dynamically into active serverless functions or Vite static builds.**
- You **MUST** trigger a **Redeploy** from the Vercel Deployments tab for changes to take effect.
