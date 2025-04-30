# OM Transport Dashboard

A full-stack management system for OM Transport featuring sales orders, purchase orders, and materials management.

## Project Structure

- `/frontend` - Next.js frontend application
- `/backend` - Node.js backend API with Express and Sequelize

## Setup Instructions

### Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 12.x
- pnpm (preferred package manager)

### Database Setup

1. Create a PostgreSQL database called `omdb`
2. Create a PostgreSQL user:
   - Username: `omadmin`
   - Password: `ompass`
   - Grant all privileges to this user on the `omdb` database

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=4000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=omadmin
   DB_PASSWORD=ompass
   DB_NAME=omdb
   SECRET_KEY=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Run database migrations:
   ```
   npx sequelize-cli db:migrate
   ```

5. Seed the database with initial data:
   ```
   npx sequelize-cli db:seed:all
   ```

6. Start the backend server:
   ```
   pnpm run dev
   ```

   The backend will be available at https://omtransport-dash.onrender.com

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create a `.env.local` file in the frontend directory with the following content:
   ```
   NEXT_PUBLIC_API_URL=https://omtransport-dash.onrender.com
   ```

4. Start the frontend development server:
   ```
   pnpm run dev
   ```

   The frontend will be available at http://localhost:3000

## Authentication

Use the following test accounts to log in:

- Super Admin: 
  - Email: `admin@omtransport.com`
  - OTP will be displayed in the backend console

- Admin: 
  - Email: `admin@example.com`
  - OTP will be displayed in the backend console

- Staff: 
  - Email: `test@test.com`
  - OTP will be displayed in the backend console

## Deployment Options

### Backend Deployment Options

1. **VPS/Dedicated Server**:
   - Set up a Linux server (Ubuntu/Debian recommended)
   - Install Node.js, PostgreSQL
   - Use PM2 to manage the Node.js process
   - Set up Nginx as a reverse proxy

2. **Heroku**:
   - Use the Heroku Postgres add-on
   - Deploy from GitHub
   - Set environment variables in Heroku dashboard

3. **Railway, Render, or Fly.io**:
   - Connect GitHub repository
   - Configure PostgreSQL database
   - Set environment variables

### Frontend Deployment Options

1. **Vercel** (recommended for Next.js):
   - Connect GitHub repository
   - Configure environment variables
   - Deploy

2. **Netlify**:
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables

## License

[MIT](LICENSE)

## Contact

For questions, contact the development team.
