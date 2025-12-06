# HR Management System - Backend

Backend API for the HR Management System built with Node.js, Express, and MySQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- MySQL 8.0+
- Redis (optional, for caching)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and update your database credentials
```

3. Create database:
```bash
mysql -u root -p
CREATE DATABASE hrms_db;
exit
```

4. Import database schema:
```bash
mysql -u root -p hrms_db < ../.agent/planning/database-schema.sql
```

5. Start development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── tests/               # Test files
├── uploads/             # File uploads
├── logs/                # Application logs
├── .env                 # Environment variables
├── .env.example         # Example environment file
├── server.js            # Entry point
└── package.json         # Dependencies
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 📚 API Documentation

API documentation will be available at http://localhost:5000/api-docs (Swagger UI)

## 🔑 Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT secret key
- `PORT` - Server port (default: 5000)

## 🧪 Testing

```bash
npm test
```

## 📝 License

ISC
