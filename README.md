# MediFind

Locate nearby pharmacies and compare medicine prices with AI-suggested cheaper alternatives.

## Monorepo Layout

- `frontend/` – React + Vite + Tailwind app (GitHub Pages deploy)
- `backend/` – Node.js + Express API with mock data (Render/Railway deploy)

## Quickstart (Local)

1) Backend

```bash
cd backend
npm install
# copy env
copy env.example .env   # Windows PowerShell
# or: cp env.example .env
npm run start
# API on http://localhost:4000
```

2) Frontend

```bash
cd frontend
npm install
# Create .env with your backend URL
# Windows PowerShell example:
# echo VITE_API_BASE_URL=http://localhost:4000 > .env
npm run dev
# App on http://localhost:5173
```

## Environment Variables

- Frontend:
  - `VITE_API_BASE_URL` – Base URL of backend (e.g. `https://medifind-api.onrender.com`)
  - `VITE_BASE_PATH` (optional) – Set to `/REPO_NAME/` for GitHub Pages if using a project site
- Backend:
  - `PORT` – Defaults to `4000`
  - `CORS_ORIGIN` – Frontend origin (e.g. `http://localhost:5173` or your GitHub Pages URL)

## API Endpoints

- `GET /api/health` – Health check
- `GET /api/pharmacies?location=<city>` – List pharmacies (mock data)
- `GET /api/medicines/search?q=<name>&location=<city>` – Search medicines with price + availability
- `GET /api/ai/alternatives?name=<brand>` – AI-style generic/cheaper alternatives (mocked)

## Deployment

### Backend (Render or Railway)

- Render:
  - Create a new Web Service from the `backend/` folder
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Environment:
    - `PORT` (Render provides automatically)
    - `CORS_ORIGIN` set to your frontend URL (later GitHub Pages URL)
- Railway:
  - Create a new service from repo, set root to `backend/`
  - Deploy with `npm start`
  - Set `CORS_ORIGIN`

Note your deployed backend base URL for the frontend.

### Frontend (GitHub Pages)

- In `frontend/vite.config.ts`, `base` is controlled by `VITE_BASE_PATH` env.
- If deploying to a project site (e.g. `https://username.github.io/medifind`), set `VITE_BASE_PATH=/medifind/` during build.

Build and deploy:

```bash
cd frontend
npm install
# e.g. PowerShell
# $env:VITE_API_BASE_URL="https://<your-api>.onrender.com"; $env:VITE_BASE_PATH="/medifind/"; npm run build
npm run build
# Serve dist/ with GitHub Pages (commit and use Pages from /docs or gh-pages action)
```

Recommended: publish `dist/` to a `gh-pages` branch via an action, or set Pages to serve from `/docs` and copy `dist/` there.

## Notes

- Data is mocked in `backend/src/mock/` for demo purposes.
- The AI endpoint is a heuristic mock. Replace with a real model/API when available.


