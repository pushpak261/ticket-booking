# 🎬 CineBook — Movie Ticket Booking System

A production-grade **MERN Stack** Movie Ticket Booking System. Browse movies, select showtimes, pick your seats interactively, and book instantly.

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Tech Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

---

## ✨ Features

- 🎭 Browse movies with search, genre, and language filters
- 📅 View showtimes by date and theater
- 🪑 **Interactive seat selection map** (Regular / Premium / Recliner tiers)
- 🔐 JWT Authentication (Register / Login / Persistent sessions)
- 📋 My Bookings dashboard with cancellation support
- 🎟️ Beautiful ticket confirmation card
- ⚙️ Admin panel to add/delete/update movies
- 🌱 Database seed script with realistic data
- 📱 Fully responsive design

---

## 🏗️ Project Structure

```
Ticket Booking/
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js        # MongoDB connection
│   │   ├── controllers/        # Route logic
│   │   ├── middleware/         # Auth, error handling, validation
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express router
│   │   └── utils/
│   │       ├── jwt.js          # Token helpers
│   │       └── seed.js         # DB seeder
│   ├── .env                    # Environment variables
│   ├── server.js               # Entry point
│   └── package.json
│
└── frontend/                   # React 18 + Vite
    ├── src/
    │   ├── api/                # Axios service layer
    │   ├── components/         # Reusable components
    │   ├── context/            # Auth Context
    │   ├── pages/              # Page components
    │   ├── routes/             # Route guards
    │   └── styles/             # Global CSS design system
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 1. Setup Backend

```bash
cd backend
npm install
```

Copy and configure environment variables:
```bash
# .env is already created with defaults
# Edit MONGO_URI if you're using MongoDB Atlas:
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cinebook
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# API running at http://localhost:5000
```

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role  | Email                   | Password     |
|-------|------------------------|--------------|
| Admin | admin@cinebook.com     | admin123     |
| User  | john@example.com       | password123  |

---

## 📡 API Reference

| Method | Endpoint                     | Auth     | Description           |
|--------|------------------------------|----------|-----------------------|
| POST   | /api/auth/register           | Public   | Register new user     |
| POST   | /api/auth/login              | Public   | Login user            |
| GET    | /api/auth/me                 | Private  | Get current user      |
| GET    | /api/movies                  | Public   | List movies (filters) |
| GET    | /api/movies/:id              | Public   | Movie details         |
| GET    | /api/theaters                | Public   | List theaters         |
| GET    | /api/theaters/cities         | Public   | List cities           |
| GET    | /api/showtimes               | Public   | List showtimes        |
| GET    | /api/showtimes/:id           | Public   | Showtime details      |
| POST   | /api/bookings                | Private  | Create booking        |
| GET    | /api/bookings/my             | Private  | My bookings           |
| GET    | /api/bookings/:id            | Private  | Single booking        |
| DELETE | /api/bookings/:id            | Private  | Cancel booking        |
| POST   | /api/admin/movies            | Admin    | Add movie             |
| PUT    | /api/admin/movies/:id        | Admin    | Update movie          |
| DELETE | /api/admin/movies/:id        | Admin    | Delete movie          |
| GET    | /api/admin/bookings          | Admin    | All bookings          |

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, React Router v6   |
| Styling   | Vanilla CSS with custom design system |
| HTTP      | Axios with interceptors           |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB, Mongoose ODM             |
| Auth      | JWT + bcryptjs                    |
| Validation| express-validator                 |

---

## 📝 Code Quality

- ✅ MVC architecture (Models → Controllers → Routes)
- ✅ Centralized error handling
- ✅ Input validation middleware
- ✅ JWT auth + role-based access control
- ✅ Atomic seat conflict prevention
- ✅ Service layer abstraction on frontend
- ✅ Context API for state management
- ✅ Semantic HTML + accessible IDs

---

Built with ❤️ for MERN Stack Developer interviews.
