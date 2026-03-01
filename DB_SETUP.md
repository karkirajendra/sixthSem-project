# Room-Finder-App: MongoDB Connection Guide

To connect your project to a database, you need to set the `MONGO_URI` in the `backend/.env` file.

## Option 1: Local MongoDB (Easier for Development)
If you have MongoDB installed on your laptop:
1. Ensure the **MongoDB Service** is running (usually found in Windows Services).
2. Open your `backend/.env` file.
3. Use this connection string:
   ```env
   MONGO_URI=mongodb://localhost:27017/roomsathi
   ```

---

## Option 2: MongoDB Atlas (Cloud Database)
If you want to host your database in the cloud:
1. Log in to your [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
2. Create a "Cluster" and then a "Database User" (remember the username and password).
3. Under **Network Access**, add your current IP address (or `0.0.0.0/0` for access from anywhere).
4. Click **Connect** → **Connect your application**.
5. Copy the connection string (it looks like `mongodb+srv://user:password@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`).
6. Replace `<password>` with your actual password.
7. Paste this into your `backend/.env` file:
   ```env
   MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster-name.abcde.mongodb.net/roomsathi?retryWrites=true&w=majority
   ```

---

## How it works in the code:
- The backend uses `mongoose` to connect.
- The configuration is in `backend/src/config/database.js`.
- It looks for `process.env.MONGO_URI`, which it reads from the `.env` file.

**Important**: After changing the `.env` file, **restart your backend** (`npm run dev`) for the changes to take effect.
