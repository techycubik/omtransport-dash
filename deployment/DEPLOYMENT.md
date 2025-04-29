# Deployment Guide for OM Transport Dashboard

This guide provides instructions for deploying the OM Transport Dashboard application using different methods.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
  - [Railway Deployment](#railway-deployment)
  - [Heroku Deployment](#heroku-deployment)
  - [VPS/Dedicated Server](#vpsdedicated-server)
- [Environment Variables](#environment-variables)

## Local Development Setup

Follow the instructions in the project's main README.md file for local development setup.

## Docker Deployment

This project includes Docker configuration for easy deployment.

### Prerequisites

- Docker
- Docker Compose

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/omtransport-dash.git
   cd omtransport-dash
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

4. To stop the application:
   ```bash
   docker-compose down
   ```

## Cloud Deployment

### Railway Deployment

[Railway](https://railway.app/) offers a simple way to deploy applications.

1. Create an account on Railway.
2. Install the Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

3. Login to Railway:
   ```bash
   railway login
   ```

4. Navigate to your project directory and initialize Railway:
   ```bash
   cd omtransport-dash
   railway init
   ```

5. Create a PostgreSQL database on Railway:
   ```bash
   railway add
   ```
   Select PostgreSQL from the options.

6. Deploy the backend:
   ```bash
   cd backend
   railway up
   ```

7. Set the required environment variables through the Railway dashboard.

8. Deploy the frontend:
   ```bash
   cd ../frontend
   railway up
   ```

9. Set the `NEXT_PUBLIC_API_URL` to your deployed backend URL.

### Heroku Deployment

1. Create an account on [Heroku](https://heroku.com/).
2. Install the Heroku CLI:
   ```bash
   npm install -g heroku
   ```

3. Login to Heroku:
   ```bash
   heroku login
   ```

4. Create two Heroku apps (one for backend, one for frontend):
   ```bash
   heroku create omtransport-backend
   heroku create omtransport-frontend
   ```

5. Add a PostgreSQL add-on to the backend app:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev --app omtransport-backend
   ```

6. Set environment variables for the backend:
   ```bash
   heroku config:set NODE_ENV=production --app omtransport-backend
   heroku config:set SECRET_KEY=your_secure_key_here --app omtransport-backend
   ```

7. Deploy the backend:
   ```bash
   git subtree push --prefix backend heroku-backend master
   ```

8. Set environment variables for the frontend:
   ```bash
   heroku config:set NEXT_PUBLIC_API_URL=https://omtransport-backend.herokuapp.com --app omtransport-frontend
   ```

9. Deploy the frontend:
   ```bash
   git subtree push --prefix frontend heroku-frontend master
   ```

### VPS/Dedicated Server

For more control, you can deploy to a VPS (Virtual Private Server).

1. SSH into your server:
   ```bash
   ssh user@your-server-ip
   ```

2. Install required software:
   ```bash
   # Update package lists
   sudo apt update
   sudo apt upgrade -y

   # Install Node.js
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib

   # Install PM2 for process management
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

3. Configure PostgreSQL:
   ```bash
   sudo -u postgres psql
   ```

   In the PostgreSQL shell:
   ```sql
   CREATE DATABASE omdb;
   CREATE USER omadmin WITH ENCRYPTED PASSWORD 'ompass';
   GRANT ALL PRIVILEGES ON DATABASE omdb TO omadmin;
   \q
   ```

4. Clone the repository:
   ```bash
   git clone https://github.com/your-username/omtransport-dash.git
   cd omtransport-dash
   ```

5. Set up the backend:
   ```bash
   cd backend
   npm install
   # Create .env file with production settings
   echo "PORT=4000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=omadmin
   DB_PASSWORD=ompass
   DB_NAME=omdb
   SECRET_KEY=your_secure_key_here
   NODE_ENV=production" > .env

   # Run migrations and seeds
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all

   # Build and start with PM2
   npm run build
   pm2 start dist/index.js --name "omtransport-backend"
   ```

6. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://your-server-ip:4000" > .env.local
   npm run build
   pm2 start npm --name "omtransport-frontend" -- start
   ```

7. Configure Nginx as a reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/omtransport
   ```

   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. Enable the Nginx configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/omtransport /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. Set up SSL with Let's Encrypt:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Environment Variables

### Backend

| Variable        | Description                         | Default Value  |
|-----------------|-------------------------------------|----------------|
| PORT            | Port for the backend server         | 4000           |
| DB_HOST         | PostgreSQL database host            | localhost      |
| DB_PORT         | PostgreSQL database port            | 5432           |
| DB_USER         | PostgreSQL database username        | omadmin        |
| DB_PASSWORD     | PostgreSQL database password        | ompass         |
| DB_NAME         | PostgreSQL database name            | omdb           |
| SECRET_KEY      | Secret key for JWT authentication   |                |
| NODE_ENV        | Node environment                   | development    |

### Frontend

| Variable              | Description                 | Default Value        |
|-----------------------|-----------------------------|----------------------|
| NEXT_PUBLIC_API_URL   | URL of the backend API      | http://localhost:4000 | 