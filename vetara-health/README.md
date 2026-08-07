# Vetara Health

Full-stack pet health management platform — Node.js/Express backend, SQLite database, and a vanilla-JS single-page frontend that preserves the original Vetara dark navy / blue / cyan theme.

## Features

**Pet owners** can register, add pets, track medical records, vaccinations (with due-date status) and medications, browse a verified provider network with ratings and reviews, book and cancel appointments, and manage care reminders.

**Providers** get their own portal: a dashboard with schedule and patient stats, appointment check-in/complete workflow, patient list, and the ability to add medical records to patients they treat.

**Platform**: session-based auth with bcrypt-hashed passwords, role-based access control (owner vs. provider), REST API, and a marketing landing page.

**No-login verification links**: owners share an unguessable link (`/r/<token>`) with a groomer or boarder, who sees a fast server-rendered page with the pet's required-vaccine status — green "cleared", amber "due soon", or red "not cleared" — filtered to their business type, with a confirm button and an "accept anyway (logged)" override. No account or app install needed on the business side. Every view and confirmation is logged and visible to the owner, and links expire automatically. Try it after seeding: `/r/demoLuna8x2k` (cleared) and `/r/demoDaisyQm9p` (blocked).

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite via Node's built-in `node:sqlite` (no native compilation, zero DB setup)
- **Auth**: bcryptjs + express-session
- **Frontend**: Vanilla HTML/CSS/JS SPA (no build step)

## Requirements

- Node.js **22.5 or newer** (uses the built-in `node:sqlite` module)

## Getting Started

```bash
npm install
npm run seed     # optional: load demo data
npm start        # → http://localhost:3000
```

### Demo accounts (after seeding)

| Role     | Email              | Password |
|----------|--------------------|----------|
| Owner    | sarah@demo.vetara  | demo1234 |
| Provider | elena@demo.vetara  | demo1234 |

The database is created automatically at `data/vetara.db` on first run.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account (owner or provider) |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current session |
| GET/POST | `/api/pets` | List / add pets |
| GET/PUT/DELETE | `/api/pets/:id` | Pet detail / edit / remove |
| POST/DELETE | `/api/pets/:id/vaccinations[/:vid]` | Manage vaccinations |
| POST/DELETE | `/api/pets/:id/medications[/:mid]` | Manage medications |
| GET/POST | `/api/records` | Medical records |
| GET | `/api/providers` | Provider directory (`?type=` filter) |
| GET | `/api/providers/:id` | Provider detail + reviews |
| POST | `/api/providers/:id/reviews` | Post a review |
| GET/POST | `/api/appointments` | List / book appointments |
| PATCH | `/api/appointments/:id` | Update status (cancel / check-in / complete) |
| GET/POST | `/api/reminders` | Care reminders |
| PATCH | `/api/reminders/:id/done` | Complete a reminder |
| GET | `/api/insurance` | Policies, claims, discount tiers |
| GET/POST | `/api/posts` | Community feed |
| POST | `/api/posts/:id/like` | Like a post |
| GET/POST | `/api/slots` | Open-slot broadcasts (Smart Fill) |
| POST | `/api/slots/:id/claim` | Claim an open slot |
| POST | `/api/assistant` | AI assistant (grounded in your records) |
| GET/POST/DELETE | `/api/shares` | Verification share links |
| GET | `/r/:token` | Public no-login verification page |

## Pushing to GitHub

```bash
# from the project folder (git is already initialized with an initial commit)
git remote add origin https://github.com/<your-username>/vetara-health.git
git branch -M main
git push -u origin main
```

## Production Notes

- Set `SESSION_SECRET` in the environment before deploying.
- The default express-session memory store is fine for development; use a persistent store (e.g. `better-sqlite3-session-store` or Redis) in production.
- Serve behind HTTPS and set `cookie.secure = true` in `server.js`.

## Project Structure

```
vetara-health/
├── server.js            # Express app entry
├── src/
│   ├── db.js            # SQLite connection + schema
│   ├── seed.js          # Demo data seeder
│   ├── middleware.js    # Auth guards
│   └── routes/          # API route modules
├── public/
│   ├── index.html       # SPA shell
│   ├── css/style.css    # Original Vetara theme
│   └── js/              # Icons + SPA logic
└── data/                # SQLite database (gitignored)
```
