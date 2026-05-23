# Perfume Paradise Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your settings:
```bash
cp .env.example .env
```

Update the following in `.env`:
- `DB_HOST`: MySQL host (default: localhost)
- `DB_USER`: MySQL username (default: root)
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: perfume_paradise)
- `JWT_SECRET`: A random secret string for JWT tokens
- `FRONTEND_URL`: Your frontend URL (default: http://localhost:3000)

### 3. Create MySQL Database
```sql
CREATE DATABASE perfume_paradise;
```

The tables will be created automatically when you start the server.

### 4. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Security Features
- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Rate limiting (5 login attempts per 15 min, 3 registrations per hour)
- Brute force protection
- Input validation
- SQL injection protection (parameterized queries)
- CORS protection
- Helmet.js security headers

## Database Schema

### users
- id (INT, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- first_name (VARCHAR)
- last_name (VARCHAR)
- phone (VARCHAR, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
- is_active (BOOLEAN)

### user_sessions
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- token (VARCHAR)
- expires_at (TIMESTAMP)

### login_attempts
- id (INT, PRIMARY KEY)
- email (VARCHAR)
- ip_address (VARCHAR)
- success (BOOLEAN)
- attempted_at (TIMESTAMP)

