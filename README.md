# Green Space Optimizer

MERN stack web app: community cleaning drives, virtual jungle, AQI/carbon tracking, daily sustainability tips. React (JS) + Tailwind CSS frontend; Node + Express + MongoDB backend.

## Setup

### Backend

1. Install MongoDB and run it locally, or use MongoDB Atlas and set `MONGO_URI` in `.env`.
2. In `backend/`:
   - Copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, `PORT`.
   - Run `npm install` then `npm run dev`. Server runs on port 5000.

### Frontend

1. In `client/`:
   - Run `npm install` then `npm run dev`. App runs on port 3000 with proxy to backend `/api`.

### Run both

- Terminal 1: `cd backend` then `npm run dev` (server on port 5000)
- Terminal 2: `cd client` then `npm run dev` (app on port 3000)
- Open http://localhost:3000

On Windows PowerShell use `cd backend; npm run dev` (semicolon) if needed.

## Features

- **User:** Sign up, login, dashboard with coins, virtual jungle, AQI/carbon reduced, daily habit tip, share on social.
- **Drives:** List scheduled drives, AI-ranked priority locations, join/leave (max 20 per drive).
- **Incharge:** Separate login, dashboard, emergency chatbot (e.g. injury, snake bite).
- **AI:** Priority locations (AQI, garbage, last camp, plants), daily habit tip, emergency actions.

## API (backend)

- `POST /api/auth/register` – register
- `POST /api/auth/login` – login
- `GET /api/auth/me` – current user (auth)
- `GET /api/drives` – list drives
- `POST /api/drives/:id/join` – join drive (auth)
- `GET /api/locations/priority` – AI priority locations
- `GET /api/scoring` – my score (auth)
- `POST /api/scoring/drive` – submit drive work (auth)
- `GET /api/ai/habit/daily` – daily habit tip
- `POST /api/ai/emergency` – emergency actions (incharge)

To create drives or locations, use an API client (e.g. Postman) or add a seed script. Incharge users can create drives once the backend route is used with their token.
