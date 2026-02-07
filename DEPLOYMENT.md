# Deployment Guide

This guide covers how to deploy the **INVentry** application.

## 1. Backend Deployment (Render.com)

1.  **Create a New Web Service**:
    *   Connect your GitHub repository to Render.
    *   Select the root directory as the **Root Directory** (or leave empty if repository root).
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`

2.  **Environment Variables**:
    *   Add the following variables in the "Environment" tab:
        *   `NODE_ENV`: `production`
        *   `MONGO_URI`: Your MongoDB Atlas connection string.
        *   `JWT_SECRET`: A strong secret key for token generation.
        *   `PORT`: `10000` (Render acts on this port by default or sets it automatically).

3.  **Deploy**:
    *   Click "Create Web Service". Render will build and deploy your API.

---

## 2. Frontend Deployment (Vercel)

1.  **Import Project**:
    *   Go to Vercel Dashboard -> Add New -> Project.
    *   Import your GitHub repository.

2.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: `frontend` (Edit the root directory to point to the frontend folder).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`

3.  **Environment Variables**:
    *   If your frontend needs to talk to the backend, add:
        *   `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://inventry-api.onrender.com`).

4.  **Deploy**:
    *   Click "Deploy".

---

## 3. MongoDB Atlas Setup

1.  **Create Cluster**: Log in to MongoDB Atlas and create a free tier cluster.
2.  **Database Access**: Create a database user with password.
3.  **Network Access**: Whitelist `0.0.0.0/0` (Allow access from anywhere) for cloud deployment.
4.  **Connection String**:
    *   Go to "Connect" -> "Connect your application".
    *   Copy the string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`).
    *   Replace `<password>` with your actual password.

## 4. Final Checklist

*   [ ] `MONGO_URI` is set in backend environment variables.
*   [ ] `JWT_SECRET` is strong and secure.
*   [ ] Frontend `VITE_API_URL` points to the *production* backend URL, not `localhost`.
*   [ ] **CORS**: Ensure your backend `server.js` allows requests from your Vercel frontend domain.
