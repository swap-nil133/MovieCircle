# 🎬 MovieCircle

A private group-based movie tracking and recommendation web app where friends can add movies, rate them, mark watched status, and discover what to watch next — all together.

---

## 📁 Project Structure

```
moviecircle/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── groupController.js
│   │   ├── movieController.js
│   │   ├── ratingController.js
│   │   └── watchedController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Movie.js
│   │   ├── Rating.js
│   │   └── Watched.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── groups.js
│   │   ├── movies.js
│   │   ├── ratings.js
│   │   └── watched.js
│   ├── utils/
│   │   └── tmdb.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── groups/
    │   │   │   ├── CreateGroupModal.jsx
    │   │   │   └── JoinGroupModal.jsx
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Sidebar.jsx
    │   │   └── movies/
    │   │       ├── AddMovieModal.jsx
    │   │       ├── MovieCard.jsx
    │   │       ├── MovieDetailModal.jsx
    │   │       └── MovieGrid.jsx
    │   ├── context/
    │   │   ├── authStore.js
    │   │   ├── groupStore.js
    │   │   └── movieStore.js
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   └── GroupPage.jsx
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── format.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI
- **TMDb API Key** — get one free at https://www.themoviedb.org/settings/api

---

## 🚀 Setup & Running

### 1. Clone / Extract the project

```bash
cd moviecircle
```

### 2. Backend Setup

```bash
cd backend

# Copy env file and fill in your values
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/moviecircle
JWT_SECRET=some_long_random_secret_string_here
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
CLIENT_URL=http://localhost:5173
```

```bash
npm install
npm run dev        # development (nodemon auto-reload)
# or
npm start          # production
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

The Vite dev server proxies `/api` requests to the backend automatically.

---

## 🔑 Getting a TMDb API Key

1. Go to https://www.themoviedb.org/signup and create a free account
2. Navigate to https://www.themoviedb.org/settings/api
3. Click **Create** → select **Developer**
4. Fill in the form (app name: "MovieCircle", etc.)
5. Copy your **API Key (v3 auth)** into `backend/.env` as `TMDB_API_KEY`

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 Auth | JWT-based signup/login, bcrypt hashed passwords |
| 👥 Groups | Create private groups, invite via 8-char code |
| 🎬 Add Movies | Paste any IMDb URL or IMDb ID (tt0111161) |
| ⭐ Rating | Rate movies 1–10, see friends' ratings & avg |
| ✅ Watched | Mark watched with date, see who watched what |
| 🔍 Filters | Filter by genre, language, minimum rating |
| 📈 Top Rated | Sorted list of highest-rated group movies |
| 🎯 Recommendations | Unwatched movies sorted by group avg rating |
| 🎨 Dark UI | Cinema-themed dark mode with animations |

---

## 📡 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Groups
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/groups` | Get my groups |
| POST | `/api/groups` | Create group |
| GET | `/api/groups/:id` | Get group details |
| POST | `/api/groups/join` | Join via invite code |
| DELETE | `/api/groups/:id/leave` | Leave group |

### Movies
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/movies` | Add movie (IMDb link) |
| GET | `/api/movies/group/:groupId` | Get group movies (filterable) |
| GET | `/api/movies/group/:groupId/top-rated` | Top rated movies |
| GET | `/api/movies/group/:groupId/recommendations` | Unwatched recommendations |
| GET | `/api/movies/:id` | Single movie detail |
| DELETE | `/api/movies/:id` | Remove movie |

### Ratings
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ratings` | Add/update rating |
| DELETE | `/api/ratings/:movieId/:groupId` | Remove rating |
| GET | `/api/ratings/movie/:movieId/group/:groupId` | Get all ratings |

### Watched
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/watched/toggle` | Toggle watched status |
| GET | `/api/watched/movie/:movieId/group/:groupId` | Get watched list |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand + React Router
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Movie Data**: TMDb API (via IMDb ID lookup)
- **Notifications**: react-hot-toast
- **HTTP Client**: Axios

---

## 📝 Notes

- The same movie cannot be added twice to the same group
- Each user gets exactly one rating and one watched entry per movie per group
- Recommendations exclude movies the current user has already marked as watched
- Group owners and movie adders can remove movies
- Only group owners can't leave — they must delete the group (future feature)
- Invite codes are auto-generated 8-character alphanumeric codes
