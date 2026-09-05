# Deployment Guide - CareConnect Maharashtra

This guide explains how to deploy the CareConnect platform using Docker.

## 🚀 Quick Start

If you have Docker and Docker Compose installed, you can launch the entire stack with one command:

```bash
docker-compose up --build
```

## ⚙️ Environment Configuration

Before deploying, create a `.env` file in the root directory:

```env
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_google_gemini_key
GROQ_API_KEY=your_groq_api_key
```

## 🏗️ Architecture Overview

The system consists of three main containers:

1. **MongoDB**: Official MongoDB image for persistent data storage.
2. **Backend**: Node.js/Express API (compiled from TypeScript).
3. **Frontend**: Vite/React application served via Nginx.

## 🛠️ Troubleshooting

- **API Connectivity**: Ensure the frontend `VITE_API_URL` matches the backend port (default: 5000).
- **DB Connection**: The backend connects to MongoDB using the service name `mongodb:27017`.
- **Logs**: Use `docker-compose logs -f` to monitor the system in real-time.
