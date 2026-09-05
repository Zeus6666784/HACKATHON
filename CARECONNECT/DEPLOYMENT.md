# Deployment Guide: CareConnect Maharashtra

This document provides a professional guide to deploying the CareConnect platform to a production environment.

## 🏗️ System Architecture
The application is containerized using Docker and consists of three main components:
- **Frontend**: React + Vite (served via Nginx)
- **Backend**: Node.js + Express (TypeScript)
- **Database**: MongoDB

## 🚀 Quick Deploy (Local/Development)

1. **Clone the repository** and navigate to the root directory.
2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and provide your actual API keys and secrets.
3. **Launch the stack**:
   ```bash
   docker-compose up --build -d
   ```
4. **Access the app**:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:5000/api/v1`

## ☁️ Production Deployment (VPS/Cloud)

### 1. Server Requirements
- A Linux VPS (Ubuntu 22.04 recommended).
- Docker and Docker Compose installed.
- A domain name pointing to your server's IP.

### 2. Production Environment Setup
Create a `.env` file on the server:
```env
# Server
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/careconnect
JWT_SECRET=your_extremely_long_random_string_here

# AI Providers
GEMINI_API_KEY=your_actual_google_key
GROQ_API_KEY=your_actual_groq_key

# Frontend (Crucial: Use your actual domain!)
VITE_API_URL=https://api.yourdomain.com/api/v1
```

### 3. Deployment Steps
```bash
# Clone the repo
git clone <repo-url>
cd careconnect

# Launch
docker-compose up --build -d
```

### 4. Recommended: Reverse Proxy & HTTPS
For production, do **not** expose ports 80 and 5000 directly. Use a reverse proxy like **Nginx** or **Traefik** with Let's Encrypt for SSL.

**Suggested Nginx Configuration Snippet:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:80; # if on different port
        proxy_set_header Host $host;
    }
}
```

## 🛠️ Maintenance

- **View Logs**: `docker-compose logs -f`
- **Restart Services**: `docker-compose restart`
- **Update App**:
  ```bash
  git pull
  docker-compose up --build -d
  ```

## 🛡️ Security Checklist
- [ ] Change `JWT_SECRET` to a high-entropy random string.
- [ ] Ensure MongoDB is not exposed to the public internet (kept internal to Docker network).
- [ ] Implement a firewall (UFW) to only allow ports 80, 443, and SSH.
- [ ] Set up automated backups for the `mongodb_data` volume.
