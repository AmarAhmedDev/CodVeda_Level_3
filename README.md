# CodVeda Level 3 - Advanced MERN Full-Stack Application

This repository represents the **Level 3** iteration of the CodVeda User Manager. It extends the full MERN stack (MongoDB, Express, React, Node) built in Level 2 by introducing production-grade performance optimizations, advanced security middlewares, and full deployment readiness.

## Advanced Features & Optimizations

- **Security Headers**: Integrated `helmet` to automatically secure Express apps by setting various HTTP headers.
- **Payload Compression**: Integrated `compression` to gzip all JSON responses, significantly reducing bandwidth and improving load times.
- **Brute Force Protection**: Implemented `express-rate-limit` on the Authentication routes to strictly limit repeated login/signup attempts from the same IP address.
- **Dynamic Environments**: Replaced hardcoded `localhost` URLs with Vite Environment Variables (`import.meta.env.VITE_API_URL`) to allow seamless transitioning between local development and cloud production.

## Technology Stack

- **Frontend**: React (Vite), React Router, Lucide Icons, Vanilla CSS (Glassmorphism UI)
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM)
- **Security & Performance**: JWT, bcryptjs, Helmet, Compression, Express-Rate-Limit

---

## Local Development Setup

To run this application locally, refer to the `.env.example` files provided in both the `Frontend` and `Backend` directories.

1. **Backend**:
   ```bash
   cd Backend
   npm install
   cp .env.example .env # Configure your MONGO_URI
   npm run start
   ```

2. **Frontend**:
   ```bash
   cd Frontend
   npm install
   cp .env.example .env # Configure VITE_API_URL
   npm run dev
   ```

---

## Deployment Guide

This repository is optimized for modern cloud hosting. We recommend deploying the Backend to **Render** and the Frontend to **Vercel**.

### 1. Deploying the Backend (Render)

1. Create a free account on [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`CodVeda_Level_3`).
4. Configure the service:
   - **Root Directory**: `Backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** and add your Environment Variables:
   - `MONGO_URI`: (Your MongoDB Atlas Connection String)
   - `JWT_SECRET`: (A secure random string)
6. Click **Create Web Service**. Once deployed, copy your new live URL (e.g., `https://codveda-backend.onrender.com`).

### 2. Deploying the Frontend (Vercel)

1. Create a free account on [Vercel.com](https://vercel.com/).
2. Click **Add New** > **Project** and import the same GitHub repository.
3. In the Configuration screen:
   - **Root Directory**: Select the `Frontend` folder.
   - The Build Command (`npm run build`) and Output Directory (`dist`) will be auto-detected by Vite.
4. Open the **Environment Variables** section and add:
   - Name: `VITE_API_URL`
   - Value: `https://codveda-backend.onrender.com` (Paste the URL you got from Render).
5. Click **Deploy**. Vercel will build and host your highly optimized React SPA!