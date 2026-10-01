# Deployment Guide – Expense Tracker on Render

This guide walks you through deploying your Expense Tracker application as a unified Full-Stack Web Service on **Render** (with **MongoDB Atlas** for the database).

---

## Architecture Overview
The application is configured to build and deploy as a **single unified service**:
- The **frontend** (React + Vite) is built during deployment into `frontend/dist`.
- The **backend** (Express.js) serves both the REST API endpoints (`/api/...`) and the production React frontend (`/`).
- Only **1 free web service** on Render is needed — zero CORS setup required!

---

## Step 1: Set Up Free MongoDB Atlas Database (2 minutes)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up/log in (Free Tier).
2. Click **Create Deployment** → Select **M0 (Free)** cluster → Choose any cloud provider and region → Click **Create**.
3. Under **Security Quickstart**:
   - Create a database user (e.g., username `admin`, password `YourSecurePassword123` — save these!).
   - Under **Where would you like to connect from?**, select **Allow Access from Anywhere** (`0.0.0.0/0`) and click **Add IP Address**.
4. Go to **Database** → click **Connect** → choose **Drivers** (Node.js).
5. Copy your connection string. It looks like:
   ```text
   mongodb+srv://admin:YourSecurePassword123@cluster0.abcde.mongodb.net/expense_tracker?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database user password, and add `/expense_tracker` before the `?`)*

---

## Step 2: Push Code to GitHub

### Option A: Using GitHub Website (No Git installation required)
1. Go to [github.com](https://github.com) and click **New Repository**.
2. Name it `expense-tracker`, choose **Public** or **Private**, and click **Create repository**.
3. On the repository page, click the link: **"uploading an existing file"**.
4. Drag and drop the project files into the browser:
   - Select all files in `expense-tracker-241260131040/` **except** `node_modules` folders.
   - Click **Commit changes**.

### Option B: Using Git CLI (if Git is installed)
```bash
git init
git add .
git commit -m "Deploy: Expense Tracker full-stack application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

---

## Step 3: Deploy on Render

1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** → select **Web Service**.
3. Choose **Build and deploy from a Git repository** → Connect your GitHub account and select your `expense-tracker` repository.
4. Fill in the service configuration:
   - **Name:** `expense-tracker` (or any name you like)
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** *(leave empty)*
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | *Your MongoDB Atlas connection string from Step 1* |
   | `JWT_SECRET` | *Any random secure secret string (e.g. `exp_track_secret_998877`)* |
6. Click **Deploy Web Service**!

Render will automatically run `npm run build`, build both frontend and backend, start the server, and give you a free live HTTPS URL:
`https://expense-tracker-xxxx.onrender.com`

---

## Step 4: Verification

Once the deployment status shows **Live**:
1. Open your Render URL (`https://your-app.onrender.com`).
2. Test registering a user account and logging in.
3. Add transactions, test filters, sorting, and upload receipt images.
4. Check `https://your-app.onrender.com/api/ping` to verify backend and database connection status.
