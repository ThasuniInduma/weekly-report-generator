# Weekly Report Generator & Team Dashboard

A MERN stack app for submitting fixed-structure weekly work reports (Team Member role)
and reviewing them across the whole team through a consolidated dashboard (Manager role).

## Stack

- **Frontend**: React 19 + Vite, React Router, Axios, Recharts, date-fns
- **Backend**: Node.js + Express 5, JWT auth (httpOnly cookie), express-validator
- **Database**: MongoDB (Mongoose)

## Project Structure

```
backend/    Express API (config, models, controllers, routes, middleware, services, scripts/seed.js)
frontend/   React + Vite app (src/api, context, routes, pages, components)
```

## 1. Installing dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 2. Running the database

This project uses MongoDB. Either:

- Use a hosted **MongoDB Atlas** cluster (already configured in `backend/.env` as `MONGO_URI`), or
- Run MongoDB locally and point `MONGO_URI` in `backend/.env` at it, e.g. `mongodb://localhost:27017/weeklyReportDB`.

`backend/.env` also needs:

```
PORT=5000
MONGO_URI=<your connection string>
NODE_ENV=development
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
COOKIE_NAME=wrg_token
CLIENT_URL=http://localhost:5173
```

Optionally seed demo data (wipes and re-creates Users/Projects/Reports):

```bash
cd backend
npm run seed
```

This creates:
- Manager: `manager@demo.com` / `password123`
- Members: `member1@demo.com` .. `member4@demo.com` / `password123`
- 4 demo projects and ~6 weeks of report history.

## 3. Running the backend

```bash
cd backend
npm run dev      # nodemon, auto-restarts
# or: npm start
```

Runs on `http://localhost:5000`.

## 4. Running the frontend

`frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
cd frontend
npm run dev
```

Runs on `http://localhost:5173`. Register a new account (choosing a role) or log in with
one of the seeded accounts above.

## Roles

- **Team Member**: create/edit/submit their own weekly reports, view their own history.
- **Manager**: view/filter all team reports, track per-member submission status
  (submitted / pending / late), manage projects/categories, and view the dashboard
  (summary metrics + charts + recent activity).

## API Overview

```
POST   /api/auth/register        POST /api/auth/login   POST /api/auth/logout   GET /api/auth/me
GET    /api/users                                        (manager)
GET    /api/projects              POST/PUT/DELETE /api/projects/:id             (write = manager)
POST   /api/reports               GET /api/reports/me?week=
PUT    /api/reports/:id           PATCH /api/reports/:id/submit   DELETE /api/reports/:id
GET    /api/reports               GET /api/reports/team-status?week=            (manager)
GET    /api/dashboard/summary     GET /api/dashboard/charts   GET /api/dashboard/activity  (manager)
```

## Notes

- The AI Chat Assistant (optional/bonus feature from the assignment) is not implemented in this pass.
- Submission status (submitted/pending/late) is derived, not stored: a report due for week
  W is "late" if unsubmitted after the Monday following week W's end.
